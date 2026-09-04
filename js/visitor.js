// Simple behavior tracking with dynamic timing
// Set to true to disable sending visit summary emails during development
const DISABLE_VISIT_EMAILS = true;

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
    formFields: {}, // Store final field values instead of every keystroke
  };
  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

// Save visit session when user leaves
function saveVisitSession() {
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
    sessionData.checkoutActions.length > 0
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
    }
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

  // Only store final values, not every keystroke
  if (value && value.length > 0) {
    sessionData.formFields[field] = {
      value: value.length > 20 ? value.substring(0, 20) + "..." : value,
      length: value.length,
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

function summarizeSession(sessionData) {
  const summary = [];

  if (sessionData.pages.length > 0) {
    const pageSummary = sessionData.pages
      .map((page) => `${page.page} (${formatDuration(page.duration)})`)
      .join(", ");
    summary.push(`Pages Visited: ${pageSummary}`);
  }

  // Add current page if session ended while on a page
  if (sessionData.currentPage && sessionData.totalDuration) {
    const currentPageDuration =
      sessionData.endTimestamp - sessionData.pageStartTime;
    summary.push(
      `Current Page: ${sessionData.currentPage} (${formatDuration(
        currentPageDuration
      )})`
    );
  }

  if (sessionData.productsViewed.length > 0) {
    const productNames = sessionData.productsViewed.map((p) => p.productName);
    summary.push(`Products Viewed: ${productNames.join(", ")}`);
  }

  if (sessionData.socialClicks.length > 0) {
    const socialPlatforms = sessionData.socialClicks.map(
      (click) => click.platform
    );
    summary.push(
      `Social Clicks: ${[...new Set(socialPlatforms)].join(", ")} (${
        sessionData.socialClicks.length
      } clicks)`
    );
  }

  if (sessionData.cartActions.length > 0) {
    const actionCounts = {};
    sessionData.cartActions.forEach((action) => {
      actionCounts[action.action] = (actionCounts[action.action] || 0) + 1;
    });
    const actionSummary = Object.entries(actionCounts)
      .map(([action, count]) => `${action} (${count})`)
      .join(", ");
    summary.push(`Cart Actions: ${actionSummary}`);
  }

  if (sessionData.searchActions.length > 0) {
    summary.push(`Product Searches: ${sessionData.searchActions.map((a) => a.query).join(", ")}`);
  }

  if (sessionData.filterActions.length > 0) {
    const filters = sessionData.filterActions.map((a) => `${a.type}: ${a.value}`).join(", ");
    summary.push(`Product Filters: ${filters}`);
  }

  if (sessionData.wishlistActions.length > 0) {
    const wishlistSummary = sessionData.wishlistActions
      .map((a) => `${a.action}${a.product ? ` (${a.product})` : ""}`)
      .join(", ");
    summary.push(`Wishlist: ${wishlistSummary}`);
  }

  if (sessionData.variantSelections.length > 0) {
    const variants = sessionData.variantSelections
      .map((v) => `${v.product || "Product"}: ${v.variant || "unknown"}`)
      .join(", ");
    summary.push(`Variant Choices: ${variants}`);
  }

  if (sessionData.contactActions.length > 0) {
    const submitCount = sessionData.contactActions.filter(
      (a) => a.action === "form_submit"
    ).length;
    const inputCount = sessionData.contactActions.filter(
      (a) => a.action === "form_input"
    ).length;
    summary.push(
      `Contact Form: ${inputCount} fields filled, ${submitCount} submissions`
    );
  }

  if (sessionData.checkoutActions.length > 0) {
    const shippingChanges = sessionData.checkoutActions.filter(
      (a) => a.action === "shipping_change"
    ).length;
    const noteTyped = sessionData.checkoutActions.filter(
      (a) => a.action === "note_typed"
    ).length;
    const formInputs = sessionData.checkoutActions.filter(
      (a) => a.action === "form_input"
    ).length;
    const submits = sessionData.checkoutActions.filter(
      (a) => a.action === "order_submit"
    ).length;

    let checkoutSummary = [];
    if (shippingChanges > 0)
      checkoutSummary.push(`shipping changes: ${shippingChanges}`);
    if (noteTyped > 0) checkoutSummary.push(`notes: ${noteTyped}`);
    if (formInputs > 0) checkoutSummary.push(`fields filled: ${formInputs}`);
    if (submits > 0) checkoutSummary.push(`submits: ${submits}`);

    if (checkoutSummary.length > 0) {
      summary.push(`Checkout: ${checkoutSummary.join(", ")}`);
    }
  }

  if (Object.keys(sessionData.formFields).length > 0) {
    const fieldSummary = Object.entries(sessionData.formFields)
      .map(([field, data]) => `${field}: ${data.value} (${data.length} chars)`)
      .join("; ");
    summary.push(`Form Data: ${fieldSummary}`);
  }

  if (sessionData.alertsShown.length > 0) {
    summary.push(`Alerts Shown: ${sessionData.alertsShown.join(", ")}`);
  }

  if (sessionData.totalDuration) {
    summary.push(`Total Session: ${formatDuration(sessionData.totalDuration)}`);
  }

  return summary.length > 0
    ? summary.join("\n")
    : "Brief visit - no significant activity";
}

function sendVisitEmail(sessionData) {
  const isDev =
    DISABLE_VISIT_EMAILS ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "" ||
    location.protocol === "file:";

  if (isDev) {
    console.log("Visit summary email disabled during development.");
    return;
  }

  const visitCount = parseInt(localStorage.getItem("visit_count") || "0");

  const visitorData = {
    // name: "Visit Completed",
    // email: "visitor@example.com",
    message: `
Visit Summary:
User Agent: ${navigator.userAgent}
Referrer: ${document.referrer || "none"}
Screen: ${window.screen.width}x${window.screen.height}
Session Start: ${new Date(sessionData.startTimestamp).toLocaleString()}
Session End: ${new Date().toLocaleString()}
Total Duration: ${formatDuration(sessionData.totalDuration)}
Visit Count: ${visitCount}

Session Activity:
${summarizeSession(sessionData)}

Key Interactions:
- Social Clicks: ${sessionData.socialClicks.length}
- Cart Actions: ${sessionData.cartActions.length}
- Product Searches: ${sessionData.searchActions.length}
- Product Filters: ${sessionData.filterActions.length}
- Wishlist Actions: ${sessionData.wishlistActions.length}
- Variant Choices: ${sessionData.variantSelections.length}
- Contact Fields: ${
      Object.keys(sessionData.formFields).filter((k) => k.includes("contact"))
        .length
    }
- Checkout Actions: ${sessionData.checkoutActions.length}
- Products Viewed: ${sessionData.productsViewed.length}

Full Session Data (simplified):
${JSON.stringify(
  {
    pages: sessionData.pages.length,
    products: sessionData.productsViewed.map((p) => p.productName),
    socialClicks: sessionData.socialClicks.map((s) => s.platform),
    cartActions: sessionData.cartActions.reduce((acc, action) => {
      acc[action.action] = (acc[action.action] || 0) + 1;
      return acc;
    }, {}),
    searches: sessionData.searchActions.map((action) => action.query),
    filters: sessionData.filterActions.map((action) => `${action.type}: ${action.value}`),
    wishlistActions: sessionData.wishlistActions.map((action) => ({
      action: action.action,
      product: action.product,
    })),
    variantSelections: sessionData.variantSelections.map((selection) => ({
      product: selection.product,
      variant: selection.variant,
    })),
    formFields: sessionData.formFields,
    checkoutSummary: sessionData.checkoutActions.reduce((acc, action) => {
      acc[action.action] = (acc[action.action] || 0) + 1;
      return acc;
    }, {}),
  },
  null,
  2
)}`,
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

  // Form field tracking on blur (when user leaves the field)
  function setupFormFieldTracking(form, prefix) {
    if (!form) return;

    const fields = form.querySelectorAll("input, textarea, select");
    fields.forEach((field) => {
      const recordField = () => {
        if (field.value && field.value.trim().length > 0) {
          const fieldName = `${prefix}_${field.name || field.id}`;
          trackFormField(fieldName, field.value);
          if (prefix === "checkout") {
            trackCheckoutAction("form_input", {
              field: fieldName,
              value: field.value.length > 40 ? field.value.substring(0, 40) + "..." : field.value,
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
        if (orderNote.value.length > 5) {
          trackCheckoutAction("note_typed", {
            length: orderNote.value.length,
            preview:
              orderNote.value.substring(0, 30) +
              (orderNote.value.length > 30 ? "..." : ""),
          });
        }
      });
    }
  }
}

// Initialize everything when script loads
setupExitTracking();
