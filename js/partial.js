// FormSubmit Email & Notification Configuration
const FORMSUBMIT_CONFIG = {
  checkout: {
    recipients: [
      "hayatiq.life@gmail.com",
      "topukhan6364@gmail.com",
    ],
    fallback: "topukhan6364@gmail.com",
  },
  contact: {
    recipients: ["hayatiq.life@gmail.com"],
    fallback: "topukhan6364@gmail.com",
  },
};

function submitFormWithFallback(form, type = "checkout") {
  const config = FORMSUBMIT_CONFIG[type] || FORMSUBMIT_CONFIG.checkout;
  const formData = new FormData(form);

  // Set unique, informative subject line so email apps don't group orders and each triggers a notification
  if (type === "checkout") {
    const nameInput = document.getElementById("checkoutName");
    const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Customer";
    const totalData = document.getElementById("totalData");
    const total = totalData ? parseFloat(totalData.value) || 0 : 0;
    formData.set("_subject", `You have an order from ${name} - Amount: ৳${total.toFixed(2)}`);
  } else if (type === "contact") {
    const nameInput = document.getElementById("name");
    const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Visitor";
    formData.set("_subject", `New Message from ${name}`);
  }

  const requests = config.recipients.map((email) => {
    return axios.post(`https://formsubmit.co/ajax/${email}`, formData).catch((error) => {
      if (error.response?.status !== 429) throw error;
      const fallbackUrl = `https://formsubmit.co/ajax/${config.fallback}`;
      return axios.post(fallbackUrl, formData);
    });
  });

  return Promise.allSettled(requests).then((results) => {
    const hasSuccess = results.some((r) => r.status === "fulfilled");
    if (!hasSuccess) {
      const firstError = results.find((r) => r.status === "rejected")?.reason;
      throw firstError || new Error("All submission requests failed");
    }
    return results;
  });
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

  // === Send via FormSubmit AJAX ===
  submitFormWithFallback(form, "contact")
    .then((response) => {
      if (submitBtn) {
        submitBtn.classList.remove("is-submitting");
        submitBtn.classList.add("is-success");
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>Sent!</span>';
      }
      // Record submission timestamp
      submissions.push(now);
      localStorage.setItem(limitKey, JSON.stringify(submissions));
      // Show success message
      messageBox.style.display = "block";
      messageBox.style.color = "green";
      messageBox.textContent =
        "✅ We have received your message and will get back to you soon. Redirecting...";
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

// checkout form submit
document
  .getElementById("checkoutForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    if (isCheckoutSubmitting) return;

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector(".checkout-submit");
    const limitKey = "checkoutOrders";
    const now = Date.now();
    let orders = JSON.parse(localStorage.getItem(limitKey)) || [];
    const cart = getCart();

    // Cart validation
    if (cart.length === 0) {
      toast("Your cart is empty");
      return;
    }

    const phoneInput = document.getElementById("checkoutPhone");
    const phone = phoneInput ? phoneInput.value.trim() : "";

    // Phone validation
    const phoneRegex = /^01[3-9]\d{8}$/;

    if (!phoneRegex.test(phone)) {
      toast("Please enter a valid Bangladeshi phone number");
      if (phoneInput) phoneInput.focus();
      return;
    }

    // Remove old orders (older than 20 minutes)
    orders = orders.filter((timestamp) => now - timestamp < 1200000);
    localStorage.setItem(limitKey, JSON.stringify(orders));

    if (orders.length >= 5) {
      toast("Order limit reached. Please try again later.", "warning");
      return;
    }

    // All validations passed — instantly trigger active loading feedback and prevent duplicate clicks
    isCheckoutSubmitting = true;
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : "Place Order";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-submitting");
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> <span>Placing Order...</span>';
    }

    submitFormWithFallback(form, "checkout")
      .then((response) => {
        if (submitBtn) {
          submitBtn.classList.remove("is-submitting");
          submitBtn.classList.add("is-success");
          submitBtn.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>Order Placed!</span>';
        }

        // Save form data for next time
        saveFormData();
        // Record order timestamp
        orders.push(now);
        localStorage.setItem(limitKey, JSON.stringify(orders));

        // Clear cart and show success
        clearCart();
        toastBox("Order placed successfully! 😊");

        setTimeout(() => {
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("is-success");
            submitBtn.innerHTML = originalBtnHTML;
          }
          isCheckoutSubmitting = false;
          goTo("/products");
        }, 2500);
      })
      .catch((error) => {
        isCheckoutSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-submitting");
          submitBtn.innerHTML = originalBtnHTML;
        }
        toast("Error placing order. Please try again.");
        console.error(error);
      });
  });
