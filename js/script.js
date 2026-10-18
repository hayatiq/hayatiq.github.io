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
  order: document.getElementById("view-order"),
  orders: document.getElementById("view-orders"),
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
// resolved by social crawlers); index.html's tag already is one.
const SITE_IMAGE_RAW = document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
const SITE_IMAGE = /^https?:/.test(SITE_IMAGE_RAW) ? SITE_IMAGE_RAW : SITE_IMAGE_RAW ? `${SITE_URL}${SITE_IMAGE_RAW.replace(/^\./, "")}` : "";
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
          trackEvent("product_view", { product: product.name });
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
    if (getCart().length) trackEvent("begin_checkout", { items: getCart().length });
    setPageMeta("Checkout — Hayatiq", "Complete your Hayatiq order — cash on delivery available across Bangladesh.", { path: "/checkout" });
    resetProductJsonLd();
  } else if (path === "/order") {
    routes.order.classList.add("active");
    renderOrderPage();
    setPageMeta("Your Order — Hayatiq", "Your Hayatiq order confirmation.", { path: "/order", noindex: true });
    resetProductJsonLd();
  } else if (path === "/orders") {
    routes.orders.classList.add("active");
    renderMyOrders();
    setPageMeta("My Orders — Hayatiq", "Orders placed on this phone.", { path: "/orders", noindex: true });
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
  document.getElementById("toastBox")?.classList.remove("show");
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
// Only add genuine feedback, with the customer's permission (see README.MD).
const TESTIMONIALS = [];

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
  // Commas by hand: toLocaleString() costs a slow phone a noticeable pause the first time.
  return `৳${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Small (600px-wide) copy of a product photo for cards, thumbnails and cart rows;
// the full-size file is only loaded for the product page's main photo. Every photo
// in images/ needs a matching file in images/cards/ (see README.MD).
function cardImage(src) {
  return src.replace("./images/", "./images/cards/");
}

// The product page's main photo: the 800px copy in images/md/ on phones (enough for
// their screens, about half the bytes), the full photo on wider screens and in the
// full-size viewer. tools/photo-sizes.py makes the copies.
const PHONE_SCREEN = window.matchMedia("(max-width: 800px)").matches;
function pagePhoto(src) {
  return PHONE_SCREEN ? src.replace("./images/", "./images/md/") : src;
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

// False while a product still uses images/placeholder.webp. Such products stay off
// the homepage and "You may also like", sit at the end of /products, and show a
// brand-colored tile instead of the placeholder picture.
function hasRealPhoto(p) {
  const images = productVariants(p)[0].images || p.images || [];
  return Boolean(images[0]) && !images[0].includes("placeholder");
}

function photoPendingTile(p, extraClass = "") {
  return `<div class="photo-pending ${extraClass}"><span class="brand-logo" aria-hidden="true"></span><span>${p.name}</span></div>`;
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
            ${hasRealPhoto(p)
              ? `<img ${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'} src="${cardImage(display.images[0])}" alt="${p.name}" class="fade-in" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">`
              : photoPendingTile(p)}
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
               ${!isComingSoon ? `<button class="btn-icon-add" aria-label="${p.attributes ? 'Choose options for' : 'Add'} ${p.name} to cart" onclick="event.preventDefault(); event.stopPropagation(); ${p.attributes ? `goTo('/product/${p.slug}');` : `addToCart('${p.id}', '${selectedId || ''}');`}"><i class="fa-solid ${p.attributes ? 'fa-sliders' : 'fa-cart-plus'}"></i></button>` : ''}
            </div>
          </div>
        </a>
      </article>`;
}

// Skips products already shown in the Top Selling carousel just above it, so the
// homepage shows more of the range instead of the same cards twice.
function renderFeatured() {
  if (!featuredGrid) return;
  const shown = new Set(topProducts().map((p) => p.id));
  featuredGrid.innerHTML = PRODUCTS.filter((p) => !shown.has(p.id) && hasRealPhoto(p)).slice(0, 8).map((p) => productCard(p)).join("");
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
  // The first two cards are on screen at load, so their photos load straight away.
  topProductsGrid.innerHTML = items.map((p, i) => productCard(p, { carousel: true, eager: i < 2 })).join("");
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
  // Only the needs: categories (Hair Care, Oral Care) already have photo tiles above.
  grid.innerHTML = `<span class="need-chips-label">Shop by need:</span>` + NEED_TILES.filter((tile) => tile.concern).map((tile) => {
    const count = needTileLiveCount(tile);
    return `<a class="need-chip${count === 0 ? " need-chip-empty" : ""}" href="${needTileHref(tile)}">
        <i class="fa-solid ${tile.icon}" aria-hidden="true"></i><span>${tile.label}</span>
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
  items = [...items.filter(hasRealPhoto), ...items.filter((p) => !hasRealPhoto(p))];
  productsGrid.innerHTML = items.map((p) => productCard(p)).join("");
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

// Category chips above the product grid; each is a normal link, so the router
// handles it. A ?concern= filter (from the "Shop by need" chips) gets its own chip.
const FILTER_CATEGORIES = ["Hair Care", "Magnesium Oil Spray", "Oral Care", "Cleaning Supply", "Bath Bombs", "Footsoaks", "Salves & Balms"];

function setupProductFilters() {
  const chips = document.getElementById("categoryChips");
  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const concern = params.get("concern");
  if (chips) {
    const chip = (label, href, active) =>
      `<a href="${href}" class="filter-chip${active ? " active" : ""}"${active ? ' aria-current="true"' : ""}>${label}</a>`;
    chips.innerHTML = [
      chip("All", "/products", !category && !concern),
      concern ? chip(concern, `/products?concern=${encodeURIComponent(concern)}`, true) : "",
      ...FILTER_CATEGORIES.map((c) => chip(c, `/products?cat=${encodeURIComponent(c)}`, c === category)),
    ].join("");
    chips.querySelector(".active")?.scrollIntoView({ block: "nearest", inline: "center" });
  }
  renderProducts(category, concern);
}

function accordionItem(title, arr, { open = false } = {}) {
  // No shared `name` grouping on purpose — each section opens/closes independently
  // instead of auto-closing others, so opening one can't jump the page layout.
  return `<details class="accordion-item" data-section="${title}" ${open ? "open" : ""}>
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
}

// "Order Now": put this exact item in the cart (once) and go straight to checkout.
function orderNow(productId, variantId) {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p) return;
  let key = variantIdFor(p, variantId || null);
  let selections = null;
  if (p.attributes) {
    selections = getVisibleAttributeSelections(p, initProductAttributeSelections(p));
    key = attributeSelectionsKey(p, selections);
  }
  const inCart = getCart().some((i) => i.id === productId && cartRowVariantId(i, p) === key);
  if (!inCart) addToCart(productId, key, null, false, selections);
  goTo("/checkout");
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
  
  // Keep the chosen photo only when re-rendering the same product (e.g. after picking
  // an option), not when moving to another product from "You may also like".
  const images = display.images || [];
  let activeImageIndex = detailWrap.dataset.productId === p.id ? Number(detailWrap.dataset.imageIndex) || 0 : 0;
  if (activeImageIndex >= images.length) activeImageIndex = 0;
  detailWrap.dataset.productId = p.id;
  detailWrap.dataset.imageIndex = activeImageIndex;
  // Square photos that swipe, with a "2 / 3" count and a row of square thumbnails below.
  const galleryHTML = !hasRealPhoto(p)
    ? `<div class="gallery"><div class="gallery-main">${photoPendingTile(p, "photo-pending-large")}${shareButtonHTML(p)}</div></div>`
    : `<div class="gallery">
          <div class="gallery-main">
            ${shareButtonHTML(p)}
            <div class="gallery-track" id="galleryTrack">
              ${images
                .map(
                  (src, i) => `<div class="gallery-slide"><img src="${pagePhoto(src)}" alt="${p.name} ${i + 1}" ${
                    i === activeImageIndex ? 'fetchpriority="high"' : 'loading="lazy"'
                  } class="fade-in" onload="this.classList.add('loaded')" onerror="${
                    pagePhoto(src) === src ? "" : `if (!this.dataset.full) { this.dataset.full = 1; this.src = '${src}'; return; } `
                  }this.classList.add('loaded')" onclick="openImageLightbox('${src}')"></div>`
                )
                .join("")}
            </div>
            ${images.length > 1 ? `<span class="gallery-count" id="galleryCount">${activeImageIndex + 1} / ${images.length}</span>` : ""}
          </div>
          <div class="thumbs" id="thumbs">${images
            .map(
              (src, i) => `<button type="button" class="thumb${i === activeImageIndex ? " active" : ""}" data-index="${i}" aria-label="Photo ${i + 1}"><img loading="lazy" src="${cardImage(src)}" alt=""></button>`
            )
            .join("")}</div>
        </div>`;

  // By data-section, not the summary text, which js/i18n.js may have translated.
  const openAccordions = Array.from(document.querySelectorAll("#detailWrap details[open]")).map((d) => d.dataset.section);

  detailWrap.innerHTML = `
        ${galleryHTML}
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
            <div class="product-price detail-price" id="detailPrice">${money(
               finalPrice
            )}</div>
            ${customAttributesHTML}
            <p class="muted">${p.short}</p>
            ${
              p.benefits && p.benefits.length
                ? `<ul class="benefit-list">${p.benefits
                    .map((b) => `<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>${b}</span></li>`)
                    .join("")}</ul>`
                : ""
            }
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
            <button class="btn button-primary detail-order-now" onclick="event.preventDefault(); orderNow('${p.id}', '${selectedId || ''}');">Order Now</button>
             ${isGenericCustom
               ? `<button class="btn button-ghost" onclick="event.preventDefault(); addAttributeProductToCart('${p.id}', this);">Add to Cart</button>`
               : `<button class="btn button-ghost" onclick="event.preventDefault(); addToCart('${p.id}', '${selectedId || ''}');">Add to Cart</button>`
             }
            <a class="btn button-ghost" href="https://m.me/hayatiq.life?ref=${p.slug}" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-messenger"></i> Ask a Question</a>
            <button class="wishlist-toggle wishlist-toggle-inline ${isWishlisted(p.id) ? 'active' : ''}" data-id="${p.id}" aria-label="Add to wishlist" onclick="event.preventDefault(); toggleWishlist('${p.id}');"><i class="fa-solid fa-heart"></i></button>
          </div>
          <div class="usp-strip">
            <div class="usp-badge"><span aria-hidden="true">🌿</span> Natural</div>
            <div class="usp-badge"><span aria-hidden="true">✋</span> Handmade</div>
            <div class="usp-badge"><span aria-hidden="true">✅</span> Quality Checked</div>
          </div>
          <ul class="detail-info">
            <li><span aria-hidden="true">💵</span><span><strong>Cash on delivery</strong>: check your order before you pay.</span></li>
            <li><span aria-hidden="true">🚚</span><span>Inside Dhaka ${money(SHIPPING_RATES.inside_dhaka)} (${DELIVERY_TIME.inside_dhaka}) · Outside Dhaka ${money(SHIPPING_RATES.outside_dhaka)} (${DELIVERY_TIME.outside_dhaka})</span></li>
            <li><span aria-hidden="true">💬</span><span>${DAMAGE_PROMISE} <a href="${FACEBOOK_URL}" target="_blank" rel="noopener">Facebook page</a></span></li>
          </ul>

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

          ${reviews.length ? `<div class="soft-card">
            <h3 style="margin-bottom:.4rem;">Customer Reviews</h3>
            <div class="reviews">${reviews
                    .map(
                      (r) =>
                        `<div class="review-item">
                          <div class="review-item-head"><strong>${r.name}</strong><span class="stars">${stars(r.rating)}</span></div>
                          ${r.image ? `<img loading="lazy" src="${r.image}" alt="Photo shared by ${r.name}" class="review-item-img" onclick="openImageLightbox('${r.image}')">` : ''}
                          <p class="muted">${r.text}</p>
                          ${r.source ? `<span class="review-source">via ${r.source}</span>` : ''}
                        </div>`
                    )
                    .join("")}</div>
          </div>` : ""}
        </div>
        ${renderRelated(p)}
      `;
  setupGallery(images.length);
  watchOrderBar();
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

/* ---------- Share a product ---------- */
// A share icon on the product photo: the phone's own share sheet (WhatsApp,
// Messenger, …) where the browser has one; otherwise, e.g. inside Facebook's in-app
// browser, a small menu with WhatsApp / Facebook / Copy link.
const SHARE_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';

// One round button on the corner of the product photo.
function shareButtonHTML(p) {
  return `<button type="button" class="gallery-share" aria-label="Share" onclick="openShare('${p.id}', this)">${SHARE_ICON}</button>`;
}

// Where there's no share sheet: a small menu under the button; any tap closes it.
function openShare(id, button) {
  if (typeof navigator.share === "function") return shareProduct(id, "native");
  const open = button.parentElement.querySelector(".share-menu");
  closeShareMenus();
  if (open) return;
  const item = (method, label) => `<button type="button" role="menuitem" onclick="shareProduct('${id}', '${method}')">${label}</button>`;
  button.insertAdjacentHTML(
    "afterend",
    `<div class="share-menu" role="menu">${item("whatsapp", "WhatsApp")}${item("facebook", "Facebook")}${item("copy", "Copy link")}</div>`
  );
  setTimeout(() => document.addEventListener("click", closeShareMenus, { once: true }));
}

function closeShareMenus() {
  document.querySelectorAll(".share-menu").forEach((menu) => menu.remove());
}

function shareProduct(id, method) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  // The live address, except on a Netlify test copy (deploy preview), which shares its own.
  const base = location.hostname.endsWith(".netlify.app") ? location.origin : SITE_URL;
  const url = `${base}/product/${p.slug}`;
  const text = `${p.name} — HAYATIQ`;
  trackEvent("share", { product: p.name, method });
  if (method === "native") navigator.share({ title: text, text, url }).catch(() => {});
  else if (method === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank", "noopener");
  else if (method === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener");
  else copyText(url, "Link copied");
}

// The active thumbnail and the "2 / 3" count follow the swiped photo; tapping a
// thumbnail scrolls to that photo.
function setupGallery(count) {
  const track = document.getElementById("galleryTrack");
  if (!track || count < 2) return;
  const setActive = (index) => {
    detailWrap.dataset.imageIndex = index;
    document.querySelectorAll("#thumbs .thumb").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.index) === index);
    });
    const counter = document.getElementById("galleryCount");
    if (counter) counter.textContent = `${index + 1} / ${count}`;
  };
  const showSlide = (index, smooth = true) =>
    track.scrollTo({ left: index * track.clientWidth, behavior: smooth ? "smooth" : "auto" });
  const start = Number(detailWrap.dataset.imageIndex) || 0;
  if (start) requestAnimationFrame(() => showSlide(start, false));
  track.addEventListener(
    "scroll",
    () => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      if (index !== Number(detailWrap.dataset.imageIndex)) setActive(index);
    },
    { passive: true }
  );
  document.querySelectorAll("#thumbs .thumb").forEach((b) => {
    b.addEventListener("click", () => showSlide(Number(b.dataset.index)));
  });
}

// The slim "Order Now" bar (#orderBar) shows on a product page once its own buttons
// have scrolled up out of view; updateFloatingCartButton() shows it in place of the
// cart bar.
var orderBarOn = false;
var orderBarObserver = null;
function watchOrderBar() {
  if (orderBarObserver) orderBarObserver.disconnect();
  orderBarOn = false;
  const actions = document.querySelector("#detailWrap .detail-actions");
  if (actions && "IntersectionObserver" in window) {
    orderBarObserver = new IntersectionObserver(([entry]) => {
      orderBarOn = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      updateFloatingCartButton();
    });
    orderBarObserver.observe(actions);
  }
  updateFloatingCartButton();
}

// "You may also like": the product's own `related` ids first (see products.js), then
// other live products from the same category, then top sellers, up to 4 in total.
function relatedProducts(p, limit = 4) {
  const live = (x) => x && x.id !== p.id && isLiveProduct(x) && hasRealPhoto(x);
  const picked = (p.related || []).map((id) => PRODUCTS.find((x) => x.id === id)).filter(live);
  const add = (list, more) => list.concat(more.filter((x) => live(x) && !list.includes(x)));
  let items = add(picked, PRODUCTS.filter((x) => x.category === p.category));
  items = add(items, PRODUCTS.filter((x) => x.topSelling));
  return items.slice(0, limit);
}

function renderRelated(p) {
  const items = relatedProducts(p);
  if (!items.length) return "";
  return `<section class="related-products" aria-label="You may also like">
      <h3>You may also like</h3>
      <div class="products-grid">${items.map((x) => productCard(x)).join("")}</div>
    </section>`;
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

// Readable name for a cart line, e.g. "Bath Bomb (Round · Lavender · 100g)".
function cartLineLabel(p, variantId, selections) {
  if (p.attributes && selections) return `${p.name} (${formatAttributeSelections(p, selections)})`;
  if (variantId && p.variants) {
    const v = selectedVariant(p, variantId);
    return `${p.name} (${v.label || v.subtitle})`;
  }
  return p.subtitle ? `${p.name} (${p.subtitle})` : p.name;
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
  const label = cartLineLabel(p, resolvedVariantId, selections);
  if (typeof trackCartAction === "function") trackCartAction("add_to_cart", { product: label });
  trackEvent("add_to_cart", { product: label });
  bumpCart();
  // Every add confirms itself and offers the next step, instead of a silent counter change.
  if (showToast) toast(`Added to cart: ${label}`, "success", { label: "Checkout", href: "/checkout" });
}
// A small bounce on the cart icons, so an add is felt as well as read.
function bumpCart() {
  document.querySelectorAll(".site-header .cart, .cart-bar-summary .icon, .order-bar-cart").forEach((el) => {
    el.classList.remove("bump");
    void el.offsetWidth; // restart the animation
    el.classList.add("bump");
  });
}

function removeFromCart(id, variantId = null) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (typeof trackCartAction === "function") trackCartAction("remove_from_cart", { product: p ? cartLineLabel(p, variantId || null) : id });
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
function clearCart(track = true) {
  if (track && typeof trackCartAction === "function" && getCart().length) trackCartAction("clear_cart");
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
    ? items.map((p) => productCard(p)).join("")
    : `<div class="empty-state">
        <p class="muted">Your wishlist is empty. Tap the ♥ on any product to save it here.</p>
        <a class="btn button-primary" href="/products">Browse products</a>
      </div>`;
}

/* ==============================
       Floating mobile cart button
       ============================== */
// Slim bottom bar with the cart total and a Checkout button. It shows only when the
// cart has something in it, and stays out of the way on cart, checkout and the
// order confirmation.
function updateFloatingCartButton() {
  const bar = document.getElementById("floatingCartBtn");
  const countEl = document.getElementById("floatingCartCount");
  const totalEl = document.getElementById("floatingCartTotal");
  if (!bar || !countEl || !totalEl) return;

  const cart = getCart();
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const total = cart.reduce((sum, row) => {
    const item = cartProduct(row);
    return item ? sum + item.display.price * row.qty : sum;
  }, 0);
  countEl.textContent = `${count} item${count === 1 ? "" : "s"}`;
  totalEl.textContent = money(total);

  const path = location.pathname;
  const showOrderBar = path.startsWith("/product/") && orderBarOn;
  const orderBar = document.getElementById("orderBar");
  if (orderBar) {
    orderBar.classList.toggle("hidden", !showOrderBar);
    if (showOrderBar) {
      document.getElementById("orderBarName").textContent = document.querySelector("#detailWrap h2")?.textContent || "";
      document.getElementById("orderBarPrice").textContent = document.getElementById("detailPrice")?.textContent || "";
      const cartBtn = document.getElementById("orderBarCart");
      cartBtn.hidden = count === 0;
      document.getElementById("orderBarCount").textContent = count;
    }
  }
  const hide = showOrderBar || count === 0 || path.startsWith("/cart") || path.startsWith("/checkout") || path.startsWith("/order");
  bar.classList.toggle("hidden", hide);
  document.body.classList.toggle("has-cart-bar", !hide || showOrderBar);
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

// One cart line, shared by the cart page, the cart drawer and checkout.
function cartRowHTML(row, p) {
  const cartItem = cartProduct(row);
  if (!cartItem) {
    return `<div class="cart-line-missing cart-line">
        <span class="muted">This product is no longer available.</span>
        <button type="button" class="cart-line-remove" aria-label="Remove" onclick="event.preventDefault(); event.stopPropagation(); removeFromCart('${row.id}')">✕</button>
      </div>`;
  }
  const { display, variant } = cartItem;
  // Keep the stored variant ID so stale variants can still be removed.
  const variantId = p?.attributes ? (row.variantId || "") : (p?.variants ? (row.variantId || variant.id) : "");
  const subtitleText = p?.attributes
    ? display.subtitle
    : `${p?.variants ? `${variant.label} · ` : ""}${display.subtitle || ""}`;
  return `<div class="cart-line">
      <img class="cart-line-img" loading="lazy" src="${cardImage(display.images[0])}" alt="${display.name}">
      <div class="cart-line-info">
        <div class="cart-line-top">
          <div class="cart-line-name">${display.name}${subtitleText ? `<small>${subtitleText}</small>` : ""}</div>
          <button type="button" class="cart-line-remove" aria-label="Remove ${display.name}" onclick="event.preventDefault(); event.stopPropagation(); removeFromCart('${row.id}', '${variantId}')">✕</button>
        </div>
        <div class="cart-line-bottom">
          ${qtyControlsHTML(row.id, variantId, row.qty)}
          <strong>${money(display.price * row.qty)}</strong>
        </div>
      </div>
    </div>`;
}

function renderCart() {
  const holder = document.getElementById("cartItems");
  const list = getCart();
  const summary = document.getElementById("cartSummary");
  if (list.length === 0) {
    holder.innerHTML = `<div class="empty-state">
        <p class="muted">Your cart is empty.</p>
        <a class="btn button-primary" href="/products">Shop products</a>
      </div>`;
    if (summary) summary.hidden = true;
    return;
  }
  if (summary) summary.hidden = false;
  const note = document.getElementById("cartDeliveryNote");
  if (note) {
    note.textContent = `Delivery is added at checkout: Inside Dhaka ${money(SHIPPING_RATES.inside_dhaka)}, Outside Dhaka ${money(SHIPPING_RATES.outside_dhaka)}.`;
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
    totalEl.textContent = money(0);
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
  
  container.innerHTML = cart.map((row) => cartRowHTML(row, PRODUCTS.find((x) => x.id === row.id))).join("");
}

// Cart lines in a plain shape for emails, Telegram, the order sheet and the
// confirmation page.
function orderItems() {
  return getCart().map((row) => {
    const item = cartProduct(row);
    if (!item) return null;
    const { display, variant, p } = item;
    let label = display.name;
    if (p.attributes) label += ` (${display.subtitle})`;
    else if (p.variants) label += ` (${variant.label || variant.subtitle} · ${display.subtitle})`;
    else if (display.subtitle) label += ` (${display.subtitle})`;
    return { label, qty: row.qty, unitPrice: display.price, lineTotal: display.price * row.qty };
  }).filter(Boolean);
}

function updateCartItemsData() {
  const lines = orderItems().map((i, index) => `${index + 1}. ${i.label}\n   Qty: ${i.qty} × ${money(i.unitPrice)} = ${money(i.lineTotal)}`);
  const cartInput = document.getElementById('cartItemsData');
  if (cartInput) {
    cartInput.value = lines.join('\n\n');
  }
}

const AREA_LABELS = { inside_dhaka: "Inside Dhaka", outside_dhaka: "Outside Dhaka" };

// The delivery area has no default on purpose: customers outside Dhaka used to
// check out at the Inside Dhaka rate without noticing.
function selectedArea() {
  const checked = document.querySelector('input[name="shipping_method"]:checked');
  return checked ? checked.value : null;
}

function updateCheckoutTotals() {
  const subtotal = orderItems().reduce((sum, i) => sum + i.lineTotal, 0);
  const area = selectedArea();
  const shippingCost = area ? SHIPPING_RATES[area] : 0;
  const total = subtotal + shippingCost;

  const subtotalEl = document.getElementById('checkoutSubtotal');
  if (subtotalEl) subtotalEl.textContent = money(subtotal);
  const shippingEl = document.getElementById('checkoutShipping');
  if (shippingEl) shippingEl.textContent = area ? money(shippingCost) : "Choose an area";
  const totalEl = document.getElementById('checkoutTotal');
  if (totalEl) totalEl.textContent = money(total);
  const btn = document.getElementById('placeOrderBtn');
  if (btn && !btn.disabled) btn.textContent = area ? `Place Order · ${money(total)}` : "Place Order";

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
  saveFormData();
}

// Accepts numbers the way people type them: Bangla digits, +880 / 880 / 0088
// prefixes, spaces, dashes and dots. Returns "01XXXXXXXXX", or null if it still
// isn't a valid Bangladeshi mobile number.
function normalizePhone(value) {
  let v = String(value || "").replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  v = v.replace(/[\s\-.()]/g, "");
  v = v.replace(/^(\+?88|0088)(?=01)/, "");
  if (/^1[3-9]\d{8}$/.test(v)) v = "0" + v;
  return /^01[3-9]\d{8}$/.test(v) ? v : null;
}

function showPhoneError(message) {
  const el = document.getElementById('phoneError');
  if (!el) return;
  el.textContent = message || "";
  el.hidden = !message;
}

// Initialize checkout when view is shown
function initCheckout() {
  updateCheckoutTotals();
  renderCheckoutItems();
  loadFormData();
  document.querySelectorAll('.ship-time').forEach((el) => {
    el.textContent = DELIVERY_TIME[el.dataset.area] || "";
  });

  // Attach listeners once — this runs on every visit to /checkout.
  const form = document.getElementById('checkoutForm');
  if (form.dataset.bound) return;
  form.dataset.bound = "true";
  ['checkoutName', 'checkoutPhone', 'checkoutAddress'].forEach((id) => {
    document.getElementById(id).addEventListener('input', saveFormData);
  });
  const phone = document.getElementById('checkoutPhone');
  phone.addEventListener('blur', () => {
    if (!phone.value.trim()) return showPhoneError("");
    const clean = normalizePhone(phone.value);
    if (clean) {
      phone.value = clean;
      saveFormData();
      showPhoneError("");
    } else {
      showPhoneError("Please enter an 11-digit mobile number, e.g. 01712345678");
    }
  });
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

/* ==============================
       Order confirmation (/order)
       ============================== */
const LAST_ORDER_KEY = "hayatiq_last_order";

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Plain-text version of an order, for copying into Messenger if sending failed.
function orderText(order) {
  return [
    `Order ${order.id}`,
    ...order.items.map((i) => `${i.label} × ${i.qty} = ${money(i.lineTotal)}`),
    `Delivery (${order.areaLabel}): ${money(order.delivery)}`,
    `Total: ${money(order.total)} (cash on delivery)`,
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}`,
    order.note ? `Note: ${order.note}` : "",
  ].filter(Boolean).join("\n");
}

