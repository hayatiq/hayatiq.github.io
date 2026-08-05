# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Hayatiq is a static, single-page e-commerce marketing site for a handmade natural-wellness product brand (Bangladesh). There is no build step, no package manager, and no backend — it's plain HTML/CSS/JS deployed as static files (to Netlify, per the canonical URL in `index.html`).

## Development

There is no build/lint/test tooling in this repo. To develop, just open/serve `index.html` directly, e.g.:

```bash
python3 -m http.server 8000
```

Then browse to `http://localhost:8000`. Reload the page after editing any file — there's no hot reload.

## Architecture

Everything is driven from three plain scripts loaded by `index.html`, in this order: `js/visitor.js`, `js/script.js`, then (after CDN scripts) `js/partial.js`.

### `js/script.js` — app core
- **Hash-based SPA router** (`navigate()`): all "pages" are `<section id="view-*">` elements in `index.html` that get shown/hidden by toggling an `active` class based on `location.hash` (`#/`, `#/products`, `#/product/:id`, `#/categories`, `#/contact`, `#/about`, `#/cart`, `#/checkout`). The `#/products` route also reads `?cat=` and `?concern=` query params to filter the grid. There is no history/state management beyond the hash.
- **`PRODUCTS` array**: the entire product catalog is hardcoded in this file as plain JS objects (no CMS/database). See "Adding a product" below.
- **`TESTIMONIALS` array**: site-wide (not per-product) social proof — Messenger/Facebook screenshots or general feedback not tied to one SKU. Ships empty; `renderTestimonials()` hides the homepage "Customer Love" section entirely while it's empty. Currently seeded with demo-labeled preview entries (commented `DEMO PREVIEW DATA`) — replace with real content before launch.
- **Homepage sections** (`#view-home`, in order): Hero → Trust Bar → Top Selling Products (carousel, `renderTopProducts()`/`topProducts()` — best sellers first, then other live products, "Coming Soon" only as filler) → Customer Love (carousel, `renderTestimonials()`) → Shop Our Products (full grid, `renderFeatured()`) → Shop by Category → Find the Right Product (`NEED_TILES`/`renderNeedTiles()` — "shop by need" tiles matched against each product's `concerns` array) → How to Order → What Happens After Ordering → FAQ → About → Contact teaser.
- **Category/need availability**: categories and need tiles are never hidden, even at zero live products — `liveProductCount()`/`renderCategoryAvailability()` label each with a live count or "Coming Soon", and an empty category/need page shows a "Notify Me" Messenger banner (`notifyMeLink()`, `ref=notify-{topic}`).
- **Rendering**: functions like `renderFeatured`, `renderTopProducts`, `renderNeedTiles`, `renderProducts`, `renderDetail`, `renderTestimonials`, `renderCart`, `renderCheckoutItems` build HTML strings and inject via `innerHTML` directly into DOM containers (`featuredGrid`, `topProductsGrid`, `needTilesGrid`, `productsGrid`, `detailWrap`, `testimonialGrid`, `cartItems`, `checkoutItems`). Inline `onclick="..."` handlers (e.g. `addToCart('id')`) are used throughout instead of addEventListener-based delegation for dynamically rendered markup. The two homepage carousels (Top Selling Products, Customer Love) are plain CSS scroll-snap, driven by a shared `scrollCarousel()` helper (`scrollTopProducts()`/`scrollTestimonials()` wrappers) — no JS carousel library.
- **Product card badges** (`BADGE_TYPES`, `productCard()`): `badge` field (`"hot"`/`"new"`/`"sale"`/`"popular"`) shows a fixed-color badge; `bestSeller: true` auto-applies a gold "Best Seller" badge when no explicit `badge` is set. Coming-soon cards show an "Ask about this" Messenger button instead of a badge/wishlist control.
- **Image lightbox** (`openImageLightbox()`/`closeImageLightbox()`, `#imageLightbox` in `index.html`): shared full-size viewer for the product detail gallery image and any review/testimonial photo; closes on backdrop click, its ✕ button, or Escape (shared `keydown` listener with the cart drawer).
- **Cart & reviews persistence**: both use `localStorage` directly (`hayatiq_cart`, `hayatiq_reviews` keys) — there is no server-side cart/order storage. Per-product reviews (`reviews: []` on a product) support optional `image`/`source` fields for photo proof and provenance (e.g. `"Messenger"`).
- **Checkout/contact forms** submit via FormSubmit (`https://formsubmit.co/...`) using `axios` (loaded from CDN) — see `js/partial.js`. There's client-side rate limiting via `localStorage` timestamps (contact: 3/hour, orders: 5/20min) and Bangladeshi phone number validation (`/^01[3-9]\d{8}$/`).
- Toasts/alerts use SweetAlert2 (`Swal`, loaded from CDN) via `toast()`/`toastBox()` helpers.

### `js/visitor.js` — behavioral analytics
Tracks visitor session behavior entirely client-side (page views/durations, product views, cart actions, social clicks, form field completion) into `localStorage` (`user_behavior`, `current_visit_data` keys), then emails a plain-text summary via FormSubmit on tab-hide/unload (`sendVisitEmail`). Also drives timed marketing popups: a "product alert" Swal after `TIMING.productViewMinTime` on a product page, and a "checkout alert" (discount hint) on the checkout page — both rate-limited via `TIMING` cooldowns. When editing checkout/product flows, be aware this file listens for the same `hashchange` event and DOM elements as `script.js`.

### `js/partial.js`
Wires the contact form and checkout form `submit` handlers (FormSubmit + axios POST, rate limiting, validation). Kept separate from `script.js` and loaded after the SweetAlert2/axios CDN `<script>` tags in `index.html`, so it can assume those globals exist.

### Styling
`css/style.css` defines the design system as CSS custom properties at the top (`--color-earth`, `--color-almond`, `--color-night`, `--radius`, `--shadow-soft`, etc.) — reuse these tokens rather than hardcoding new colors/shadows.

### External dependencies (all via CDN, no npm)
SweetAlert2, axios, Font Awesome, Google Fonts (Outfit, Dancing Script), plus a third-party visitor-counter widget (freevisitorcounters.com) embedded at the bottom of `index.html`.

## Adding a product

Products live only in the `PRODUCTS` array in `js/script.js`. All keys are required on every product object: `id`, `name`, `slug`, `price`, `category`, `images`, `short`, `ingredients`, `how`, `tips`, `warns`, `storage` (`subtitle`, `concerns`, `badge`, `bestSeller` are optional). Notes:
- `price`: a number makes the product live/purchasable; the string `"Coming Soon"` disables the buy button and shows a coming-soon detail view instead (see `isComingSoon` checks in `productCard`/`renderDetail`).
- `category` must match one of the categories rendered in the `#view-categories` section of `index.html`; add a new category block there if introducing one.
- `concerns` (optional array, e.g. `["Better Sleep", "Muscle Recovery"]`) drives the homepage "Find the Right Product" tiles — base tags on the product's own `how`/`tips` guidance, not guesswork; add a matching entry to `NEED_TILES` if introducing a new tag.
- `how` entries use a `"Tab Name: point one; point two;"` string format parsed by `renderHowToUseTags()` into tabbed panels — keep the `:` and `;` delimiters when adding entries.
- Messenger buttons link to `https://m.me/hayatiq.life?ref=<slug>` (product detail) or `ref=notify-<category>` (category/need "Notify Me" links) — the ManyChat automation on that account keys off this `ref` parameter (see README.MD for setting up new automations per product/ref).

## Other project docs

`README.MD` documents non-code setup: configuring ManyChat Messenger automations per product/notify ref, configuring FormSubmit for form emails, and the full `PRODUCTS`/`reviews`/`TESTIMONIALS`/badge field reference. Read it before changing form `action` URLs, Messenger ref links, or adding products/reviews/badges.
