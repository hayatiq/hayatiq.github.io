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
};

function setActiveNav(hash) {
  document.querySelectorAll(".nav-links a[data-link]").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === hash);
  });
  // Close mobile menu after navigation
  primaryNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

function navigate() {
  const hash = location.hash || "#/";
  Object.values(routes).forEach((v) => v.classList.remove("active"));

  if (hash.startsWith("#/product/")) {
    routes.detail.classList.add("active");
    const id = hash.split("/")[2];
    renderDetail(id);
  } else if (hash.startsWith("#/products")) {
    routes.products.classList.add("active");
    const params = new URLSearchParams(hash.split("?")[1] || "");
    const cat = params.get("cat");
    renderProducts(cat);
  } else if (hash === "#/categories") {
    routes.categories.classList.add("active");
  } else if (hash === "#/contact") {
    routes.contact.classList.add("active");
  } else if (hash === "#/about") {
    routes.about.classList.add("active");
  } else if (hash === "#/cart") {
    routes.cart.classList.add("active");
    renderCart();
  } else if (hash === "#/checkout") {
    routes.checkout.classList.add("active");
  } else {
    routes.home.classList.add("active");
    renderFeatured();
  }
  setActiveNav(hash);
  // Move focus for accessibility
  document.getElementById("app").focus();
}

window.addEventListener("hashchange", navigate);

/* ==============================
       Dummy Product Data
       ============================== */
