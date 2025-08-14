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
};

function setActiveNav(hash) {
  document.querySelectorAll(".nav-links a[data-link]").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === hash);
  });
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
    name: "Rose Glow Serum",
    price: 24.0,
    category: "Skincare",
    images: [
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618473963526-87b11925bdf1?q=80&w=1200&auto=format&fit=crop",
    ],
    short: "A lightweight serum for daily radiance.",
    ingredients: ["Rosehip oil", "Squalane", "Vitamin E"],
    how: "Apply 2–3 drops to clean skin.",
    pros: ["Lightweight", "Glowy finish", "Fast absorbing"],
    cons: ["Not fragrance‑free"],
    warns: ["Patch test before use."],
  },
  {
    id: "2",
    name: "Lavender Cloud Balm",
    price: 18.5,
    category: "Wellness",
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?q=80&w=1200&auto=format&fit=crop",
    ],
    short: "Calming balm for pulse points & lips.",
    ingredients: ["Shea butter", "Lavender", "Beeswax"],
    how: "Massage a small amount where needed.",
    pros: ["Soothing", "Multi‑use"],
    cons: ["Contains beeswax"],
    warns: ["Avoid during allergy flare‑ups."],
  },
  {
    id: "3",
    name: "Citrus Hair Oil",
    price: 22.0,
    category: "Haircare",
    images: [
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571782742478-0816a4773a10?q=80&w=1200&auto=format&fit=crop",
    ],
    short: "Nourishing oil for shine & scalp care.",
    ingredients: ["Argan oil", "Sweet orange", "Jojoba"],
    how: "Warm a few drops and apply to ends.",
    pros: ["Adds shine", "Smells fresh"],
    cons: ["May feel heavy if overused"],
    warns: ["Keep away from eyes."],
  },
  {
    id: "4",
    name: "Oat Milk Cleanser",
    price: 16.0,
    category: "Skincare",
    images: [
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop",
    ],
    short: "Gentle daily cleanser for sensitive skin.",
    ingredients: ["Colloidal oats", "Glycerin", "Aloe"],
    how: "Massage into damp skin, rinse.",
    pros: ["Very gentle", "Non‑stripping"],
    cons: ["Not waterproof‑makeup remover"],
    warns: ["External use only."],
  },
  {
    id: "5",
    name: "Mint Scalp Tonic",
    price: 14.75,
    category: "Haircare",
    images: [
      "https://images.unsplash.com/photo-1611175694985-b42b0312627b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1200&auto=format&fit=crop",
    ],
    short: "Refreshing tonic to awaken the scalp.",
    ingredients: ["Peppermint", "Witch hazel", "Panthenol"],
    how: "Spritz onto clean scalp as needed.",
    pros: ["Cooling", "Lightweight"],
    cons: ["Cooling can tingle"],
    warns: ["Do not use on broken skin."],
  },
  {
    id: "6",
    name: "Vanilla Body Polish",
    price: 19.25,
    category: "Wellness",
    images: [
      "https://images.unsplash.com/photo-1512203492609-8f9fef3608f9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=1200&auto=format&fit=crop",
    ],
    short: "Sugar scrub for buttery‑soft skin.",
    ingredients: ["Sugar", "Coconut oil", "Vanilla"],
    how: "Massage on damp skin, rinse.",
    pros: ["Softens", "Smells warm"],
    cons: ["Can be slippery"],
    warns: ["Rinse shower thoroughly."],
  },
  {
    id: "7",
    name: "Ceramide Cream",
    price: 26.0,
    category: "Skincare",
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e8a6c69b0?q=80&w=1200&auto=format&fit=crop",
    ],
    short: "Barrier‑supportive daily moisturizer.",
    ingredients: ["Ceramides", "Niacinamide", "Hyaluronic acid"],
    how: "Apply to face & neck morning & night.",
    pros: ["Plump skin", "Supports barrier"],
    cons: ["Richer texture"],
    warns: ["Discontinue if irritation occurs."],
  },
  {
    id: "8",
    name: "Bath Tea Soak",
    price: 15.0,
    category: "Wellness",
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop",
    ],
    short: "Herbal soak for a serene bath.",
    ingredients: ["Chamomile", "Epsom salt", "Calendula"],
    how: "Steep in warm bath 10 minutes.",
    pros: ["Deeply relaxing"],
    cons: ["Not for small tubs"],
    warns: ["May increase drowsiness."],
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
  return `$${n.toFixed(2)}`;
}

function productCard(p) {
  return `
      <article class="product-card" aria-label="${p.name}">
        <a href="#/product/${p.id}">
          <div class="product-media">
            <img loading="lazy" src="${p.images[0]}" alt="${p.name}">
            <div class="product-overlay">
              <div class="product-actions">
                <button class="btn quick-view" onclick="event.preventDefault(); location.hash='#/product/${
                  p.id
                }';">Quick View</button>
                <button class="btn button-primary" onclick="event.preventDefault(); addToCart('${
                  p.id
                }');">Add to Cart</button>
              </div>
            </div>
          </div>
          <div class="product-body">
            <div class="product-name">${p.name}</div>
            <div class="product-price">${money(p.price)}</div>
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
  return `<div class="soft-card"><strong>${title}</strong><ul style="margin:.4rem 0 0 1rem; padding:0;">${arr
    .map((i) => `<li>${i}</li>`)
    .join("")}</ul></div>`;
}

function renderDetail(id) {
  const p = PRODUCTS.find((x) => x.id === id) || PRODUCTS[0];
  const [main, ...rest] = p.images;
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
          </div>
          <div style="display:flex; gap:.6rem; flex-wrap:wrap;">
            <button class="btn button-primary" onclick="addToCart('${
              p.id
            }')">Add to Cart</button>
            <a class="btn button-ghost" href="#/products">Back to Products</a>
          </div>
          ${detailList("Ingredients", p.ingredients)}
          <div class="soft-card"><strong>How to use</strong><p style="margin-top:.4rem;">${
            p.how
          }</p></div>
          ${detailList("Pros", p.pros)}
          ${detailList("Cons", p.cons)}
          ${detailList("Warnings / Precautions", p.warns)}
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
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  setCart(cart);
  // small toast
  const p = PRODUCTS.find((x) => x.id === id);
  toast(`${p?.name || "Item"} added to cart`);
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
  document.getElementById("cartCount").textContent = count;
}
function renderCart() {
  const holder = document.getElementById("cartItems");
  const list = getCart();
  if (list.length === 0) {
    holder.innerHTML = '<p class="muted">Your cart is empty.</p>';
    document.getElementById("cartTotal").textContent = "$0.00";
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
          <div style="display:flex; align-items:center; gap:.4rem; margin-top:.3rem;">
            <button class="btn" style="padding:0.2rem 0.4rem;" onclick="updateQty('${
              row.id
            }', ${row.qty - 1})">−</button>
            <span>${row.qty}</span>
            <button class="btn" style="padding:0.2rem 0.4rem;" onclick="updateQty('${
              row.id
            }', ${row.qty + 1})">+</button>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:.4rem;">
          <strong>${money(p.price * row.qty)}</strong>
          <button class="btn" title="Remove" onclick="removeFromCart('${
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

function updateQty(id, newQty) {
  if (newQty < 1) {
    removeFromCart(id);
    return;
  }
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) item.qty = newQty;
  setCart(cart);
  renderCart();
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

document.querySelector(".mobile-nav-toggle").addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("active");
});
