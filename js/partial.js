// FormSubmit's free tier rate-limits how many submissions an inbox can receive in a
// short window (429 Too Many Requests) — retry once against a fallback inbox instead
// of losing the contact message/order outright when that happens.
const FORMSUBMIT_PRIMARY_EMAIL = "hayatiq.life@gmail.com";
const FORMSUBMIT_FALLBACK_EMAIL = "topukhan6364@gmail.com";

function submitFormWithFallback(formData) {
  return axios.post(`https://formsubmit.co/ajax/${FORMSUBMIT_PRIMARY_EMAIL}`, formData).catch((error) => {
    if (error.response?.status !== 429) throw error;
    return axios.post(`https://formsubmit.co/ajax/${FORMSUBMIT_FALLBACK_EMAIL}`, formData);
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
  submitFormWithFallback(new FormData(form))
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
    submitFormWithFallback(new FormData(form))
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
