// Simple behavior tracking with dynamic timing
// Set to true to disable sending visit summary emails even in production (dev is auto-disabled)
const DISABLE_VISIT_EMAILS = true;
const MIN_VISIT_EMAIL_DURATION_MS = 5000; // Filter out visits under 5 seconds

const USER_BEHAVIOR_KEY = "user_behavior";
const VISIT_SESSION_KEY = "current_visit_data";

// Dynamic timing variables (easily adjustable)
// Initialize visit session when page loads
function initVisitSession() {
  const sessionData = {
    startTime: new Date().toISOString(),
    startTimestamp: Date.now(),
    currentPage: "home",
    pageStartTime: Date.now(),
    pages: [],
    productsViewed: [],
    alertsShown: [],
    socialClicks: [],
    cartActions: [],
    searchActions: [],
    filterActions: [],
    wishlistActions: [],
    variantSelections: [],
    contactActions: [],
    checkoutActions: [],
    formFields: {}, // Store full field values
    orderPlaced: false,
    orderData: null,
  };
  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

// Save visit session when user leaves
function saveVisitSession() {
  // Capture any active input values from checkout or contact forms directly before leaving
  try {
    const checkoutName = document.getElementById("checkoutName")?.value;
    const checkoutPhone = document.getElementById("checkoutPhone")?.value;
    const checkoutAddress = document.getElementById("checkoutAddress")?.value;
    const orderNoteVal = document.getElementById("orderNote")?.value;
    if (checkoutName && checkoutName.trim()) trackFormField("checkout_name", checkoutName);
    if (checkoutPhone && checkoutPhone.trim()) trackFormField("checkout_phone", checkoutPhone);
    if (checkoutAddress && checkoutAddress.trim()) trackFormField("checkout_address", checkoutAddress);
    if (orderNoteVal && orderNoteVal.trim()) trackFormField("checkout_order_note", orderNoteVal);

    const contactNameVal = document.getElementById("name")?.value;
    const contactEmailPhoneVal = document.getElementById("contact")?.value;
    const contactMsgVal = document.getElementById("message")?.value;
    if (contactNameVal && contactNameVal.trim()) trackFormField("contact_name", contactNameVal);
    if (contactEmailPhoneVal && contactEmailPhoneVal.trim()) trackFormField("contact_email_or_phone", contactEmailPhoneVal);
    if (contactMsgVal && contactMsgVal.trim()) trackFormField("contact_message", contactMsgVal);
  } catch (e) {
    // Ignore DOM read errors during unload
  }

  const sessionData = getVisitSession();

  // Record time spent on current page before leaving
  if (sessionData.currentPage) {
    const pageDuration = Date.now() - sessionData.pageStartTime;
    sessionData.pages.push({
      page: sessionData.currentPage,
      duration: pageDuration,
      timestamp: Date.now(),
      time: new Date().toLocaleString(),
    });
  }

  if (
    sessionData.pages.length > 0 ||
    sessionData.socialClicks.length > 0 ||
    sessionData.cartActions.length > 0 ||
    sessionData.contactActions.length > 0 ||
    sessionData.checkoutActions.length > 0 ||
    Object.keys(sessionData.formFields || {}).length > 0
  ) {
    // Calculate total session duration
    sessionData.endTime = new Date().toISOString();
    sessionData.endTimestamp = Date.now();
    sessionData.totalDuration =
      sessionData.endTimestamp - sessionData.startTimestamp;

    // Save to behavior history
    saveSessionToHistory(sessionData);

    // Send email with this session data
    sendVisitEmail(sessionData);
  }

  // Clear current session
  localStorage.removeItem(VISIT_SESSION_KEY);
}

function getVisitSession() {
  const sessionData =
    JSON.parse(localStorage.getItem(VISIT_SESSION_KEY)) || {
      startTime: new Date().toISOString(),
      startTimestamp: Date.now(),
      currentPage: "home",
      pageStartTime: Date.now(),
      pages: [],
      productsViewed: [],
      alertsShown: [],
      socialClicks: [],
      cartActions: [],
      searchActions: [],
      filterActions: [],
      wishlistActions: [],
      variantSelections: [],
      contactActions: [],
      checkoutActions: [],
      formFields: {},
      orderPlaced: false,
      orderData: null,
    };
  sessionData.searchActions ||= [];
  sessionData.filterActions ||= [];
  sessionData.wishlistActions ||= [];
  sessionData.variantSelections ||= [];
  return sessionData;
}

function saveSessionToHistory(sessionData) {
  const behavior = getBehavior();
  if (!behavior.visitHistory) {
    behavior.visitHistory = [];
  }

  // Keep only last 10 visits to prevent storage bloat
  behavior.visitHistory.unshift(sessionData);
  behavior.visitHistory = behavior.visitHistory.slice(0, 10);

  localStorage.setItem(USER_BEHAVIOR_KEY, JSON.stringify(behavior));
}

function trackPageView(pageName) {
  const sessionData = getVisitSession();

  // Record time spent on previous page
  if (sessionData.currentPage) {
    const pageDuration = Date.now() - sessionData.pageStartTime;
    sessionData.pages.push({
      page: sessionData.currentPage,
      duration: pageDuration,
      timestamp: Date.now(),
      time: new Date().toLocaleString(),
    });
  }

  // Start tracking new page
  sessionData.currentPage = pageName;
  sessionData.pageStartTime = Date.now();

  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

function trackProductView(productId, productName) {
  const sessionData = getVisitSession();

  // Add to session products viewed (avoid duplicates in same session)
  if (!sessionData.productsViewed.some((p) => p.productId === productId)) {
    sessionData.productsViewed.push({
      productId: productId,
      productName: productName,
      timestamp: Date.now(),
      time: new Date().toLocaleString(),
    });
  }

  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

function trackSocialClick(platform) {
  const sessionData = getVisitSession();
  sessionData.socialClicks.push({
    platform: platform,
    timestamp: Date.now(),
    time: new Date().toLocaleString(),
  });
  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

function trackCartAction(action, data = {}) {
  const sessionData = getVisitSession();

  // Only track unique cart actions to avoid duplicates
  const lastAction =
    sessionData.cartActions[sessionData.cartActions.length - 1];
  if (
    !lastAction ||
    lastAction.action !== action ||
    Date.now() - lastAction.timestamp > 1000
  ) {
    sessionData.cartActions.push({
      action: action,
      ...data,
      timestamp: Date.now(),
      time: new Date().toLocaleString(),
    });
    localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
  }
}

function trackProductFilter(type, value) {
  if (!value) return;
  const sessionData = getVisitSession();
  sessionData.filterActions.push({
    type,
    value,
    timestamp: Date.now(),
    time: new Date().toLocaleString(),
  });
  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

function trackWishlistAction(action, data = {}) {
  const sessionData = getVisitSession();
  sessionData.wishlistActions.push({
    action,
    ...data,
    timestamp: Date.now(),
    time: new Date().toLocaleString(),
  });
  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

function trackVariantSelection(data = {}) {
  const sessionData = getVisitSession();
  sessionData.variantSelections.push({
    ...data,
    timestamp: Date.now(),
    time: new Date().toLocaleString(),
  });
  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

function trackFormField(field, value) {
  const sessionData = getVisitSession();

  // Store full field values without truncation
  if (value && value.trim().length > 0) {
    sessionData.formFields[field] = {
      value: value.trim(),
      length: value.trim().length,
      timestamp: Date.now(),
      time: new Date().toLocaleString(),
    };
  }

  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

function trackContactAction(action, data = {}) {
  const sessionData = getVisitSession();

  // Only track meaningful contact actions
  if (action === "form_submit" || (action === "form_input" && data.field)) {
    sessionData.contactActions.push({
      action: action,
      ...data,
      timestamp: Date.now(),
      time: new Date().toLocaleString(),
    });
    localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
  }
}

function trackCheckoutAction(action, data = {}) {
  const sessionData = getVisitSession();

  // Filter out excessive tracking
  const shouldTrack =
    action === "shipping_change" ||
    action === "order_submit" ||
    action === "order_placed" ||
    (action === "note_typed" && data.length > 5) ||
    (action === "form_input" && data.field && data.value);

  if (shouldTrack) {
    sessionData.checkoutActions.push({
      action: action,
      ...data,
      timestamp: Date.now(),
      time: new Date().toLocaleString(),
    });
    localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
  }
}

function trackOrderPlaced(orderData = {}) {
  const sessionData = getVisitSession();
  sessionData.orderPlaced = true;
  sessionData.orderData = {
    name: orderData.name || "",
    phone: orderData.phone || "",
    address: orderData.address || "",
    note: orderData.note || "",
    total: orderData.total || 0,
    timestamp: Date.now(),
    time: new Date().toLocaleString(),
  };

  if (orderData.name) trackFormField("checkout_name", orderData.name);
  if (orderData.phone) trackFormField("checkout_phone", orderData.phone);
  if (orderData.address) trackFormField("checkout_address", orderData.address);
  if (orderData.note) trackFormField("checkout_order_note", orderData.note);

  trackCheckoutAction("order_placed", {
    total: orderData.total || 0,
    phone: orderData.phone || "",
  });

  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

if (typeof window !== "undefined") {
  window.trackOrderPlaced = trackOrderPlaced;
}

function getBehavior() {
  return JSON.parse(localStorage.getItem(USER_BEHAVIOR_KEY)) || {};
}

function formatDuration(ms) {
  if (!ms || isNaN(ms)) return "0s";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
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
  if (/FB_IAB|FB4A|FBAV/i.test(ua)) browser = "Facebook App";
  else if (/Instagram/i.test(ua)) browser = "Instagram App";
  else if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";

  return `${os} (${browser})`;
}

function parseReferrer(ref) {
  if (!ref || ref === "none") return "Direct Traffic / Bookmark";
  try {
    const url = new URL(ref);
    if (url.hostname.includes("facebook.com") || url.hostname.includes("fb.com")) {
      return `Facebook (${url.hostname})`;
    }
    if (url.hostname.includes("instagram.com")) {
      return `Instagram (${url.hostname})`;
    }
    if (url.hostname.includes("google.com")) {
      return `Google Search (${url.hostname})`;
    }
    return `${url.hostname}`;
  } catch {
    return ref;
  }
}

function getVisitorIntent(sessionData) {
  const fields = sessionData.formFields || {};
  const hasCheckoutName = Boolean(fields["checkout_name"]?.value);
  const hasCheckoutPhone = Boolean(fields["checkout_phone"]?.value);
  const hasCheckoutAddress = Boolean(fields["checkout_address"]?.value);
  const hasCheckoutData = hasCheckoutName || hasCheckoutPhone || hasCheckoutAddress;

  // 1. Check if an order was placed during this visit session
  let isOrderPlaced =
    Boolean(sessionData.orderPlaced) ||
    (sessionData.checkoutActions &&
      sessionData.checkoutActions.some((a) => a.action === "order_placed"));

  // Secondary check: Did an order occur in checkoutOrders during this session?
  if (!isOrderPlaced) {
    try {
      const recentOrders = JSON.parse(localStorage.getItem("checkoutOrders")) || [];
      isOrderPlaced = recentOrders.some(
        (ts) => ts >= (sessionData.startTimestamp || 0) - 2000
      );
    } catch (e) {}
  }

  if (isOrderPlaced) {
    const customerName =
      sessionData.orderData?.name ||
      fields["checkout_name"]?.value ||
      "Customer";
    const total = sessionData.orderData?.total;
    const totalPart =
      total !== undefined && total !== null && Number(total) > 0
        ? ` - ৳${Number(total).toFixed(2)}`
        : "";

    return {
      isOrderPlaced: true,
      level: "🎉 ORDER COMPLETED: Customer Successfully Placed Order!",
      subjectTag: `🎉 [Order Placed] ${customerName}${totalPart}`,
    };
  }

  const reachedCheckout =
    sessionData.currentPage === "checkout" ||
    (sessionData.pages && sessionData.pages.some((p) => p.page === "checkout"));

  const cartCount = sessionData.cartActions ? sessionData.cartActions.length : 0;
  const productsCount = sessionData.productsViewed ? sessionData.productsViewed.length : 0;

  if (hasCheckoutData) {
    return {
      isOrderPlaced: false,
      level: "🔥 HIGH INTENT: Checkout Data Entered (Potential Lead / Unfinished Order)",
      subjectTag: "🔥 [High Intent Lead] Checkout Filled (Unfinished)",
    };
  }
  if (reachedCheckout) {
    return {
      isOrderPlaced: false,
      level: "🛒 HIGH INTENT: Checkout Abandoned",
      subjectTag: "🛒 [Abandoned Checkout]",
    };
  }
  if (cartCount > 0) {
    return {
      isOrderPlaced: false,
      level: "🛍️ CART ENGAGED: Items Added to Cart",
      subjectTag: "🛍️ [Cart Active]",
    };
  }
  if (productsCount > 0) {
    return {
      isOrderPlaced: false,
      level: "👀 PRODUCT EXPLORER: Browsed Catalog",
      subjectTag: "👀 [Browsed Products]",
    };
  }
  return {
    isOrderPlaced: false,
    level: "⏱️ VISITOR SESSION SUMMARY",
    subjectTag: "⏱️ [Visit Summary]",
  };
}

function formatOrderPlacedSummary(sessionData) {
  const orderData = sessionData.orderData || {};
  const fields = sessionData.formFields || {};
  const name = orderData.name || fields["checkout_name"]?.value || "Customer";
  const phone = orderData.phone || fields["checkout_phone"]?.value || "Not provided";
  const address = orderData.address || fields["checkout_address"]?.value || "Not provided";
  const note = orderData.note || fields["checkout_order_note"]?.value;
  const total = orderData.total;

  const lines = [
    "🎉 COMPLETED ORDER DETAILS:",
    "  • Order Status: Successfully Placed ✅",
    `  • Customer Name: ${name}`,
    `  • Phone Number: ${phone}`,
    `  • Full Delivery Address: ${address}`,
  ];
  if (note) {
    lines.push(`  • Order Note: ${note}`);
  }
  if (total !== undefined && total !== null && Number(total) > 0) {
    lines.push(`  • Total Amount: ৳${Number(total).toFixed(2)}`);
  }

  return lines.join("\n");
}

function formatFormFieldsSummary(formFields) {
  if (!formFields || Object.keys(formFields).length === 0) return null;
  const lines = [];

  const name = formFields["checkout_name"]?.value;
  const phone = formFields["checkout_phone"]?.value;
  const address = formFields["checkout_address"]?.value;
  const note = formFields["checkout_order_note"]?.value;

  if (name || phone || address || note) {
    lines.push("📋 CUSTOMER ENTERED CHECKOUT DETAILS (UNFINISHED ORDER):");
    if (name) lines.push(`  • Full Name: ${name}`);
    if (phone) lines.push(`  • Phone Number: ${phone}`);
    if (address) lines.push(`  • Full Delivery Address: ${address}`);
    if (note) lines.push(`  • Order Note: ${note}`);
  }

  const cName = formFields["contact_name"]?.value;
  const cContact = formFields["contact_contact"]?.value || formFields["contact_email_or_phone"]?.value;
  const cMsg = formFields["contact_message"]?.value;
  if (cName || cContact || cMsg) {
    if (lines.length > 0) lines.push("");
    lines.push("📬 CONTACT FORM DETAILS:");
    if (cName) lines.push(`  • Name: ${cName}`);
    if (cContact) lines.push(`  • Phone/Email: ${cContact}`);
    if (cMsg) lines.push(`  • Message: ${cMsg}`);
  }

  const handledKeys = new Set([
    "checkout_name",
    "checkout_phone",
    "checkout_address",
    "checkout_order_note",
    "contact_name",
    "contact_contact",
    "contact_email_or_phone",
    "contact_message"
  ]);
  const otherFields = Object.entries(formFields).filter(([k]) => !handledKeys.has(k));
  if (otherFields.length > 0) {
    if (lines.length > 0) lines.push("");
    lines.push("📝 OTHER FORM INPUTS:");
    otherFields.forEach(([k, v]) => lines.push(`  • ${k}: ${v.value}`));
  }

  return lines.length > 0 ? lines.join("\n") : null;
}

function formatJourneyTimeline(pages, currentPage, totalDuration, pageStartTime, endTimestamp) {
  const steps = [];
  if (pages && pages.length > 0) {
    pages.forEach((p) => {
      steps.push(`${p.page} (${formatDuration(p.duration || 0)})`);
    });
  }
  if (steps.length === 0 && currentPage) {
    const dur = (endTimestamp || Date.now()) - (pageStartTime || Date.now());
    steps.push(`${currentPage} (${formatDuration(Math.max(0, dur))})`);
  }
  return steps.length > 0 ? steps.join(" ➔ ") : "Single page visit";
}

function formatVisitSummaryMessage(sessionData, intent, deviceInfo, referrerInfo) {
  const visitCount = localStorage.getItem("visit_count") || "1";
  const sections = [];

  sections.push(`==================================================`);
  sections.push(intent.level);
  sections.push(`==================================================\n`);

  sections.push(`⏱️ SESSION OVERVIEW`);
  sections.push(`• Total Duration: ${formatDuration(sessionData.totalDuration)} (Visit #${visitCount})`);
  sections.push(`• Time: ${new Date(sessionData.startTimestamp).toLocaleString()}`);
  sections.push(`• Traffic Source: ${referrerInfo}`);
  sections.push(`• Device: ${deviceInfo}`);
  sections.push(`• Screen Size: ${window.screen ? `${window.screen.width} × ${window.screen.height}` : "Unknown"}\n`);

  // Full Customer Form Details (Completed Order or Unfinished Checkout)
  if (intent.isOrderPlaced) {
    sections.push(`${formatOrderPlacedSummary(sessionData)}\n`);
  } else {
    const formSummary = formatFormFieldsSummary(sessionData.formFields);
    if (formSummary) {
      sections.push(`${formSummary}\n`);
    }
  }

  // Shopping and site interactions
  const shoppingLines = [];
  if (sessionData.productsViewed && sessionData.productsViewed.length > 0) {
    const productCounts = {};
    sessionData.productsViewed.forEach((p) => {
      productCounts[p.productName] = (productCounts[p.productName] || 0) + 1;
    });
    const productText = Object.entries(productCounts)
      .map(([name, count]) => (count > 1 ? `${name} (viewed ${count}x)` : name))
      .join(", ");
    shoppingLines.push(`• Products Viewed: ${productText}`);
  }

  if (sessionData.cartActions && sessionData.cartActions.length > 0) {
    const actionCounts = {};
    sessionData.cartActions.forEach((a) => {
      actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
    });
    const cartSummary = Object.entries(actionCounts)
      .map(([action, count]) => `${action}: ${count}`)
      .join(", ");
    shoppingLines.push(`• Cart Actions: ${cartSummary}`);
  }

  if (sessionData.variantSelections && sessionData.variantSelections.length > 0) {
    const variants = sessionData.variantSelections
      .map((v) => `${v.product || "Product"}: ${v.variant || "Default"}`)
      .join(", ");
    shoppingLines.push(`• Options Selected: ${variants}`);
  }

  if (sessionData.wishlistActions && sessionData.wishlistActions.length > 0) {
    shoppingLines.push(`• Wishlist Actions: ${sessionData.wishlistActions.length}`);
  }

  if (sessionData.searchActions && sessionData.searchActions.length > 0) {
    const searches = sessionData.searchActions.map((a) => a.query).join(", ");
    shoppingLines.push(`• Product Searches: ${searches}`);
  }

  if (sessionData.filterActions && sessionData.filterActions.length > 0) {
    const filters = sessionData.filterActions.map((a) => `${a.type}: ${a.value}`).join(", ");
    shoppingLines.push(`• Filters Applied: ${filters}`);
  }

  if (sessionData.socialClicks && sessionData.socialClicks.length > 0) {
    const platforms = [...new Set(sessionData.socialClicks.map((c) => c.platform))];
    shoppingLines.push(`• Social Clicks: ${platforms.join(", ")} (${sessionData.socialClicks.length} clicks)`);
  }

  if (shoppingLines.length > 0) {
    sections.push(`🛒 SHOPPING & SITE ACTIVITY`);
    sections.push(shoppingLines.join("\n") + "\n");
  }

  sections.push(`📍 JOURNEY TIMELINE`);
  sections.push(formatJourneyTimeline(sessionData.pages, sessionData.currentPage, sessionData.totalDuration, sessionData.pageStartTime, sessionData.endTimestamp));

  return sections.join("\n");
}

function sendVisitEmail(sessionData) {
  const isDev =
    DISABLE_VISIT_EMAILS ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "" ||
    location.hostname.includes("ngrok") ||
    location.protocol === "file:";

  if (isDev) {
    console.log("Visit summary email disabled during development.");
    return;
  }

  // Filter out visits under 5 seconds (5000ms)
  if (!sessionData.totalDuration || sessionData.totalDuration < MIN_VISIT_EMAIL_DURATION_MS) {
    console.log(`Visit duration (${sessionData.totalDuration || 0}ms) under 5s minimum, skipping email.`);
    return;
  }

  const intent = getVisitorIntent(sessionData);
  const deviceInfo = parseUserAgent(navigator.userAgent);
  const referrerInfo = parseReferrer(document.referrer || "none");
  const sourceLabel = referrerInfo.split("(")[0].trim();
  const subject = `${intent.subjectTag} (${formatDuration(sessionData.totalDuration)}) — ${sourceLabel}`;

  const visitorData = {
    _subject: subject,
    message: formatVisitSummaryMessage(sessionData, intent, deviceInfo, referrerInfo),
  };

  fetch("https://formsubmit.co/ajax/topukhan6364@gmail.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(visitorData),
  })
    .then((r) => r.json())
    .then((d) => console.log("Visit summary sent:", d))
    .catch((err) => console.error("Error sending visit summary:", err));
}

// Exit tracking
function setupExitTracking() {
  // Page visibility change (tab switch, minimize)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      saveVisitSession();
    } else {
      // User came back to tab - start new session
      initVisitSession();
    }
  });

  // Beforeunload (closing tab/browser)
  window.addEventListener("beforeunload", () => {
    saveVisitSession();
  });

  // Page load (initialize new session)
  window.addEventListener("load", () => {
    initVisitSession();

    // Increment visit count
    const visitCount = parseInt(localStorage.getItem("visit_count") || "0") + 1;
    localStorage.setItem("visit_count", visitCount.toString());

    // Setup social icon tracking
    setupSocialTracking();

    // Setup form and cart tracking
    setupActionTracking();
  });
}

// Track page views and time spent. Dispatched by navigate() in script.js on every
// route change (link click, back/forward, or initial load) — plain "hashchange"
// stopped firing once routing moved to real paths via the History API.
window.addEventListener("route-changed", () => {
  const currentView = location.pathname.split("/")[1] || "home";
  const params = new URLSearchParams(location.search);

  // Track the page view
  trackPageView(currentView);
  if (params.get("cat")) trackProductFilter("category", params.get("cat"));
  if (params.get("concern")) trackProductFilter("need", params.get("concern"));
});

function setupSocialTracking() {
  // Track social media icon clicks
  document.addEventListener("click", (e) => {
    const socialLink = e.target.closest(
      'a[href*="instagram"], a[href*="facebook"], a[href*="twitter"]'
    );
    if (socialLink) {
      let platform = "unknown";
      const href = socialLink.getAttribute("href") || "";

      if (href.includes("instagram")) platform = "instagram";
      else if (href.includes("facebook")) platform = "facebook";
      else if (href.includes("twitter")) platform = "twitter";

      trackSocialClick(platform);
    }
  });
}

function setupActionTracking() {
  // Cart actions with debouncing
  document.addEventListener("click", (e) => {
    if (e.target.closest('[onclick*="addToCart"]')) {
      trackCartAction("add_to_cart");
    }
    if (e.target.closest('[onclick*="removeFromCart"]')) {
      trackCartAction("remove_from_cart");
    }
    if (e.target.closest('[onclick*="incQty"]')) {
      trackCartAction("increase_quantity");
    }
    if (e.target.closest('[onclick*="decQty"]')) {
      trackCartAction("decrease_quantity");
    }
    if (e.target.closest('[onclick*="clearCart"]')) {
      trackCartAction("clear_cart");
    }

  });

  // Form field tracking on blur and input (when user types or leaves field)
  function setupFormFieldTracking(form, prefix) {
    if (!form) return;

    const captureAllFormFields = () => {
      const fields = form.querySelectorAll("input, textarea, select");
      fields.forEach((field) => {
        if (field.value && field.value.trim().length > 0) {
          const fieldName = `${prefix}_${field.name || field.id}`;
          trackFormField(fieldName, field.value);
        }
      });
    };

    // Capture initial values if already populated (e.g. from loadFormData)
    captureAllFormFields();

    const fields = form.querySelectorAll("input, textarea, select");
    fields.forEach((field) => {
      const recordField = () => {
        if (field.value && field.value.trim().length > 0) {
          const fieldName = `${prefix}_${field.name || field.id}`;
          trackFormField(fieldName, field.value);
          if (prefix === "checkout") {
            trackCheckoutAction("form_input", {
              field: fieldName,
              value: field.value.trim(),
            });
          }
        }
      };
      field.addEventListener("blur", recordField);
      let fieldTimer;
      field.addEventListener("input", () => {
        clearTimeout(fieldTimer);
        fieldTimer = setTimeout(recordField, 700);
      });
    });

    // Form submission
    form.addEventListener("submit", () => {
      captureAllFormFields();
      if (prefix === "contact") {
        trackContactAction("form_submit");
      } else if (prefix === "checkout") {
        trackCheckoutAction("order_submit");
      }
    });
  }

  // Contact form
  setupFormFieldTracking(document.getElementById("contactForm"), "contact");

  // Checkout form
  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    setupFormFieldTracking(checkoutForm, "checkout");

    // Shipping method changes
    checkoutForm.addEventListener("change", (e) => {
      if (e.target.name === "shipping_method") {
        trackCheckoutAction("shipping_change", { method: e.target.value });
      }
    });

    // Order note tracking (only when substantial content)
    const orderNote = document.getElementById("orderNote");
    if (orderNote) {
      orderNote.addEventListener("blur", () => {
        if (orderNote.value && orderNote.value.trim().length > 0) {
          trackCheckoutAction("note_typed", {
            length: orderNote.value.trim().length,
            value: orderNote.value.trim(),
          });
        }
      });
    }
  }
}

// Initialize everything when script loads
setupExitTracking();
