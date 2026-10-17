/* ==============================
       Visit summaries (emailed via FormSubmit)
       ============================== */
// One "visit" = one browser tab: refreshing or switching to another app and back
// continues the same visit instead of starting a new one. A summary email goes out
// when the visitor leaves or switches away, and again only if they did something
// new since the last email (viewed another product, added to cart, reached checkout,
// ordered…). Emails only go out on the live address, to the people listed in
// NOTIFY.visitSummaryEmails (js/config.js), and never from a ?notrack device.
// Each device sends at most VISIT_EMAIL_LIMIT.max summaries per window; a summary held
// back by that limit is sent later (on the next tab switch, or the next time the site
// is opened on that device, within VISIT_EMAIL_LATE_MAX_AGE_MS).
const MIN_VISIT_EMAIL_DURATION_MS = 5000; // ignore visits with under 5 s of time on the page
const VISIT_EMAIL_LIMIT = { max: 3, windowMs: 10 * 60 * 1000 }; // 3 emails per 10 minutes
const VISIT_EMAIL_LATE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // drop held-back summaries after a day
const VISIT_EMAIL_LOG_KEY = "hayatiq_visit_email_log"; // localStorage: when this device sent summaries

const USER_BEHAVIOR_KEY = "user_behavior"; // localStorage: last 10 visits on this phone
const VISIT_SESSION_KEY = "current_visit_data"; // sessionStorage: the visit in progress
const VISIT_ACTIVE_KEY = "hayatiq_visit_active"; // sessionStorage: this tab already counted

function readJSON(storage, key, fallback) {
  try {
    return JSON.parse(storage.getItem(key)) || fallback;
  } catch (e) {
    return fallback;
  }
}
function writeJSON(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

function newVisitSession() {
  return {
    visitId: Math.random().toString(36).slice(2, 7).toUpperCase(),
    startTimestamp: Date.now(),
    currentPage: null,
    pageStartTime: Date.now(),
    pages: [],
    productsViewed: [],
    socialClicks: [],
    cartActions: [],
    filterActions: [],
    wishlistActions: [],
    variantSelections: [],
    contactActions: [],
    checkoutActions: [],
    formFields: {},
    orderPlaced: false,
    orderData: null,
    source: typeof visitSource === "function" ? visitSource() : {},
    emailsSent: 0,
    lastSentSignature: null,
  };
}

function getVisitSession() {
  return readJSON(sessionStorage, VISIT_SESSION_KEY, null) || newVisitSession();
}
function saveSession(sessionData) {
  writeJSON(sessionStorage, VISIT_SESSION_KEY, sessionData);
}
function updateSession(change) {
  const sessionData = getVisitSession();
  change(sessionData);
  saveSession(sessionData);
}

// Start (or continue) the visit right away, before the router records the landing
// page, so the first page and product a visitor sees are never lost.
(function startVisit() {
  if (!sessionStorage.getItem(VISIT_ACTIVE_KEY)) {
    try {
      sessionStorage.setItem(VISIT_ACTIVE_KEY, "1");
    } catch (e) {}
    saveSession(newVisitSession());
    const visitCount = parseInt(localStorage.getItem("visit_count") || "0") + 1;
    localStorage.setItem("visit_count", visitCount.toString());
  } else {
    // Same tab after a refresh: keep the visit, restart the clock for this page.
    updateSession((s) => {
      s.currentPage = null;
      s.pageStartTime = Date.now();
    });
  }
})();

function now() {
  return { timestamp: Date.now(), time: new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) };
}

// Closes the current page's time slot (on navigation or when the tab is hidden).
function closePageSegment(s) {
  if (!s.currentPage) return;
  s.pages.push({ page: s.currentPage, duration: Date.now() - s.pageStartTime, ...now() });
  s.pageStartTime = Date.now();
}

function trackPageView(pageName) {
  updateSession((s) => {
    closePageSegment(s);
    s.currentPage = pageName;
    s.pageStartTime = Date.now();
  });
}

