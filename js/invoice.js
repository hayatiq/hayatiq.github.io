/* ==============================
       Order invoice: on the /order page and as a downloadable PDF
       ============================== */
// The invoice on the confirmation page (invoiceHtml) and the "Download invoice" PDF
// (downloadInvoice) show the same things: order number and date, who it's for, the
// items, delivery and the total to pay on delivery. The PDF is drawn on a canvas and
// wrapped in a one-page PDF here, so no PDF library is needed. Uses money() and
// escapeHtml() from js/script.js.

// "Solid Conditioner Bar (All Hair Types · 60g+)" → name and option on separate lines.
function splitItemLabel(label) {
  const match = /^(.*?) \((.*)\)$/.exec(label);
  return match ? { name: match[1], option: match[2] } : { name: label, option: "" };
}

function orderDate(order) {
  return new Date(order.createdAt || Date.now()).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function invoiceHtml(order) {
  const e = escapeHtml;
  const rows = order.items
    .map((i) => {
      const { name, option } = splitItemLabel(i.label);
      return `<div class="invoice-row">
          <div class="invoice-item"><strong>${e(name)}</strong>${option ? `<small>${e(option)}</small>` : ""}<small>${money(i.lineTotal / i.qty)} each</small></div>
          <span class="invoice-qty">× ${i.qty}</span>
          <span class="invoice-amount">${money(i.lineTotal)}</span>
        </div>`;
    })
    .join("");
  return `<article class="invoice" aria-label="Invoice ${e(order.id)}">
      <header class="invoice-head">
        <div class="invoice-brand"><span class="brand-logo" aria-hidden="true"></span>HAYATIQ</div>
        <div class="invoice-id">
          <span class="invoice-label">Invoice</span>
          <strong>${e(order.id)}</strong>
          <span>${e(orderDate(order))}</span>
        </div>
      </header>
      <div class="invoice-parties">
        <div>
          <span class="invoice-label">Billed to</span>
          <strong>${e(order.name)}</strong>
          <span>${e(order.phone)}</span>
          <span>${e(order.address)}</span>
        </div>
        <div>
          <span class="invoice-label">Payment</span>
          <strong>Cash on delivery</strong>
          <span>${e(order.areaLabel)}, ${e(DELIVERY_TIME[order.area] || "")}</span>
        </div>
      </div>
      <div class="invoice-items">
        <div class="invoice-row invoice-row-head"><span>Item</span><span class="invoice-qty">Qty</span><span class="invoice-amount">Amount</span></div>
        ${rows}
      </div>
      <div class="invoice-totals">
        <div><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
        <div><span>Delivery (${e(order.areaLabel)})</span><span>${money(order.delivery)}</span></div>
        <div class="invoice-grand"><span>Total to pay on delivery</span><strong>${money(order.total)}</strong></div>
      </div>
      ${order.note ? `<p class="invoice-note"><strong>Note:</strong> ${e(order.note)}</p>` : ""}
      <div class="invoice-tools">
        <button type="button" class="btn button-primary btn-sm" onclick="downloadInvoice(this)"><i class="fa-solid fa-download" aria-hidden="true"></i> Download PDF</button>
        <button type="button" class="btn button-ghost btn-sm" onclick="copyText('${e(order.id)}', 'Order number copied')"><i class="fa-solid fa-copy" aria-hidden="true"></i> Copy order no.</button>
      </div>
    </article>`;
}

/* ---- PDF ---- */

async function downloadInvoice(button) {
  let order = null;
  try {
    order = JSON.parse(localStorage.getItem(LAST_ORDER_KEY));
  } catch (e) {}
  if (!order) return;
  if (button) button.disabled = true;
  try {
    const canvas = await drawInvoice(order);
    const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    const pdf = imagePdf(new Uint8Array(await jpeg.arrayBuffer()), canvas.width, canvas.height, `Hayatiq invoice ${order.id}`);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(pdf);
    link.download = `Hayatiq-invoice-${order.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    toast("Invoice downloaded", "success");
  } catch (err) {
    console.error("Invoice download failed:", err);
    toast("Couldn't create the invoice. Please take a screenshot instead.", "warning");
  } finally {
    if (button) button.disabled = false;
  }
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Draws the invoice on an A4-width canvas, as tall as the order needs.
async function drawInvoice(order) {
  const W = 800; // layout width in CSS pixels
  const SCALE = 3; // sharp when printed or zoomed
  const PAD = 56;
  const css = getComputedStyle(document.documentElement);
  const color = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  const C = {
    brand: color("--color-earth", "#1F6B52"),
    heading: color("--color-seal-brown", "#1F3F33"),
    text: "#2b3430",
    muted: "#6D766F",
    line: "#E6DED3",
    tint: color("--color-hover", "#EAF5EF"),
  };
  const FONT = "Outfit, 'Noto Sans Bengali', system-ui, sans-serif";
  await Promise.all([document.fonts.load(`400 16px ${FONT}`), document.fonts.load(`700 16px ${FONT}`)]).catch(() => {});
  const logo = await loadImage("images/logo.webp");

  // Lay everything out first (as a list of drawing steps) so the canvas can be sized
  // to fit, then paint.
  const measure = document.createElement("canvas").getContext("2d");
  const steps = [];
  const font = (size, weight = 400) => `${weight} ${size}px ${FONT}`;
  const wrap = (text, size, weight, maxWidth) => {
    measure.font = font(size, weight);
    const lines = [];
    let line = "";
    String(text).split(/\s+/).forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (line && measure.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = next;
    });
    if (line) lines.push(line);
    return lines;
  };
  const text = (str, x, y, size, opts = {}) =>
    steps.push((ctx) => {
      ctx.font = font(size, opts.weight || 400);
      ctx.fillStyle = opts.color || C.text;
      ctx.textAlign = opts.align || "left";
      if (opts.spacing) ctx.letterSpacing = `${opts.spacing}px`;
      ctx.fillText(str, x, y);
      ctx.letterSpacing = "0px";
    });
  const rule = (y, dashed = false) =>
    steps.push((ctx) => {
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.setLineDash(dashed ? [6, 5] : []);
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  const label = (str, x, y, align) => text(str.toUpperCase(), x, y, 11, { weight: 700, color: C.muted, spacing: 1.5, align });

  let y = 0;
  // Brand band
  steps.push((ctx) => {
    ctx.fillStyle = C.brand;
    ctx.fillRect(0, 0, W, 8);
  });
  y = 64;
  const logoY = y; // steps run later, after y has moved on
  if (logo) {
    steps.push((ctx) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(PAD + 24, logoY + 10, 24, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, PAD, logoY - 14, 48, 48);
      ctx.restore();
    });
  }
  text("HAYATIQ", PAD + (logo ? 60 : 0), y + 19, 26, { weight: 700, color: C.brand, spacing: 1 });
  text("Handmade natural wellness", PAD + (logo ? 60 : 0), y + 38, 12, { color: C.muted });
  label("Invoice", W - PAD, y - 2, "right");
  text(order.id, W - PAD, y + 22, 20, { weight: 700, color: C.heading, align: "right" });
  text(orderDate(order), W - PAD, y + 42, 13, { color: C.muted, align: "right" });
  if (order.test) text("TEST ORDER", W / 2, y + 20, 13, { weight: 700, color: "#b91c1c", align: "center", spacing: 2 });
  y += 76;
  rule(y);

  // Billed to / Payment
  y += 34;
  const colW = 330;
  const right = W / 2 + 40;
  label("Billed to", PAD, y);
  label("Payment", right, y);
  let left = y + 26;
  text(order.name, PAD, left, 16, { weight: 700, color: C.heading });
  left += 22;
  text(order.phone, PAD, left, 14);
  wrap(order.address, 14, 400, colW).forEach((line) => {
    left += 20;
    text(line, PAD, left, 14, { color: C.muted });
  });
  let rightY = y + 26;
  text("Cash on delivery", right, rightY, 16, { weight: 700, color: C.heading });
  rightY += 22;
  text(`${order.areaLabel}, ${DELIVERY_TIME[order.area] || ""}`, right, rightY, 14);
  rightY += 20;
  text("We'll call to confirm before sending", right, rightY, 14, { color: C.muted });
  y = Math.max(left, rightY) + 34;

  // Items
  const QTY_X = W - PAD - 150;
  const ITEM_W = QTY_X - PAD - 60;
  const headY = y;
  steps.push((ctx) => {
    ctx.fillStyle = C.tint;
    ctx.beginPath();
    ctx.roundRect(PAD - 12, headY, W - 2 * PAD + 24, 34, 8);
    ctx.fill();
  });
  label("Item", PAD, y + 22);
  label("Qty", QTY_X, y + 22, "right");
  label("Amount", W - PAD, y + 22, "right");
  y += 34;
  order.items.forEach((item, index) => {
    const { name, option } = splitItemLabel(item.label);
    let rowY = y + 28;
    wrap(name, 15, 700, ITEM_W).forEach((line, i) => {
      if (i) rowY += 20;
      text(line, PAD, rowY, 15, { weight: 700, color: C.heading });
    });
    text(`× ${item.qty}`, QTY_X, y + 28, 15, { align: "right" });
    text(money(item.lineTotal), W - PAD, y + 28, 15, { weight: 700, color: C.heading, align: "right" });
    const details = [option, `${money(item.lineTotal / item.qty)} each`].filter(Boolean).join("  ·  ");
    wrap(details, 13, 400, ITEM_W).forEach((line) => {
      rowY += 19;
      text(line, PAD, rowY, 13, { color: C.muted });
    });
    y = rowY + 18;
    if (index < order.items.length - 1) rule(y);
  });
  rule(y);

  // Totals
  const TOTALS_X = W / 2 + 20;
  y += 32;
  text("Subtotal", TOTALS_X, y, 14, { color: C.muted });
  text(money(order.subtotal), W - PAD, y, 14, { align: "right" });
  y += 26;
  text(`Delivery (${order.areaLabel})`, TOTALS_X, y, 14, { color: C.muted });
  text(money(order.delivery), W - PAD, y, 14, { align: "right" });
  y += 20;
  const boxY = y;
  steps.push((ctx) => {
    ctx.fillStyle = C.brand;
    ctx.beginPath();
    ctx.roundRect(TOTALS_X - 16, boxY, W - PAD - TOTALS_X + 28, 52, 10);
    ctx.fill();
  });
  text("Total to pay on delivery", TOTALS_X, y + 32, 14, { weight: 700, color: "#fff" });
  text(money(order.total), W - PAD, y + 34, 22, { weight: 700, color: "#fff", align: "right" });
  y += 52;

  if (order.note) {
    y += 34;
    label("Note", PAD, y);
    wrap(order.note, 14, 400, W - 2 * PAD).forEach((line) => {
      y += 21;
      text(line, PAD, y, 14, { color: C.muted });
    });
  }

  // Footer
  y += 44;
  rule(y, true);
  y += 36;
  text("Thank you for choosing Hayatiq!", W / 2, y, 16, { weight: 700, color: C.heading, align: "center" });
  y += 24;
  text(`Questions? Message us at ${FACEBOOK_URL.replace(/^https?:\/\//, "")}`, W / 2, y, 13, { color: C.muted, align: "center" });
  y += 40;

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = Math.ceil(y * SCALE);
  const ctx = canvas.getContext("2d");
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = "#fff"; // JPEG has no transparency
  ctx.fillRect(0, 0, W, y);
  ctx.textBaseline = "alphabetic";
  steps.forEach((step) => step(ctx));
  return canvas;
}

// A one-page PDF (A4 width, as tall as the image) showing a single JPEG.
function imagePdf(jpeg, width, height, title) {
  const enc = new TextEncoder();
  const pageW = 595.28;
  const pageH = +(pageW * (height / width)).toFixed(2);
  const parts = [];
  const offsets = [];
  let length = 0;
  const push = (chunk) => {
    const bytes = typeof chunk === "string" ? enc.encode(chunk) : chunk;
    parts.push(bytes);
    length += bytes.length;
  };
  const object = (n, dict, stream) => {
    offsets[n] = length;
    push(`${n} 0 obj\n${dict}\n`);
    if (stream) {
      push("stream\n");
      push(stream);
      push("\nendstream\n");
    }
    push("endobj\n");
  };
  const content = enc.encode(`q ${pageW} 0 0 ${pageH} 0 0 cm /Im0 Do Q`);
  const pdfText = (s) => `(${String(s).replace(/[\\()]/g, "\\$&").replace(/[^\x20-\x7e]/g, "")})`;

  push("%PDF-1.4\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  object(4, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`, jpeg);
  object(5, `<< /Length ${content.length} >>`, content);
  object(6, `<< /Title ${pdfText(title)} /Producer (Hayatiq) >>`);
  const xref = length;
  push(`xref\n0 7\n0000000000 65535 f \n${offsets.slice(1).map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`);
  push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts, { type: "application/pdf" });
}
