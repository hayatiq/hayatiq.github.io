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

document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;
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
  // === Send via FormSubmit AJAX ===
  submitFormWithFallback(form, "contact")
    .then((response) => {
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
        goTo("/products");
      }, 5000);
      form.reset();
    })
    .catch((error) => {
      // Show error message
      messageBox.style.display = "block";
      messageBox.style.color = "red";
      messageBox.textContent =
        "❌ Something went wrong. Please try again later.";
    });
});

// checkout form submit
document
  .getElementById("checkoutForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const form = e.target;
    const limitKey = "checkoutOrders";
    const now = Date.now();
    let orders = JSON.parse(localStorage.getItem(limitKey)) || [];
    const cart = getCart();
    // Cart validation
    if (cart.length === 0) {
      toast("Your cart is empty");
      return;
    }

    const phone = document.getElementById("checkoutPhone").value;

    // Phone validation
    const phoneRegex = /^01[3-9]\d{8}$/;

    if (!phoneRegex.test(phone)) {
      toast("Please enter a valid Bangladeshi phone number");
      return;
    }
    // Remove old orders (older than 20 minutes)
    orders = orders.filter((timestamp) => now - timestamp < 1200000);
    localStorage.setItem(limitKey, JSON.stringify(orders));

    if (orders.length >= 5) {
      toast("Order limit reached. Please try again later.", "warning");
      return;
    }
    submitFormWithFallback(form, "checkout")
      .then((response) => {
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
          goTo("/products");
        }, 3000);
      })
      .catch((error) => {
        toast("Error placing order. Please try again.");
        console.error(error);
      });
  });