function trackProductView(productId, productName) {
  updateSession((s) => {
    if (!s.productsViewed.some((p) => p.productId === productId)) {
      s.productsViewed.push({ productId, productName, ...now() });
    }
  });
}

function trackSocialClick(platform) {
  updateSession((s) => s.socialClicks.push({ platform, ...now() }));
}

function trackCartAction(action, data = {}) {
  updateSession((s) => s.cartActions.push({ action, ...data, ...now() }));
}

function trackProductFilter(type, value) {
  if (!value) return;
  updateSession((s) => s.filterActions.push({ type, value, ...now() }));
}

function trackWishlistAction(action, data = {}) {
  updateSession((s) => s.wishlistActions.push({ action, ...data, ...now() }));
}

function trackVariantSelection(data = {}) {
  updateSession((s) => s.variantSelections.push({ ...data, ...now() }));
}

function trackFormField(field, value) {
  if (!value || !value.trim()) return;
  updateSession((s) => {
    s.formFields[field] = { value: value.trim(), length: value.trim().length, ...now() };
  });
}

function trackContactAction(action, data = {}) {
  updateSession((s) => s.contactActions.push({ action, ...data, ...now() }));
}

function trackCheckoutAction(action, data = {}) {
  updateSession((s) => s.checkoutActions.push({ action, ...data, ...now() }));
}

function trackOrderPlaced(orderData = {}) {
  updateSession((s) => {
    s.orderPlaced = true;
    s.orderData = {
      orderId: orderData.orderId || "",
      name: orderData.name || "",
      phone: orderData.phone || "",
      address: orderData.address || "",
      note: orderData.note || "",
      total: orderData.total || 0,
      ...now(),
    };
    s.checkoutActions.push({ action: "order_placed", orderId: orderData.orderId || "", total: orderData.total || 0, ...now() });
  });
}

function getBehavior() {
  return readJSON(localStorage, USER_BEHAVIOR_KEY, {});
}

function saveSessionToHistory(sessionData) {
  const behavior = getBehavior();
  behavior.visitHistory = (behavior.visitHistory || []).filter((v) => v.visitId !== sessionData.visitId);
  behavior.visitHistory.unshift(sessionData);
  behavior.visitHistory = behavior.visitHistory.slice(0, 10);
  writeJSON(localStorage, USER_BEHAVIOR_KEY, behavior);
}

/* ---------- Building the summary ---------- */

