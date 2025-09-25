// Simple behavior tracking with dynamic timing
const USER_BEHAVIOR_KEY = "user_behavior";
const VISIT_SESSION_KEY = "current_visit_data";

// Dynamic timing variables (easily adjustable)
const TIMING = {
  productViewMinTime: 10000, // 10 seconds to show product alert
  productAlertCooldown: 120000, // 2 minutes between product alerts
  checkoutAlertCooldown: 300000, // 5 minutes between checkout alerts
  checkoutAlertMaxCount: 2, // Max 2 checkout alerts
};

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
  return (
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
      contactActions: [],
      checkoutActions: [],
      formFields: {},
    }
  );
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
    const submits = sessionData.checkoutActions.filter(
      (a) => a.action === "order_submit"
    ).length;

    let checkoutSummary = [];
    if (shippingChanges > 0)
      checkoutSummary.push(`shipping changes: ${shippingChanges}`);
    if (noteTyped > 0) checkoutSummary.push(`notes: ${noteTyped}`);
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

  fetch("https://formsubmit.co/ajax/topukhan6364gmail.com", {
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

// Track page views and time spent
window.addEventListener("hashchange", () => {
  const currentView = location.hash.split("/")[1] || "home";

  // Track the page view
  trackPageView(currentView);

  // Clear any running timers when leaving page
  if (productViewTimer) {
    clearTimeout(productViewTimer);
    productViewTimer = null;
  }
  if (checkoutTimer) {
    clearTimeout(checkoutTimer);
    checkoutTimer = null;
  }

  // Set up timers for new view
  if (currentView === "product") {
    setupProductAlertTimer();
  } else if (currentView === "checkout") {
    setupCheckoutAlertTimer();
  }
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
      field.addEventListener("blur", () => {
        if (field.value && field.value.trim().length > 0) {
          trackFormField(`${prefix}_${field.name || field.id}`, field.value);
        }
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

// Rest of the timer functions...
let productViewTimer = null;
let checkoutTimer = null;

function setupProductAlertTimer() {
  const behavior = getBehavior();
  const lastProductAlert = behavior.lastProductAlert || 0;
  const now = Date.now();

  // Check cooldown period
  if (now - lastProductAlert < TIMING.productAlertCooldown) {
    return;
  }

  productViewTimer = setTimeout(() => {
    showProductAlert();
  }, TIMING.productViewMinTime);
}

function setupCheckoutAlertTimer() {
  const behavior = getBehavior();
  const checkoutAlerts = behavior.checkoutAlerts || [];
  const now = Date.now();

  // Filter alerts from last 5 minutes
  const recentAlerts = checkoutAlerts.filter(
    (alertTime) => now - alertTime < TIMING.checkoutAlertCooldown
  );

  // Check if we've shown max allowed alerts
  if (recentAlerts.length >= TIMING.checkoutAlertMaxCount) {
    return;
  }

  checkoutTimer = setTimeout(() => {
    showCheckoutAlert();
  }, 2000);
}

function showProductAlert() {
  const behavior = getBehavior();
  const sessionData = getVisitSession();

  // Get current product ID from URL
  const currentHash = window.location.hash;
  const productId = currentHash.split("/product/")[1];

  Swal.fire({
    title: "Love this product? 👀",
    text: "Why not give it a try? Go to checkout and I'll share a little secret!",
    icon: "info",
    confirmButtonText: "Maybe Later",
    showCancelButton: true,
    cancelButtonText: "Take me to Checkout",
    background: "#EADED0",
    confirmButtonColor: "#95714F",
  }).then((result) => {
    if (result.dismiss === "cancel") {
      // Check if product is already in cart
      const cart = getCart();
      const isInCart = cart.some((item) => item.id === productId);

      if (!isInCart && productId) {
        addToCart(productId, "#/checkout", false);
      }

      window.location.hash = "#/checkout";
    }
  });

  // Record that we showed this alert
  behavior.lastProductAlert = Date.now();
  sessionData.alertsShown.push("product_alert");
  localStorage.setItem(USER_BEHAVIOR_KEY, JSON.stringify(behavior));
  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

function showCheckoutAlert() {
  const behavior = getBehavior();
  const sessionData = getVisitSession();
  const checkoutAlerts = behavior.checkoutAlerts || [];

  Swal.fire({
    title: "Psst... here's your secret! 🤫",
    html: 'In the <b>order note section</b>, write <br><code>"50% off on delivery charge"</code><br>to get half-price shipping!',
    icon: "success",
    confirmButtonText: "Got it!",
    background: "#EADED0",
    confirmButtonColor: "#95714F",
  });

  // Record this checkout alert
  checkoutAlerts.push(Date.now());
  behavior.checkoutAlerts = checkoutAlerts;
  sessionData.alertsShown.push("checkout_alert");
  localStorage.setItem(USER_BEHAVIOR_KEY, JSON.stringify(behavior));
  localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify(sessionData));
}

// Initialize everything when script loads
setupExitTracking();
