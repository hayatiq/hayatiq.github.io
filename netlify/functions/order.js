// Order notifications: Telegram alerts (business and developer chats) and a row in the
// Google order sheet. Also forwards contact-form messages to Telegram ({ kind: "contact" }). Which of these run is switched in js/config.js (NOTIFY); the
// secrets live in Netlify environment variables (see README.MD "Order notifications"):
//   TELEGRAM_BOT_TOKEN                  — the bot that sends the alerts
//   TELEGRAM_CHAT_ID                    — business chat
//   TELEGRAM_DEV_CHAT_ID                — developer chat
//   TELEGRAM_DEV_BOT_TOKEN (optional)   — only if the developer chat uses a different bot
//   SHEET_WEBHOOK_URL, SHEET_TOKEN      — Google Apps Script web app + shared secret
// A channel whose variables are missing is reported as "not-configured" and skipped.

// Recipient name (as used in NOTIFY.orderTelegram) → where its chat ID and bot token live.
const TELEGRAM_CHATS = {
  business: { chat: "TELEGRAM_CHAT_ID", token: "TELEGRAM_BOT_TOKEN" },
  developer: { chat: "TELEGRAM_DEV_CHAT_ID", token: "TELEGRAM_DEV_BOT_TOKEN" },
};

const LIMITS = { name: 100, phone: 20, address: 500, note: 300, label: 200, items: 50, id: 40, source: 200, area: 40, contact: 100, message: 2000 };

const clip = (value, max) => String(value ?? "").slice(0, max);
const taka = (n) => `৳${Math.round(Number(n) || 0).toLocaleString("en-US")}`;
// Telegram's HTML mode only needs these three characters escaped, so any address or
// note a customer types (underscores, asterisks, brackets…) can't break the message.
const escapeHtml = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

function cleanOrder(raw = {}) {
  const items = (Array.isArray(raw.items) ? raw.items : []).slice(0, LIMITS.items).map((i) => ({
    label: clip(i.label, LIMITS.label),
    qty: Math.max(1, Math.min(99, parseInt(i.qty, 10) || 1)),
    lineTotal: Number(i.lineTotal) || 0,
  }));
  return {
    id: clip(raw.id, LIMITS.id),
    name: clip(raw.name, LIMITS.name).trim(),
    phone: clip(raw.phone, LIMITS.phone).trim(),
    address: clip(raw.address, LIMITS.address).trim(),
    area: clip(raw.areaLabel, LIMITS.area),
    deliveryTime: clip(raw.deliveryTime, LIMITS.area),
    note: clip(raw.note, LIMITS.note).trim(),
    source: clip(raw.source, LIMITS.source),
    items,
    subtotal: Number(raw.subtotal) || 0,
    delivery: Number(raw.delivery) || 0,
    total: Number(raw.total) || 0,
    time: new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }),
  };
}

// Items as a fixed-width table (Telegram shows <pre> in a monospace font). 32 characters
// fits a phone screen without wrapping; long names continue on the next line.
const COL = { item: 19, qty: 4, amount: 9 };
const TABLE_WIDTH = COL.item + COL.qty + COL.amount;

function wrapText(text, width) {
  const lines = [];
  let line = "";
  for (let word of String(text).split(/\s+/).filter(Boolean)) {
    while (word.length > width) {
      if (line) lines.push(line), (line = "");
      lines.push(word.slice(0, width));
      word = word.slice(width);
    }
    const next = line ? `${line} ${word}` : word;
    if (next.length > width) lines.push(line), (line = word);
    else line = next;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function itemsTable(o) {
  const row = (item, qty, amount) => item.padEnd(COL.item) + String(qty).padStart(COL.qty) + String(amount).padStart(COL.amount);
  const total = (label, amount) => label.padEnd(TABLE_WIDTH - String(amount).length) + amount;
  const rule = "─".repeat(TABLE_WIDTH);
  const lines = [row("Item", "Qty", "Amount"), rule];
  o.items.forEach((i, index) => {
    const [first, ...rest] = wrapText(i.label, COL.item - 1);
    lines.push(row(first, i.qty, taka(i.lineTotal)));
    rest.forEach((line) => lines.push(line));
    if (index < o.items.length - 1) lines.push("- ".repeat(TABLE_WIDTH / 2).trimEnd());
  });
  lines.push(rule, total("Subtotal", taka(o.subtotal)), total("Delivery", taka(o.delivery)), total("TOTAL", taka(o.total)));
  return lines.join("\n");
}

// "17 Oct 2026, 5:24 PM" in Dhaka time, for messages (the sheet keeps o.time).
const niceTime = () =>
  new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).replace(/\b(am|pm)\b/, (m) => m.toUpperCase());

// Drops empty optional lines and doubled blank lines.
const joinLines = (lines) => lines.filter((line, index, all) => line !== null && (line !== "" || all[index - 1] !== "")).join("\n");

// Telegram HTML: <blockquote> draws a coloured bar beside a block, <code> is tap-to-copy,
// and a plain phone number is tap-to-call.
function telegramMessage(o) {
  const e = escapeHtml;
  return joinLines([
    `🛒 <b>NEW ORDER</b>  <code>${e(o.id)}</code>`,
    `<i>${e(niceTime())}</i>`,
    "",
    "<b>👤 CUSTOMER</b>",
    `<blockquote><b>${e(o.name)}</b>`,
    `📞 ${e(o.phone)}`,
    `📍 ${e(o.address)}`,
    `🚚 ${e(o.area)}${o.deliveryTime ? `  ·  ${e(o.deliveryTime)}` : ""}</blockquote>`,
    o.note ? "" : null,
    o.note ? "<b>📝 NOTE</b>" : null,
    o.note ? `<blockquote><i>${e(o.note)}</i></blockquote>` : null,
    "",
    "<b>📦 ITEMS</b>",
    `<pre>${e(itemsTable(o))}</pre>`,
    "",
    `<blockquote>💰 <b>COLLECT ${taka(o.total)}</b>  ·  cash on delivery</blockquote>`,
    o.source ? `🔗 <i>${e(o.source)}</i>` : null,
  ]);
}

function cleanContact(raw = {}) {
  return {
    name: clip(raw.name, LIMITS.name).trim(),
    contact: clip(raw.contact, LIMITS.contact).trim(),
    message: clip(raw.message, LIMITS.message).trim(),
    source: clip(raw.source, LIMITS.source),
    time: new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }),
  };
}

