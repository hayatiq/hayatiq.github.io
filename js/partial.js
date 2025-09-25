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
      window.location.hash = "/products";
    }, 5000);
    return;
  }
  // === Send via FormSubmit AJAX ===
  axios
    .post(
      "https://formsubmit.co/ajax/hayatiq.life@gmail.com",
      new FormData(form)
    )
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
        window.location.hash = "/products";
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
      toast("Order limit reached. Please try again in 20 minutes.", "warning");
      return;
    }
    axios
      .post(
        "https://formsubmit.co/ajax/hayatiq.life@gmail.com",
        new FormData(form)
      )
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
          window.location.hash = "/products";
        }, 3000);
      })
      .catch((error) => {
        toast("Error placing order. Please try again.");
      });
  });
