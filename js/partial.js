// Form submission: order emails via FormSubmit, Telegram alerts and the order sheet
// via the Netlify function (netlify/functions/order.js). Who gets what is set in
// js/config.js (NOTIFY). Outside the live address nothing is sent (IS_LIVE, sendsOn) —
// forms still run their full flow so they can be tested.

// Sends one kind of email (a NOTIFY key, e.g. "orderEmails") through FormSubmit to each
// of its recipients, in parallel so one slow or rate-limited inbox doesn't hold up the
// other. Resolves with { sent, failed } if at least one arrived, or { skipped } when
// test mode or a local switch (sendsOn) holds it back; rejects if none arrived.
async function sendEmails(kind, formData) {
  const to = recipients(kind);
  if (!to.length) throw new Error("No email recipients configured");
  if (!sendsOn(kind)) {
    console.info(`[${IS_LIVE ? "SWITCHED OFF" : "TEST MODE"}] ${kind} to ${to.join(", ")} not sent. It would have sent:`, Object.fromEntries(formData.entries()));
    return { skipped: IS_LIVE ? "switched off" : "test mode" };
  }
  const results = await Promise.allSettled(to.map(async (address) => {
    const res = await fetch(`https://formsubmit.co/ajax/${address}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) === "false") throw new Error(`${address}: ${data.message || `FormSubmit error ${res.status}`}`);
    return address;
  }));
  const sent = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  const failed = results.filter((r) => r.status === "rejected").map((r) => r.reason.message);
  failed.forEach((reason) => console.error("Email not sent:", reason));
  if (!sent.length) throw new Error(`No email was sent (${failed.join("; ")})`);
  return { sent, failed };
}

// Telegram alerts + order-sheet row, handled by the Netlify function. Resolves to the
// function's report, e.g. { telegram: { business: "sent", developer: "sent" }, sheet: "sent" },
// or { skipped } when test mode or the local switches hold both back.
async function sendToServer(order) {
  const channels = {
    telegram: sendsOn("orderTelegram") ? NOTIFY.orderTelegram || [] : [],
    sheet: sendsOn("orderSheet") && Boolean(NOTIFY.orderSheet),
  };
  if (!IS_LIVE) {
    console.info("[TEST MODE] Telegram alerts and order sheet row not sent. They would have sent:", { order, channels: { telegram: NOTIFY.orderTelegram, sheet: NOTIFY.orderSheet } });
    return { telegram: {}, sheet: "off", skipped: "test mode" };
  }
  if (!channels.telegram.length && !channels.sheet) return { telegram: {}, sheet: "off", skipped: "switched off" };
  return callFunction({ order, channels });
}

// Contact-form message to the Telegram chats in NOTIFY.contactTelegram (same function).
async function sendContactToServer(contact) {
  const telegram = sendsOn("contactTelegram") ? NOTIFY.contactTelegram || [] : [];
  if (!IS_LIVE) {
    console.info("[TEST MODE] Telegram contact alert not sent. It would have sent:", { contact, telegram: NOTIFY.contactTelegram });
    return { telegram: {}, skipped: "test mode" };
  }
  if (!telegram.length) return { telegram: {}, skipped: "switched off" };
  return callFunction({ kind: "contact", contact, channels: { telegram } });
}

async function callFunction(body) {
  const res = await fetch("/.netlify/functions/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Notification function error ${res.status}`);
  return data;
}

// What each channel did with an order, shown on the order page while testing locally.
function deliveryReport(email, server) {
  const describe = (result) => (typeof result === "object" ? Object.entries(result).map(([who, r]) => `${who} ${r}`).join(", ") : result);
  return [
    ["Email", email.error ? email.error.message : email.skipped || [`sent to ${email.sent.join(", ")}`, ...email.failed].join("; ")],
    ["Telegram", server.error ? server.error.message : server.skipped || (sendsOn("orderTelegram") ? describe(server.telegram) || "nobody in NOTIFY.orderTelegram" : "switched off")],
    ["Sheet", server.error ? server.error.message : server.skipped || (sendsOn("orderSheet") ? server.sheet : "switched off")],
  ];
}

// Order numbers look like HQ-261017-4K7P: the date in Dhaka plus 4 random characters
// (no 0/O or 1/I, so they're easy to read out on the phone).
function newOrderId() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", year: "2-digit", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type) => parts.find((x) => x.type === type).value;
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const random = Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) => alphabet[n % alphabet.length]).join("");
  return `HQ-${get("year")}${get("month")}${get("day")}-${random}`;
}

