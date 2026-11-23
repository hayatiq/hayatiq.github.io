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
const MIN_VISIT_EMAIL_DURATION_MS = 1000; // Count visits from 1 s of time on the page
const VISIT_INACTIVE_DELAY_MS = 60 * 1000; // 1-minute grace window before sending a summary email
const VISIT_EMAIL_LIMIT = { max: 2, windowMs: 10 * 60 * 1000 }; // 2 emails per 10 minutes
const VISIT_EMAIL_LATE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // drop held-back summaries after a day
const VISIT_EMAIL_LOG_KEY = "hayatiq_visit_email_log"; // localStorage: when this device sent summaries

const USER_BEHAVIOR_KEY = "user_behavior"; // localStorage: last 10 visits on this phone
const VISIT_SESSION_KEY = "current_visit_data"; // sessionStorage: the visit in progress
const VISIT_ACTIVE_KEY = "hayatiq_visit_active"; // sessionStorage: this tab already counted
const LAST_ACTIVE_SESSION_KEY = "hayatiq_last_active_visit"; // localStorage: recent session state for refresh & quick re-entry
const RELOAD_FLAG_KEY = "hayatiq_page_reloading"; // sessionStorage: flag to distinguish reload vs tab close
const DEVICE_ID_KEY = "hayatiq_device_id"; // localStorage: six-digit id of this browser, shown only in the visit email
const FIRST_SEEN_KEY = "hayatiq_first_seen"; // localStorage: when this browser first opened the site
// Checkout form fields -> the step names shown in the email. Only the step is recorded, never what was typed.
const CHECKOUT_STEPS = { name: "name", phone: "phone", shipping_method: "delivery area", address: "address", order_note: "note" };

let inactiveFlushTimer = null;

// Detect automated bots, link scrapers (e.g., Facebook / Meta crawler) and headless browsers
function isBot() {
  if (typeof navigator !== "undefined" && navigator.webdriver) return true;
  if (typeof window !== "undefined" && window.screen) {
    if (window.screen.width === 2000 && window.screen.height === 2000) return true;
    if (window.screen.width === 0 || window.screen.height === 0) return true;
  }
  const ua = typeof navigator !== "undefined" ? (navigator.userAgent || "") : "";
  const botRegex = /\b(bot|crawler|spider|slurp|facebookexternalhit|facebot|meta-externalagent|headlesschrome|googlebot|bingbot)\b/i;
  if (botRegex.test(ua)) return true;
  return false;
}

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