// Falls back to the old copy command where the clipboard API is missing or blocked
// (some in-app browsers); if that fails too, shows the text so it can be copied by hand.
function copyText(text, done = "Copied") {
  const fallback = () => {
    const box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(box);
    box.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (e) {}
    box.remove();
    copied ? toast(done, "success") : toast(text);
  };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => toast(done, "success"), fallback);
  else fallback();
}

function renderOrderPage() {
  const wrap = document.getElementById("orderWrap");
  let order = null;
  try {
    order = JSON.parse(localStorage.getItem(LAST_ORDER_KEY));
  } catch (e) {}
  if (!order) {
    wrap.innerHTML = `<div class="coming-soon-container">
        <h2>No recent order</h2>
        <p class="muted">Orders you place on this phone show up here.</p>
        <a class="btn button-primary" href="/products">Shop products</a>
      </div>`;
    return;
  }
  const messenger = `${MESSENGER_URL}?ref=order-${encodeURIComponent(order.id)}`;
  // Local testing only (js/partial.js deliveryReport): what each channel did.
  const report = order.report
    ? `<div class="order-report"><strong>Test details (only shown on your computer)</strong>${order.report
        .map(([channel, result]) => `<div><span>${escapeHtml(channel)}</span> ${escapeHtml(result)}</div>`)
        .join("")}</div>`
    : "";

  if (order.status === "failed") {
    wrap.innerHTML = `<div class="soft-card order-confirm">
        <h2>We couldn't send your order</h2>
        <p>Your cart is saved. Please send us the order below on Messenger and we'll confirm it there, or try again.</p>
        <pre class="order-text">${escapeHtml(orderText(order))}</pre>
        <div class="order-actions order-actions-row">
          <a class="btn button-primary btn-sm" href="${messenger}" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-messenger" aria-hidden="true"></i> Messenger</a>
          <button type="button" class="btn button-ghost btn-sm" onclick="copyText(orderText(JSON.parse(localStorage.getItem(LAST_ORDER_KEY))), 'Order copied')">Copy order</button>
          <a class="btn button-ghost btn-sm" href="/checkout">Try again</a>
        </div>
        ${report}
      </div>`;
    return;
  }

  const time = DELIVERY_TIME[order.area] || "";
  wrap.innerHTML = `<div class="order-confirm">
      ${order.test ? '<p class="order-test-tag">TEST ORDER: nothing was sent</p>' : ""}
      <div class="order-success">
        <span class="order-success-icon"><i class="fa-solid fa-circle-check" aria-hidden="true"></i></span>
        <h2>Thank you, ${escapeHtml(order.name)}!</h2>
        <p>Your order is placed. We'll call <strong>${escapeHtml(order.phone)}</strong> to confirm it.</p>
      </div>
      ${invoiceHtml(order)}
      <div class="order-next">
        <h3>What happens next</h3>
        <ol class="order-steps">
          <li>We call you to confirm your order.</li>
          <li>We send it by courier. Delivery ${escapeHtml(order.areaLabel)}: ${escapeHtml(time)}.</li>
          <li>Check your order when it arrives, then pay the courier in cash.</li>
        </ol>
        <p class="muted">${escapeHtml(DAMAGE_PROMISE)}</p>
      </div>
      <div class="order-actions order-actions-row">
        <a class="btn button-primary btn-sm" href="${messenger}" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-messenger" aria-hidden="true"></i> Message us</a>
        <a class="btn button-ghost btn-sm" href="/products">Continue shopping</a>
      </div>
      <p class="order-more-link"><a href="/orders">My orders</a></p>
      ${report}
    </div>`;
}

