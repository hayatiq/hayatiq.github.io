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
       Minimal SPA Router (History API / real paths)
       ============================== */
// Real, crawlable per-page URLs (e.g. /product/conditioner-bar) instead of hash
// fragments — see _redirects for the Netlify rule that makes deep links to these
// paths resolve (Netlify has no server-side routing, so every path has to fall
// back to index.html and let this router take over client-side).
const SITE_URL = "https://hayatiq.netlify.app";

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
  notfound: document.getElementById("view-notfound"),
};

function setActiveNav(path) {
  document.querySelectorAll(".nav-links a[data-link]").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === path);
  });
  // Close mobile menu after navigation
  primaryNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

// Site-wide defaults, read once from index.html, so a product page's keywords/image
// don't linger once you navigate away from it.
const SITE_KEYWORDS = document.querySelector('meta[name="keywords"]')?.getAttribute("content") || "";
// Open Graph/Twitter images need an absolute URL (relative ones aren't reliably
// resolved by social crawlers) — index.html's tag ships a "./"-relative path since
// it's also read by the browser itself (which resolves it fine via <base href="/">).
const SITE_IMAGE_RAW = document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
const SITE_IMAGE = SITE_IMAGE_RAW ? `${SITE_URL}${SITE_IMAGE_RAW.replace(/^\./, "")}` : "";
const SITE_ROBOTS = document.querySelector('meta[name="robots"]')?.getAttribute("content") || "index, follow";

// SEO: keep <title>, meta description/keywords, canonical, and Open Graph/Twitter
// tags current for each route — now that every route has its own real URL, each
// needs its own canonical link (otherwise every page would tell crawlers to treat
// it as a duplicate of whichever page set it last).
function setPageMeta(title, description, opts = {}) {
  document.title = title;
  const { path = location.pathname, keywords = SITE_KEYWORDS, image = SITE_IMAGE, noindex = false } = opts;
  const url = `${SITE_URL}${path}`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", description);

  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) metaKeywords.setAttribute("content", keywords);

  const metaRobots = document.querySelector('meta[name="robots"]');
  if (metaRobots) metaRobots.setAttribute("content", noindex ? "noindex, nofollow" : SITE_ROBOTS);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", url);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", description);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute("content", url);
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.setAttribute("content", image);

  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute("content", title);
  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute("content", description);
}

function resetProductJsonLd() {
  const script = document.getElementById("productJsonLd");
  if (script) script.textContent = "{}";
}

// Shown for any path that isn't a known route or resolves to no real product (e.g. a
// stale/mistyped Messenger ref link or product URL) — keeps a wrong URL from either
// silently rendering the wrong product or looking identical to the homepage. `noindex`
// keeps it out of search results even though the server still returns 200 for it (see
// _redirects — Netlify has no server-side routing to return a real 404 status from).
function renderNotFound(path) {
  routes.notfound.classList.add("active");
  setPageMeta(
    "Page Not Found — Hayatiq",
    "The page you're looking for doesn't exist or may have moved.",
    { path, noindex: true }
  );
  resetProductJsonLd();
}