// A six-digit number (100000-999999) for this browser, kept in localStorage so every visit
// from it shows the same one in the visit email; another device or browser gets its own.
// It is random, so two devices can in theory share one (about 1 in 900,000 per pair).
// Returns "" if the browser won't store it (e.g. storage blocked), so the email says so.
function getDeviceId() {
  try {
    const saved = localStorage.getItem(DEVICE_ID_KEY);
    if (/^\d{6}$/.test(saved)) return saved;
    const random = window.crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * 4294967296);
    const id = String(100000 + (random % 900000));
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch (e) {
    return "";
  }
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
    checkoutProgress: [], // checkout steps reached, by name only
    productInfo: [], // parts of product pages they opened
    brokenLinks: [], // wrong addresses they landed on
    tech: readTech(), // connection, memory, language
    vitals: null, // how fast the pages were on their phone
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
  if (isBot()) return;
  scrubCheckoutValues();
  getDeviceId(); // make this browser's Device ID on its first visit
  try {
    if (!localStorage.getItem(FIRST_SEEN_KEY)) localStorage.setItem(FIRST_SEEN_KEY, String(Date.now()));
  } catch (e) {}
  try {
    sessionStorage.removeItem(RELOAD_FLAG_KEY);
  } catch (e) {}
  const now = Date.now();
  const recent = readJSON(localStorage, LAST_ACTIVE_SESSION_KEY, null);
  const isRecentVisit = recent && recent.sessionData && (now - recent.lastActiveTime < VISIT_INACTIVE_DELAY_MS);

  if (isRecentVisit) {
    // Reconnect to the session active within the last 1 minute (page refresh or quick return)
    const s = recent.sessionData;
    s.currentPage = null;
    s.pageStartTime = now;
    s.pendingEmail = false;
    saveSession(s);
    try {
      sessionStorage.setItem(VISIT_ACTIVE_KEY, "1");
    } catch (e) {}
  } else if (!sessionStorage.getItem(VISIT_ACTIVE_KEY)) {
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
      s.pageStartTime = now;
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

// Checkout: only which step the visitor reached, never what they typed. What they typed is not
// recorded or emailed unless the order is placed (see trackOrderPlaced).
function trackCheckoutStep(step) {
  if (!step) return;
  updateSession((s) => {
    s.checkoutProgress = s.checkoutProgress || [];
    if (!s.checkoutProgress.includes(step)) s.checkoutProgress.push(step);
  });
}

// Older versions of this file saved what visitors typed in checkout before they ordered. Remove
// any such values already on this device (this tab's visit, the saved history, a visit waiting to
// be emailed) so they can never be sent.
function scrubCheckoutValues() {
  const clean = (s) => {
    if (s && s.formFields) Object.keys(s.formFields).forEach((k) => k.startsWith("checkout_") && delete s.formFields[k]);
    return s;
  };
  const current = readJSON(sessionStorage, VISIT_SESSION_KEY, null);
  if (current) writeJSON(sessionStorage, VISIT_SESSION_KEY, clean(current));
  const behavior = getBehavior();
  if (behavior.visitHistory) {
    behavior.visitHistory.forEach(clean);
    writeJSON(localStorage, USER_BEHAVIOR_KEY, behavior);
  }
  const last = readJSON(localStorage, LAST_ACTIVE_SESSION_KEY, null);
  if (last && last.sessionData) {
    clean(last.sessionData);
    writeJSON(localStorage, LAST_ACTIVE_SESSION_KEY, last);
  }
}

// Which part of a product page a visitor opened (names only).
function currentProductName() {
  const m = (getVisitSession().currentPage || "").match(/^product: (.+)$/);
  if (!m) return "";
  const p = typeof PRODUCTS !== "undefined" ? PRODUCTS.find((x) => x.slug === m[1]) : null;
  if (!p) return m[1];
  const sub = String(p.subtitle || "").split("·")[0].trim();
  return `${p.name}${sub ? ` (${sub})` : ""}`;
}
function trackProductInfo(item) {
  const product = currentProductName();
  if (!product || !item) return;
  updateSession((s) => {
    s.productInfo = s.productInfo || [];
    if (!s.productInfo.some((x) => x.product === product && x.item === item)) s.productInfo.push({ product, item, ...now() });
  });
}

// A wrong address (old link, mistyped) that showed the "page not found" view.
function trackBrokenLink(path) {
  updateSession((s) => {
    s.brokenLinks = s.brokenLinks || [];
    if (!s.brokenLinks.some((b) => b.path === path)) s.brokenLinks.push({ path, from: typeof sourceLabel === "function" ? sourceLabel() : "", ...now() });
  });
}

// What this phone and connection are like (Chrome on Android shares more than iPhone/Safari).
function readTech() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
  let siteLanguage = "en";
  try {
    siteLanguage = localStorage.getItem("hayatiq_lang") || "en";
  } catch (e) {}
  return {
    effectiveType: c.effectiveType || "",
    downlink: typeof c.downlink === "number" ? c.downlink : null,
    rtt: typeof c.rtt === "number" ? c.rtt : null,
    saveData: typeof c.saveData === "boolean" ? c.saveData : null,
    deviceMemory: typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : null,
    cores: navigator.hardwareConcurrency || null,
    language: navigator.language || "",
    siteLanguage,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
  };
}

// How fast the page felt on this visitor's phone: the standard web measurements, read from the
// browser itself (a browser that doesn't report one leaves it empty).
const pageVitals = { path: location.pathname, ttfb: null, fcp: null, lcp: null, cls: 0, inp: null };
(function watchPageSpeed() {
  if (isBot() || typeof PerformanceObserver === "undefined") return;
  const watch = (type, onEntries, extra = {}) => {
    try {
      new PerformanceObserver((list) => onEntries(list.getEntries())).observe({ type, buffered: true, ...extra });
    } catch (e) {}
  };
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav && nav.responseStart > 0) pageVitals.ttfb = Math.round(nav.responseStart);
  } catch (e) {}
  watch("paint", (entries) => entries.forEach((e) => e.name === "first-contentful-paint" && (pageVitals.fcp = Math.round(e.startTime))));
  watch("largest-contentful-paint", (entries) => entries.forEach((e) => (pageVitals.lcp = Math.round(e.startTime))));
  watch("layout-shift", (entries) => entries.forEach((e) => !e.hadRecentInput && (pageVitals.cls += e.value)));
  // The slowest tap or key press (a close stand-in for "Interaction to Next Paint").
  watch("event", (entries) => entries.forEach((e) => e.interactionId && (pageVitals.inp === null || e.duration > pageVitals.inp) && (pageVitals.inp = Math.round(e.duration))), { durationThreshold: 40 });
})();