/* ==============================
       My orders (this phone only)
       ============================== */
// A record of orders placed from this browser, kept in localStorage only: the latest
// MY_ORDERS_MAX, none older than MY_ORDERS_DAYS. It never shows the address or phone
// (a shared phone shouldn't reveal them) and has no delivery status: the team has it.
// `sig` (a hash of phone + cart) lets checkout spot the same order placed twice.
const MY_ORDERS_KEY = "hayatiq_orders";
const MY_ORDERS_MAX = 10;
const MY_ORDERS_DAYS = 90;
const SAME_ORDER_MINUTES = 30;

function getMyOrders() {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(MY_ORDERS_KEY)) || [];
  } catch (e) {}
  const since = Date.now() - MY_ORDERS_DAYS * 86400000;
  return list.filter((o) => o && o.id && Date.parse(o.createdAt) > since).slice(0, MY_ORDERS_MAX);
}

function setMyOrders(list) {
  try {
    localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(list.slice(0, MY_ORDERS_MAX)));
  } catch (e) {}
  updateMyOrdersLinks();
}

// The menu and footer links show only once this phone has an order.
function updateMyOrdersLinks() {
  const any = getMyOrders().length > 0;
  document.querySelectorAll(".my-orders-link").forEach((a) => (a.hidden = !any));
}