function navigate() {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const search = location.search;
  Object.values(routes).forEach((v) => v.classList.remove("active"));

  if (path.startsWith("/product/")) {
        const slugOrId = decodeURIComponent(path.slice("/product/".length));
        const product = PRODUCTS.find((p) => p.slug === slugOrId) || PRODUCTS.find((p) => p.id === slugOrId);
        if (!product) {
          renderNotFound(path);
        } else {
          routes.detail.classList.add("active");
          trackProductView(product.id, product.name);
          renderDetail(product.id);
        }
  } else if (path.startsWith("/products")) {
    routes.products.classList.add("active");
    const params = new URLSearchParams(search);
    const cat = params.get("cat");
    const concern = params.get("concern");
    renderProducts(cat, concern);
    setupProductFilters();
    const topic = concern || cat;
    setPageMeta(
      `${topic ? topic + " " : ""}Products — Hayatiq`,
      `Shop ${topic ? topic.toLowerCase() + " " : ""}products from Hayatiq — handcrafted natural wellness essentials.`,
      { path: "/products" + search }
    );
    resetProductJsonLd();
  } else if (path === "/categories") {
    routes.categories.classList.add("active");
    setPageMeta("Shop by Category — Hayatiq", "Browse Hayatiq's Hair Care, Magnesium Oil Spray, Salves & Balms, Bath Bombs, Footsoaks, Oral Care, and Cleaning Supply product categories.", { path: "/categories" });
    resetProductJsonLd();
  } else if (path === "/contact") {
    routes.contact.classList.add("active");
    setPageMeta("Contact Us — Hayatiq", "Get in touch with Hayatiq for questions about our handcrafted natural wellness products.", { path: "/contact" });
    resetProductJsonLd();
  } else if (path === "/about") {
    routes.about.classList.add("active");
    setPageMeta("Our Story — Hayatiq", "Learn about Hayatiq's story — handmade natural wellness products crafted with intention.", { path: "/about" });
    resetProductJsonLd();
  } else if (path === "/cart") {
    routes.cart.classList.add("active");
    renderCart();
    setPageMeta("Your Cart — Hayatiq", "Review the items in your Hayatiq shopping cart.", { path: "/cart" });
    resetProductJsonLd();
  } else if (path === "/checkout") {
    routes.checkout.classList.add("active");
    initCheckout();
    setPageMeta("Checkout — Hayatiq", "Complete your Hayatiq order — cash on delivery available across Bangladesh.", { path: "/checkout" });
    resetProductJsonLd();
  } else if (path === "/wishlist") {
    routes.wishlist.classList.add("active");
    renderWishlist();
    setPageMeta("Your Wishlist — Hayatiq", "Products you've saved from Hayatiq's natural wellness collection.", { path: "/wishlist" });
    resetProductJsonLd();
  } else if (path === "/") {
    routes.home.classList.add("active");
    renderTopProducts();
    renderFeatured();
    renderTestimonials();
    setPageMeta(
      "Hayatiq — Handcrafted with Intention",
      "Hayatiq - Handcrafted natural wellness products. Magnesium oil spray, hair care, salves & balms, bath bombs, footsoaks, oral care, and non-toxic cleaning supplies made with intention in Bangladesh.",
      { path: "/" }
    );
    resetProductJsonLd();
  } else {
    renderNotFound(path);
  }
  setActiveNav(path);
  updateFloatingCartButton();
  // Start each route at the top instead of wherever the previous view left off scrolled.
  window.scrollTo(0, 0);
  // Move focus for accessibility (preventScroll so it doesn't fight the scrollTo above)
  document.getElementById("app").focus({ preventScroll: true });
  // Lets visitor.js (and anything else) react to a route change without caring
  // whether it came from a link click, browser back/forward, or the initial load.
  window.dispatchEvent(new CustomEvent("route-changed"));
}

// A real path means a plain <a href="/products"> click would trigger a full page
// reload by default — intercept same-origin path clicks and drive them through
// the router instead. Hash-only anchors (e.g. the carousel's "#topProductsGrid"
// scroll target) and external/new-tab/download links are left to the browser.
document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest("a");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href || !href.startsWith("/") || a.target === "_blank" || a.hasAttribute("download")) return;
  e.preventDefault();
  goTo(href);
});

function goTo(path) {
  if (location.pathname + location.search !== path) history.pushState(null, "", path);
  navigate();
}

window.addEventListener("popstate", navigate);

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

function productVariants(p) {
  return Array.isArray(p.variants) && p.variants.length ? p.variants : [p];
}

function selectedVariant(p, variantId) {
  const variants = productVariants(p);
  return variants.find((v) => v.id === variantId) || variants.find((v) => v.default === true) || variants[0];
}

function variantIdFor(p, variantId) {
  if (p.attributes) return variantId || null;
  return p.variants ? selectedVariant(p, variantId).id : null;
}

function productDisplay(p, variantId) {
  const variant = selectedVariant(p, variantId);
  return { ...p, ...variant, name: p.name };
}