function captureTechAndSpeed() {
  updateSession((s) => {
    s.tech = readTech();
    s.vitals = { ...pageVitals, cls: Math.round(pageVitals.cls * 1000) / 1000 };
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
  if (isBot()) return;
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

function deviceTypeWord(ua) {
  if (!ua) return "device";
  if (/Android/i.test(ua) && !/Tablet/i.test(ua)) return "phone";
  if (/iPhone/i.test(ua)) return "phone";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Windows|Macintosh|Linux/i.test(ua)) return "computer";
  return "device";
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
  // Steps reached in checkout (names only): started filling it in, without having ordered.
  const startedCheckout = (sessionData.checkoutProgress || []).some((x) => ["name", "phone", "address", "delivery area"].includes(x));

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
  if (startedCheckout) {
    return { level: "🔥 HIGH INTENT: Started Checkout, Left Before Ordering", subjectTag: "🔥 [High Intent Lead] Checkout Started (Unfinished)" };
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
  // The contact form only. Checkout details are never listed here: they appear only in the
  // order itself, once it is placed (formatOrderPlacedSummary).
  if (!formFields) return null;
  const f = (key) => formFields[key]?.value;
  if (!(f("contact_name") || f("contact_email_or_phone") || f("contact_message"))) return null;
  const lines = ["📬 CONTACT FORM DETAILS:"];
  if (f("contact_name")) lines.push(`  • Name: ${f("contact_name")}`);
  if (f("contact_email_or_phone")) lines.push(`  • Phone/Email: ${f("contact_email_or_phone")}`);
  if (f("contact_message")) lines.push(`  • Message: ${f("contact_message")}`);
  return lines.join("\n");
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

// ---- Pieces of the email ----

const secondsText = (ms) => (ms == null ? "not reported" : `${(ms / 1000).toFixed(1)} s`);
// 🟢 good, 🟡 needs work, 🔴 poor (Google's usual limits); ⚪ when the browser didn't report it.
const rate = (value, good, ok) => (value == null ? "⚪" : value <= good ? "🟢" : value <= ok ? "🟡" : "🔴");

function daysAgoText(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}

function topNames(names, n = 3) {
  const count = {};
  names.filter(Boolean).forEach((x) => (count[x] = (count[x] || 0) + 1));
  return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name]) => name);
}

// Who this visitor is to the shop, and what to do about it: first visit or returning, what they
// looked at before, whether they have ordered, then one plain-words hint.
function visitorProfile(s) {
  const count = parseInt(localStorage.getItem("visit_count") || "1", 10) || 1;
  const earlier = (getBehavior().visitHistory || []).filter((v) => v.visitId !== s.visitId).sort((a, b) => b.startTimestamp - a.startTimestamp);
  const stored = Number(localStorage.getItem(FIRST_SEEN_KEY)) || 0;
  const firstSeen = [stored, earlier.length ? earlier[earlier.length - 1].startTimestamp : 0, s.startTimestamp].filter(Boolean).reduce((a, b) => Math.min(a, b));
  const returning = count > 1 || earlier.length > 0;
  const days = Math.max(0, Math.floor((Date.now() - firstSeen) / 86400000));
  const pastOrders = readJSON(localStorage, "hayatiq_orders", []).filter((o) => !o.test && (typeof o.createdAt === "number" ? o.createdAt : Date.parse(o.createdAt)) < s.startTimestamp);
  const earlierViewed = topNames(earlier.flatMap((v) => (v.productsViewed || []).map((p) => p.productName)));
  const earlierCart = topNames(earlier.flatMap((v) => (v.cartActions || []).filter((a) => a.action === "add_to_cart").map((a) => a.product)));
  const earlierCheckout = earlier.some((v) => (v.pages || []).some((p) => p.page === "checkout"));
  const reachedCheckout = s.pages.some((p) => p.page === "checkout") || s.currentPage === "checkout";
  const inCart = (s.cartNow && s.cartNow.items.length) || 0;
  const step = (s.checkoutProgress || []).length;

  let insight;
  if (s.orderPlaced && !returning) insight = "New customer: ordered on the first visit.";
  else if (s.orderPlaced && pastOrders.length) insight = `Repeat customer: order number ${pastOrders.length + 1} from this device.`;
  else if (s.orderPlaced) insight = `Converted after ${count} visits over ${days} day${days === 1 ? "" : "s"}${earlierViewed.length ? ` (earlier they looked at: ${earlierViewed.join(", ")})` : ""}.`;
  else if (pastOrders.length) insight = `Past customer is back (${pastOrders.length} earlier order${pastOrders.length === 1 ? "" : "s"}, last ${daysAgoText(Date.parse(pastOrders[0].createdAt) || pastOrders[0].createdAt)}): a reorder or a friendly message may work.`;
  else if (reachedCheckout && returning) insight = `Warm lead: back for visit ${count}, reached checkout${earlierCheckout ? " again" : ""} without ordering. A friendly Messenger follow-up could help.`;
  else if (reachedCheckout) insight = "Hot new lead: reached checkout on the first visit and left before ordering (where they stopped is under CHECKOUT).";
  else if (inCart && returning) insight = `Interested: came back, ${inCart} item${inCart === 1 ? "" : "s"} in the cart, not ordered yet.`;
  else if (inCart) insight = "First visit with items in the cart.";
  else if (returning && s.productsViewed.length) insight = `Comparing: visit ${count}${earlierViewed.length ? `, looked at ${earlierViewed.join(", ")} before` : ""}.`;
  else if (returning) insight = "Returning visitor, still browsing.";
  else insight = "First visit, still browsing.";
  if (step && !s.orderPlaced && !reachedCheckout) insight += " (They started checkout steps.)";

  // A plain-text email can't show coloured text, so the visit number gets a blue circle to stand out.
  const lines = [`• Type: ${returning ? `Returning visitor, 🔵 visit #${count}` : "New visitor, 🔵 first visit"} on this ${deviceTypeWord(navigator.userAgent)}`];
  if (returning) lines.push(`• First seen: ${daysAgoText(firstSeen)}${earlier.length ? ` · Last visit: ${daysAgoText(earlier[0].startTimestamp)}` : ""}`);
  lines.push(`• Past orders on this device: ${pastOrders.length ? `${pastOrders.length} (last ${daysAgoText(Date.parse(pastOrders[0].createdAt) || pastOrders[0].createdAt)})` : "none"}`);
  if (earlierViewed.length) lines.push(`• Looked at before: ${earlierViewed.join(", ")}`);
  if (earlierCart.length) lines.push(`• Added to cart before: ${earlierCart.join(", ")}`);
  lines.push(`• 💡 What it means: ${insight}`);
  return lines;
}

const STOPPED_ANSWERS = { delivery: "Delivery charge", price: "Price", unsure: "Not sure it works", question: "Has a question (opened Messenger)", looking: "Just looking" };

// Which checkout steps were reached (names only), where they stopped, and their own answer if they gave one.
function formatCheckoutLines(s) {
  const done = s.checkoutProgress || [];
  const reached = s.pages.some((p) => p.page === "checkout") || s.currentPage === "checkout" || done.length;
  if (!reached) return [];
  const steps = ["name", "phone", "delivery area", "address"];
  const lines = ["CHECKOUT", `• Steps: opened ✓ → ${steps.map((x) => `${x} ${done.includes(x) ? "✓" : "✗"}`).join(" → ")} → ordered ${s.orderPlaced ? "✓" : "✗"}`];
  if (!s.orderPlaced) {
    const next = steps.find((x) => !done.includes(x));
    lines.push(`• Left at: ${next ? `${next} (not filled in)` : "after every step was filled in, but no order was placed"}`);
  }
  const card = s.stoppedCard;
  if (card && card.answer) lines.push(`• Why they left (their own answer): ${STOPPED_ANSWERS[card.answer] || card.answer}`);
  else if (card && card.shown) lines.push("• Was asked \"What stopped you?\" and closed it without answering");
  return lines;
}

function formatTechLines(s) {
  // A visit that began before connection, memory and speed were recorded (an older version of this
  // file started it) has no `tech` / `vitals`: say so, instead of guessing or blaming the browser.
  const t = s.tech && Object.keys(s.tech).length ? s.tech : null;
  const v = s.vitals;
  const early = "not captured for this visit (it began before this update)";
  const lines = ["DEVICE", `• Device: ${parseUserAgent(navigator.userAgent)}`, `• Screen: ${window.screen ? `${window.screen.width} × ${window.screen.height}` : "Unknown"}${t && t.viewport ? ` (window ${t.viewport})` : ""}`];
  lines.push(t ? `• Language: browser ${t.language || "unknown"} · site shown in ${t.siteLanguage === "bn" ? "Bangla" : "English"}` : `• Language: ${early}`);
  lines.push("", "NETWORK AND HARDWARE");
  if (!t) lines.push(`• Connection, memory and CPU: ${early}`);
  else {
    if (t.effectiveType || t.downlink != null) {
      lines.push(`• Connection: ${t.effectiveType || "unknown"}${t.downlink != null ? ` · about ${t.downlink} Mbps` : ""}${t.rtt != null ? ` · ${t.rtt} ms delay` : ""}${t.saveData ? " · Data Saver is ON" : ""}`);
    } else lines.push("• Connection: not shared by this browser (Safari and Firefox don't share it)");
    lines.push(`• Memory: ${t.deviceMemory != null ? `about ${t.deviceMemory} GB` : "not shared by this browser"} · CPU cores: ${t.cores || "not shared by this browser"}`);
  }
  lines.push("", `PAGE SPEED${v && v.path ? ` (page loaded: ${v.path})` : ""}`);
  if (!v) lines.push(`• ${early[0].toUpperCase()}${early.slice(1)}`);
  else if (v.lcp == null && v.fcp == null && v.ttfb == null) lines.push("• Not measured (this browser doesn't report page speed)");
  else {
    lines.push(`• ${rate(v.lcp, 2500, 4000)} Main content shown: ${secondsText(v.lcp)} (good: 2.5 s or less)`);
    lines.push(`• ${rate(v.fcp, 1800, 3000)} First content shown: ${secondsText(v.fcp)} (good: 1.8 s or less)`);
    lines.push(`• ${rate(v.ttfb, 800, 1800)} Server answered in: ${secondsText(v.ttfb)} (good: 0.8 s or less)`);
    lines.push(`• ${v.cls == null ? "⚪" : v.cls <= 0.1 ? "🟢" : v.cls <= 0.25 ? "🟡" : "🔴"} Page jumping: ${v.cls == null ? "not reported" : v.cls} (good: 0.1 or less)`);
    lines.push(`• ${rate(v.inp, 200, 500)} Slowest tap: ${v.inp == null ? "no taps measured" : `${v.inp} ms`} (good: 200 ms or less)`);
  }
  lines.push("", "SITE HEALTH");
  const broken = s.brokenLinks || [];
  if (broken.length) broken.forEach((b) => lines.push(`• ⚠️ Broken link: ${b.path}${b.from ? ` (they came from: ${b.from})` : ""}`));
  else lines.push("• ✅ No broken links hit");
  return lines;
}

function formatVisitSummaryMessage(sessionData, intent) {
  const source = sessionData.source || {};
  const sections = [];
  const bar = "==================================================";
  const thin = "─".repeat(34);
  sections.push(bar, intent.level, bar, "");

  // ---------- USER INFO ----------
  sections.push("👤 USER INFO", thin, "VISIT");
  sections.push(`• Visit ID: ${sessionData.visitId}${sessionData.emailsSent ? ` (update ${sessionData.emailsSent + 1})` : ""}`);
  sections.push(`• Device ID: ${getDeviceId() || "unavailable (browser storage blocked)"}`);
  sections.push(`• Started: ${new Date(sessionData.startTimestamp).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })} (Dhaka time)`);
  sections.push(`• Time on site: ${formatDuration(activeTime(sessionData))}`, "");
  sections.push("VISITOR", ...visitorProfile(sessionData), "");
  sections.push("WHERE THEY CAME FROM");
  sections.push(`• Source: ${typeof sourceLabel === "function" ? sourceLabel(source) : source.referrer || "Direct"}`);
  sections.push(`• Landing page: ${source.landing || "/"}`, "");

  if (intent.isOrderPlaced) sections.push(`${formatOrderPlacedSummary(sessionData)}\n`);
  else {
    const formSummary = formatFormFieldsSummary(sessionData.formFields);
    if (formSummary) sections.push(`${formSummary}\n`);
  }

  // What they did on the site.
  sections.push("🛒 WHAT THEY DID", thin);
  const shopping = [];
  // One item per line, like the Telegram order message.
  const list = (title, items) => {
    if (items.length) shopping.push(`• ${title}:\n${items.map((i) => `    – ${i}`).join("\n")}`);
  };
  const cart = sessionData.cartNow;
  if (cart && cart.items.length) list(`Cart right now (${taka(cart.subtotal)})`, cart.items);
  list("Products Viewed", sessionData.productsViewed.map((p) => p.productName));
  const byProduct = {};
  (sessionData.productInfo || []).forEach((x) => (byProduct[x.product] = [...(byProduct[x.product] || []), x.item]));
  list("Product info opened", Object.entries(byProduct).map(([product, items]) => `${product}: ${items.join(", ")}`));
  list("Added to Cart", sessionData.cartActions.filter((a) => a.action === "add_to_cart").map((a) => a.product || "item"));
  list("Removed from Cart", sessionData.cartActions.filter((a) => a.action === "remove_from_cart").map((a) => a.product || "item"));
  if (sessionData.cartActions.some((a) => a.action === "clear_cart")) shopping.push("• Cleared the cart");
  list("Options Selected", sessionData.variantSelections.map((v) => `${v.product || "Product"}: ${v.variant || "Default"}`));
  list("Wishlist", sessionData.wishlistActions.map((w) => `${w.action} ${w.product || ""}`.trim()));
  list("Filters Applied", [...new Set(sessionData.filterActions.map((a) => `${a.type}: ${a.value}`))]);
  if (sessionData.socialClicks.length) {
    shopping.push(`• Social / Messenger Clicks: ${[...new Set(sessionData.socialClicks.map((c) => c.platform))].join(", ")} (${sessionData.socialClicks.length})`);
  }
  sections.push(shopping.length ? shopping.join("\n") : "• Just looked around (no cart, wishlist or product activity)");
  const checkout = formatCheckoutLines(sessionData);
  if (checkout.length) sections.push("", ...checkout);
  sections.push("", "JOURNEY", formatJourneyTimeline(sessionData.pages), "");

  // ---------- TECHNICAL INFO ----------
  sections.push("🖥️ TECHNICAL INFO", thin, ...formatTechLines(sessionData));
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
    (s.checkoutProgress || []).slice().sort(),
    (s.brokenLinks || []).length,
    s.contactActions.length,
    s.stoppedCard && s.stoppedCard.answer,
    s.orderPlaced,
  ]);
}