function orderSignature(phone, cart) {
  const rows = cart.map((r) => `${r.id}:${r.variantId || ""}:${r.qty}`).sort().join(",");
  let hash = 5381;
  for (const ch of `${phone}|${rows}`) hash = ((hash * 33) ^ ch.charCodeAt(0)) >>> 0;
  return hash.toString(36);
}

// The same items from the same phone within SAME_ORDER_MINUTES, if any.
function recentSameOrder(sig) {
  const since = Date.now() - SAME_ORDER_MINUTES * 60000;
  return getMyOrders().find((o) => o.sig === sig && Date.parse(o.createdAt) > since) || null;
}

function saveMyOrder(order, cart, test) {
  const entry = {
    id: order.id,
    createdAt: order.createdAt,
    items: order.items.map(({ label, qty, lineTotal }) => ({ label, qty, lineTotal })),
    total: order.total,
    cart: cart.map(({ id, variantId, selections, qty }) => ({ id, variantId, selections, qty })),
    sig: orderSignature(order.phone, cart),
    ...(test ? { test: true } : {}),
  };
  setMyOrders([entry, ...getMyOrders().filter((o) => o.id !== order.id)]);
}

function removeMyOrder(id) {
  setMyOrders(getMyOrders().filter((o) => o.id !== id));
  renderMyOrders();
}