function isLiveProduct(p) {
  return productVariants(p).some((v) => typeof v.price === "number");
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
  const variant = selectedVariant(p);
  const display = productDisplay(p, variant.id);
  const selectedId = variantIdFor(p, variant.id);
  const isComingSoon = typeof display.price === 'string' && display.price.toLowerCase().includes('coming soon');
  // An explicit `badge` field always wins; otherwise a topSelling product is auto-badged.
  const badgeKey = p.badge || (p.topSelling ? "bestseller" : null);
  const badge = !isComingSoon && badgeKey && BADGE_TYPES[badgeKey];
  // opts.carousel adds a sizing class for horizontal scroll-snap carousels (e.g. Top
  // Selling Products) — the card markup/behavior is identical either way.
  const cardClass = opts.carousel ? "product-card product-card-carousel" : "product-card";

  return `
      <article class="${cardClass}" aria-label="${p.name}">
        <a href="/product/${p.slug}">
          <div class="product-media">
            <img loading="lazy" src="${display.images[0]}" alt="${p.name}">
            ${isComingSoon ? `<div class="coming-soon-overlay">
              <span>Coming Soon</span>
              <button class="coming-soon-ask" onclick="event.preventDefault(); event.stopPropagation(); window.open('https://m.me/hayatiq.life?ref=${p.slug}', '_blank');"><i class="fa-brands fa-facebook-messenger" aria-hidden="true"></i> Ask about this</button>
            </div>` : ''}
            ${badge ? `<span class="product-badge badge-${badgeKey}"><i class="fa-solid ${badge.icon}" aria-hidden="true"></i> ${badge.label}</span>` : ''}
             ${!isComingSoon ? `<button class="wishlist-toggle ${isWishlisted(p.id) ? 'active' : ''}" data-id="${p.id}" aria-label="Add to wishlist" onclick="event.preventDefault(); event.stopPropagation(); toggleWishlist('${p.id}');"><i class="fa-solid fa-heart"></i></button>` : ''}
          </div>
          <div class="product-body">
            <div class="product-name">${p.name}</div>
             ${p.attributes ? `<div class="product-subtitle">${p.subtitle}</div>` : (p.variants ? `<div class="product-subtitle">${p.variants.length} variants · ${display.label || display.subtitle}</div>` : (p.subtitle ? `<div class="product-subtitle">${p.subtitle}</div>` : ''))}
            <div class="product-footer">
               <div class="product-price">${money(display.price)}</div>
               ${!isComingSoon ? `<button class="btn-icon-add" aria-label="${p.attributes ? 'Choose options for' : 'Add'} ${p.name} to cart" onclick="event.preventDefault(); event.stopPropagation(); ${p.attributes ? `goTo('/product/${p.slug}');` : `addToCart('${p.id}', '${selectedId || ''}'); animateCartToCart(this);`}"><i class="fa-solid ${p.attributes ? 'fa-sliders' : 'fa-cart-plus'}"></i></button>` : ''}
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
  return PRODUCTS.filter((p) => isLiveProduct(p) && (p.concerns || []).includes(tile.concern)).length;
}
function needTileHref(tile) {
  return tile.category
    ? `/products?cat=${encodeURIComponent(tile.category)}`
    : `/products?concern=${encodeURIComponent(tile.concern)}`;
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
  return PRODUCTS.filter((p) => p.category === category && isLiveProduct(p)).length;
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

function renderProducts(category, concern) {
  let items = PRODUCTS;
  if (category) items = items.filter((p) => p.category === category);
  if (concern) items = items.filter((p) => (p.concerns || []).includes(concern));
  productsGrid.innerHTML = items.map(productCard).join("");
  productCount.textContent = `${items.length} item${
    items.length !== 1 ? "s" : ""
  }`;

  const banner = document.getElementById("categoryNotifyBanner");
  if (banner) {
    const topic = category || concern;
    const empty = topic && !items.some(isLiveProduct);
    banner.hidden = !empty;
    banner.innerHTML = empty
      ? `<strong>${topic} is launching soon.</strong><p class="muted" style="margin:.3rem 0 0;">New products are on the way — <a href="${notifyMeLink(topic)}" target="_blank" rel="noopener">message us on Messenger</a> to be notified the moment they're live.</p>`
      : "";
  }
}