function captureOpenForms() {
  const fields = {
    contact_name: "name",
    contact_email_or_phone: "contact",
    contact_message: "message",
  };
  Object.entries(fields).forEach(([key, id]) => {
    const value = document.getElementById(id)?.value;
    if (value && value.trim()) trackFormField(key, value);
  });
  // Checkout: which steps are filled in, never the values.
  [["name", "checkoutName"], ["phone", "checkoutPhone"], ["address", "checkoutAddress"], ["order_note", "orderNote"]].forEach(([name, id]) => {
    if (document.getElementById(id)?.value?.trim()) trackCheckoutStep(CHECKOUT_STEPS[name]);
  });
  if (document.querySelector('#checkoutForm input[name="shipping_method"]:checked')) trackCheckoutStep(CHECKOUT_STEPS.shipping_method);
}

function visitEmailsAllowed() {
  if (isBot()) return false;
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

// Sends summaries of earlier visits on this device that the limit held back or that closed before flush.
function sendHeldBackVisits(currentVisitId) {
  if (isBot() || !visitEmailsAllowed()) return;
  const now = Date.now();

  // Send any abandoned session left in LAST_ACTIVE_SESSION_KEY that ended > 1 minute ago
  const recent = readJSON(localStorage, LAST_ACTIVE_SESSION_KEY, null);
  if (recent && recent.sessionData && recent.sessionData.visitId !== currentVisitId) {
    if (now - recent.lastActiveTime >= VISIT_INACTIVE_DELAY_MS) {
      const s = recent.sessionData;
      const signature = visitSignature(s);
      if (activeTime(s) >= MIN_VISIT_EMAIL_DURATION_MS && signature !== s.lastSentSignature) {
        if (visitEmailRoom() > 0) {
          sendVisitSummary(s, true);
        }
      }
      try {
        localStorage.removeItem(LAST_ACTIVE_SESSION_KEY);
      } catch (e) {}
    }
  }

  const behavior = getBehavior();
  const history = behavior.visitHistory || [];
  let changed = false;
  history.forEach((v) => {
    if (!v.pendingEmail || v.visitId === currentVisitId) return;
    if (now - v.startTimestamp > VISIT_EMAIL_LATE_MAX_AGE_MS) {
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
  if (isBot()) return;
  captureOpenForms();
  captureTechAndSpeed();
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
  writeJSON(localStorage, LAST_ACTIVE_SESSION_KEY, {
    visitId: s.visitId,
    lastActiveTime: Date.now(),
    sessionData: s,
  });
  sendHeldBackVisits(s.visitId);
}

function saveActiveSnapshot() {
  if (isBot()) return null;
  captureOpenForms();
  captureTechAndSpeed();
  const s = getVisitSession();
  closePageSegment(s);
  s.cartNow = cartSnapshot();
  saveSession(s);
  writeJSON(localStorage, LAST_ACTIVE_SESSION_KEY, {
    visitId: s.visitId,
    lastActiveTime: Date.now(),
    sessionData: s,
  });
  return s;
}

// Delays email sending by 1 minute when a visitor switches away or goes inactive.
// If they return within 1 minute, the timer is cleared and the session continues seamlessly.
function scheduleInactiveFlush() {
  if (isBot()) return;
  saveActiveSnapshot();

  if (inactiveFlushTimer) {
    clearTimeout(inactiveFlushTimer);
    inactiveFlushTimer = null;
  }

  inactiveFlushTimer = setTimeout(() => {
    inactiveFlushTimer = null;
    flushVisit();
  }, VISIT_INACTIVE_DELAY_MS);
}

// Resumes the active session and cancels the 1-minute delay timer upon user return.
function resumeActiveSession() {
  if (inactiveFlushTimer) {
    clearTimeout(inactiveFlushTimer);
    inactiveFlushTimer = null;
  }
  updateSession((s) => {
    s.pageStartTime = Date.now();
  });
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
  if (isBot()) return;
  if (document.hidden) {
    scheduleInactiveFlush();
  } else {
    resumeActiveSession();
  }
});
// Detect if user initiates a reload (F5, Ctrl+R, Cmd+R, or clicking language switch)
window.addEventListener("keydown", (e) => {
  if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R"))) {
    try {
      sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
    } catch (err) {}
  }
}, true);

document.addEventListener("click", (e) => {
  if (e.target && e.target.closest && e.target.closest(".lang-toggle")) {
    try {
      sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
    } catch (err) {}
  }
}, true);

window.addEventListener("pagehide", () => {
  if (isBot()) return;
  const isReloading = sessionStorage.getItem(RELOAD_FLAG_KEY) === "1";
  if (isReloading) {
    saveActiveSnapshot();
  } else {
    if (inactiveFlushTimer) {
      clearTimeout(inactiveFlushTimer);
      inactiveFlushTimer = null;
    }
    flushVisit();
  }
});
setTimeout(() => {
  if (!isBot()) sendHeldBackVisits(getVisitSession().visitId);
}, 5000);

// Page views come from navigate() in script.js on every route change (link click,
// back/forward or first load). Product pages are named after the product.
window.addEventListener("route-changed", () => {
  const parts = location.pathname.split("/").filter(Boolean);
  const pageName = parts[0] === "product" && parts[1] ? `product: ${decodeURIComponent(parts[1])}` : parts[0] || "home";
  const params = new URLSearchParams(location.search);
  trackPageView(pageName);
  if (params.get("cat")) trackProductFilter("category", params.get("cat"));
  if (parts[0] === "category" && parts[1]) trackProductFilter("category", categoryFromSlug(decodeURIComponent(parts[1])) || parts[1]);
  if (params.get("concern")) trackProductFilter("need", params.get("concern"));
});

// Social and Messenger link clicks.
document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href*="instagram"], a[href*="facebook"], a[href*="m.me"]');
  if (!link) return;
  const href = link.getAttribute("href") || "";
  trackSocialClick(href.includes("instagram") ? "instagram" : href.includes("m.me") ? "messenger" : "facebook");
});

