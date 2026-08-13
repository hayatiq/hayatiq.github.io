# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Hayatiq is a static, single-page e-commerce marketing site for a handmade natural-wellness product brand (Bangladesh). There is no build step, no package manager, and no backend — it's plain HTML/CSS/JS deployed as static files (to Netlify, per the canonical URL in `index.html`). Routing uses real paths via the History API (e.g. `/product/conditioner-bar`), not hash fragments — `_redirects` (`/* /index.html 200`) is what makes Netlify serve `index.html` for those paths instead of 404ing, and `<base href="/">` in `index.html` is what keeps every `./`-relative asset reference (its own CSS/script tags, every product image path) resolving against the site root instead of the current route's path.

## Development

There is no build/lint/test tooling in this repo. To develop, just open/serve `index.html` directly, e.g.:

```bash
python3 -m http.server 8000
```

Then browse to `http://localhost:8000`. Reload the page after editing any file — there's no hot reload.

`python3 -m http.server` (and VS Code's Live Server extension, the other common way to preview this repo) has no SPA fallback, so either one 404s ("Cannot GET /product/...") if you type/paste/refresh a nested path directly (e.g. `/product/solid-conditioner-bar`) — it's looking for a real file at that path and there isn't one. Clicking through the app itself is unaffected, since that's all client-side routing (see the router in `js/script.js`), and it won't happen on the real Netlify deployment either (`_redirects` handles the fallback there). To test deep links/refreshes on nested paths locally the way Netlify serves them in production, run `npx serve -s .` instead and browse to the port it prints.

## Architecture

Everything is driven from four plain scripts loaded by `index.html`, in this order: `js/visitor.js`, `js/products.js`, `js/script.js`, then (after CDN scripts) `js/partial.js`. None of these use ES module syntax — they're classic `<script>` tags that share one global scope, which is how `js/script.js` can reference `PRODUCTS` without an explicit import.

### `js/products.js` — product data
Just the `PRODUCTS` array (plus the small `PLACEHOLDER_WARNS`/`PLACEHOLDER_STORAGE` constants it uses) and the `display_order` sort — kept separate from `js/script.js` so editing the catalog (listing, pricing, images) never requires touching rendering code. Loaded before `js/script.js` so `PRODUCTS` is a defined global by the time any render function runs. See "Adding a product" below.

### `js/script.js` — app core
- **Path-based SPA router** (`navigate()`): all "pages" are `<section id="view-*">` elements in `index.html` that get shown/hidden by toggling an `active` class based on `location.pathname` (`/`, `/products`, `/product/:slug`, `/categories`, `/contact`, `/about`, `/cart`, `/checkout`, `/wishlist`). The `/products` route also reads `?cat=` and `?concern=` query params to filter the grid. A document-level click listener intercepts clicks on same-origin `href="/..."` links and drives them through `history.pushState` + `navigate()` instead of a full page load (`goTo(path)`); the browser back/forward buttons fire a native `popstate`, which also calls `navigate()` directly. `navigate()` dispatches a `route-changed` `CustomEvent` on every call (initial load, link click, or popstate) — `js/visitor.js` listens for that instead of `hashchange` to track page views. `setPageMeta()` updates `<title>`, the description/keywords meta tags, `<link rel="canonical">`, and the Open Graph/Twitter tags per route, using each route's real path so every page gets its own canonical URL instead of all pages pointing at the homepage. Any path that isn't a known route, or a `/product/:slug` that doesn't match a real product, renders `#view-notfound` (`renderNotFound()`) instead of silently falling back to the homepage or the wrong product — that view's meta tags are set to `noindex, nofollow` (the server still returns HTTP 200 for it either way, since Netlify's `_redirects` fallback has no way to return a real 404 status without a serverless function).
- **`PRODUCTS` array**: the entire product catalog, defined in `js/products.js` (see above) — no CMS/database.
- **`TESTIMONIALS` array**: site-wide (not per-product) social proof — Messenger/Facebook screenshots or general feedback not tied to one SKU. Ships empty; `renderTestimonials()` hides the homepage "Customer Love" section entirely while it's empty. Currently seeded with demo-labeled preview entries (commented `DEMO PREVIEW DATA`) — replace with real content before launch.
- **Homepage sections** (`#view-home`, in order): Hero → Trust Bar → Top Selling Products (carousel, `renderTopProducts()`/`topProducts()` — strictly opt-in: shows only products with `topSelling: true`, no automatic fallback, and the whole section hides itself when nothing is marked) → Customer Love (carousel, `renderTestimonials()`) → Shop Our Products (full grid, `renderFeatured()`) → Shop by Category → Find the Right Product (`NEED_TILES`/`renderNeedTiles()` — "shop by need" tiles matched against each product's `concerns` array) → How to Order → What Happens After Ordering → FAQ → About → Contact teaser.
- **Category/need availability**: categories and need tiles are never hidden, even at zero live products — `liveProductCount()`/`renderCategoryAvailability()` label each with a live count or "Coming Soon", and an empty category/need page shows a "Notify Me" Messenger banner (`notifyMeLink()`, `ref=notify-{topic}`).
- **Rendering**: functions like `renderFeatured`, `renderTopProducts`, `renderNeedTiles`, `renderProducts`, `renderDetail`, `renderTestimonials`, `renderCart`, `renderCheckoutItems` build HTML strings and inject via `innerHTML` directly into DOM containers (`featuredGrid`, `topProductsGrid`, `needTilesGrid`, `productsGrid`, `detailWrap`, `testimonialGrid`, `cartItems`, `checkoutItems`). Inline `onclick="..."` handlers (e.g. `addToCart('id')`) are used throughout instead of addEventListener-based delegation for dynamically rendered markup. The two homepage carousels (Top Selling Products, Customer Love) are plain CSS scroll-snap, driven by a shared `scrollCarousel()` helper (`scrollTopProducts()`/`scrollTestimonials()` wrappers) — no JS carousel library. Top Selling Products cards use a distinct `.product-card-carousel` sizing class (`productCard(p, { carousel: true })`) from the regular grid cards, since they're laid out for horizontal scrolling rather than a grid.
- **Product card badges** (`BADGE_TYPES`, `productCard()`): `badge` field (`"hot"`/`"new"`/`"sale"`/`"popular"`) shows a fixed-color badge; `topSelling: true` auto-applies a gold "Best Seller" badge when no explicit `badge` is set — the same field that puts the product in the Top Selling Products carousel. Coming-soon cards show an "Ask about this" Messenger button instead of a badge/wishlist control.
- **Image lightbox** (`openImageLightbox()`/`closeImageLightbox()`, `#imageLightbox` in `index.html`): shared full-size viewer for the product detail gallery image and any review/testimonial photo; closes on backdrop click, its ✕ button, or Escape (shared `keydown` listener with the cart drawer).
- **Cart & reviews persistence**: both use `localStorage` directly (`hayatiq_cart`, `hayatiq_reviews` keys) — there is no server-side cart/order storage. Per-product reviews (`reviews: []` on a product) support optional `image`/`source` fields for photo proof and provenance (e.g. `"Messenger"`).
- **Checkout/contact forms** submit via FormSubmit (`https://formsubmit.co/...`) using `axios` (loaded from CDN) — see `js/partial.js`. There's client-side rate limiting via `localStorage` timestamps (contact: 3/hour, orders: 5/20min) and Bangladeshi phone number validation (`/^01[3-9]\d{8}$/`).
- Toasts/alerts use SweetAlert2 (`Swal`, loaded from CDN) via `toast()`/`toastBox()` helpers.

### `js/visitor.js` — behavioral analytics
Tracks visitor session behavior entirely client-side (page views/durations, product views, cart actions, social clicks, form field completion) into `localStorage` (`user_behavior`, `current_visit_data` keys), then emails a plain-text summary via FormSubmit on tab-hide/unload (`sendVisitEmail`). Also drives timed marketing popups: a "product alert" Swal after `TIMING.productViewMinTime` on a product page, and a "checkout alert" (discount hint) on the checkout page — both rate-limited via `TIMING` cooldowns. When editing checkout/product flows, be aware this file listens for the same `route-changed` event (see `js/script.js`'s router) and DOM elements as `script.js`.

### `js/partial.js`
Wires the contact form and checkout form `submit` handlers (FormSubmit + axios POST, rate limiting, validation). Kept separate from `script.js` and loaded after the SweetAlert2/axios CDN `<script>` tags in `index.html`, so it can assume those globals exist.

### Styling
`css/style.css` defines the design system as CSS custom properties at the top (`--color-earth`, `--color-almond`, `--color-night`, `--radius`, `--shadow-soft`, etc.) — reuse these tokens rather than hardcoding new colors/shadows.

### External dependencies (all via CDN, no npm)
SweetAlert2, axios, Font Awesome, Google Fonts (Outfit, Dancing Script), plus a third-party visitor-counter widget (freevisitorcounters.com) embedded at the bottom of `index.html`.

## Adding a product

Products live only in the `PRODUCTS` array in `js/products.js` (not `js/script.js` — that file only renders them). All keys are required on every product object: `id`, `name`, `slug`, `price`, `category`, `images`, `short`, `ingredients`, `how`, `tips`, `warns`, `storage` (`subtitle`, `concerns`, `badge`, `topSelling`, `display_order`, `seoTitle`, `metaKeywords` are optional; `ingredients`/`how`/`tips` may be left as `[]` when real content isn't ready yet — `renderDetail()` skips rendering a section entirely when its array is empty rather than showing an empty accordion). Notes:
- `slug` is now the product's real URL path (`/product/<slug>`, see the router in `js/script.js`), not just an internal identifier — avoid changing an existing product's slug once it's live, since that changes its URL and breaks any existing Messenger ref links/bookmarks/search listings pointing at the old one.
- `seoTitle`/`metaKeywords` (optional strings): override the `<title>`/meta-keywords tag on that product's detail page (`setPageMeta()` in `js/script.js`); both fall back to `${name} — Hayatiq` / the site-wide default keywords when unset. The product's own `short` field is always what's used as the meta description — there's no separate field for that.
- `display_order` (number, optional): a single `PRODUCTS.sort(...)` call at the end of `js/products.js` sorts the whole catalog by this field once at load (ascending, unset/non-numeric treated as last, ties keep array order since `Array#sort` is stable) — every render function that reads from `PRODUCTS` (`renderFeatured`, `topProducts`, `renderProducts`, `renderWishlist`) inherits the order for free, so a new listing surface never needs its own sort logic.
- `price`: a number makes the product live/purchasable; the string `"Coming Soon"` disables the buy button and shows a coming-soon detail view instead (see `isComingSoon` checks in `productCard`/`renderDetail`).
- `category` must match one of the categories rendered in the `#view-categories` section of `index.html`; add a new category block there if introducing one.
- `concerns` (optional array, e.g. `["Better Sleep", "Muscle Recovery"]`) drives the homepage "Find the Right Product" tiles — base tags on the product's own `how`/`tips` guidance, not guesswork; add a matching entry to `NEED_TILES` if introducing a new tag.
- `how` entries use a `"Tab Name: point one; point two;"` string format parsed by `renderHowToUseTags()` into tabbed panels — keep the `:` and `;` delimiters when adding entries.
- Messenger buttons link to `https://m.me/hayatiq.life?ref=<slug>` (product detail) or `ref=notify-<category>` (category/need "Notify Me" links) — the ManyChat automation on that account keys off this `ref` parameter (see README.MD for setting up new automations per product/ref).

## Other project docs

`README.MD` documents non-code setup: configuring ManyChat Messenger automations per product/notify ref, configuring FormSubmit for form emails, and the full `PRODUCTS`/`reviews`/`TESTIMONIALS`/badge field reference. Read it before changing form `action` URLs, Messenger ref links, or adding products/reviews/badges.