let isContactSubmitting = false;

document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();
  if (isContactSubmitting) return;

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const messageBox = document.getElementById("formMessage");
  // === Rate Limiting with localStorage ===
  const limitKey = "contactFormSubmissions";
  const now = Date.now();
  let submissions = JSON.parse(localStorage.getItem(limitKey)) || [];
  // Remove old submissions (older than 1 hour)
  submissions = submissions.filter((timestamp) => now - timestamp < 3600000);
  localStorage.setItem(limitKey, JSON.stringify(submissions));
  if (submissions.length >= 3) {
    messageBox.style.display = "block";
    messageBox.style.color = "red";
    messageBox.textContent =
      "⚠️ You have reached your submission limit. Please try again later.";
    setTimeout(() => {
      goTo("/products");
    }, 5000);
    return;
  }

  isContactSubmitting = true;
  const originalBtnHTML = submitBtn ? submitBtn.innerHTML : "Send Message";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add("is-submitting");
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> <span>Sending...</span>';
  }

  // === Email (FormSubmit) and Telegram at the same time ===
  const contactData = new FormData(form);
  const contactName = (document.getElementById("name").value || "").trim() || "Visitor";
  contactData.set("_subject", `New Message from ${contactName}`);
  const contact = {
    name: (document.getElementById("name").value || "").trim(),
    contact: (document.getElementById("contact").value || "").trim(),
    message: (document.getElementById("message").value || "").trim(),
    source: sourceLabel(),
  };
  Promise.allSettled([sendEmails("contactEmails", contactData), sendContactToServer(contact)])
    .then(([emailResult, serverResult]) => {
      const email = emailResult.status === "fulfilled" ? emailResult.value : { error: emailResult.reason };
      const server = serverResult.status === "fulfilled" ? serverResult.value : { error: serverResult.reason };
      // Received if either channel got it (or, when testing, both were deliberately held back).
      const delivered = (email.sent || []).length > 0 || Object.values(server.telegram || {}).includes("sent");
      if (!delivered && !(email.skipped && server.skipped)) {
        console.error("Contact message not delivered", { email: email.error || email, telegram: server.error || server });
        throw new Error("Contact message not delivered");
      }
      const response = { skipped: !delivered };
      if (submitBtn) {
        submitBtn.classList.remove("is-submitting");
        submitBtn.classList.add("is-success");
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>Sent!</span>';
      }
      // Record submission timestamp (test sends don't count toward the limit)
      if (!response.skipped) {
        submissions.push(now);
        localStorage.setItem(limitKey, JSON.stringify(submissions));
      }
      // Show success message
      messageBox.style.display = "block";
      messageBox.style.color = "green";
      messageBox.textContent = !response.skipped
        ? "✅ We have received your message and will get back to you soon. Redirecting..."
        : "✅ Test message: nothing was sent. Redirecting...";
      // Redirect after short delay
      setTimeout(() => {
        messageBox.textContent = "";
        messageBox.style.display = "none";
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-success");
          submitBtn.innerHTML = originalBtnHTML;
        }
        isContactSubmitting = false;
        goTo("/products");
      }, 3500);
    })
    .catch((error) => {
      isContactSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-submitting");
        submitBtn.innerHTML = originalBtnHTML;
      }
      // Show error message
      messageBox.style.display = "block";
      messageBox.style.color = "red";
      messageBox.textContent =
        "❌ Something went wrong. Please try again later.";
    });
});

