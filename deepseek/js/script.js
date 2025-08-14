document.addEventListener("DOMContentLoaded", function () {
  // Mobile navigation toggle
  const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  mobileNavToggle.addEventListener("click", function () {
    this.classList.toggle("active");
    mainNav.classList.toggle("active");
  });

  // Cart functionality (placeholder)
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  const cartCount = document.querySelector(".cart-count");

  let cartItems = JSON.parse(localStorage.getItem("hayatiqCart")) || [];
  updateCartCount();

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // In a real implementation, you would add the actual product
      cartItems.push({ id: Date.now(), name: "Product", price: 0 });
      localStorage.setItem("hayatiqCart", JSON.stringify(cartItems));
      updateCartCount();

      // Show feedback
      this.textContent = "Added!";
      setTimeout(() => {
        this.textContent = "Add to Cart";
      }, 2000);
    });
  });

  function updateCartCount() {
    cartCount.textContent = cartItems.length;
  }

  // Product quick view (placeholder)
//   const quickViewButtons = document.querySelectorAll(".quick-view");

  // Product quick view
  const quickViewButtons = document.querySelectorAll(".quick-view");
  const quickViewModal = document.createElement("div");
  quickViewModal.className = "quick-view-modal";
  document.body.appendChild(quickViewModal);

  // Sample product data (in a real app, this would come from a database)
  const products = [
    {
      id: 1,
      name: "Lavender Body Butter",
      price: 24.99,
      description:
        "Our luxurious lavender body butter is formulated with shea butter, coconut oil, and pure lavender essential oil to deeply moisturize and relax your senses.",
      ingredients:
        "Organic shea butter, organic coconut oil, organic jojoba oil, lavender essential oil, vitamin E, rosemary extract (natural preservative).",
      usage:
        "Apply to clean, dry skin as needed. Massage in circular motions until fully absorbed. Best used after showering or bathing when skin is still slightly damp.",
      warnings:
        "For external use only. Discontinue use if irritation occurs. Keep out of reach of children. Avoid contact with eyes. Store in a cool, dry place.",
      image: "assets/images/product1.jpg",
    },
    {
      id: 2,
      name: "Rosehip Facial Oil",
      price: 29.99,
      description:
        "Nourishing facial oil packed with antioxidants and essential fatty acids to hydrate and rejuvenate your skin.",
      ingredients:
        "Organic rosehip oil, jojoba oil, vitamin E, lavender essential oil.",
      usage:
        "Apply 2-3 drops to clean face morning and/or night. Gently massage into skin.",
      warnings:
        "For external use only. Avoid contact with eyes. Store in a cool, dark place.",
      image: "assets/images/product2.jpg",
    },
    // Add more products as needed
  ];

  quickViewButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      // In a real app, you would get the product ID from a data attribute
      const productId =
        parseInt(this.closest(".product-card").getAttribute("data-id")) || 1;
      const product = products.find((p) => p.id === productId) || products[0];

      showQuickView(product);
    });
  });

  function showQuickView(product) {
    quickViewModal.innerHTML = `
            <div class="quick-view-content">
                <button class="close-quick-view">&times;</button>
                <div class="quick-view-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="quick-view-details">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="description">${product.description}</p>
                    
                    <div class="quick-view-tabs">
                        <div class="tab-header">
                            <button class="tab-btn active" data-tab="ingredients">Ingredients</button>
                            <button class="tab-btn" data-tab="usage">How to Use</button>
                            <button class="tab-btn" data-tab="warnings">Warnings</button>
                        </div>
                        <div class="tab-content">
                            <div class="tab-pane active" id="ingredients">
                                <p>${product.ingredients}</p>
                            </div>
                            <div class="tab-pane" id="usage">
                                <p>${product.usage}</p>
                            </div>
                            <div class="tab-pane" id="warnings">
                                <p>${product.warnings}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quantity-selector">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" value="1" min="1">
                        <button class="quantity-btn plus">+</button>
                    </div>
                    
                    <button class="btn btn-primary add-to-cart">Add to Cart</button>
                </div>
            </div>
        `;

    quickViewModal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Close modal
    const closeBtn = quickViewModal.querySelector(".close-quick-view");
    closeBtn.addEventListener("click", closeQuickView);

    // Tab functionality
    const tabBtns = quickViewModal.querySelectorAll(".tab-btn");
    const tabPanes = quickViewModal.querySelectorAll(".tab-pane");

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab");

        tabBtns.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        tabPanes.forEach((pane) => pane.classList.remove("active"));
        quickViewModal.querySelector(`#${tabId}`).classList.add("active");
      });
    });

    // Quantity selector
    const minusBtn = quickViewModal.querySelector(".quantity-btn.minus");
    const plusBtn = quickViewModal.querySelector(".quantity-btn.plus");
    const quantityInput = quickViewModal.querySelector(
      ".quantity-selector input"
    );

    minusBtn.addEventListener("click", function () {
      let value = parseInt(quantityInput.value);
      if (value > 1) {
        quantityInput.value = value - 1;
      }
    });

    plusBtn.addEventListener("click", function () {
      let value = parseInt(quantityInput.value);
      quantityInput.value = value + 1;
    });

    // Add to cart
    const addToCartBtn = quickViewModal.querySelector(".add-to-cart");
    addToCartBtn.addEventListener("click", function () {
      const quantity = parseInt(quantityInput.value);
      cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
      });
      localStorage.setItem("hayatiqCart", JSON.stringify(cartItems));
      updateCartCount();

      this.textContent = "Added to Cart!";
      setTimeout(() => {
        this.textContent = "Add to Cart";
        closeQuickView();
      }, 1500);
    });
  }

  function closeQuickView() {
    quickViewModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  // Close modal when clicking outside
  quickViewModal.addEventListener("click", function (e) {
    if (e.target === quickViewModal) {
      closeQuickView();
    }
  });

  // Add product IDs to product cards
  document.querySelectorAll(".product-card").forEach((card, index) => {
    card.setAttribute("data-id", index + 1);
  });

  // Newsletter form (placeholder)
  const newsletterForm = document.querySelector(".newsletter-form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      alert(`Thank you for subscribing with ${emailInput.value}!`);
      emailInput.value = "";
    });
  }
});