/* ---------- "What stopped you?" ---------- */
// A small one-tap card, shown when a visitor LEAVES checkout (Back button or any link) with items in
// the cart, after at least 15 seconds there, without ordering. At most once per visit and once per
// 30 days per phone. Never while they are typing or placing the order. The answer goes only into
// the visit email (s.stoppedCard); closing the card asks nothing more.
const STOPPED_CARD_KEY = "hayatiq_stopped_card_at"; // localStorage: when this phone was last shown the card
const STOPPED_CARD_GAP_MS = 30 * 24 * 60 * 60 * 1000;
const STOPPED_CARD_MIN_CHECKOUT_MS = 15 * 1000;
const STOPPED_OPTIONS = [["delivery", "Delivery charge"], ["price", "Price"], ["unsure", "Not sure it works"], ["question", "I have a question"], ["looking", "Just looking"]];
let checkoutSince = 0;
let lastRoutePath = "";

function closeStoppedCard() {
  document.getElementById("stopCard")?.remove();
  document.removeEventListener("keydown", stoppedCardKey);
}
function stoppedCardKey(e) {
  if (e.key === "Escape") closeStoppedCard();
}

function answerStoppedCard(answer) {
  updateSession((s) => {
    s.stoppedCard = { ...(s.stoppedCard || { shown: true }), answer, answeredAt: Date.now() };
  });
  closeStoppedCard();
  // "I have a question": open Messenger, where the answer can be given in person.
  if (answer === "question" && typeof MESSENGER_URL !== "undefined") window.open(`${MESSENGER_URL}?ref=stopped-checkout`, "_blank", "noopener");
  else if (typeof toast === "function") toast("Thank you, that helps us improve.");
}