// Puts the same products back in the cart and opens checkout; nothing is sent until
// the customer places the order there. Products no longer sold are skipped.
function orderAgain(id) {
  const order = getMyOrders().find((o) => o.id === id);
  if (!order) return;
  const cart = getCart();
  let added = 0;
  (order.cart || []).forEach((row) => {
    const p = PRODUCTS.find((x) => x.id === row.id);
    if (!p || !isLiveProduct(p)) return;
    if (p.variants && !p.variants.some((v) => v.id === row.variantId)) return;
    const key = cartRowVariantId(row, p);
    const existing = cart.find((i) => i.id === row.id && cartRowVariantId(i, p) === key);
    if (existing) existing.qty = Math.min(99, existing.qty + row.qty);
    else cart.push({ ...row });
    added += 1;
  });
  if (!added) {
    toast("These products are no longer available.", "warning");
    return;
  }
  setCart(cart);
  bumpCart();
  trackEvent("order_again", { order: id });
  goTo("/checkout");
}

function renderMyOrders() {
  const wrap = document.getElementById("ordersWrap");
  if (!wrap) return;
  const orders = getMyOrders();
  if (!orders.length) {
    wrap.innerHTML = `<div class="empty-state">
        <p>No orders on this phone yet.</p>
        <a class="btn button-primary btn-sm" href="/products">Shop products</a>
      </div>`;
    return;
  }
  const e = escapeHtml;
  wrap.innerHTML = `
    <p class="muted my-orders-note">Orders placed on this phone. For updates, message us with the order number.</p>
    <div class="my-orders">
      ${orders
        .map(
          (o) => `<article class="my-order">
          <div class="my-order-head">
            <strong>${e(o.id)}</strong>${o.test ? ' <span class="my-order-test">Test</span>' : ""}
            <span class="my-order-date">${e(orderDate(o))}</span>
          </div>
          <ul class="my-order-items">
            ${o.items.map((i) => `<li><span>${e(i.label)}</span><span>× ${i.qty}</span></li>`).join("")}
          </ul>
          <div class="my-order-total"><span>Total</span><strong>${money(o.total)}</strong></div>
          <div class="my-order-actions">
            <a class="btn button-primary btn-sm" href="${MESSENGER_URL}?ref=order-${encodeURIComponent(o.id)}" target="_blank" rel="noopener" onclick="copyText('${e(o.id)}', 'Order number copied')"><i class="fa-brands fa-facebook-messenger" aria-hidden="true"></i> Ask about this order</a>
            <button type="button" class="btn button-ghost btn-sm" onclick="orderAgain('${e(o.id)}')">Order again</button>
            <button type="button" class="my-order-remove" onclick="removeMyOrder('${e(o.id)}')">Remove</button>
          </div>
        </article>`
        )
        .join("")}
    </div>`;
}

