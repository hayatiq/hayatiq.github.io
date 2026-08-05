/* ==============================
       Mobile nav toggle
       ============================== */
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");
navToggle.addEventListener("click", () => {
  const open = primaryNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
});

// Close mobile nav on route change or click outside
document.addEventListener("click", (e) => {
  if (!primaryNav.contains(e.target) && !navToggle.contains(e.target)) {
    primaryNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

/* ==============================
       Minimal SPA Router (hash based)
       ============================== */
const routes = {
  home: document.getElementById("view-home"),
  products: document.getElementById("view-products"),
  detail: document.getElementById("view-detail"),
  categories: document.getElementById("view-categories"),
  contact: document.getElementById("view-contact"),
  about: document.getElementById("view-about"),
  cart: document.getElementById("view-cart"),
  checkout: document.getElementById("view-checkout"),
  wishlist: document.getElementById("view-wishlist"),
};

function setActiveNav(hash) {
  document.querySelectorAll(".nav-links a[data-link]").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === hash);
  });
  // Close mobile menu after navigation
  primaryNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

// SEO: keep <title> and the description meta tag current for each route. Hash
// fragments aren't distinctly indexable/shareable, but this still helps the browser
// tab/history and any crawler that does execute the JS.
function setPageMeta(title, description) {
  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", description);
}

function resetProductJsonLd() {
  const script = document.getElementById("productJsonLd");
  if (script) script.textContent = "{}";
}

function navigate() {
  const hash = location.hash || "#/";
  Object.values(routes).forEach((v) => v.classList.remove("active"));

  if (hash.startsWith("#/product/")) {
        routes.detail.classList.add("active");
        const id = hash.split("/")[2];
        const product = PRODUCTS.find(p => p.id === id);
        trackProductView(id, product?.name);
        renderDetail(id);
  } else if (hash.startsWith("#/products")) {
    routes.products.classList.add("active");
    const params = new URLSearchParams(hash.split("?")[1] || "");
    const cat = params.get("cat");
    const concern = params.get("concern");
    renderProducts(cat, concern);
    setupProductFilters();
    const topic = concern || cat;
    setPageMeta(
      `${topic ? topic + " " : ""}Products — Hayatiq`,
      `Shop ${topic ? topic.toLowerCase() + " " : ""}products from Hayatiq — handcrafted natural wellness essentials.`
    );
    resetProductJsonLd();
  } else if (hash === "#/categories") {
    routes.categories.classList.add("active");
    setPageMeta("Shop by Category — Hayatiq", "Browse Hayatiq's Hair Care, Magnesium Oil Spray, Salves & Balms, Bath Bombs, Footsoaks, Oral Care, and Cleaning Supply product categories.");
    resetProductJsonLd();
  } else if (hash === "#/contact") {
    routes.contact.classList.add("active");
    setPageMeta("Contact Us — Hayatiq", "Get in touch with Hayatiq for questions about our handcrafted natural wellness products.");
    resetProductJsonLd();
  } else if (hash === "#/about") {
    routes.about.classList.add("active");
    setPageMeta("Our Story — Hayatiq", "Learn about Hayatiq's story — handmade natural wellness products crafted with intention.");
    resetProductJsonLd();
  } else if (hash === "#/cart") {
    routes.cart.classList.add("active");
    renderCart();
    setPageMeta("Your Cart — Hayatiq", "Review the items in your Hayatiq shopping cart.");
    resetProductJsonLd();
  } else if (hash === "#/checkout") {
    routes.checkout.classList.add("active");
    initCheckout();
    setPageMeta("Checkout — Hayatiq", "Complete your Hayatiq order — cash on delivery available across Bangladesh.");
    resetProductJsonLd();
  } else if (hash === "#/wishlist") {
    routes.wishlist.classList.add("active");
    renderWishlist();
    setPageMeta("Your Wishlist — Hayatiq", "Products you've saved from Hayatiq's natural wellness collection.");
    resetProductJsonLd();
  } else {
    routes.home.classList.add("active");
    renderTopProducts();
    renderFeatured();
    renderTestimonials();
    setPageMeta(
      "Hayatiq — Handcrafted with Intention",
      "Hayatiq - Handcrafted natural wellness products. Magnesium oil spray, hair care, salves & balms, bath bombs, footsoaks, oral care, and non-toxic cleaning supplies made with intention in Bangladesh."
    );
    resetProductJsonLd();
  }
  setActiveNav(hash);
  updateFloatingCartButton();
  // Start each route at the top instead of wherever the previous view left off scrolled.
  window.scrollTo(0, 0);
  // Move focus for accessibility (preventScroll so it doesn't fight the scrollTo above)
  document.getElementById("app").focus({ preventScroll: true });
}

window.addEventListener("hashchange", navigate);

/* ==============================
       Site-wide testimonials (Customer Love)
       ============================== */
// Separate from per-product `reviews` — screenshots/testimonials here are usually
// about the overall experience, not one SKU. Ships empty; renderTestimonials() hides
// the homepage section entirely until populated. Entry shape: { type:
// "text"|"photo"|"screenshot", customerName, rating (optional), content, image
// (required for photo/screenshot), relatedProductId (optional), source (optional) }.
// DEMO PREVIEW DATA below — replace with real testimonials before launch.
const TESTIMONIALS = [
  { type: "text", customerName: "Farhana S.", rating: 5, content: "Ordered on a Wednesday, arrived exactly as described — will be reordering the magnesium oil.", source: "Facebook" },
  { type: "text", customerName: "Imran K.", rating: 5, content: "Really appreciated how quickly they replied to my questions on Messenger before I ordered.", source: "Messenger" },
  { type: "photo", customerName: "Sadia R.", rating: 4.5, content: "Loved the packaging, felt very premium for a small brand.", image: "./images/placeholder.webp" },
];

function initials(name) {
  return (name || "?").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function renderTestimonials() {
  const grid = document.getElementById("testimonialGrid");
  const section = document.getElementById("testimonialSection");
  if (!grid || !section) return;
  if (!TESTIMONIALS.length) {
    section.style.display = "none";
    return;
  }
  section.style.display = "";
  grid.innerHTML = TESTIMONIALS.map(
    (t) => `<div class="testimonial-card testimonial-card-modern">
        <i class="fa-solid fa-quote-left testimonial-quote-icon" aria-hidden="true"></i>
        <div class="testimonial-header">
          <span class="testimonial-avatar" aria-hidden="true">${initials(t.customerName)}</span>
          <div>
            <strong>${t.customerName}</strong>
            ${t.rating ? `<div class="stars">${stars(t.rating)}</div>` : ""}
          </div>
        </div>
        ${t.content ? `<p class="muted testimonial-content">${t.content}</p>` : ""}
        ${t.image ? `<img loading="lazy" src="${t.image}" alt="${t.type === "screenshot" ? "Customer conversation screenshot" : "Photo shared by " + t.customerName}" class="review-item-img" onclick="openImageLightbox('${t.image}')">` : ""}
        ${t.source ? `<span class="review-source">via ${t.source}</span>` : ""}
      </div>`
  ).join("");
}

// Plain CSS scroll-snap carousel (see .testimonial-carousel/.product-carousel in
// style.css) — swipe already works on touch devices without any JS; these buttons are
// only needed for mouse/keyboard users where click-drag-scroll isn't discoverable.
// Shared by both the Customer Love and Top Selling Products carousels.
function scrollCarousel(containerId, direction, itemSelector) {
  const track = document.getElementById(containerId);
  if (!track) return;
  const item = track.querySelector(itemSelector);
  const amount = item ? item.getBoundingClientRect().width + 16 : track.clientWidth * 0.8;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  track.scrollBy({ left: direction * amount, behavior: reduceMotion ? "auto" : "smooth" });
}
function scrollTestimonials(direction) {
  scrollCarousel("testimonialGrid", direction, ".testimonial-card");
}
function scrollTopProducts(direction) {
  scrollCarousel("topProductsGrid", direction, ".product-card-carousel");
}

/* ==============================
       Rendering helpers
       ============================== */
const featuredGrid = document.getElementById("featuredGrid");
const topProductsGrid = document.getElementById("topProductsGrid");
const productsGrid = document.getElementById("productsGrid");
const productCount = document.getElementById("productCount");
const detailWrap = document.getElementById("detailWrap");

function money(n) {
  if (typeof n === "string") {
    return n;
  }
  return `৳${n.toFixed(2)}`;
}

// Owner-assignable badge presets — set a product's `badge` field to one of these
// keys (see README.MD). Fixed marketing colors, not theme tokens: shoppers expect
// "Hot"/"New"/"Sale" to look the same regardless of which site palette is active.
const BADGE_TYPES = {
  hot: { label: "Hot", icon: "fa-fire" },
  new: { label: "New", icon: "fa-bolt" },
  sale: { label: "Sale", icon: "fa-tag" },
  popular: { label: "Popular", icon: "fa-crown" },
  // Auto-applied from `topSelling: true` rather than set via `badge` directly — same
  // flag that puts the product in the Top Selling Products carousel.
  bestseller: { label: "Best Seller", icon: "fa-star" },
};

function productCard(p, opts = {}) {
  const isComingSoon = typeof p.price === 'string' && p.price.toLowerCase().includes('coming soon');
  // An explicit `badge` field always wins; otherwise a topSelling product is auto-badged.
  const badgeKey = p.badge || (p.topSelling ? "bestseller" : null);
  const badge = !isComingSoon && badgeKey && BADGE_TYPES[badgeKey];
  // opts.carousel adds a sizing class for horizontal scroll-snap carousels (e.g. Top
  // Selling Products) — the card markup/behavior is identical either way.
  const cardClass = opts.carousel ? "product-card product-card-carousel" : "product-card";

  return `
      <article class="${cardClass}" aria-label="${p.name}">
        <a href="#/product/${p.id}">
          <div class="product-media">
            <img loading="lazy" src="${p.images[0]}" alt="${p.name}">
            ${isComingSoon ? `<div class="coming-soon-overlay">
              <span>Coming Soon</span>
              <button class="coming-soon-ask" onclick="event.preventDefault(); event.stopPropagation(); window.open('https://m.me/hayatiq.life?ref=${p.slug}', '_blank');"><i class="fa-brands fa-facebook-messenger" aria-hidden="true"></i> Ask about this</button>
            </div>` : ''}
            ${badge ? `<span class="product-badge badge-${badgeKey}"><i class="fa-solid ${badge.icon}" aria-hidden="true"></i> ${badge.label}</span>` : ''}
            ${!isComingSoon ? `<button class="wishlist-toggle ${isWishlisted(p.id) ? 'active' : ''}" data-id="${p.id}" aria-label="Add to wishlist" onclick="event.preventDefault(); event.stopPropagation(); toggleWishlist('${p.id}');"><i class="fa-solid fa-heart"></i></button>` : ''}
          </div>
          <div class="product-body">
            <div class="product-name">${p.name}</div>
            ${p.subtitle ? `<div class="product-subtitle">${p.subtitle}</div>` : ''}
            <div class="product-footer">
              <div class="product-price">${money(p.price)}</div>
              ${!isComingSoon ? `<button class="btn-icon-add" aria-label="Add ${p.name} to cart" onclick="event.preventDefault(); event.stopPropagation(); addToCart('${p.id}');"><i class="fa-solid fa-cart-plus"></i></button>` : ''}
            </div>
          </div>
        </a>
      </article>`;
}

function renderFeatured() {
  if (!featuredGrid) return;
  featuredGrid.innerHTML = PRODUCTS.slice(0, 8).map(productCard).join("");
}

// Opt-in only via `topSelling: true` — no automatic fallback to other live products.
function topProducts(limit = Infinity) {
  return PRODUCTS.filter((p) => p.topSelling).slice(0, limit);
}

function renderTopProducts() {
  if (!topProductsGrid) return;
  const section = topProductsGrid.closest("section");
  const items = topProducts();
  if (!items.length) {
    // Hide the whole section until at least one product is marked topSelling: true —
    // an empty "Top Selling Products" row would look broken.
    if (section) section.style.display = "none";
    return;
  }
  if (section) section.style.display = "";
  topProductsGrid.innerHTML = items.map((p) => productCard(p, { carousel: true })).join("");
}

// "Find the Right Product" — small, hand-curated list of needs (not auto-derived) so
// it stays meaningful with few products. `concern` matches a product's `concerns`
// tag; `category` reuses the category filter for broader needs.
const NEED_TILES = [
  { label: "Better Sleep", icon: "fa-moon", concern: "Better Sleep" },
  { label: "Muscle Recovery", icon: "fa-dumbbell", concern: "Muscle Recovery" },
  { label: "Hair Care", icon: "fa-scissors", category: "Hair Care" },
  { label: "Oral Care", icon: "fa-tooth", category: "Oral Care" },
];

function needTileTopic(tile) {
  return tile.category || tile.concern;
}
function needTileLiveCount(tile) {
  if (tile.category) return liveProductCount(tile.category);
  return PRODUCTS.filter((p) => typeof p.price === "number" && (p.concerns || []).includes(tile.concern)).length;
}
function needTileHref(tile) {
  return tile.category
    ? `#/products?cat=${encodeURIComponent(tile.category)}`
    : `#/products?concern=${encodeURIComponent(tile.concern)}`;
}

function renderNeedTiles() {
  const grid = document.getElementById("needTilesGrid");
  if (!grid) return;
  grid.innerHTML = NEED_TILES.map((tile) => {
    const count = needTileLiveCount(tile);
    return `<a class="category-tile" href="${needTileHref(tile)}">
        <span class="category-tile-icon" aria-hidden="true"><i class="fa-solid ${tile.icon}"></i></span>
        <span>${tile.label}</span>
        <span class="category-status${count === 0 ? " category-status-empty" : ""}">${count > 0 ? count + " available" : "Coming Soon"}</span>
      </a>`;
  }).join("");
}

// Categories are never hidden, even at 0 live products — status is labeled honestly.
function liveProductCount(category) {
  return PRODUCTS.filter((p) => p.category === category && typeof p.price === "number").length;
}

function notifyMeLink(topic) {
  const slug = topic.toLowerCase().replace(/\s+/g, "-");
  return `https://m.me/hayatiq.life?ref=notify-${slug}`;
}

function renderCategoryAvailability() {
  document.querySelectorAll(".category-status[data-cat]").forEach((el) => {
    const count = liveProductCount(el.dataset.cat);
    el.textContent = count > 0 ? `${count} available` : "Coming Soon";
    el.classList.toggle("category-status-empty", count === 0);
  });
  document.querySelectorAll(".category-notify[data-cat]").forEach((el) => {
    const cat = el.dataset.cat;
    const empty = liveProductCount(cat) === 0;
    el.hidden = !empty;
    el.innerHTML = empty
      ? `<a href="${notifyMeLink(cat)}" target="_blank" rel="noopener">New ${cat} products launching soon — notify me →</a>`
      : "";
  });
}

function renderProducts(category, concern, searchQuery = "") {
  let items = PRODUCTS;
  if (category) items = items.filter((p) => p.category === category);
  if (concern) items = items.filter((p) => (p.concerns || []).includes(concern));
  if (searchQuery) {
    const query = searchQuery.toLowerCase().trim();
    items = items.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(query)) ||
      (p.short && p.short.toLowerCase().includes(query))
    );
  }
  productsGrid.innerHTML = items.map(productCard).join("");
  productCount.textContent = `${items.length} item${
    items.length !== 1 ? "s" : ""
  }`;

  const banner = document.getElementById("categoryNotifyBanner");
  if (banner) {
    const topic = category || concern;
    const empty = topic && !items.some((p) => typeof p.price === "number");
    banner.hidden = !empty;
    banner.innerHTML = empty
      ? `<strong>${topic} is launching soon.</strong><p class="muted" style="margin:.3rem 0 0;">New products are on the way — <a href="${notifyMeLink(topic)}" target="_blank" rel="noopener">message us on Messenger</a> to be notified the moment they're live.</p>`
      : "";
  }
}