function showStoppedCard() {
  if (document.getElementById("stopCard")) return;
  try {
    localStorage.setItem(STOPPED_CARD_KEY, String(Date.now()));
  } catch (e) {}
  updateSession((s) => {
    s.stoppedCard = { shown: true, shownAt: Date.now() };
  });
  const card = document.createElement("div");
  card.id = "stopCard";
  card.className = "stop-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-labelledby", "stopCardTitle");
  card.innerHTML = `
    <button type="button" class="stop-close" aria-label="Close">✕</button>
    <p class="stop-title" id="stopCardTitle">What stopped you?</p>
    <p class="stop-sub">One tap helps us improve. Totally optional.</p>
    <div class="stop-options">${STOPPED_OPTIONS.map(([key, label]) => `<button type="button" class="stop-option" data-answer="${key}">${label}</button>`).join("")}</div>`;
  card.addEventListener("click", (e) => {
    const option = e.target.closest(".stop-option");
    if (option) answerStoppedCard(option.dataset.answer);
    else if (e.target.closest(".stop-close")) closeStoppedCard();
  });
  document.body.appendChild(card);
  document.addEventListener("keydown", stoppedCardKey);
}

function maybeAskWhatStopped(stayedMs) {
  if (isBot() || stayedMs < STOPPED_CARD_MIN_CHECKOUT_MS) return;
  const s = getVisitSession();
  if (s.orderPlaced || (s.stoppedCard && s.stoppedCard.shown)) return;
  if (typeof isCheckoutSubmitting !== "undefined" && isCheckoutSubmitting) return; // an order is being sent
  if (!(typeof cartSnapshot === "function" && cartSnapshot().items.length)) return;
  let last = 0;
  try {
    last = Number(localStorage.getItem(STOPPED_CARD_KEY)) || 0;
  } catch (e) {}
  if (Date.now() - last < STOPPED_CARD_GAP_MS) return;
  showStoppedCard();
}

