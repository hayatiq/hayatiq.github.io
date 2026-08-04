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
        
        // Track product detail views
        trackProductView(id, product?.name);
        renderDetail(id);
  } else if (hash.startsWith("#/products")) {
    routes.products.classList.add("active");
    const params = new URLSearchParams(hash.split("?")[1] || "");
    const cat = params.get("cat");
    renderProducts(cat);
    setPageMeta(
      `${cat ? cat + " " : ""}Products — Hayatiq`,
      `Shop ${cat ? cat.toLowerCase() + " " : ""}products from Hayatiq — handcrafted natural wellness essentials.`
    );
    resetProductJsonLd();
  } else if (hash === "#/categories") {
    routes.categories.classList.add("active");
    setPageMeta("Shop by Category — Hayatiq", "Browse Hayatiq's Skincare, Haircare, and Wellness product categories.");
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
    renderBestSellers();
    renderFeatured();
    setPageMeta(
      "Hayatiq — Handcrafted with Intention",
      "Hayatiq - Handcrafted natural wellness products. Premium magnesium oil, organic soaps, hair care serums, and skincare products made with intention in Bangladesh."
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
       Product Data
       ============================== */
const PRODUCTS = [
  {
    id: "1",
    name: "Magnesium oil spray 100 ml",
    subtitle: "30% Concentration",
    slug: "magnesium-oil",
    price: 360,
    category: "Wellness",
    images: [
      "./images/hayatiq_magnesium_oil.jpg",
      "./images/hayatiq_magnesium_oil_2.jpg",
      "./images/hayatiq_magnesium_oil_3.jpg",
    ],
    short: "Nature’s Calm in Every Spray",
    ingredients: ["Magnesium Chloride Brine ", "Lavender Essential Oil"],
    how: [
      "Daily Supplement: <b>Where</b>: Spread across arms, legs, stomach.; <b>How much</b>: 15–20 sprays total.; <b>When</b>: Split between morning & evening.;",
      "Muscle Cramps & Soreness:<b>Where</b>: Directly on cramped or sore muscles (calves, thighs, arms).; <b>How much</b>: 10–15 sprays.; <b>When</b>: During cramps, after workouts, or long days standing.; <b>Extra Tip</b>: Massage in for faster relief.;",
      "Sleep & Relaxation:<b>Where</b>: Soles of feet, back of neck, shoulders.; <b>How much</b>: 5–10 sprays.; <b>When</b>: 30 minutes before bedtime.; <b>Extra Tip</b>: Massage gently into skin for deeper relaxation.;",
      "Restless Legs Syndrome:<b>Where</b>: Calves, thighs.; <b>How much</b>: 10–15 sprays.; <b>When</b>: Before bedtime.;",
      "Bone & Joint Health:<b>Where</b>: Knees, elbows, lower back, wrists.; <b>How much</b>: 8–12 sprays.; <b>When</b>: Daily, preferably evening.;",
      "Headaches & Migraines:<b>Where</b>: Temples (lightly), back of neck, shoulders.; <b>How much</b>: 2–3 sprays.; <b>When</b>: At onset of headache/migraine.; <b>Extra Tip</b>: Soak feet in warm water + magnesium oil for additional relief. Spray on hand then rub it to temple.;",
      "Hair & Scalp Health:<b>Where</b>: Spray directly onto scalp (part hair).; <b>How much</b>: 5–8 sprays.; <b>When</b>: 2–3 times per week, before shower.; <b>Extra Tip</b>: Massage scalp, leave for 30 minutes, then wash.;",
      "Cramps & PMS Relief:<b>Where</b>: Lower abdomen, lower back.; <b>How much</b>: 8–12 sprays.; <b>When</b>: During cramps or PMS discomfort.; <b>Extra Tip</b>: Massage gently until absorbed.;",
      "Energy Boost & Fatigue Relief:<b>Where</b>: Arms, legs, stomach.; <b>How much</b>: 5–10 sprays.; <b>When</b>: Morning or mid-day slump.; <b>Extra Tip</b>: Pair with light stretching or deep breathing.;",
      "Deodorant:<b>Where</b>: Underarms (on clean, dry skin).; <b>How much</b>: 2–4 sprays per armpit.; <b>When</b>: Once daily (morning), reapply if needed.; <b>Extra Tip</b>: Wear clothing after fully absorbed.;",
      "Stress & Anxiety:<b>Where</b>: Chest, shoulders, behind ears (not too close to eyes).; <b>How much</b>: 5–8 sprays.; <b>When</b>: During stress, after work, or before meditation.;",
      "Exercise Recovery:<b>Where</b>: On exercised muscles (legs, arms, back).; <b>How much</b>: 10–15 sprays.; <b>When</b>: Right after workout or before bed.;",
    ],


    tips: [
      "Apply on clean skin, make sure there are no dead skin",
      "Consistent application is recommended for effective results",
      "A mild tingling sensation is normal and fades with regular use",
      "May dilute with water to ease tingling",
    ],
    
    warns: [
      "<b>Patch test first:</b>  Always test on a small area (inner wrist/leg) before first full use.", 
      "<b>For external use only:</b>  Do not ingest unless specifically formulated for oral use.",
      "<b>Avoid sensitive areas:</b>  Do not spray near eyes, mouth, broken skin, cuts, or freshly shaved skin.",
      "<b>Skin sensitivity:</b>  A mild tingling, itching, or warmth is normal for first-time users. If irritation persists, rinse off and dilute with water before reapplying."
    ],
    storage: [
      "Keep bottle tightly sealed. Store in a cool, dry placeaway from direct sunlight, heat, or children’s reach.",
      "Use within 6 months of manufacture."
    ],
    // Demo reviews — replace with real customer feedback as it comes in, see README.MD.
    reviews: [
      { name: "Nusrat Jahan", rating: 5, text: "This has genuinely improved my sleep. A few sprays on my feet before bed and I feel so much more relaxed — the scent is mild too, no irritation at all. Highly recommend!" },
      { name: "Rakibul Islam", rating: 4.5, text: "Using this for muscle cramps after workouts and it really helps. Had a bit of tingling the first couple of days but that faded quickly. Would love a bigger bottle option." },
    ],
    // Set to true to feature this product in the homepage "Best Sellers" section.
    bestSeller: true,
    // Set to "hot" / "new" / "sale" / "popular" (or leave null) — see README.MD.
    badge: null,
  },
  {
    id: "2",
    name: "Magnesium oil spray 100 ml",
    subtitle: "50% Concentration",
    slug: "magnesium-oil-50-concentration",
    price: 500,
    category: "Wellness",
    images: [
      "./images/magnesium-oil-50-concentration.jpeg",
      "./images/hayatiq_magnesium_oil_2.jpg",
      "./images/hayatiq_magnesium_oil_3.jpg",
    ],
    short: "Nature’s Calm in Every Spray",
    ingredients: ["Magnesium Chloride Brine ", "Lavender Essential Oil"],
    how: [
      "Daily Supplement: <b>Where</b>: Spread across arms, legs, stomach.; <b>How much</b>: 15–20 sprays total.; <b>When</b>: Split between morning & evening.;",
      "Muscle Cramps & Soreness:<b>Where</b>: Directly on cramped or sore muscles (calves, thighs, arms).; <b>How much</b>: 10–15 sprays.; <b>When</b>: During cramps, after workouts, or long days standing.; <b>Extra Tip</b>: Massage in for faster relief.;",
      "Sleep & Relaxation:<b>Where</b>: Soles of feet, back of neck, shoulders.; <b>How much</b>: 5–10 sprays.; <b>When</b>: 30 minutes before bedtime.; <b>Extra Tip</b>: Massage gently into skin for deeper relaxation.;",
      "Restless Legs Syndrome:<b>Where</b>: Calves, thighs.; <b>How much</b>: 10–15 sprays.; <b>When</b>: Before bedtime.;",
      "Bone & Joint Health:<b>Where</b>: Knees, elbows, lower back, wrists.; <b>How much</b>: 8–12 sprays.; <b>When</b>: Daily, preferably evening.;",
      "Headaches & Migraines:<b>Where</b>: Temples (lightly), back of neck, shoulders.; <b>How much</b>: 2–3 sprays.; <b>When</b>: At onset of headache/migraine.; <b>Extra Tip</b>: Soak feet in warm water + magnesium oil for additional relief. Spray on hand then rub it to temple.;",
      "Hair & Scalp Health:<b>Where</b>: Spray directly onto scalp (part hair).; <b>How much</b>: 5–8 sprays.; <b>When</b>: 2–3 times per week, before shower.; <b>Extra Tip</b>: Massage scalp, leave for 30 minutes, then wash.;",
      "Cramps & PMS Relief:<b>Where</b>: Lower abdomen, lower back.; <b>How much</b>: 8–12 sprays.; <b>When</b>: During cramps or PMS discomfort.; <b>Extra Tip</b>: Massage gently until absorbed.;",
      "Energy Boost & Fatigue Relief:<b>Where</b>: Arms, legs, stomach.; <b>How much</b>: 5–10 sprays.; <b>When</b>: Morning or mid-day slump.; <b>Extra Tip</b>: Pair with light stretching or deep breathing.;",
      "Deodorant:<b>Where</b>: Underarms (on clean, dry skin).; <b>How much</b>: 2–4 sprays per armpit.; <b>When</b>: Once daily (morning), reapply if needed.; <b>Extra Tip</b>: Wear clothing after fully absorbed.;",
      "Stress & Anxiety:<b>Where</b>: Chest, shoulders, behind ears (not too close to eyes).; <b>How much</b>: 5–8 sprays.; <b>When</b>: During stress, after work, or before meditation.;",
      "Exercise Recovery:<b>Where</b>: On exercised muscles (legs, arms, back).; <b>How much</b>: 10–15 sprays.; <b>When</b>: Right after workout or before bed.;",
    ],


    tips: [
      "Apply on clean skin, make sure there are no dead skin",
      "Consistent application is recommended for effective results",
      "A mild tingling sensation is normal and fades with regular use",
      "May dilute with water to ease tingling",
    ],
    
    warns: [
      "<b>Patch test first:</b>  Always test on a small area (inner wrist/leg) before first full use.", 
      "<b>For external use only:</b>  Do not ingest unless specifically formulated for oral use.",
      "<b>Avoid sensitive areas:</b>  Do not spray near eyes, mouth, broken skin, cuts, or freshly shaved skin.",
      "<b>Skin sensitivity:</b>  A mild tingling, itching, or warmth is normal for first-time users. If irritation persists, rinse off and dilute with water before reapplying."
    ],
    storage: [
      "Keep bottle tightly sealed. Store in a cool, dry placeaway from direct sunlight, heat, or children’s reach.",
      "Use within 6 months of manufacture."
    ],
    // Fill in real customer reviews here as they come in — see README.MD.
    reviews: [],
    // Set to true to feature this product in the homepage "Best Sellers" section.
    bestSeller: false,
    // Set to "hot" / "new" / "sale" / "popular" (or leave null) — see README.MD.
    badge: null,
  },
  {
    id: "3",
    name: "Loofah Soap Bar (Neem + Moringa)",
    slug: "loofah-soap",
    price: "Coming Soon",
    category: "Skincare",
    images: [
      "./images/hayatiq_loofah_soap.jpg",
      "https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?q=80&w=1200&auto=format&fit=crop",
    ],
    short: "Calming balm for pulse points & lips.",
    ingredients: ["Shea butter", "Lavender", "Beeswax"],
    how: ["Massage a small amount where needed."],
    tips: ["Shake well before Use", "as deodorant", "muscle relief"],
    warns: ["Avoid during allergy flare‑ups."],
    storage: [
      "Keep bottle tightly sealed. Store in a cool, dry placeaway from direct sunlight, heat, or children’s reach.",
      "Use within 6 months of manufacture."
    ],
    // Fill in real customer reviews here as they come in — see README.MD.
    reviews: [],
    // Set to true to feature this product in the homepage "Best Sellers" section.
    bestSeller: false,
    // Set to "hot" / "new" / "sale" / "popular" (or leave null) — see README.MD.
    badge: null,
  },
  {
    id: "4",
    name: "RoseMintClove Scalp Elixir",
    slug: "scalp-elixir",
    price: "Coming Soon",
    category: "Haircare",
    images: [
      "./images/rose_mint_clove_scalp_elixir.jpeg",
    ],
    short: "Calming balm for pulse points & lips.",
    ingredients: ["Shea butter", "Lavender", "Beeswax"],
    how: ["Massage a small amount where needed."],
    tips: ["Shake well before Use", "as deodorant", "muscle relief"],
    warns: ["Avoid during allergy flare‐ups."],
    storage: [
      "Keep bottle tightly sealed. Store in a cool, dry placeaway from direct sunlight, heat, or children’s reach.",
      "Use within 6 months of manufacture."
    ],
    // Fill in real customer reviews here as they come in — see README.MD.
    reviews: [],
    // Set to true to feature this product in the homepage "Best Sellers" section.
    bestSeller: false,
    // Set to "hot" / "new" / "sale" / "popular" (or leave null) — see README.MD.
    badge: null,
  },
  {
    id: "5",
    name: "Lash & Brow Serum",
    slug: "lash-brow-serum",
    price: "Coming Soon",
    category: "Skincare",
    images: [
      "./images/lash&brow_serum.jpeg",
    ],
    short: "Calming balm for pulse points & lips.",
    ingredients: ["Shea butter", "Lavender", "Beeswax"],
    how: ["Massage a small amount where needed."],
    tips: ["Shake well before Use", "as deodorant", "muscle relief"],
    warns: ["Avoid during allergy flare‐ups."],
    storage: [
      "Keep bottle tightly sealed. Store in a cool, dry placeaway from direct sunlight, heat, or children’s reach.",
      "Use within 6 months of manufacture."
    ],
    // Fill in real customer reviews here as they come in — see README.MD.
    reviews: [],
    // Set to true to feature this product in the homepage "Best Sellers" section.
    bestSeller: false,
    // Set to "hot" / "new" / "sale" / "popular" (or leave null) — see README.MD.
    badge: null,
  },
  {
    id: "6",
    name: "SilkRoot shampoo bar",
    slug: "silkroot-shampoo-bar",
    price: "Coming Soon",
    category: "Haircare",
    images: [
      "./images/SilkRoot_shampoo_bar.jpeg",
    ],
    short: "Calming balm for pulse points & lips.",
    ingredients: ["Shea butter", "Lavender", "Beeswax"],
    how: ["Massage a small amount where needed."],
    tips: ["Shake well before Use", "as deodorant", "muscle relief"],
    warns: ["Avoid during allergy flare‐ups."],
    storage: [
      "Keep bottle tightly sealed. Store in a cool, dry placeaway from direct sunlight, heat, or children’s reach.",
      "Use within 6 months of manufacture."
    ],
    // Fill in real customer reviews here as they come in — see README.MD.
    reviews: [],
    // Set to true to feature this product in the homepage "Best Sellers" section.
    bestSeller: false,
    // Set to "hot" / "new" / "sale" / "popular" (or leave null) — see README.MD.
    badge: null,
  },
  {
    id: "7",
    name: "FollicleFuel Scalp Tonic",
    slug: "folliclefuel-scalp-tonic",
    price: "Coming Soon",
    category: "Haircare",
    images: [
      "./images/FollicleFuel_Scalp_Tonic.jpeg",
    ],
    short: "Calming balm for pulse points & lips.",
    ingredients: ["Shea butter", "Lavender", "Beeswax"],
    how: ["Massage a small amount where needed."],
    tips: ["Shake well before Use", "as deodorant", "muscle relief"],
    warns: ["Avoid during allergy flare‐ups."],
    storage: [
      "Keep bottle tightly sealed. Store in a cool, dry placeaway from direct sunlight, heat, or children’s reach.",
      "Use within 6 months of manufacture."
    ],
    // Fill in real customer reviews here as they come in — see README.MD.
    reviews: [],
    // Set to true to feature this product in the homepage "Best Sellers" section.
    bestSeller: false,
    // Set to "hot" / "new" / "sale" / "popular" (or leave null) — see README.MD.
    badge: null,
  },
];

/* ==============================
       Rendering helpers
       ============================== */
const featuredGrid = document.getElementById("featuredGrid");
const bestSellerGrid = document.getElementById("bestSellerGrid");
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
};

function productCard(p) {
  const isComingSoon = typeof p.price === 'string' && p.price.toLowerCase().includes('coming soon');
  const badge = !isComingSoon && p.badge && BADGE_TYPES[p.badge];

  return `
      <article class="product-card" aria-label="${p.name}">
        <a href="#/product/${p.id}">
          <div class="product-media">
            <img loading="lazy" src="${p.images[0]}" alt="${p.name}">
            ${isComingSoon ? `<div class="coming-soon-overlay">Coming Soon</div>` : ''}
            ${badge ? `<span class="product-badge badge-${p.badge}"><i class="fa-solid ${badge.icon}" aria-hidden="true"></i> ${badge.label}</span>` : ''}
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

function renderBestSellers() {
  if (!bestSellerGrid) return;
  const section = bestSellerGrid.closest("section");
  const items = PRODUCTS.filter((p) => p.bestSeller);
  if (!items.length) {
    // Hide the whole section until the owner marks at least one product
    // bestSeller: true — an empty "Best Sellers" grid would look broken.
    if (section) section.style.display = "none";
    return;
  }
  if (section) section.style.display = "";
  bestSellerGrid.innerHTML = items.map(productCard).join("");
}

function renderProducts(category) {
  let items = PRODUCTS;
  if (category) items = items.filter((p) => p.category === category);
  productsGrid.innerHTML = items.map(productCard).join("");
  productCount.textContent = `${items.length} item${
    items.length !== 1 ? "s" : ""
  }`;
}

function accordionItem(title, arr, { open = false } = {}) {
  // No shared `name` grouping on purpose — an exclusive accordion (opening one
  // auto-closes another) meant clicking a section far down the page could cause a
  // large section elsewhere to snap shut instantly, jumping the whole layout. Each
  // section now opens/closes independently, only ever affecting its own space.
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
        ${main ? `<img src="${main}" alt="${p.name}" class="coming-soon-image">` : ''}
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
  }"></div>
          <div class="thumbs" id="thumbs">
            ${p.images
              .map(
                (src, i) =>
                  `<img src="${src}" alt="${p.name} ${i + 1}" class="${
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
            <a class="btn button-ghost" href="https://m.me/hayatiq.life" target="_blank"><i class="fa-brands fa-facebook-messenger"></i> Message</a>
            <button class="wishlist-toggle wishlist-toggle-inline ${isWishlisted(p.id) ? 'active' : ''}" data-id="${p.id}" aria-label="Add to wishlist" onclick="event.preventDefault(); toggleWishlist('${p.id}');"><i class="fa-solid fa-heart"></i></button>
          </div>
          <div class="usp-strip">
            <div class="usp-badge"><span aria-hidden="true">🌿</span> Natural</div>
            <div class="usp-badge"><span aria-hidden="true">✋</span> Handmade</div>
            <div class="usp-badge"><span aria-hidden="true">✅</span> Quality Checked</div>
            <div class="usp-badge"><span aria-hidden="true">💵</span> Cash on Delivery</div>
          </div>
          <p class="muted" style="font-size:.85rem;">🚚 Delivery: Inside Dhaka ৳${
            SHIPPING_RATES.inside_dhaka
          } · Outside Dhaka ৳${SHIPPING_RATES.outside_dhaka}</p>

          <div class="accordion-group">
            <details class="accordion-item" open>
              <summary>How to Use</summary>
              <div class="accordion-panel">${renderHowToUseTags(p.how)}</div>
            </details>
            ${accordionItem("Ingredients", p.ingredients)}
            ${accordionItem("Cautions", p.warns)}
            ${accordionItem("For Optimal Benefits", p.tips)}
            ${accordionItem("Storage", p.storage)}
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
                          <p class="muted">${r.text}</p>
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

  // Image zoom functionality
  mainImg.addEventListener('click', (e) => {
    e.stopPropagation();
    mainImg.parentElement.classList.toggle('zoomed');
  });

  // Close zoom when clicking outside
  document.addEventListener('click', (e) => {
    if (mainImg.parentElement.classList.contains('zoomed') && 
        !e.target.closest('.gallery-main')) {
      mainImg.parentElement.classList.remove('zoomed');
    }
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
    // No drawer opens on this path (e.g. the marketing "take me to checkout" flow),
    // so the toast is the only add-to-cart confirmation the user sees.
    showToast && toast(`${PRODUCTS.find((x) => x.id === id)?.name || "Item"} added to cart`);
    setTimeout(() => {
      window.location.href = redirect;
    }, 1500);
  }
  // Adding to cart no longer auto-opens the drawer — the floating cart button's
  // live count/total (updated via setCart() above) is the confirmation. The drawer
  // only opens when the user explicitly taps the floating button or a header cart icon.
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
  // Sync every rendered heart button for this id (a product can appear in both
  // Best Sellers and Featured Products on the home view at once) instead of
  // re-rendering every grid, which would also blow away detail-page gallery state.
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

// New: update quantity controls
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
      <img src="${p.images[0]}" alt="${
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
  if (e.key === "Escape") closeCartDrawer();
});
  // toggle expand for how to use
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
        <img src="${p.images[0]}" alt="${p.name}" class="checkout-item-img">
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
navigate();