function setupProductFilters() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  if (!searchInput || !categoryFilter) return;

  const updateFilters = () => {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const category = params.get("cat");
    const concern = params.get("concern");
    const searchQuery = searchInput.value;

    categoryFilter.value = category || "";
    renderProducts(category, concern, searchQuery);
  };

  const onSearchInput = () => {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const category = params.get("cat");
    const concern = params.get("concern");
    const searchQuery = searchInput.value;
    renderProducts(category, concern, searchQuery);
  };

  searchInput.addEventListener("input", onSearchInput);
  categoryFilter.addEventListener("change", () => {
    searchInput.value = "";
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
      window.location.hash = `#/products?cat=${encodeURIComponent(selectedCategory)}`;
    } else {
      window.location.hash = "#/products";
    }
  });

  updateFilters();
}

function accordionItem(title, arr, { open = false } = {}) {
  // No shared `name` grouping on purpose — each section opens/closes independently
  // instead of auto-closing others, so opening one can't jump the page layout.
  return `<details class="accordion-item" ${open ? "open" : ""}>
      <summary>${title}</summary>
      <div class="accordion-panel"><ul>${arr.map((i) => `<li>${i}</li>`).join("")}</ul></div>
    </details>`;
}

/* ==============================
       Static per-product reviews
       ============================== */