const USER_FORM_DATA = "user_form_data";

function saveFormData() {
  const formData = {
    name: document.getElementById('checkoutName').value,
    phone: document.getElementById('checkoutPhone').value,
    address: document.getElementById('checkoutAddress').value,
    area: selectedArea() || ""
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
    // The area this phone chose last time (there is still no default for new buyers).
    const area = formData.area && document.querySelector(`input[name="shipping_method"][value="${formData.area}"]`);
    if (area && !selectedArea()) {
      area.checked = true;
      updateCheckoutTotals();
    }
  }
}

function clearFormData() {
  localStorage.removeItem(USER_FORM_DATA);
}


/* ==============================
       Toast
       ============================== */

// Small built-in notice (replaces SweetAlert2). `action` adds a link button,
// e.g. { label: "Checkout", href: "/checkout" }.
function toast(msg, type = "info", action = null) {
  let box = document.getElementById("toastBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "toastBox";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  box.innerHTML = `<span>${msg}</span>${action ? `<a href="${action.href}" class="toast-action">${action.label}</a>` : ""}`;
  box.className = `toast-box toast-${type} show`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => box.classList.remove("show"), action ? 4000 : 3000);
}


/* ==============================
       Init
       ============================== */
document.getElementById("year").textContent = new Date().getFullYear();
const trustLineText = document.getElementById("trustLineText");
if (trustLineText) {
  trustLineText.textContent = `💵 Cash on delivery · 🚚 Dhaka ${money(SHIPPING_RATES.inside_dhaka)} (${DELIVERY_TIME.inside_dhaka}) · Outside Dhaka ${money(SHIPPING_RATES.outside_dhaka)} (${DELIVERY_TIME.outside_dhaka})`;
}
const trustLine = document.getElementById("trustLine");
if (trustLine) {
  trustLine.innerHTML = [
    ["💵", "Cash on delivery"],
    ["🚚", `Dhaka ${money(SHIPPING_RATES.inside_dhaka)} · ${DELIVERY_TIME.inside_dhaka}`],
    ["📦", `Outside Dhaka ${money(SHIPPING_RATES.outside_dhaka)} · ${DELIVERY_TIME.outside_dhaka}`],
    ["🌿", "Handmade"],
  ]
    .map(([icon, text]) => `<li><span aria-hidden="true">${icon}</span><span>${text}</span></li>`)
    .join("");
}
// Phones: the header sticks to the top (css/style.css); a shadow appears once the
// page has scrolled under it.
const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  // Off the live site the test banner is also pinned to the top: sit just below it.
  const banner = document.querySelector(".test-mode-banner");
  const placeHeader = () => {
    siteHeader.style.setProperty("--header-top", banner ? `${banner.offsetHeight}px` : "0px");
  };
  const markStuck = () => siteHeader.classList.toggle("is-stuck", window.scrollY > 0 && siteHeader.getBoundingClientRect().top <= (banner ? banner.offsetHeight : 0));
  placeHeader();
  // The banner's height changes when the font loads or the screen turns.
  if (banner && "ResizeObserver" in window) new ResizeObserver(placeHeader).observe(banner);
  else window.addEventListener("resize", placeHeader);
  window.addEventListener("scroll", markStuck, { passive: true });
  markStuck();
}
updateCartCount();
updateWishlistCount();
updateMyOrdersLinks();
renderFeatured();
renderCategoryAvailability();
renderNeedTiles();
navigate();
