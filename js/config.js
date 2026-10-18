/* ==============================
       Site settings — the one place to change shop-wide behaviour
       ============================== */

/* ---- Live vs test mode ----
   Real sends (order and contact emails via FormSubmit, Telegram alerts, the order
   sheet, visit summaries, analytics) only happen on the production address below.
   Everywhere else (localhost, a phone testing over Wi-Fi, Netlify deploy previews,
   `netlify dev`) the site runs in test mode: forms go through their full flow, but
   nothing leaves the browser. If the shop ever moves to its own domain, add it here. */
const LIVE_HOSTS = ["hayatiq.netlify.app"];

/* ---- Real sends while developing ----
   To test emails, Telegram and the sheet for real from your own computer, run the
   local test server (tools/dev-server.js, see README.MD "Testing real sends locally")
   and open the site once with ?send=real. That tab then sends for real until you open
   ?send=test or close it. Only works on localhost and home-network addresses. */
const IS_LOCAL = /^(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(location.hostname);
const REAL_SENDS_KEY = "hayatiq_real_sends";
if (IS_LOCAL) {
  const send = new URLSearchParams(location.search).get("send");
  try {
    if (send === "real") sessionStorage.setItem(REAL_SENDS_KEY, "1");
    if (send === "test") sessionStorage.removeItem(REAL_SENDS_KEY);
  } catch (e) {}
}
const LOCAL_REAL_SENDS = IS_LOCAL && (() => {
  try {
    return sessionStorage.getItem(REAL_SENDS_KEY) === "1";
  } catch (e) {
    return false;
  }
})();

const IS_LIVE = LIVE_HOSTS.includes(location.hostname) || LOCAL_REAL_SENDS;

/* ---- Not tracking your own devices ----
   Open the site once with ?notrack on each phone/browser you use (the Facebook app's
   browser counts separately): that browser then sends no visit-summary emails and no
   Umami stats, so your own visits don't use quota or skew the numbers. Orders still
   work normally. ?track turns tracking back on. */
const NO_TRACK_KEY = "hayatiq_notrack";
const TRACK_CHANGE = (() => {
  const params = new URLSearchParams(location.search);
  const change = params.has("notrack") ? "off" : params.has("track") ? "on" : "";
  if (!change) return "";
  try {
    if (change === "off") {
      localStorage.setItem(NO_TRACK_KEY, "1");
      localStorage.setItem("umami.disabled", "1"); // Umami's own opt-out
    } else {
      localStorage.removeItem(NO_TRACK_KEY);
      localStorage.removeItem("umami.disabled");
    }
  } catch (e) {}
  // Tidy the address bar so the setting isn't shared by accident with a copied link.
  params.delete("notrack");
  params.delete("track");
  history.replaceState(history.state, "", `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`);
  return change;
})();
const NO_TRACK = (() => {
  try {
    return localStorage.getItem(NO_TRACK_KEY) === "1";
  } catch (e) {
    return false;
  }
})();
if (TRACK_CHANGE) {
  window.addEventListener("load", () => {
    if (typeof toast === "function") {
      toast(TRACK_CHANGE === "off" ? "This device is no longer tracked" : "Tracking is back on for this device", "success");
    }
  });
}

/* ---- Who gets what ----
   Two recipients: the business (hayatiq) and the developer. For each kind of message,
   list who should get it; an empty list [] turns it off. Every email is one FormSubmit
   submission, so each extra recipient uses quota.
   Telegram chat IDs and the Google Sheet address are secrets and stay in Netlify's
   environment variables (README.MD "Order notifications"); here you only switch them
   on or off. A Telegram chat whose variable isn't set in Netlify is simply skipped. */
const NOTIFY = {
  emails: {
    business: "hayatiq.life@gmail.com",
    developer: "topukhan6364@gmail.com",
  },
  orderEmails: ["business", "developer"], // "You have an order" email
  contactEmails: ["business", "developer"], // contact-form messages
  visitSummaryEmails: ["developer"], // visit summaries (js/visitor.js)
  orderTelegram: ["business", "developer"], // TELEGRAM_CHAT_ID / TELEGRAM_DEV_CHAT_ID
  contactTelegram: ["business", "developer"], // contact-form messages, same Telegram chats as orders
  orderSheet: true, // a row per order in the Google Sheet (SHEET_WEBHOOK_URL)
};

// Email addresses for one kind of message, e.g. recipients("orderEmails").
function recipients(kind) {
  return (NOTIFY[kind] || []).map((who) => NOTIFY.emails[who]).filter(Boolean);
}

// Whether one kind of message (a NOTIFY key, e.g. "visitSummaryEmails") is really sent.
// On the live site: always. With local real sends: only if its SEND_* line in .env is
// on (tools/dev-server.js hands those switches to the page). If the page didn't get
// the switches (another local server, or an old dev-server still running), nothing is sent.
const LOCAL_SWITCHES = LOCAL_REAL_SENDS ? window.HAYATIQ_LOCAL_SWITCHES || null : null;
function sendsOn(kind) {
  if (!IS_LIVE) return false;
  if (!LOCAL_REAL_SENDS) return true;
  return Boolean(LOCAL_SWITCHES && LOCAL_SWITCHES[kind]);
}

/* ---- Analytics ----
   Paste the Website ID from cloud.umami.is (Settings → Websites → Edit) to turn on
   Umami. Leave empty to keep it off. */
const UMAMI_WEBSITE_ID = "64d1b719-e002-47ac-9b7f-a433917061d3";

/* ---- Homepage top section ----
   "text": headline and one trust line (the original). "photo": photo hero with a
   Shop Now button and trust chips. Both are in index.html (data-hero). */
const HOME_HERO = "text";
document.documentElement.dataset.hero = HOME_HERO;

/* ---- Bangla ----
   true shows the বাংলা / EN switch in the header (js/i18n.js); false hides it and
   keeps the site in English. */
const SHOW_BANGLA = true;

/* ---- Delivery and support text shown to customers ---- */
const DELIVERY_TIME = { inside_dhaka: "about 2 days", outside_dhaka: "3–5 days" };
const DAMAGE_PROMISE = "If anything arrives damaged, message us on Facebook and we'll sort it out.";
const FACEBOOK_URL = "https://facebook.com/hayatiq.life";
const MESSENGER_URL = "https://m.me/hayatiq.life";

/* ---- Setup that follows from the settings above ---- */

// The GitHub Pages copy serves these same files but has no Telegram function and
// 404s on product links, so send anyone who lands there to the real shop.
if (location.hostname === "hayatiq.github.io") {
  location.replace(`https://${LIVE_HOSTS[0]}${location.pathname}${location.search}${location.hash}`);
}

// Loaded at the end of <body>, so the body already exists here.
if (LOCAL_REAL_SENDS && !LOCAL_SWITCHES) {
  document.body.insertAdjacentHTML(
    "afterbegin",
    '<div class="test-mode-banner" role="status">REAL SENDS BLOCKED: open the site through <code>node tools/dev-server.js</code> (restart it after changing .env) · <a href="/?send=test">turn off</a></div>'
  );
} else if (LOCAL_REAL_SENDS) {
  const off = Object.keys(LOCAL_SWITCHES).filter((kind) => !LOCAL_SWITCHES[kind]);
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="test-mode-banner real-sends" role="status">REAL SENDS ON${off.length ? ` (off: ${off.join(", ")})` : ""} · <a href="/?send=test">turn off</a></div>`
  );
} else if (!IS_LIVE) {
  document.body.insertAdjacentHTML(
    "afterbegin",
    '<div class="test-mode-banner" role="status">TEST MODE: orders, emails and Telegram alerts are not sent</div>'
  );
}

if (IS_LIVE && !LOCAL_REAL_SENDS && !NO_TRACK && UMAMI_WEBSITE_ID) {
  const umami = document.createElement("script");
  umami.src = "https://cloud.umami.is/script.js";
  umami.defer = true;
  umami.dataset.websiteId = UMAMI_WEBSITE_ID;
  document.head.appendChild(umami);
}

// Analytics event helper; a no-op until Umami is loaded (and always in test mode).
function trackEvent(name, data) {
  if (IS_LIVE && !NO_TRACK && window.umami && typeof window.umami.track === "function") {
    window.umami.track(name, data);
  }
}

// Remembers where this visit came from (first page, referrer, campaign tags) so the
// visit summary and the order itself can say which post or ad brought the buyer.
function visitSource() {
  try {
    const saved = sessionStorage.getItem("hayatiq_source");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  const params = new URLSearchParams(location.search);
  const source = {
    landing: location.pathname,
    referrer: document.referrer || "",
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
  };
  try {
    sessionStorage.setItem("hayatiq_source", JSON.stringify(source));
  } catch (e) {}
  return source;
}
visitSource();

function sourceLabel(source = visitSource()) {
  if (source.utm_source) {
    return [source.utm_source, source.utm_medium, source.utm_campaign].filter(Boolean).join(" / ");
  }
  if (!source.referrer) return "Direct or in-app browser";
  try {
    return new URL(source.referrer).hostname;
  } catch (e) {
    return source.referrer;
  }
}