function averageRating(list) {
  if (!list.length) return 0;
  return list.reduce((n, r) => n + Number(r.rating || 0), 0) / list.length;
}
function stars(n) {
  // Rounds to the nearest half star so a 4.5 rating renders distinctly from a 5.
  const rounded = Math.round(n * 2) / 2;
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (rounded >= i) html += '<i class="fa-solid fa-star"></i>';
    else if (rounded >= i - 0.5) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    else html += '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

function renderDetail(id) {
  const p = PRODUCTS.find((x) => x.id === id) || PRODUCTS[0];
  const isComingSoon = typeof p.price === 'string' && p.price.toLowerCase().includes('coming soon');
  const reviews = p.reviews || [];
  const avg = averageRating(reviews);

  setPageMeta(`${p.name} — Hayatiq`, p.short || `${p.name} — handcrafted natural wellness from Hayatiq.`);
  const jsonLdScript = document.getElementById("productJsonLd");
  if (jsonLdScript) {
    jsonLdScript.textContent = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      name: p.name,
      image: p.images,
      description: p.short,
      sku: p.id,
      offers: {
        "@type": "Offer",
        priceCurrency: "BDT",
        ...(typeof p.price === "number" ? { price: p.price } : {}),
        availability: isComingSoon ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
      },
      ...(reviews.length
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: avg.toFixed(1),
              reviewCount: reviews.length,
            },
          }
        : {}),
    });
  }

  if (isComingSoon) {
    const [main] = p.images || ["./images/placeholder.webp"];
    detailWrap.innerHTML = `
      <div class="coming-soon-container">
        ${main ? `<img src="${main}" alt="${p.name}" class="coming-soon-image" loading="lazy">` : ''}
        <h2>${p.name}</h2>
        <div style="font-size:1.2rem; color:var(--color-earth); margin:1rem 0; font-weight:600;">Coming Soon</div>
        <p class="muted">This product will be available shortly. Check back soon!</p>
        <a class="btn button-primary" href="#/products" style="margin-top:1.5rem;">Back to Products</a>
      </div>
    `;
    return;
  }
  
  const [main] = p.images;
  detailWrap.innerHTML = `
        <div class="gallery">
          <div class="gallery-main"><img id="mainImg" src="${main}" fetchpriority="high" alt="${
    p.name
  }" onclick="openImageLightbox(this.src)"></div>
          <div class="thumbs" id="thumbs">
            ${p.images
              .map(
                (src, i) =>
                  `<img loading="lazy" src="${src}" alt="${p.name} ${i + 1}" class="${
                    i === 0 ? "active" : ""
                  }" data-src="${src}">`
              )
              .join("")}
          </div>
        </div>
        <div style="display:grid; gap:.8rem;">
          <div>
            <h2 style="margin-bottom:.2rem;">${p.name}</h2>
            <span class="product-subtitle-detail">${p.subtitle}</span>
            <div class="product-price" style="font-size:1.1rem;">${money(
              p.price
            )}</div>
            <p class="muted">${p.short}</p>
            ${
              reviews.length
                ? `<div class="muted" aria-label="Average rating"><span class="stars" title="Average: ${avg.toFixed(
                    1
                  )}">${stars(avg)}</span> <small>(${reviews.length} review${
                    reviews.length !== 1 ? "s" : ""
                  })</small></div>`
                : ""
            }
          </div>
          <div style="display:flex; gap:.6rem; flex-wrap:wrap; align-items:center;">
            <button class="btn button-primary" onclick="event.preventDefault(); addToCart('${p.id}');">Add to Cart</button>
            <a class="btn button-ghost" href="https://m.me/hayatiq.life?ref=${p.slug}" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-messenger"></i> Ask a Question</a>
            <button class="wishlist-toggle wishlist-toggle-inline ${isWishlisted(p.id) ? 'active' : ''}" data-id="${p.id}" aria-label="Add to wishlist" onclick="event.preventDefault(); toggleWishlist('${p.id}');"><i class="fa-solid fa-heart"></i></button>
          </div>
          <div class="usp-strip">
            <div class="usp-badge"><span aria-hidden="true">🌿</span> Natural</div>
            <div class="usp-badge"><span aria-hidden="true">✋</span> Handmade</div>
            <div class="usp-badge"><span aria-hidden="true">✅</span> Quality Checked</div>
            <div class="usp-badge"><span aria-hidden="true">💵</span> Cash on Delivery</div>
          </div>
          <p class="hero-trust-line">100% Cash on Delivery — inspect your order before you pay.</p>
          <p class="muted" style="font-size:.85rem;">🚚 Delivery: Inside Dhaka ৳${
            SHIPPING_RATES.inside_dhaka
          } · Outside Dhaka ৳${SHIPPING_RATES.outside_dhaka}</p>

          <div class="accordion-group">
            ${p.how && p.how.length ? `<details class="accordion-item" open>
              <summary>How to Use</summary>
              <div class="accordion-panel">${renderHowToUseTags(p.how)}</div>
            </details>` : ''}
            ${p.ingredients && p.ingredients.length ? accordionItem("Ingredients", p.ingredients) : ''}
            ${p.warns && p.warns.length ? accordionItem("Cautions", p.warns) : ''}
            ${p.tips && p.tips.length ? accordionItem("For Optimal Benefits", p.tips) : ''}
            ${p.storage && p.storage.length ? accordionItem("Storage", p.storage) : ''}
          </div>

          <div class="soft-card">
            <h3 style="margin-bottom:.4rem;">Customer Reviews</h3>
            <div class="reviews">${
              reviews.length
                ? reviews
                    .map(
                      (r) =>
                        `<div class="review-item">
                          <div class="review-item-head"><strong>${r.name}</strong><span class="stars">${stars(r.rating)}</span></div>
                          ${r.image ? `<img loading="lazy" src="${r.image}" alt="Photo shared by ${r.name}" class="review-item-img" onclick="openImageLightbox('${r.image}')">` : ''}
                          <p class="muted">${r.text}</p>
                          ${r.source ? `<span class="review-source">via ${r.source}</span>` : ''}
                        </div>`
                    )
                    .join("")
                : '<p class="muted">No reviews yet.</p>'
            }</div>
          </div>
        </div>
      `;
  // thumbs interactivity
  const thumbs = document.getElementById("thumbs");
  const mainImg = document.getElementById("mainImg");
  thumbs.querySelectorAll("img").forEach((img) => {
    img.addEventListener("click", () => {
      thumbs
        .querySelectorAll("img")
        .forEach((t) => t.classList.remove("active"));
      img.classList.add("active");
      mainImg.src = img.dataset.src;
    });
  });
  // How to use tabs functionality
  document.querySelectorAll('.how-to-use-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      
      // Update active tab
      document.querySelectorAll('.how-to-use-tab').forEach(t => {
        t.classList.remove('active');
      });
      tab.classList.add('active');
      
      // Show only the clicked panel
      document.querySelectorAll('.how-to-use-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      document.getElementById(target).classList.add('active');
    });
  });
}

// Shared with the checkout shipping calculation and the product detail page's
// delivery-transparency note, so both always agree.
const SHIPPING_RATES = { inside_dhaka: 80, outside_dhaka: 130 };

/* ==============================
       Local Cart (localStorage)
       ============================== */
const CART_KEY = "hayatiq_cart";
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function setCart(list) {
  localStorage.setItem(CART_KEY, JSON.stringify(list));
  updateCartCount();
  updateFloatingCartButton();
  renderCart();
  renderCartDrawer();
  renderCheckoutItems();
  updateCheckoutTotals();
}
function addToCart(id, redirect = null, showToast = true) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item){
    if (item.qty >= 99) {
      toast("Maximum quantity reached");
      return;
    }
    item.qty += 1;
  }
  else cart.push({ id, qty: 1 });
  setCart(cart);
  if (redirect) {
    // No drawer on this path — the toast is the only add-to-cart confirmation shown.
    showToast && toast(`${PRODUCTS.find((x) => x.id === id)?.name || "Item"} added to cart`);
    setTimeout(() => {
      window.location.href = redirect;
    }, 1500);
  }
  // The drawer only opens when the user explicitly taps the floating cart button or a
  // header cart icon — not automatically on every add.
}
function removeFromCart(id) {
  setCart(getCart().filter((i) => i.id !== id));
}
function clearCart() {
  setCart([]);
}
function updateCartCount() {
  const count = getCart().reduce((n, i) => n + i.qty, 0);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "inline-flex" : "none";
  });
}

/* ==============================
       Wishlist (localStorage)
       ============================== */
const WISHLIST_KEY = "hayatiq_wishlist";
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function isWishlisted(id) {
  return getWishlist().includes(id);
}
function setWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  updateWishlistCount();
  // Sync every rendered heart button for this id (a product can appear in more than
  // one grid at once) instead of re-rendering every grid, which would also blow away
  // detail-page gallery state.
  document.querySelectorAll(".wishlist-toggle").forEach((btn) => {
    btn.classList.toggle("active", isWishlisted(btn.dataset.id));
  });
  renderWishlist();
}
function toggleWishlist(id) {
  const list = getWishlist();
  const i = list.indexOf(id);
  const added = i < 0;
  added ? list.push(id) : list.splice(i, 1);
  setWishlist(list);
  toast(added ? "Added to wishlist" : "Removed from wishlist");
}
function updateWishlistCount() {
  const count = getWishlist().length;
  document.querySelectorAll(".wishlist-count").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "inline-flex" : "none";
  });
}
function renderWishlist() {
  const grid = document.getElementById("wishlistGrid");
  if (!grid) return;
  const ids = getWishlist();
  const items = PRODUCTS.filter((p) => ids.includes(p.id));
  grid.innerHTML = items.length
    ? items.map(productCard).join("")
    : '<p class="muted">Your wishlist is empty. Tap the heart on any product to save it here.</p>';
}

/* ==============================
       Floating mobile cart button
       ============================== */
function updateFloatingCartButton() {
  const btn = document.getElementById("floatingCartBtn");
  const countEl = document.getElementById("floatingCartCount");
  const totalEl = document.getElementById("floatingCartTotal");
  if (!btn || !countEl || !totalEl) return;

  const cart = getCart();
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const total = cart.reduce((sum, row) => {
    const p = PRODUCTS.find((x) => x.id === row.id);
    return p ? sum + p.price * row.qty : sum;
  }, 0);
  countEl.textContent = count;
  totalEl.textContent = money(total);

  const hash = location.hash || "#/";
  const onCartOrCheckout = hash.startsWith("#/cart") || hash.startsWith("#/checkout");
  btn.classList.toggle("hidden", onCartOrCheckout);
}

function updateQty(id, qty) {
  qty = Math.max(1, Math.min(99, Number(qty) || 1));
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = qty;
  setCart(cart);
}
function incQty(id) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.min(99, (item.qty || 1) + 1);
  setCart(cart);
}
function decQty(id) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) - 1);
  setCart(cart);
}

function qtyControlsHTML(id, qty) {
  return `<div class="qty" aria-label="Quantity controls">
      <button onclick="decQty('${id}')" aria-label="Decrease quantity">−</button>
      <input type="number" min="1" max="99" value="${qty}" onchange="updateQty('${id}', this.value)" />
      <button onclick="incQty('${id}')" aria-label="Increase quantity">+</button>
    </div>`;
}

function cartRowHTML(row, p) {
  return `<div style="display:grid; grid-template-columns: 64px 1fr auto; gap:.6rem; align-items:center; padding:.5rem 0; border-bottom:1px solid rgba(16,15,15,.06);">
      <img loading="lazy" src="${p.images[0]}" alt="${
    p.name
  }" style="width:64px; height:64px; object-fit:cover; border-radius:10px;">
      <div>
        <div style="font-weight:600;">${p.name} <span class="deep-muted"> (${p.subtitle}) </span></div>
        ${qtyControlsHTML(row.id, row.qty)}
      </div>
      <div style="display:flex; align-items:center; gap:.4rem;">
        <strong>${money(p.price * row.qty)}</strong>
        <button class="close-btn" title="Remove" onclick="removeFromCart('${
          row.id
        }')">✕</button>
      </div>
    </div>`;
}

function renderCart() {
  const holder = document.getElementById("cartItems");
  const list = getCart();
  if (list.length === 0) {
    holder.innerHTML = '<p class="muted">Your cart is empty.</p>';
    document.getElementById("cartTotal").textContent = "৳0.00";
    return;
  }
  holder.innerHTML = list
    .map((row) => cartRowHTML(row, PRODUCTS.find((x) => x.id === row.id)))
    .join("");
  const total = list.reduce((sum, row) => {
    const p = PRODUCTS.find((x) => x.id === row.id);
    return sum + p.price * row.qty;
  }, 0);
  document.getElementById("cartTotal").textContent = money(total);
}

/* ==============================
       Slide-in cart drawer
       ============================== */
function renderCartDrawer() {
  const holder = document.getElementById("drawerCartItems");
  const totalEl = document.getElementById("drawerCartTotal");
  if (!holder || !totalEl) return;

  const list = getCart();
  if (list.length === 0) {
    holder.innerHTML = '<p class="muted">Your cart is empty.</p>';
    totalEl.textContent = "৳0.00";
    return;
  }
  holder.innerHTML = list
    .map((row) => cartRowHTML(row, PRODUCTS.find((x) => x.id === row.id)))
    .join("");
  const total = list.reduce((sum, row) => {
    const p = PRODUCTS.find((x) => x.id === row.id);
    return sum + p.price * row.qty;
  }, 0);
  totalEl.textContent = money(total);
}

function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartDrawerOverlay");
  if (!drawer || !overlay) return;
  renderCartDrawer();
  primaryNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  drawer.classList.add("open");
  overlay.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  const closeBtn = drawer.querySelector(".cart-drawer-header .close-btn");
  closeBtn && closeBtn.focus();
}

function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartDrawerOverlay");
  if (!drawer || !overlay) return;
  drawer.classList.remove("open");
  overlay.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCartDrawer();
    closeImageLightbox();
  }
});

/* ==============================
       Review/testimonial image lightbox
       ============================== */
// Any review or testimonial photo (a customer's own image, or a screenshot) opens
// full-size in this shared modal instead of just sitting inline at its small card
// size — clicking the backdrop, the image itself, the close button, or pressing
// Escape all close it.
function openImageLightbox(src) {
  const modal = document.getElementById("imageLightbox");
  const img = document.getElementById("imageLightboxImg");
  if (!modal || !img) return;
  img.src = src;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}
function closeImageLightbox() {
  const modal = document.getElementById("imageLightbox");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}
  function renderHowToUseTags(howToUseItems) {
    if (!howToUseItems || howToUseItems.length === 0) return '';
    
    return `
      <div class="how-to-use-container">
        <div class="how-to-use-tabs">
          ${howToUseItems.map((item, index) => {
            const [tabName] = item.split(':');
            return `<button class="how-to-use-tab ${index === 0 ? 'active' : ''}" data-target="panel-${index}">${tabName}</button>`;
          }).join('')}
        </div>
        <div class="how-to-use-content">
        <div class="how-to-use-point" style="margin-bottom:-4px;">Shake well before Use</div>
          ${howToUseItems.map((item, index) => {
            const [tabName, ...contentParts] = item.split(':');
            const content = contentParts.join(':');
            const points = content.split(';').filter(point => point.trim());
            
            return `<div class="how-to-use-panel ${index === 0 ? 'active' : ''}" id="panel-${index}">
              ${points.map(point => `<div class="how-to-use-point">${point.trim()}</div>`).join('')}
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Checkout functions
  function renderCheckoutItems() {
  const cart = getCart();
  const container = document.getElementById('checkoutItems');
  
  if (cart.length === 0) {
    container.innerHTML = '<p class="muted">Your cart is empty.</p>';
    
    return;
  }
  
  container.innerHTML = cart.map(row => {
    const p = PRODUCTS.find(x => x.id === row.id);

    return `
      <div class="checkout-item">
        <img loading="lazy" src="${p.images[0]}" alt="${p.name}" class="checkout-item-img">
        <div class="checkout-item-details">
          <div class="checkout-item-name">${p.name} <span class="deep-muted"> (${p.subtitle}) </span></div>
          ${qtyControlsHTML(row.id, row.qty)}
        </div>
        <div class="checkout-item-price">
          <strong>${money(p.price * row.qty)}</strong>
          <button class="close-btn" title="Remove" onclick="removeFromCart('${row.id}')">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

function updateCartItemsData() {
  const cart = getCart();
  const cartItemsWithNames = cart.map(row => {
    const p = PRODUCTS.find(x => x.id === row.id);
    return {
      name: p.name + ' (' + p.subtitle + ')',
      qty: row.qty,
      unit_price: p.price
    };
  });
  
  document.getElementById('cartItemsData').value = JSON.stringify(cartItemsWithNames);
}

function updateCheckoutTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, row) => {
    const p = PRODUCTS.find(x => x.id === row.id);
    return sum + p.price * row.qty;
  }, 0);
  
  const shippingMethod = document.querySelector('input[name="shipping_method"]:checked').value;
  const shippingCost = SHIPPING_RATES[shippingMethod];
  const total = subtotal + shippingCost;
  
  document.getElementById('checkoutSubtotal').textContent = `৳${subtotal.toFixed(2)}`;
  document.getElementById('checkoutShipping').textContent = `৳${shippingCost.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `৳${total.toFixed(2)}`;
  
  // Update hidden fields for form submission
  updateCartItemsData(); // Add this line
  document.getElementById('subtotalData').value = subtotal;
  document.getElementById('shippingData').value = shippingCost;
  document.getElementById('totalData').value = total;
}

function updateShipping() {
  updateCheckoutTotals();
}

// Character counter for order note
document.addEventListener('input', function(e) {
  if (e.target.id === 'orderNote') {
    const chars = e.target.value.length;
    document.getElementById('noteChars').textContent = `${chars}/200`;
  }
});

// Initialize checkout when view is shown
function initCheckout() {
  updateCheckoutTotals();
  renderCheckoutItems();
  updateCartItemsData();
  loadFormData();

  // Auto-save when user types
  document.getElementById('checkoutName').addEventListener('input', saveFormData);
  document.getElementById('checkoutPhone').addEventListener('input', saveFormData);
  document.getElementById('checkoutAddress').addEventListener('input', saveFormData);
}

document.addEventListener('input', function(e) {
  if (e.target.id === 'orderNote') {
    const chars = e.target.value.length;
    const counter = document.getElementById('noteChars');
    counter.textContent = `${chars}/200`;

    counter.classList.remove('warning', 'danger');
    if (chars > 150 && chars <= 190) {
      counter.classList.add('warning');
    } else if (chars > 190) {
      counter.classList.add('danger');
    }
  }
});

const USER_FORM_DATA = "user_form_data";

function saveFormData() {
  const formData = {
    name: document.getElementById('checkoutName').value,
    phone: document.getElementById('checkoutPhone').value,
    address: document.getElementById('checkoutAddress').value
  };
  localStorage.setItem(USER_FORM_DATA, JSON.stringify(formData));
}

function loadFormData() {
  const savedData = localStorage.getItem(USER_FORM_DATA);
  if (savedData) {
    const formData = JSON.parse(savedData);
    document.getElementById('checkoutName').value = formData.name || '';
    document.getElementById('checkoutPhone').value = formData.phone || '';
    document.getElementById('checkoutAddress').value = formData.address || '';
  }
}

function clearFormData() {
  localStorage.removeItem(USER_FORM_DATA);
}


/* ==============================
       Toast
       ============================== */

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function toast(msg, type = 'info') {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: type,
  });
  
  Toast.fire({
    title: msg,
  });
}

function toastBox(msg, type = 'success') {
    Swal.fire({
    title: msg,
    icon: type,
    confirmButtonText: 'OK',
    confirmButtonColor: cssVar('--color-earth'),
    background: cssVar('--color-almond'),
    color: cssVar('--color-night'),
    customClass: {
      confirmButton: 'swal-confirm-btn',
      title: 'swal-title'
    }
  });
}


/* ==============================
       Init
       ============================== */
document.getElementById("year").textContent = new Date().getFullYear();
updateCartCount();
updateWishlistCount();
renderFeatured();
renderCategoryAvailability();
renderNeedTiles();
navigate();
