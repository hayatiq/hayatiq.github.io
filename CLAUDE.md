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
- **Hash-based SPA router** (`navigate()`): all "pages" are `<section id="view-*">` elements in `index.html` that get shown/hidden by toggling an `active` class based on `location.hash` (`#/`, `#/products`, `#/product/:id`, `#/categories`, `#/contact`, `#/about`, `#/cart`, `#/checkout`). There is no history/state management beyond the hash.
- **`PRODUCTS` array**: the entire product catalog is hardcoded in this file as plain JS objects (no CMS/database). See "Adding a product" below.
- **Rendering**: functions like `renderFeatured`, `renderProducts`, `renderDetail`, `renderCart`, `renderCheckoutItems` build HTML strings and inject via `innerHTML` directly into DOM containers (`featuredGrid`, `productsGrid`, `detailWrap`, `cartItems`, `checkoutItems`). Inline `onclick="..."` handlers (e.g. `addToCart('id')`) are used throughout instead of addEventListener-based delegation for dynamically rendered markup.
- **Cart & reviews persistence**: both use `localStorage` directly (`hayatiq_cart`, `hayatiq_reviews` keys) — there is no server-side cart/order storage. Reviews UI is currently commented out in `renderDetail` but the underlying `getReviewsFor`/`addReview` functions remain.
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

Products live only in the `PRODUCTS` array in `js/script.js`. All keys are required on every product object: `id`, `name`, `slug`, `price`, `category`, `images`, `short`, `ingredients`, `how`, `tips`, `warns`, `storage` (`subtitle` is optional). Notes:
- `price`: a number makes the product live/purchasable; the string `"Coming Soon"` disables the buy button and shows a coming-soon detail view instead (see `isComingSoon` checks in `productCard`/`renderDetail`).
- `category` must match one of the categories rendered in the `#view-categories` section of `index.html`; add a new category block there if introducing one.
- `how` entries use a `"Tab Name: point one; point two;"` string format parsed by `renderHowToUseTags()` into tabbed panels — keep the `:` and `;` delimiters when adding entries.
- Messenger "Message" buttons link to `https://m.me/hayatiq.life?ref=<slug>` — the ManyChat automation on that account keys off this `ref` parameter (see README.MD for setting up new automations per product).

## Other project docs

`README.MD` documents non-code setup: configuring ManyChat Messenger automations per product ref, and configuring FormSubmit for form emails. Read it before changing form `action` URLs or Messenger ref links.