let isCheckoutSubmitting = false;

document.getElementById("checkoutForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  if (isCheckoutSubmitting) return;

  const form = e.target;
  const submitBtn = document.getElementById("placeOrderBtn");
  const limitKey = "checkoutOrders";
  const now = Date.now();

  if (getCart().length === 0) {
    toast("Your cart is empty");
    return;
  }

  const phoneInput = document.getElementById("checkoutPhone");
  const phone = normalizePhone(phoneInput.value);
  if (!phone) {
    showPhoneError("Please enter an 11-digit mobile number, e.g. 01712345678");
    phoneInput.focus();
    return;
  }
  phoneInput.value = phone;
  showPhoneError("");

  const area = selectedArea();
  if (!area) {
    toast("Please choose your delivery area");
    return;
  }

  let orders = (JSON.parse(localStorage.getItem(limitKey)) || []).filter((t) => now - t < 1200000);
  localStorage.setItem(limitKey, JSON.stringify(orders));
  if (orders.length >= 5) {
    toast("Order limit reached. Please try again later.", "warning");
    return;
  }

  isCheckoutSubmitting = true;
  submitBtn.disabled = true;
  submitBtn.classList.add("is-submitting");
  submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> <span>Placing order...</span>';

  updateCheckoutTotals();
  const items = orderItems();
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const delivery = SHIPPING_RATES[area];
  const order = {
    id: newOrderId(),
    createdAt: new Date().toISOString(),
    name: document.getElementById("checkoutName").value.trim(),
    phone,
    address: document.getElementById("checkoutAddress").value.trim(),
    area,
    areaLabel: AREA_LABELS[area],
    deliveryTime: DELIVERY_TIME[area] || "",
    items,
    subtotal,
    delivery,
    total: subtotal + delivery,
    note: document.getElementById("orderNote").value.trim(),
    source: sourceLabel(),
  };

  // Hidden fields carry the same order number, area and source into the email.
  document.getElementById("orderIdData").value = order.id;
  document.getElementById("deliveryAreaData").value = order.areaLabel;
  document.getElementById("sourceData").value = order.source;
  const formData = new FormData(form);
  formData.set("_subject", `Order ${order.id} from ${order.name} - ${money(order.total)}`);

  // Email and Telegram/sheet go out at the same time; neither waits for the other.
  const [emailResult, serverResult] = await Promise.allSettled([
    sendEmails("orderEmails", formData),
    sendToServer(order),
  ]);
  const email = emailResult.status === "fulfilled" ? emailResult.value : { error: emailResult.reason };
  const server = serverResult.status === "fulfilled" ? serverResult.value : { error: serverResult.reason };
  // Received if any channel really delivered it (or, when testing, if every channel was
  // deliberately held back, so a test with everything switched off still "succeeds").
  const delivered = (email.sent || []).length > 0 || Object.values(server.telegram || {}).includes("sent") || server.sheet === "sent";
  const received = delivered || Boolean(email.skipped && server.skipped);
  const report = deliveryReport(email, server);
  if (!received) console.error("Order not delivered", report);

  localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({
    ...order,
    status: received ? "sent" : "failed",
    test: !delivered,
    report: IS_LOCAL ? report : undefined,
  }));

  if (received) {
    if (typeof trackOrderPlaced === "function") {
      trackOrderPlaced({ orderId: order.id, name: order.name, phone, address: order.address, note: order.note, total: order.total });
    }
    trackEvent("order_placed", { order: order.id, total: order.total });
    saveFormData();
    if (delivered) {
      orders.push(now);
      localStorage.setItem(limitKey, JSON.stringify(orders));
    }
    clearCart(false);
    form.reset();
  } else {
    trackEvent("order_failed", { order: order.id });
    loadFormData(); // keep what they typed; the cart is kept too
  }

  isCheckoutSubmitting = false;
  submitBtn.disabled = false;
  submitBtn.classList.remove("is-submitting");
  updateCheckoutTotals();
  goTo("/order");
});