function formatDuration(ms) {
  if (!ms || isNaN(ms)) return "0s";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

function parseUserAgent(ua) {
  if (!ua) return "Unknown Device";
  let os = "Desktop";
  if (/Android/i.test(ua)) os = "Android Mobile";
  else if (/iPhone/i.test(ua)) os = "iPhone";
  else if (/iPad/i.test(ua)) os = "iPad";
  else if (/Windows/i.test(ua)) os = "Windows PC";
  else if (/Macintosh/i.test(ua)) os = "Mac";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Browser";
  if (/FB_IAB|FB4A|FBAV|FBAN/i.test(ua)) browser = "Facebook App";
  else if (/Instagram/i.test(ua)) browser = "Instagram App";
  else if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";

  return `${os} (${browser})`;
}

function activeTime(sessionData) {
  return sessionData.pages.reduce((sum, p) => sum + (p.duration || 0), 0);
}

// What's in the cart right now (including items added on an earlier visit).
function cartSnapshot() {
  const items = typeof orderItems === "function" ? orderItems() : [];
  return {
    items: items.map((i) => `${i.label} × ${i.qty}`),
    subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
  };
}

const taka = (n) => `৳${Math.round(Number(n) || 0).toLocaleString("en-US")}`;

function getVisitorIntent(sessionData) {
  const fields = sessionData.formFields || {};
  const hasCheckoutData = Boolean(fields.checkout_name?.value || fields.checkout_phone?.value || fields.checkout_address?.value);

  if (sessionData.orderPlaced) {
    const o = sessionData.orderData || {};
    const totalPart = Number(o.total) > 0 ? ` - ৳${Math.round(Number(o.total)).toLocaleString("en-US")}` : "";
    return {
      isOrderPlaced: true,
      level: "🎉 ORDER COMPLETED",
      subjectTag: `🎉 [Order Placed${o.orderId ? ` ${o.orderId}` : ""}] ${o.name || "Customer"}${totalPart}`,
    };
  }
  if (sessionData.contactActions.some((a) => a.action === "form_submit")) {
    const who = fields.contact_name?.value || "Visitor";
    return { level: "📬 CONTACT MESSAGE SENT", subjectTag: `📬 [Contact Message] ${who}` };
  }
  const reachedCheckout = sessionData.pages.some((p) => p.page === "checkout") || sessionData.currentPage === "checkout";
  if (hasCheckoutData) {
    return { level: "🔥 HIGH INTENT: Checkout Data Entered (Unfinished Order)", subjectTag: "🔥 [High Intent Lead] Checkout Filled (Unfinished)" };
  }
  if (reachedCheckout) return { level: "🛒 HIGH INTENT: Checkout Abandoned", subjectTag: "🛒 [Abandoned Checkout]" };
  if (sessionData.cartActions.some((a) => a.action === "add_to_cart") || sessionData.cartNow?.items.length) {
    return { level: "🛍️ CART ENGAGED: Items Added to Cart", subjectTag: "🛍️ [Cart Active]" };
  }
  if (sessionData.productsViewed.length) return { level: "👀 PRODUCT EXPLORER: Browsed Products", subjectTag: "👀 [Browsed Products]" };
  return { level: "⏱️ VISITOR SESSION SUMMARY", subjectTag: "⏱️ [Visit Summary]" };
}

function formatOrderPlacedSummary(sessionData) {
  const o = sessionData.orderData || {};
  const lines = [
    "🎉 COMPLETED ORDER DETAILS:",
    o.orderId ? `  • Order Number: ${o.orderId}` : "",
    `  • Customer Name: ${o.name || "Customer"}`,
    `  • Phone Number: ${o.phone || "Not provided"}`,
    `  • Full Delivery Address: ${o.address || "Not provided"}`,
    o.note ? `  • Order Note: ${o.note}` : "",
    Number(o.total) > 0 ? `  • Total Amount: ৳${Math.round(Number(o.total)).toLocaleString("en-US")}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

function formatFormFieldsSummary(formFields) {
  if (!formFields || Object.keys(formFields).length === 0) return null;
  const lines = [];
  const f = (key) => formFields[key]?.value;

  if (f("checkout_name") || f("checkout_phone") || f("checkout_address") || f("checkout_order_note")) {
    lines.push("📋 CUSTOMER ENTERED CHECKOUT DETAILS (UNFINISHED ORDER):");
    if (f("checkout_name")) lines.push(`  • Full Name: ${f("checkout_name")}`);
    if (f("checkout_phone")) lines.push(`  • Phone Number: ${f("checkout_phone")}`);
    if (f("checkout_address")) lines.push(`  • Full Delivery Address: ${f("checkout_address")}`);
    if (f("checkout_shipping_method")) {
      const area = f("checkout_shipping_method");
      lines.push(`  • Delivery Area: ${(typeof AREA_LABELS !== "undefined" && AREA_LABELS[area]) || area}`);
    }
    if (f("checkout_order_note")) lines.push(`  • Order Note: ${f("checkout_order_note")}`);
  }
  if (f("contact_name") || f("contact_email_or_phone") || f("contact_message")) {
    if (lines.length) lines.push("");
    lines.push("📬 CONTACT FORM DETAILS:");
    if (f("contact_name")) lines.push(`  • Name: ${f("contact_name")}`);
    if (f("contact_email_or_phone")) lines.push(`  • Phone/Email: ${f("contact_email_or_phone")}`);
    if (f("contact_message")) lines.push(`  • Message: ${f("contact_message")}`);
  }
  return lines.length ? lines.join("\n") : null;
}

// Joins back-to-back time on the same page (e.g. before and after an app switch).
function formatJourneyTimeline(pages) {
  const merged = [];
  pages.forEach((p) => {
    const last = merged[merged.length - 1];
    if (last && last.page === p.page) last.duration += p.duration || 0;
    else merged.push({ page: p.page, duration: p.duration || 0 });
  });
  return merged.length ? merged.map((p) => `${p.page} (${formatDuration(p.duration)})`).join(" ➔ ") : "Single page visit";
}

function formatVisitSummaryMessage(sessionData, intent) {
  const source = sessionData.source || {};
  const sections = [];
  sections.push("==================================================");
  sections.push(intent.level);
  sections.push("==================================================\n");

  sections.push("⏱️ SESSION OVERVIEW");
  sections.push(`• Visit ID: ${sessionData.visitId}${sessionData.emailsSent ? ` (update ${sessionData.emailsSent + 1})` : ""}`);
  sections.push(`• Time on site: ${formatDuration(activeTime(sessionData))} (Visit #${localStorage.getItem("visit_count") || "1"} on this phone)`);
  sections.push(`• Started: ${new Date(sessionData.startTimestamp).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })} (Dhaka time)`);
  sections.push(`• Source: ${typeof sourceLabel === "function" ? sourceLabel(source) : source.referrer || "Direct"}`);
  sections.push(`• Landing page: ${source.landing || "/"}`);
  sections.push(`• Device: ${parseUserAgent(navigator.userAgent)}`);
  sections.push(`• Screen Size: ${window.screen ? `${window.screen.width} × ${window.screen.height}` : "Unknown"}\n`);

  if (intent.isOrderPlaced) {
    sections.push(`${formatOrderPlacedSummary(sessionData)}\n`);
  } else {
    const formSummary = formatFormFieldsSummary(sessionData.formFields);
    if (formSummary) sections.push(`${formSummary}\n`);
  }

  const shopping = [];
  const cart = sessionData.cartNow;
  if (cart && cart.items.length) shopping.push(`• Cart right now (${taka(cart.subtotal)}): ${cart.items.join(", ")}`);
  if (sessionData.productsViewed.length) {
    shopping.push(`• Products Viewed: ${sessionData.productsViewed.map((p) => p.productName).join(", ")}`);
  }
  const adds = sessionData.cartActions.filter((a) => a.action === "add_to_cart").map((a) => a.product || "item");
  if (adds.length) shopping.push(`• Added to Cart: ${adds.join(", ")}`);
  const removes = sessionData.cartActions.filter((a) => a.action === "remove_from_cart").map((a) => a.product || "item");
  if (removes.length) shopping.push(`• Removed from Cart: ${removes.join(", ")}`);
  if (sessionData.cartActions.some((a) => a.action === "clear_cart")) shopping.push("• Cleared the cart");
  if (sessionData.variantSelections.length) {
    shopping.push(`• Options Selected: ${sessionData.variantSelections.map((v) => `${v.product || "Product"}: ${v.variant || "Default"}`).join(", ")}`);
  }
  if (sessionData.wishlistActions.length) {
    shopping.push(`• Wishlist: ${sessionData.wishlistActions.map((w) => `${w.action} ${w.product || ""}`.trim()).join(", ")}`);
  }
  if (sessionData.filterActions.length) {
    shopping.push(`• Filters Applied: ${[...new Set(sessionData.filterActions.map((a) => `${a.type}: ${a.value}`))].join(", ")}`);
  }
  if (sessionData.socialClicks.length) {
    shopping.push(`• Social / Messenger Clicks: ${[...new Set(sessionData.socialClicks.map((c) => c.platform))].join(", ")} (${sessionData.socialClicks.length})`);
  }
  if (shopping.length) {
    sections.push("🛒 SHOPPING & SITE ACTIVITY");
    sections.push(shopping.join("\n") + "\n");
  }

  sections.push("📍 JOURNEY TIMELINE");
  sections.push(formatJourneyTimeline(sessionData.pages));
  return sections.join("\n");
}

/* ---------- Sending ---------- */

// What counts as "something new" for a follow-up email. Time on page alone doesn't.
function visitSignature(s) {
  return JSON.stringify([
    s.productsViewed.length,
    s.cartActions.length,
    s.wishlistActions.length,
    s.pages.some((p) => p.page === "checkout"),
    Object.keys(s.formFields).sort(),
    s.contactActions.length,
    s.orderPlaced,
  ]);
}

function captureOpenForms() {
  const fields = {
    checkout_name: "checkoutName",
    checkout_phone: "checkoutPhone",
    checkout_address: "checkoutAddress",
    checkout_order_note: "orderNote",
    contact_name: "name",
    contact_email_or_phone: "contact",
    contact_message: "message",
  };
  Object.entries(fields).forEach(([key, id]) => {
    const value = document.getElementById(id)?.value;
    if (value && value.trim()) trackFormField(key, value);
  });
}

function visitEmailsAllowed() {
  return !NO_TRACK && sendsOn("visitSummaryEmails") && recipients("visitSummaryEmails").length > 0;
}

// How many more summaries this device may send in the current window.
function visitEmailRoom() {
  const since = Date.now() - VISIT_EMAIL_LIMIT.windowMs;
  const log = readJSON(localStorage, VISIT_EMAIL_LOG_KEY, []).filter((t) => t > since);
  writeJSON(localStorage, VISIT_EMAIL_LOG_KEY, log);
  return VISIT_EMAIL_LIMIT.max - log.length;
}

function logVisitEmail() {
  writeJSON(localStorage, VISIT_EMAIL_LOG_KEY, [...readJSON(localStorage, VISIT_EMAIL_LOG_KEY, []), Date.now()]);
}

// Emails one summary (to every recipient) and marks the visit as sent up to now.
function sendVisitSummary(s, late = false) {
  recipients("visitSummaryEmails").forEach((address) => sendVisitEmail(s, address, late));
  logVisitEmail();
  s.lastSentSignature = visitSignature(s);
  s.emailsSent += 1;
  s.pendingEmail = false;
}

// Sends summaries of earlier visits on this device that the limit held back.
function sendHeldBackVisits(currentVisitId) {
  if (!visitEmailsAllowed()) return;
  const behavior = getBehavior();
  const history = behavior.visitHistory || [];
  let changed = false;
  history.forEach((v) => {
    if (!v.pendingEmail || v.visitId === currentVisitId) return;
    if (Date.now() - v.startTimestamp > VISIT_EMAIL_LATE_MAX_AGE_MS) {
      v.pendingEmail = false; // too old to be useful
    } else if (visitEmailRoom() > 0) {
      sendVisitSummary(v, true);
    } else return;
    changed = true;
  });
  if (changed) writeJSON(localStorage, USER_BEHAVIOR_KEY, behavior);
}

// Runs when the visitor switches away or leaves. Sends at most one email per change,
// within the per-device limit.
function flushVisit() {
  captureOpenForms();
  const s = getVisitSession();
  closePageSegment(s);
  s.cartNow = cartSnapshot();
  // Another tab may have sent this visit's held-back summary already.
  const saved = (getBehavior().visitHistory || []).find((v) => v.visitId === s.visitId);
  if (saved && saved.emailsSent > s.emailsSent) {
    s.emailsSent = saved.emailsSent;
    s.lastSentSignature = saved.lastSentSignature;
    s.pendingEmail = saved.pendingEmail;
  }
  const signature = visitSignature(s);
  const shouldSend = activeTime(s) >= MIN_VISIT_EMAIL_DURATION_MS && signature !== s.lastSentSignature;

  if (shouldSend) {
    if (!visitEmailsAllowed()) {
      console.log("Visit summary email not sent (?notrack device, test mode, SEND_VISIT_EMAILS=false, or turned off in config.js).");
      s.lastSentSignature = signature;
      s.pendingEmail = false;
    } else if (visitEmailRoom() > 0) {
      sendVisitSummary(s);
    } else {
      console.log(`Visit summary held back (limit: ${VISIT_EMAIL_LIMIT.max} per ${VISIT_EMAIL_LIMIT.windowMs / 60000} min); it will be sent later.`);
      s.pendingEmail = true;
    }
  }
  saveSession(s);
  saveSessionToHistory(s);
  sendHeldBackVisits(s.visitId);
}

function sendVisitEmail(sessionData, to, late = false) {
  const intent = getVisitorIntent(sessionData);
  const source = typeof sourceLabel === "function" ? sourceLabel(sessionData.source || {}) : "";
  const update = (sessionData.emailsSent ? " (update)" : "") + (late ? " (sent late)" : "");
  const body = new FormData();
  body.set("_subject", `${intent.subjectTag}${update} (${formatDuration(activeTime(sessionData))}) — ${source} — Visit ${sessionData.visitId}`);
  body.set("message", formatVisitSummaryMessage(sessionData, intent));
  // keepalive lets the request finish even if the tab is closing; a FormData body
  // needs no CORS preflight, which keepalive requests can't do.
  fetch(`https://formsubmit.co/ajax/${to}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body,
    keepalive: true,
  }).catch((err) => console.error("Error sending visit summary:", err));
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    flushVisit();
  } else {
    // Back from another app: same visit, the clock restarts for the current page.
    updateSession((s) => {
      s.pageStartTime = Date.now();
    });
  }
});
window.addEventListener("pagehide", flushVisit);
setTimeout(() => sendHeldBackVisits(getVisitSession().visitId), 5000);

// Page views come from navigate() in script.js on every route change (link click,
// back/forward or first load). Product pages are named after the product.
window.addEventListener("route-changed", () => {
  const parts = location.pathname.split("/").filter(Boolean);
  const pageName = parts[0] === "product" && parts[1] ? `product: ${decodeURIComponent(parts[1])}` : parts[0] || "home";
  const params = new URLSearchParams(location.search);
  trackPageView(pageName);
  if (params.get("cat")) trackProductFilter("category", params.get("cat"));
  if (params.get("concern")) trackProductFilter("need", params.get("concern"));
});

// Social and Messenger link clicks.
document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href*="instagram"], a[href*="facebook"], a[href*="m.me"]');
  if (!link) return;
  const href = link.getAttribute("href") || "";
  trackSocialClick(href.includes("instagram") ? "instagram" : href.includes("m.me") ? "messenger" : "facebook");
});

// Form fields: record typed values (on pause and on leaving a field), ignoring
// hidden settings fields and unchosen radio buttons.
function setupFormFieldTracking(form, prefix) {
  if (!form) return;
  const record = (field) => {
    if (field.type === "hidden" || field.name === "_honey" || !field.name) return;
    if (field.type === "radio" && !field.checked) return;
    if (field.value && field.value.trim()) trackFormField(`${prefix}_${field.name}`, field.value);
  };
  form.addEventListener("focusout", (e) => record(e.target));
  form.addEventListener("change", (e) => record(e.target));
  let timer;
  form.addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => record(e.target), 700);
  });
  form.addEventListener("submit", () => {
    if (prefix === "contact") trackContactAction("form_submit");
    else trackCheckoutAction("order_submit");
  });
}
setupFormFieldTracking(document.getElementById("contactForm"), "contact");
setupFormFieldTracking(document.getElementById("checkoutForm"), "checkout");