function contactMessage(c) {
  const e = escapeHtml;
  return joinLines([
    "📬 <b>NEW MESSAGE</b>  ·  contact form",
    `<i>${e(niceTime())}</i>`,
    "",
    "<b>👤 FROM</b>",
    `<blockquote><b>${e(c.name || "No name given")}</b>`,
    `📞 ${e(c.contact)}</blockquote>`,
    "",
    "<b>💬 MESSAGE</b>",
    `<blockquote>${e(c.message)}</blockquote>`,
    c.source ? `🔗 <i>${e(c.source)}</i>` : null,
  ]);
}

async function sendTelegram(text, who) {
  const vars = TELEGRAM_CHATS[who];
  const chatId = vars && process.env[vars.chat];
  const token = vars && (process.env[vars.token] || process.env.TELEGRAM_BOT_TOKEN);
  if (!chatId || !token) return "not-configured";
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (!res.ok) {
    console.error(`Telegram API error (${who}):`, await res.text());
    return "failed";
  }
  return "sent";
}

async function sendToSheet(o) {
  const { SHEET_WEBHOOK_URL, SHEET_TOKEN } = process.env;
  if (!SHEET_WEBHOOK_URL) return "not-configured";
  const res = await fetch(SHEET_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: SHEET_TOKEN || "",
      order: { ...o, items: o.items.map((i) => `${i.label} × ${i.qty}`).join("\n") },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    console.error("Order sheet error:", res.status, data);
    return "failed";
  }
  return "sent";
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // The browser only calls this from the live address (js/config.js test mode). As a
  // second lock, refuse browser requests from any other site, including deploy
  // previews and `netlify dev`. URL is Netlify's own main address for the site.
  // Scripts can fake this header, so it's a speed bump against spam, not a lock.
  const origin = event.headers.origin;
  if (origin && origin !== process.env.URL) {
    return json(403, { error: "Origin not allowed" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Invalid JSON" });
  }
  const channels = payload.channels || {};
  const chats = (Array.isArray(channels.telegram) ? channels.telegram : []).filter((who) => TELEGRAM_CHATS[who]);
  const toChats = (text) => chats.map((who) => sendTelegram(text, who).catch((err) => (console.error(err), "failed")));

  if (payload.kind === "contact") {
    const c = cleanContact(payload.contact);
    if (!c.contact || !c.message) return json(400, { error: "Missing phone/email or message" });
    const sent = await Promise.all(toChats(contactMessage(c)));
    return json(200, { telegram: Object.fromEntries(chats.map((who, i) => [who, sent[i]])) });
  }

  const o = cleanOrder(payload.order);
  if (!/^01[3-9]\d{8}$/.test(o.phone) || !o.items.length || !o.id) {
    return json(400, { error: "Missing phone, items or order number" });
  }

  const [sheet, ...sent] = await Promise.all([
    channels.sheet ? sendToSheet(o).catch((err) => (console.error(err), "failed")) : "off",
    ...toChats(telegramMessage(o)),
  ]);
  const telegram = Object.fromEntries(chats.map((who, i) => [who, sent[i]]));
  return json(200, { telegram, sheet });
};