function setupProductFilters() {
  const categoryFilter = document.getElementById("categoryFilter");

  if (!categoryFilter) return;

  const updateFilters = () => {
    const params = new URLSearchParams(location.search);
    const category = params.get("cat");
    const concern = params.get("concern");
    categoryFilter.value = category || "";
    renderProducts(category, concern);
  };

  categoryFilter.addEventListener("change", () => {
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
      goTo(`/products?cat=${encodeURIComponent(selectedCategory)}`);
    } else {
      goTo("/products");
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

/* ==============================
       Generic Product Attributes & Price Matrix System
       ============================== */
let activeProductSelections = {};

function isAttributeVisible(attr, selections) {
  if (!attr || !attr.showIf) return true;
  return Object.entries(attr.showIf).every(([k, v]) => selections[k] === v);
}

function initProductAttributeSelections(p) {
  if (!p.attributes) return {};
  if (!activeProductSelections[p.id]) {
    const defaults = { ...(p.defaultSelections || {}) };
    p.attributes.forEach((attr) => {
      if (!defaults[attr.id]) {
        const firstChoice = attr.choices[0];
        defaults[attr.id] = typeof firstChoice === "object" ? firstChoice.label : firstChoice;
      }
    });
    activeProductSelections[p.id] = defaults;
  }
  return activeProductSelections[p.id];
}

function getProductPrice(p, selections) {
  if (!p.priceMatrix || !selections) return p.price;
  // Sort rules by specificity (more criteria matched first)
  const rules = Object.entries(p.priceMatrix).sort((a, b) => {
    const criteriaA = a[0].split("|").length;
    const criteriaB = b[0].split("|").length;
    return criteriaB - criteriaA;
  });
  for (const [rule, price] of rules) {
    const conditions = rule.split("|").map((c) => c.trim().split(":"));
    const isMatch = conditions.every(([attrId, val]) => {
      const attr = p.attributes ? p.attributes.find((a) => a.id === attrId) : null;
      if (attr && !isAttributeVisible(attr, selections)) return false;
      return selections[attrId] === val;
    });
    if (isMatch) return price;
  }
  return p.price;
}

function formatAttributeSelections(p, selections) {
  if (!p.attributes || !selections) return p.subtitle || "";
  const parts = [];
  p.attributes.forEach((attr) => {
    if (!isAttributeVisible(attr, selections)) return;
    const val = selections[attr.id];
    if (!val) return;
    if (attr.id === "styleType") return;
    if (attr.id === "colorLayer") {
      const colorVal = selections.color;
      parts.push(`Color: ${val}${colorVal ? ` (${colorVal})` : ""}`);
    } else if (attr.id === "color") {
      if (!selections.colorLayer) parts.push(`Color: ${val}`);
    } else if (attr.id === "botanical") {
      parts.push(`Botanical: ${val}`);
    } else {
      parts.push(val);
    }
  });
  if (!selections.size) {
    const weightMatch = (p.subtitle || "").match(/\d+(?:g|ml|kg)\+?/i);
    if (weightMatch) parts.push(weightMatch[0]);
  }
  return parts.join(" · ");
}

function attributeSelectionsKey(p, selections) {
  if (!selections) return "";
  const visible = p && p.attributes
    ? p.attributes.filter((attr) => isAttributeVisible(attr, selections)).map((attr) => [attr.id, selections[attr.id]])
    : Object.entries(selections);
  return visible
    .map(([k, v]) => `${k}-${v}`)
    .join("_")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function getVisibleAttributeSelections(p, selections) {
  if (!p || !p.attributes || !selections) return selections || {};
  const visible = {};
  p.attributes.forEach((attr) => {
    if (isAttributeVisible(attr, selections)) {
      visible[attr.id] = selections[attr.id];
    }
  });
  return visible;
}

function setProductAttributeSelection(productId, attrId, value) {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p || !p.attributes) return;
  const current = initProductAttributeSelections(p);
  current[attrId] = value;
  renderDetail(productId);
}

function addAttributeProductToCart(productId, sourceBtn) {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p || !p.attributes) return;
  const rawSelections = initProductAttributeSelections(p);
  const selections = getVisibleAttributeSelections(p, rawSelections);
  const key = attributeSelectionsKey(p, selections);
  addToCart(productId, key, null, true, selections);
  toast(`${p.name} (${formatAttributeSelections(p, selections)}) added to cart`);
  if (sourceBtn && typeof animateCartToCart === "function") {
    animateCartToCart(sourceBtn);
  }
}

function renderDetail(id, variantId = null) {
  const p = PRODUCTS.find((x) => x.id === id) || PRODUCTS[0];
  const isGenericCustom = Boolean(p.attributes);
  const variant = selectedVariant(p, variantId);
  const display = productDisplay(p, variant.id);
  const selectedId = variantIdFor(p, variant.id);
  const isComingSoon = typeof display.price === 'string' && display.price.toLowerCase().includes('coming soon');
  const reviews = p.reviews || [];
  const avg = averageRating(reviews);

  let currentSelections = null;
  let customAttributesHTML = "";
  let finalPrice = display.price;
  let finalSubtitle = display.subtitle;

  if (isGenericCustom) {
    currentSelections = initProductAttributeSelections(p);
    finalPrice = getProductPrice(p, currentSelections);
    finalSubtitle = formatAttributeSelections(p, currentSelections);

    customAttributesHTML = `
      <div class="custom-options-wrap" role="group" aria-label="Customize ${p.name}">
        ${p.attributes.filter((attr) => isAttributeVisible(attr, currentSelections)).map((attr) => {
          const selectedVal = currentSelections[attr.id];
          const isTab = attr.id === 'styleType';

          if (isTab) {
            return `
              <div class="custom-option-group">
                <div class="custom-option-label">${attr.label}: <span class="selected-value">${selectedVal}</span></div>
                <div class="style-type-tabs">
                  ${attr.choices.map((choice) => `
                    <button type="button" class="style-type-tab${choice === selectedVal ? ' active' : ''}" onclick="setProductAttributeSelection('${p.id}', '${attr.id}', '${choice}')">${choice}</button>
                  `).join('')}
                </div>
              </div>
            `;
          }

          return `
            <div class="custom-option-group">
              <div class="custom-option-label">${attr.label}: <span class="selected-value">${selectedVal}</span></div>
              <div class="custom-option-pills">
                ${attr.choices.map((choice) => {
                  const choiceLabel = typeof choice === 'object' ? choice.label : choice;
                  const isSelected = choiceLabel === selectedVal;
                  const previewSelections = { ...currentSelections, [attr.id]: choiceLabel };
                  const previewPrice = getProductPrice(p, previewSelections);
                  const priceBadge = previewPrice !== p.price ? `<span class="pill-price-badge">৳${previewPrice}</span>` : '';
                  return `
                    <button type="button" class="variant-badge${isSelected ? ' active' : ''}" onclick="setProductAttributeSelection('${p.id}', '${attr.id}', '${choiceLabel}')">${choiceLabel}${priceBadge}</button>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  setPageMeta(
    p.seoTitle || `${p.name} — Hayatiq`,
    p.short || `${p.name} — handcrafted natural wellness from Hayatiq.`,
    {
      path: `/product/${p.slug}`,
      keywords: p.metaKeywords,
      image: display.images[0] ? `${SITE_URL}${display.images[0].replace(/^\./, "")}` : undefined,
    }
  );
  const jsonLdScript = document.getElementById("productJsonLd");
  if (jsonLdScript) {
    jsonLdScript.textContent = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      name: p.name,
       image: display.images,
      description: p.short,
       sku: selectedId ? `${p.id}-${selectedId}` : p.id,
      offers: {
        "@type": "Offer",
        priceCurrency: "BDT",
        ...(typeof display.price === "number" ? { price: display.price } : {}),
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
    const [main] = display.images || ["./images/placeholder.webp"];
    detailWrap.innerHTML = `
      <div class="coming-soon-container">
        ${main ? `<img src="${main}" alt="${p.name}" class="coming-soon-image" loading="lazy">` : ''}
        <h2>${p.name}</h2>
        <div style="font-size:1.2rem; color:var(--color-earth); margin:1rem 0; font-weight:600;">Coming Soon</div>
        <p class="muted">This product will be available shortly. Check back soon!</p>
        <a class="btn button-primary" href="/products" style="margin-top:1.5rem;">Back to Products</a>
      </div>
    `;
    return;
  }
  
  let activeImageIndex = 0;
  const existingThumbs = document.querySelectorAll("#thumbs img");
  if (existingThumbs.length) {
    existingThumbs.forEach((t, i) => {
      if (t.classList.contains("active")) activeImageIndex = i;
    });
  }
  const main = display.images[activeImageIndex] || display.images[0];

  const openAccordions = Array.from(document.querySelectorAll("#detailWrap details[open] summary")).map((s) => s.textContent.trim());

  detailWrap.innerHTML = `
        <div class="gallery">
          <div class="gallery-main"><img id="mainImg" src="${main}" fetchpriority="high" alt="${
    p.name
  }" onclick="openImageLightbox(this.src)"></div>
          <div class="thumbs" id="thumbs">
             ${display.images
              .map(
                (src, i) =>
                  `<img loading="lazy" src="${src}" alt="${p.name} ${i + 1}" class="${
                    i === activeImageIndex ? "active" : ""
                  }" data-src="${src}">`
              )
              .join("")}
          </div>
        </div>
        <div style="display:grid; gap:.8rem;">
          <div>
            <h2 style="margin-bottom:.2rem;">${p.name}${p.variants && display.label ? ` ${display.label}` : ""}</h2>
            ${isGenericCustom ? `<span class="product-subtitle-detail">${finalSubtitle}</span>` : (p.variants ? `<div class="variant-picker" role="group" aria-label="Choose ${p.name} option">
                 <span>Choose an option</span>
                 <div class="variant-badges">
                   ${p.variants.map((v) => `<button type="button" class="variant-badge${v.id === selectedId ? " active" : ""}" aria-pressed="${v.id === selectedId}" onclick="chooseProductVariant('${p.id}', '${v.id}', '${v.label || v.subtitle}')">${v.label || v.subtitle}</button>`).join("")}
                 </div>
               </div>` : (p.subtitle ? `<span class="product-subtitle-detail">${p.subtitle}</span>` : ''))}
            ${p.variants && !isGenericCustom ? `<span class="product-subtitle-detail">${display.subtitle}</span>` : ""}
            ${customAttributesHTML}
            <div class="product-price" style="font-size:1.1rem;">${money(
               finalPrice
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
          <div class="detail-actions">
             ${isGenericCustom
               ? `<button class="btn button-primary" onclick="event.preventDefault(); addAttributeProductToCart('${p.id}', this);">Add to Cart</button>`
               : `<button class="btn button-primary" onclick="event.preventDefault(); addToCart('${p.id}', '${selectedId || ''}'); animateCartToCart(this);">Add to Cart</button>`
             }
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
              <div class="accordion-panel">${renderHowToUseTags(p.how, p.howToUseNote)}</div>
            </details>` : ''}
            ${p.ingredients && p.ingredients.length ? accordionItem("Ingredients", p.ingredients, { open: openAccordions.includes("Ingredients") }) : ''}
            ${p.warns && p.warns.length ? accordionItem("Cautions", p.warns, { open: openAccordions.includes("Cautions") }) : ''}
            ${p.tips && p.tips.length ? accordionItem("For Optimal Benefits", p.tips, { open: openAccordions.includes("For Optimal Benefits") }) : ''}
            ${p.storage && p.storage.length ? accordionItem("Storage", p.storage, { open: openAccordions.includes("Storage") }) : ''}
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

function chooseProductVariant(productId, variantId, variantLabel) {
  const product = PRODUCTS.find((x) => x.id === productId);
  if (typeof trackVariantSelection === "function" && product) {
    trackVariantSelection({ product: product.name, variant: variantLabel });
  }
  renderDetail(productId, variantId);
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
function cartProduct(row) {
  const p = PRODUCTS.find((x) => x.id === row.id);
  if (!p) return null;
  if (p.attributes) {
    const selections = row.selections || initProductAttributeSelections(p);
    const price = getProductPrice(p, selections);
    const subtitle = formatAttributeSelections(p, selections);
    return {
      p,
      variant: { id: row.variantId || attributeSelectionsKey(p, selections), label: subtitle },
      display: {
        ...p,
        price,
        subtitle,
        name: p.name,
        images: p.images,
      },
    };
  }
  const variant = selectedVariant(p, row.variantId);
  return { p, variant, display: productDisplay(p, variant.id) };
}

function cartRowVariantId(row, p) {
  if (p.attributes) return row.variantId || null;
  return p.variants ? (row.variantId || selectedVariant(p).id) : null;
}

function addToCart(id, variantId = null, redirect = null, showToast = true, selections = null) {
  const cart = getCart();
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  const resolvedVariantId = variantIdFor(p, variantId);
  const item = cart.find((i) => i.id === id && cartRowVariantId(i, p) === resolvedVariantId);
  if (item){
    if (item.qty >= 99) {
      toast("Maximum quantity reached");
      return;
    }
    item.qty += 1;
  }
  else cart.push({
    id,
    ...(resolvedVariantId ? { variantId: resolvedVariantId } : {}),
    ...(selections ? { selections } : {}),
    qty: 1
  });
  setCart(cart);
  if (redirect) {
    // No drawer on this path — the toast is the only add-to-cart confirmation shown.
    const label = p.attributes && selections
      ? ` (${formatAttributeSelections(p, selections)})`
      : resolvedVariantId && p.variants
      ? ` (${selectedVariant(p, resolvedVariantId).label || selectedVariant(p, resolvedVariantId).subtitle})`
      : "";
    showToast && toast(`${p.name}${label} added to cart`);
    setTimeout(() => {
      window.location.href = redirect;
    }, 1500);
  }
  // The drawer only opens when the user explicitly taps the floating cart button or a
  // header cart icon — not automatically on every add.
}
function animateCartToCart(source) {
  const floatingCart = document.getElementById("floatingCartBtn");
  const target = [floatingCart, ...document.querySelectorAll(".cart-link, .desktop-cart")].find((el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return !el.classList.contains("hidden") && getComputedStyle(el).display !== "none" && rect.width > 0 && rect.height > 0;
  });
  if (!source || !target) return;
  if (source.classList.contains("btn-icon-add") || source.classList.contains("button-primary")) source.blur();

  const sourceRect = source.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const flyer = document.createElement("span");
  flyer.className = "cart-flight-item";
  flyer.innerHTML = '<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>';
  flyer.style.left = `${sourceRect.left + sourceRect.width / 2 - 15}px`;
  flyer.style.top = `${sourceRect.top + sourceRect.height / 2 - 15}px`;
  flyer.style.setProperty("--cart-flight-x", `${targetRect.left + targetRect.width / 2 - sourceRect.left - sourceRect.width / 2}px`);
  flyer.style.setProperty("--cart-flight-y", `${targetRect.top + targetRect.height / 2 - sourceRect.top - sourceRect.height / 2}px`);
  document.body.appendChild(flyer);
  requestAnimationFrame(() => flyer.classList.add("is-flying"));
  target.classList.add("cart-arrival");
  setTimeout(() => {
    flyer.remove();
    target.classList.remove("cart-arrival");
  }, 1250);
}
function removeFromCart(id, variantId = null) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) {
    setCart(getCart().filter((i) => i.id !== id));
    return;
  }
  const resolvedVariantId = variantIdFor(p, variantId);
  setCart(getCart().filter((i) => {
    if (i.id !== id) return true;
    if (p.attributes) {
      if (!resolvedVariantId) return false;
      return (i.variantId || null) !== resolvedVariantId;
    }
    return p.variants && cartRowVariantId(i, p) !== resolvedVariantId;
  }));
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
  const product = PRODUCTS.find((x) => x.id === id);
  added ? list.push(id) : list.splice(i, 1);
  setWishlist(list);
  if (typeof trackWishlistAction === "function") {
    trackWishlistAction(added ? "add" : "remove", { product: product?.name || id });
  }
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
    const item = cartProduct(row);
    return item ? sum + item.display.price * row.qty : sum;
  }, 0);
  countEl.textContent = count;
  totalEl.textContent = money(total);

  const path = location.pathname;
  const onCartOrCheckout = path.startsWith("/cart") || path.startsWith("/checkout");
  btn.classList.toggle("hidden", onCartOrCheckout);
}

function updateQty(id, variantId, qty) {
  qty = Math.max(1, Math.min(99, Number(qty) || 1));
  const cart = getCart();
  const p = PRODUCTS.find((x) => x.id === id);
  const resolvedVariantId = p ? variantIdFor(p, variantId) : null;
  const item = cart.find((i) => i.id === id && cartRowVariantId(i, p) === resolvedVariantId);
  if (!item) return;
  item.qty = qty;
  setCart(cart);
}
function incQty(id, variantId = null) {
  const cart = getCart();
  const p = PRODUCTS.find((x) => x.id === id);
  const resolvedVariantId = p ? variantIdFor(p, variantId) : null;
  const item = cart.find((i) => i.id === id && cartRowVariantId(i, p) === resolvedVariantId);
  if (!item) return;
  item.qty = Math.min(99, (item.qty || 1) + 1);
  setCart(cart);
}
function decQty(id, variantId = null) {
  const cart = getCart();
  const p = PRODUCTS.find((x) => x.id === id);
  const resolvedVariantId = p ? variantIdFor(p, variantId) : null;
  const item = cart.find((i) => i.id === id && cartRowVariantId(i, p) === resolvedVariantId);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) - 1);
  setCart(cart);
}

function qtyControlsHTML(id, variantId, qty) {
  const variantArg = variantId || "";
  return `<div class="qty" aria-label="Quantity controls">
      <button type="button" onclick="decQty('${id}', '${variantArg}')" aria-label="Decrease quantity">−</button>
      <input type="number" min="1" max="99" value="${qty}" onchange="updateQty('${id}', '${variantArg}', this.value)" />
      <button type="button" onclick="incQty('${id}', '${variantArg}')" aria-label="Increase quantity">+</button>
    </div>`;
}

function cartRowHTML(row, p) {
  const cartItem = cartProduct(row);
  if (!cartItem) {
    return `<div style="display:flex; align-items:center; justify-content:space-between; gap:.6rem; padding:.5rem 0; border-bottom:1px solid rgba(16,15,15,.06);">
        <span class="muted">This product is no longer available.</span>
        <button type="button" class="close-btn" title="Remove" onclick="event.preventDefault(); event.stopPropagation(); removeFromCart('${row.id}')">✕</button>
      </div>`;
  }
  const { display, variant } = cartItem;
  // Keep the stored variant ID so stale variants can still be removed.
  const variantId = p?.attributes ? (row.variantId || "") : (p?.variants ? (row.variantId || variant.id) : "");
  const subtitleText = p?.attributes
    ? display.subtitle
    : `${p?.variants ? `${variant.label} · ` : ""}${display.subtitle}`;
  return `<div style="display:grid; grid-template-columns: 64px 1fr auto; gap:.6rem; align-items:center; padding:.5rem 0; border-bottom:1px solid rgba(16,15,15,.06);">
      <img loading="lazy" src="${display.images[0]}" alt="${
    display.name
  }" style="width:64px; height:64px; object-fit:cover; border-radius:10px;">
      <div>
        <div style="font-weight:600;">${display.name} <span class="deep-muted"> (${subtitleText}) </span></div>
        ${qtyControlsHTML(row.id, variantId, row.qty)}
      </div>
      <div style="display:flex; align-items:center; gap:.4rem;">
        <strong>${money(display.price * row.qty)}</strong>
        <button type="button" class="close-btn" title="Remove" onclick="event.preventDefault(); event.stopPropagation(); removeFromCart('${
          row.id
        }', '${variantId}')">✕</button>
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
    const item = cartProduct(row);
    return item ? sum + item.display.price * row.qty : sum;
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
    const item = cartProduct(row);
    return item ? sum + item.display.price * row.qty : sum;
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
  function renderHowToUseTags(howToUseItems, note) {
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
        ${note ? `<div class="how-to-use-point" style="margin-bottom:-4px;">${note}</div>` : ''}
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
    const item = cartProduct(row);
    if (!item) return "";
    const { display, variant } = item;
    const variantId = p?.attributes ? (row.variantId || "") : (p?.variants ? variant.id : "");
    const subtitleText = p?.attributes
      ? display.subtitle
      : `${p?.variants ? `${variant.label} · ` : ""}${display.subtitle}`;

    return `
      <div class="checkout-item">
        <img loading="lazy" src="${display.images[0]}" alt="${display.name}" class="checkout-item-img">
        <div class="checkout-item-details">
          <div class="checkout-item-name">${display.name} <span class="deep-muted"> (${subtitleText}) </span></div>
          ${qtyControlsHTML(row.id, variantId, row.qty)}
        </div>
        <div class="checkout-item-price">
          <strong>${money(display.price * row.qty)}</strong>
          <button type="button" class="close-btn" title="Remove" onclick="event.preventDefault(); removeFromCart('${row.id}', '${variantId}')">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

function updateCartItemsData() {
  const cart = getCart();
  const lines = cart.map((row, index) => {
    const item = cartProduct(row);
    if (!item) return null;
    const { display, variant } = item;
    const p = PRODUCTS.find((x) => x.id === row.id);
    let itemLabel = display.name;
    if (p && p.attributes) {
      itemLabel += ` (${display.subtitle})`;
    } else if (p && p.variants) {
      itemLabel += ` (${variant.label || variant.subtitle} · ${display.subtitle})`;
    } else if (display.subtitle) {
      itemLabel += ` (${display.subtitle})`;
    }
    const lineTotal = display.price * row.qty;
    return `${index + 1}. ${itemLabel}\n   Qty: ${row.qty} × ৳${display.price.toFixed(2)} = ৳${lineTotal.toFixed(2)}`;
  }).filter(Boolean);

  const cartInput = document.getElementById('cartItemsData');
  if (cartInput) {
    cartInput.value = lines.join('\n\n');
  }
}

function updateCheckoutTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, row) => {
    const item = cartProduct(row);
    return item ? sum + item.display.price * row.qty : sum;
  }, 0);
  
  const shippingChecked = document.querySelector('input[name="shipping_method"]:checked');
  const shippingMethod = shippingChecked ? shippingChecked.value : 'inside_dhaka';
  const shippingCost = SHIPPING_RATES[shippingMethod] || SHIPPING_RATES.inside_dhaka;
  const total = subtotal + shippingCost;
  
  const subtotalEl = document.getElementById('checkoutSubtotal');
  if (subtotalEl) subtotalEl.textContent = `৳${subtotal.toFixed(2)}`;
  const shippingEl = document.getElementById('checkoutShipping');
  if (shippingEl) shippingEl.textContent = `৳${shippingCost.toFixed(2)}`;
  const totalEl = document.getElementById('checkoutTotal');
  if (totalEl) totalEl.textContent = `৳${total.toFixed(2)}`;
  
  // Update hidden fields for form submission
  updateCartItemsData();
  const subtotalData = document.getElementById('subtotalData');
  if (subtotalData) subtotalData.value = subtotal;
  const shippingData = document.getElementById('shippingData');
  if (shippingData) shippingData.value = shippingCost;
  const totalData = document.getElementById('totalData');
  if (totalData) totalData.value = total;
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