window.addEventListener("route-changed", () => {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const leftCheckout = lastRoutePath === "/checkout" && path !== "/checkout";
  const stayed = checkoutSince ? Date.now() - checkoutSince : 0;
  if (path === "/checkout" && lastRoutePath !== "/checkout") checkoutSince = Date.now();
  lastRoutePath = path;
  if (path === "/checkout" || path === "/order") closeStoppedCard(); // they came back, or ordered
  else if (leftCheckout) maybeAskWhatStopped(stayed);
});

// Product pages: which parts a visitor opens (a section, a how-to tab, a common question, the photos,
// share, "Ask a Question"). Capture phase, so a section still shows its state from before the tap.
document.addEventListener("click", (e) => {
  if (isBot() || !(e.target.closest && e.target.closest("#detailWrap"))) return;
  const summary = e.target.closest("summary");
  if (summary) {
    const box = summary.parentElement;
    if (box && box.tagName === "DETAILS" && !box.open) {
      const label = summary.textContent.replace(/\s+/g, " ").trim();
      trackProductInfo(box.closest(".product-faq") ? `Common question: ${label.slice(0, 70)}` : label);
    }
    return;
  }
  const tab = e.target.closest(".how-to-use-tab");
  if (tab) return trackProductInfo(`How to use: ${tab.textContent.trim()}`);
  if (e.target.closest(".gallery-slide img, .thumb")) return trackProductInfo("Photos");
  if (e.target.closest(".gallery-share")) return trackProductInfo("Share button");
  if (e.target.closest('a[href*="m.me"]')) trackProductInfo("Ask a Question (Messenger)");
}, true);

// Form fields: record typed values (on pause and on leaving a field), ignoring
// hidden settings fields and unchosen radio buttons.
function setupFormFieldTracking(form, prefix) {
  if (!form) return;
  const record = (field) => {
    if (field.type === "hidden" || field.name === "_honey" || !field.name) return;
    if (field.type === "radio" && !field.checked) return;
    if (!(field.value && field.value.trim())) return;
    // Checkout: only the step reached is kept, never what was typed (until the order is placed).
    if (prefix === "checkout") return trackCheckoutStep(CHECKOUT_STEPS[field.name]);
    trackFormField(`${prefix}_${field.name}`, field.value);
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