const PRODUCTS = [
  {
    id: "1",
    name: "Magnesium oil spray 100ml",
    slug: "magnesium-oil",
    price: 360,
    category: "Skincare",
    images: [
      "./images/placeholder.webp",
      "./images/placeholder.webp",
      "./images/placeholder.webp",
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
  },
  {
    id: "2",
    name: "Loofah Soap Bar (Neem + Moringa)",
    slug: "loofah-soap",
    price: "Coming Soon",
    category: "Wellness",
    images: [
      "./images/placeholder.webp",
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
  },
];

/* ==============================
       Rendering helpers
       ============================== */
const featuredGrid = document.getElementById("featuredGrid");
const productsGrid = document.getElementById("productsGrid");
const productCount = document.getElementById("productCount");
const detailWrap = document.getElementById("detailWrap");

function money(n) {
  if (typeof n === "string") {
    return n;
  }
  return `৳${n.toFixed(2)}`;
}

function productCard(p) {
  const isComingSoon = typeof p.price === 'string' && p.price.toLowerCase().includes('coming soon');
  
  return `
      <article class="product-card" aria-label="${p.name}">
        <a href="#/product/${p.id}">
          <div class="product-media">
            <img loading="lazy" src="${p.images[0]}" alt="${p.name}">
            ${isComingSoon ? `<div class="coming-soon-overlay">Coming Soon</div>` : ''}
            <div class="product-overlay">
              <div class="product-actions">
                <button class="btn quick-view" onclick="event.preventDefault(); location.hash='#/product/${p.id}';">Quick View</button>
                ${!isComingSoon ? `<button class="btn button-primary" onclick="event.preventDefault(); addToCart('${p.id}');">Add to Cart</button>` : ''}
              </div>
            </div>
          </div>
          <div class="product-body">
            <div class="product-name">${p.name}</div>
            <div class="product-price">${money(p.price)}</div>
            <a href="https://m.me/hayatiq.lif?ref=${p.slug}" 
              target="_blank" 
              class="btn messenger-btn">
              <i class="fa-brands fa-facebook-messenger"></i> Message
            </a>
          </div>
        </a>
      </article>`;
}

function renderFeatured() {
  if (!featuredGrid) return;
  featuredGrid.innerHTML = PRODUCTS.slice(0, 8).map(productCard).join("");
}

function renderProducts(category) {
  let items = PRODUCTS;
  if (category) items = items.filter((p) => p.category === category);
  productsGrid.innerHTML = items.map(productCard).join("");
  productCount.textContent = `${items.length} item${
    items.length !== 1 ? "s" : ""
  }`;
}

function detailList(title, arr) {
  return `<div class="soft-card"><strong>${title}</strong><ul>${arr
    .map((i) => `<li>${i}</li>`)
    .join("")}</ul></div>`;
}

/* ==============================
       Reviews (localStorage per product)
       ============================== */
const REVIEWS_KEY = "hayatiq_reviews";
function getAllReviews() {
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function setAllReviews(map) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(map));
}
function getReviewsFor(id) {
  const m = getAllReviews();
  return m[id] || [];
}
function addReview(id, review) {
  const m = getAllReviews();
  m[id] = [...(m[id] || []), review];
  setAllReviews(m);
}
function averageRating(list) {
  if (!list.length) return 0;
  return list.reduce((n, r) => n + Number(r.rating || 0), 0) / list.length;
}
function stars(n) {
  const full = Math.round(n);
  return "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full); /* visual width stable */
}

function renderDetail(id) {
  const p = PRODUCTS.find((x) => x.id === id) || PRODUCTS[0];
  const isComingSoon = typeof p.price === 'string' && p.price.toLowerCase().includes('coming soon');
  
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
  
  // Rest of your existing detail rendering code...
  const [main] = p.images;
  const reviews = getReviewsFor(p.id);
  const avg = averageRating(reviews);
  detailWrap.innerHTML = `
        <div class="gallery">
          <div class="gallery-main"><img id="mainImg" src="${main}" alt="${
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
            <div class="product-price" style="font-size:1.1rem;">${money(
              p.price
            )}</div>
            <p class="muted">${p.short}</p>
            <div class="muted" aria-label="Average rating"><span class="stars" title="Average: ${avg.toFixed(
              1
            )}">${stars(avg)}</span> <small>(${reviews.length} review${
    reviews.length !== 1 ? "s" : ""
  })</small></div>
          </div>
          <div style="display:flex; gap:.6rem; flex-wrap:wrap;">
            <!-- <button class="btn button-primary" onclick="addToCart('${
              p.id
            }')">Add to Cart</button> -->
            <a class="btn button-primary" href="https://m.me/hayatiq.life" target="_blank"><i class="fa-brands fa-facebook-messenger"></i> Message</a>
            <button class="btn button-ghost" onclick="event.preventDefault(); addToCart('${p.id}');">Add to Cart</button>
          </div>
          ${detailList("Ingredients", p.ingredients)}
          <!-- how to use -->
          <!-- ${detailList("How to use", p.how)} old -->
          <!-- new -->
          <div class="soft-card">
            <strong>How to use</strong>
            ${renderHowToUseTags(p.how)}
          </div>
          ${detailList("For Optimal Benefits", p.tips)}
          <!--<div class="soft-card"><strong>How to use</strong><p style="margin-top:.4rem;">${
            p.how
          }</p></div> -->
          ${detailList("Cautions", p.warns)}
          ${detailList("Storage", p.storage)}
          
          <!--<div class="soft-card">
            <h3 style="margin-bottom:.4rem;">Customer Reviews</h3>
            <div id="reviewList" class="reviews">${
              reviews.length
                ? reviews
                    .map(
                      (r) =>
                        `<div class='review-item'><strong>${
                          r.name
                        }</strong> — <span class='stars'>${stars(
                          r.rating
                        )}</span><p class='muted' style='margin-top:.3rem;'>${
                          r.text
                        }</p><small class='muted'>${new Date(
                          r.created
                        ).toLocaleString()}</small></div>`
                    )
                    .join("")
                : '<p class="muted">No reviews yet. Be the first!</p>'
            }</div>
            <form id="reviewForm" style="margin-top:.8rem; display:grid; gap:.5rem;">
              <div class="field"><label for="revName">Name</label><input id="revName" placeholder="Your name" required></div>
              <div class="field"><label for="revRating">Rating</label>
                <select id="revRating" required>
                  <option value="">Select rating</option>
                  <option value="5">★★★★★</option>
                  <option value="4">★★★★☆</option>
                  <option value="3">★★★☆☆</option>
                  <option value="2">★★☆☆☆</option>
                  <option value="1">★☆☆☆☆</option>
                </select>
              </div>
              <div class="field"><label for="revText">Review</label><textarea id="revText" rows="4" placeholder="Share your thoughts" required></textarea></div>
              <button class="btn button-primary" type="submit">Submit Review</button>
            </form>
          </div> -->
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

  // review submit handler
  // const form = document.getElementById("reviewForm");
  // const listEl = document.getElementById("reviewList");
  // form.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   const name = document.getElementById("revName").value.trim();
  //   const rating = Number(document.getElementById("revRating").value);
  //   const text = document.getElementById("revText").value.trim();
  //   if (!name || !rating || !text) return;
  //   const review = { name, rating, text, created: new Date().toISOString() };
  //   addReview(p.id, review);
  //   // refresh
  //   const rs = getReviewsFor(p.id);
  //   listEl.innerHTML = rs
  //     .map(
  //       (r) =>
  //         `<div class='review-item'><strong>${
  //           r.name
  //         }</strong> — <span class='stars'>${stars(
  //           r.rating
  //         )}</span><p class='muted' style='margin-top:.3rem;'>${
  //           r.text
  //         }</p><small class='muted'>${new Date(
  //           r.created
  //         ).toLocaleString()}</small></div>`
  //     )
  //     .join("");
  //   form.reset();
  //   toast("Thanks for your review!");
  // });

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
}
function addToCart(id) {
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
  toast(`${PRODUCTS.find((x) => x.id === id)?.name || "Item"} added to cart`);
  setTimeout(() => {
    window.location.href = "#/cart";
  }, 1500);
}
function removeFromCart(id) {
  setCart(getCart().filter((i) => i.id !== id));
  renderCart();
}
function clearCart() {
  setCart([]);
  renderCart();
}
function updateCartCount() {
  const count = getCart().reduce((n, i) => n + i.qty, 0);
  document.querySelectorAll(".cart-count").forEach(el => el.textContent = count);
}

// New: update quantity controls
function updateQty(id, qty) {
  qty = Math.max(1, Math.min(99, Number(qty) || 1));
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = qty;
  setCart(cart);
  renderCart();
}
function incQty(id) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.min(99, (item.qty || 1) + 1);
  setCart(cart);
  renderCart();
}
function decQty(id) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) - 1);
  setCart(cart);
  renderCart();
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
    .map((row) => {
      const p = PRODUCTS.find((x) => x.id === row.id);
      return `<div style="display:grid; grid-template-columns: 64px 1fr auto; gap:.6rem; align-items:center; padding:.5rem 0; border-bottom:1px solid rgba(16,15,15,.06);">
          <img src="${p.images[0]}" alt="${
        p.name
      }" style="width:64px; height:64px; object-fit:cover; border-radius:10px;">
          <div>
            <div style="font-weight:600;">${p.name}</div>
            <div class="qty" aria-label="Quantity controls">
              <button onclick="decQty('${
                row.id
              }')" aria-label="Decrease quantity">−</button>
              <input type="number" min="1" max="99" value="${
                row.qty
              }" onchange="updateQty('${row.id}', this.value)" />
              <button onclick="incQty('${
                row.id
              }')" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:.4rem;">
            <strong>${money(p.price * row.qty)}</strong>
            <button class="close-btn" title="Remove" onclick="removeFromCart('${
              row.id
            }')">✕</button>
          </div>
        </div>`;
    })
    .join("");
  const total = list.reduce((sum, row) => {
    const p = PRODUCTS.find((x) => x.id === row.id);
    return sum + p.price * row.qty;
  }, 0);
  document.getElementById("cartTotal").textContent = money(total);
}
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

/* ==============================
       Toast
       ============================== */
const toastBox = document.createElement("div");
toastBox.style.position = "fixed";
toastBox.style.bottom = "16px";
toastBox.style.left = "50%";
toastBox.style.transform = "translateX(-50%)";
toastBox.style.zIndex = "100";
document.body.appendChild(toastBox);
function toast(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.background = "var(--color-seal-brown)";
  el.style.color = "var(--color-white)";
  el.style.padding = "10px 14px";
  el.style.borderRadius = "12px";
  el.style.boxShadow = "var(--shadow-card)";
  el.style.marginTop = "8px";
  toastBox.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .5s";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 500);
  }, 1200);
}

/* ==============================
       Init
       ============================== */
document.getElementById("year").textContent = new Date().getFullYear();
updateCartCount();
renderFeatured();
navigate();
