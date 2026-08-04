# Hayatiq UX Roadmap

## Goal

Turn the site into a fast, mobile-first, high-conversion product showcase and order
collection experience, similar to leading Bangladesh grocery/direct-order sites —
reducing friction, speeding up product discovery, and shortening the path to checkout.

## Hard constraints (do not violate)

- No React, Vue, build tools, npm, webpack, vite, or backend services.
- Plain HTML, CSS, and JavaScript only (see `CLAUDE.md` for current architecture).
- Preserve hash routing, the localStorage cart, visitor analytics behavior
  (`js/visitor.js`), and the FormSubmit contact/checkout integration.
- Work phase by phase; do not start a phase before the previous one is documented here.

## Master checklist

### Phase 1 — Homepage, product cards, sticky cart, hierarchy
- [x] Homepage UX restructuring (USP strip + category quick-links, condensed "How It Works")
- [x] Product card simplification
- [x] Sticky mobile cart CTA *(superseded — see Interim round 2: replaced by a floating cart button)*
- [x] Visual hierarchy improvements

### Phase 2 — Cart & checkout speed
- [x] Slide-in drawer cart
- [x] Faster cart interactions
- [x] Single-page checkout flow

### Interim — Named theme system & homepage hero polish (ad hoc, before Phase 3)
- [x] Switchable "sand"/"cool" color palette system
- [x] SweetAlert2 popups follow the active theme
- [x] Hero/USP/category section modernized (shorter copy, badge USPs, category tiles)

### Interim round 2 — betterme theme, floating cart, icon/UX fixes (ad hoc, before Phase 3)
- [x] Added a third "betterme" palette (colors pulled from hayatiq.github.io/BetterMe/)
- [x] Removed the "Direct Order" USP badge, replaced with "Quality Checked"; tightened
      hero/USP/category spacing further
- [x] Category icons switched from raster PNGs to Font Awesome icons (theme/background
      independent) on both the homepage tiles and the full Categories page
- [x] Removed the Phase-1 sticky bottom cart bar; replaced with a floating cart button
      (square card shape, vertically centered on the right, shows item count + running
      total, always gently pulsing as a constant shopping cue) that opens the same drawer
- [x] Fixed the add-to-cart toast overlapping/blocking the drawer's first item
- [x] Header cart icon color fixed to always-white for legibility across all themes

### Interim round 3 — stop auto-opening the drawer on add-to-cart
- [x] Adding to cart no longer opens the drawer; only the floating cart button and
      the header cart icons (mobile + desktop) open it

### Phase 3 — Product detail
- [x] Product detail redesign
- [x] Accordion-based information sections
- [x] Strong call-to-action placement
- [x] Trust indicators

### Interim round 4 — best sellers, category icon theming, detail-page desktop layout
- [x] Homepage "Best Sellers" section (owner-curated, before Featured Products)
- [x] Category icon background decoupled from `--color-khaki` into its own
      per-theme `--color-category-icon` token
- [x] Product detail page two-column desktop layout with a sticky, properly
      capped gallery (was full-bleed-width and badly cropped on wide screens)

### Phase 4 — Performance & polish
- [x] Performance improvements
- [x] Image optimization recommendations
- [x] Motion and micro-interactions
- [x] Color palette refinement (note: the interim work above already introduced the
  theme *system* — this phase item is about refining/finishing the palette(s) further)

**All 4 planned phases are now complete.** Remaining open items are the demo reviews
seeded in Phase 3 (replace with real feedback as it comes in) and the image
optimization recommendations below (documentation only, per the user's choice — the
actual files haven't been touched).

### Interim round 5 — accordion jump fix, product badges, checkout popup removed
- [x] Fixed product detail accordion sections jumping the whole page when clicking
      one caused another (possibly large) section to snap shut elsewhere
- [x] Added owner-assignable product card badges (Hot/New/Sale/Popular, with icons,
      fixed colors, responsive)
- [x] Removed the checkout page's "50% off delivery" secret-code popup entirely

### Interim round 6 — wishlist feature + SEO improvements
- [x] Wishlist: heart toggle on product cards + detail page, localStorage-backed
      (like the cart), a new `#/wishlist` view, and a header icon with a count badge
- [x] SEO: dynamic `<title>`/meta description per route, Product JSON-LD structured
      data on product detail views, fixed a duplicate `<meta name="description">` bug

## Decisions log

- **Grid card CTA (Phase 1):** dropped the per-card "Message" (Messenger) button and
  the redundant "Quick View" button (it linked to the same place the card itself
  already links to). Cards now show image, name, subtitle, price, and a compact
  always-visible add-to-cart icon button. Messenger stays as a full CTA on the product
  **detail** page only — it's no longer duplicated on every grid card.
- **Sticky mobile cart bar (Phase 1):** always visible on mobile regardless of cart
  item count (not hidden when the cart is empty), but hidden on the `#/cart` and
  `#/checkout` views themselves since a cart shortcut is redundant there.
- **Add-to-cart feedback (Phase 2):** replaced the old behavior (toast, then a forced
  full-page redirect to `#/cart` after 1.5s on every single add) with a toast *and* an
  auto-opening slide-in cart drawer. This keeps the same "show them their cart" intent
  but non-disruptively — no page navigation, browsing position is preserved, and the
  user can dismiss it or tap straight through to Checkout. This is now the default for
  any `addToCart(id)` call that doesn't explicitly pass a `redirect` argument.
  ***Superseded (interim round 3):*** once the floating cart button (with its own live
  count/total) existed, auto-opening the drawer on every add became redundant/unwanted
  — see the interim round 3 entry below. Adding to cart no longer opens anything; only
  the floating button and the header cart icons open the drawer now.
- **"Cool" palette (interim, before Phase 3):** the user wanted a palette inspired by
  ghorerbazar.com's clean whitish-card look. Direct access to that site was blocked
  (403) and no verified hex codes could be found from secondary sources; the user then
  shared a screenshot and said explicitly: use the whitish card background as
  inspiration, but do **not** copy their orange brand color — use judgment instead.
  The "cool" theme is therefore an original palette (deep emerald/teal accent, white
  card backgrounds, soft mint page background) inspired by that category of site, not
  a verified clone of ghorerbazar's exact colors.
- **Theme switch mechanism (interim):** code-level only, via `data-theme="sand"` or
  `data-theme="cool"` on `<html>` in `index.html` — no visitor-facing UI toggle, per
  the user's preference for a simple developer setting on this no-build static site.
- **"betterme" palette (interim round 2):** unlike "cool", this one *is* pulled
  directly from a real, fetchable source — `hayatiq.github.io/BetterMe/`'s own
  stylesheet (blush/sage/cream/gold/plum/ink). The one deliberate deviation:
  `--color-earth` (which has to work as white-on-color button/header backgrounds and
  as price text on light cards) is deepened from their `--gold-dark` (`#B8935A`) for
  contrast/legibility — everything else is used as fetched.
- **Category icons → Font Awesome (interim round 2):** the PNG icon images looked
  unclear and their look was tied to whatever flat color sat behind them — swapped for
  Font Awesome solid icons (`fa-pump-soap`, `fa-scissors`, `fa-spa`, `fa-bag-shopping`)
  colored via `currentColor`/CSS variables, so they stay crisp and theme-consistent
  regardless of future palette or background changes. Applied to both the homepage
  category tiles and the full Categories page for consistency.
- **Floating cart button, not a sticky bar (interim round 2):** the Phase-1 bottom bar
  took up a full-width strip that hid part of the last visible product row. Replaced
  with a small floating button (Ghorer-Bazar-style) that (a) frees that space for
  products, (b) is vertically centered on the right edge per the user's request, (c)
  shows the running total next to the item count (not just a count), and (d) is
  always gently pulsing — per explicit follow-up feedback, a constant shopping cue
  rather than one that only appears once items are added. Also per follow-up: shaped
  as a rounded square (`--radius-lg`), not a circle/pill, and nudged closer to the
  screen edge (`right: 8px`, down from `14px`). It opens the same drawer as the header
  cart icon; hide-on-`#/cart`/`#/checkout` logic carried over unchanged from the old bar.
- **Toast dropped on the drawer-open path (interim round 2):** the add-to-cart toast
  was visually overlapping/blocking the first item in the newly-opened drawer on small
  screens. Since the drawer sliding open with the updated item already *is* a clear
  confirmation, the toast is now skipped whenever the drawer opens — it's kept only for
  the explicit-redirect marketing flow (`showProductAlert`'s "take me to checkout"),
  where no drawer opens and the toast is the only confirmation the user gets.
- **Add-to-cart stops opening the drawer entirely (interim round 3):** with the
  floating cart button now always visible and updating its count/total live, the
  drawer auto-opening on every add became an unwanted interruption rather than useful
  feedback — the user confirmed the floating button's live data is confirmation
  enough. The drawer now opens only from an explicit tap: the floating cart button or
  either header cart icon. `addToCart()` still updates the cart (and therefore the
  floating button) via `setCart()`, it just no longer calls `openCartDrawer()`.
- **Betterme palette corrected to real fetched values (interim, pre-Phase-3):** the
  user flagged the "betterme" theme as not matching and pointed to a local copy of the
  source (`/home/topukhan/projects/BetterMe/index.html`) plus a screenshot. My
  original mapping had deepened `--color-earth` beyond their real `--gold-dark` for
  contrast reasons — reverted to their exact value (`#B8935A`) and reassigned
  `--color-timberwolf`/`--color-khaki` to their real `--blush`/`--sage` (previously
  derived, invented tones). Also added a theme-specific `body` background gradient
  (cream→blush) to reproduce their signature page-background wash, since a flat
  `--color-almond` fill was losing that. Authenticity over my own contrast tweak, per
  the user's explicit ask to "extract from it."
- **Trust indicators / reviews (Phase 3):** trust content is limited to what's
  verifiably true — the existing Natural/Handmade/Quality-Checked claims, "Cash on
  Delivery" (confirmed by the user as how orders are genuinely fulfilled — no online
  prepayment exists), and the real Inside/Outside Dhaka delivery pricing already used
  at checkout. No fabricated return policy or review counts. The dormant
  localStorage-based review *submission* feature was removed outright (per the user:
  it could never show real cross-visitor social proof without a backend); in its
  place, each product now has a static `reviews: []` field the owner fills in manually
  with real feedback they've collected — documented in `README.MD`. No review content
  was invented; the field ships empty for every product.
- **Demo reviews on the Best Seller product:** at the user's explicit request, added
  two placeholder reviews (Bangladeshi names, one 5-star and one 4.5-star) to product
  `id: "1"` to preview the reviews UI — clearly demo content, meant to be replaced with
  real feedback later (see `README.MD`). This uncovered that `stars()` only rendered
  whole-star ratings (`Math.round()`), which would've shown 4.5 identically to 5 —
  rewrote it to round to the nearest half-star and render via Font Awesome
  `fa-star`/`fa-star-half-stroke`/`fa-regular fa-star` icons (already loaded, no new
  dependency) so a 4.5 rating is now visually distinct from a 5.
- **Best Sellers is owner-curated, not algorithmic:** added a `bestSeller: false`
  field to every product (mirrors the `reviews: []` pattern) — the homepage section
  only shows products the owner flips to `true`, and hides itself entirely if none are
  marked yet, rather than guessing at "popular" products or showing an empty section.
- **Category icon background decoupled from `--color-khaki`:** the user noticed the
  category-tile icon backdrops looked "greenish" and cool-theme-specific even under
  other themes, because they reused `--color-khaki` — which happens to resolve to a
  green/sage tone in both the "cool" and "betterme" themes (coincidentally, since
  khaki serves an unrelated hover-state role in each). Introduced a dedicated
  `--color-category-icon` token per theme (warm tan for sand, mint for cool, their
  real blush for betterme) so this specific backdrop can be tuned per theme
  independently of whatever else khaki is used for.
- **Product detail page needed a real desktop layout:** `.detail` had no responsive
  breakpoint at all — on wide screens the gallery spanned the full page width, and
  with a 4:3 aspect ratio that produced a huge, badly-cropped main image (confirmed by
  a user screenshot). Added a two-column layout (gallery | info) from `900px` up, with
  a sticky gallery so it stays in view while scrolling the now-taller accordion/review
  content below it.
- **Image optimization is documentation-only (Phase 4):** the product photos are
  meaningfully heavier than they need to be for how they're actually displayed (see
  the table below), and Pillow is available in this environment to actually resize/
  recompress them — but the user chose to keep the real image files untouched and
  have the recommendations documented instead, for them or a designer to apply later.
- **Palette refinement is an audit, not a rewrite (Phase 4):** checked text/button
  contrast across all three themes. Sand and cool are both comfortably ≥4.5:1 for
  their text and button-label combinations. The one soft spot — "betterme"'s white
  button/header text on `--color-earth` (`#B8935A`, ≈2.9:1) — is the exact color from
  the user's own real reference source, kept deliberately authentic per their explicit
  correction in an earlier round ("extract from it"). Recorded as a known, accepted
  trade-off rather than silently re-darkened again.
- **Accordion sections made independent, not exclusive (interim round 5):** the
  Phase-3 accordion gave every `<details>` a shared `name="detail-accordion"`,
  making them behave as an exclusive group (opening one auto-closes another). The
  user reported this caused the whole page to jump up/down — clicking a section
  lower on the page could snap a large section elsewhere (e.g. the default-open "How
  to Use" tabs) shut instantly, with no animation, shifting everything below it.
  Removed the shared `name` so each section only ever expands/collapses its own
  space; multiple can be open at once now, which is the expected, non-disorienting
  accordion behavior the user asked for.
- **Product badges use fixed colors, not theme tokens (interim round 5):** "Hot"/
  "New"/"Sale"/"Popular" badges are deliberately NOT wired to `--color-*` theme
  variables — shoppers expect these conventional marketing colors (red/blue/green/
  amber) to look the same regardless of which of the three site palettes is active,
  unlike everything else on the site which is intentionally theme-aware.
- **Checkout delivery-discount popup removed entirely (interim round 5):** at the
  user's request, deleted `showCheckoutAlert()`, `setupCheckoutAlertTimer()`, the
  `checkoutTimer` variable, its `hashchange`-listener wiring, and the now-unused
  `checkoutAlertCooldown`/`checkoutAlertMaxCount` `TIMING` keys from `js/visitor.js`.
  The unrelated product-page upsell popup (`showProductAlert()`/
  `setupProductAlertTimer()`) was explicitly left untouched — only the checkout one
  was in scope.
- **Wishlist hearts sync via `data-id`, not full re-render (interim round 6):**
  toggling a wishlisted product updates every matching `.wishlist-toggle` button on
  the page (a product can appear in both Best Sellers and Featured Products at once)
  by querying `data-id`, rather than re-rendering every grid — re-rendering the
  detail page specifically would have blown away its gallery/thumbnail state.
- **Wishlist heart color is fixed, not theme-tied (interim round 6):** same
  reasoning as the Hot/New/Sale/Popular badges — a "loved" heart conventionally reads
  the same red/pink regardless of which site palette is active.
- **SEO scope is "achievable within hash routing" (interim round 6):** confirmed with
  the user that individual product URLs (`#/product/1`) can't realistically become
  distinctly indexable or get correct link-preview cards on Facebook/Messenger
  without changing the hash-routing architecture (out of scope — it's a hard
  constraint). Delivered instead: dynamic `<title>`/meta description per route
  (helps browser tab/history and any crawler that does render the JS), Product
  JSON-LD structured data per product view (a real, recognized signal, and valuable
  for rich results if the page is ever crawled/rendered), and fixed a pre-existing
  bug where `index.html` had two duplicate `<meta name="description">` tags (only
  the first was ever used; the second was dead weight).

## Interim round 6 — what changed (wishlist + SEO)

### Wishlist
- `js/script.js`: new `WISHLIST_KEY` localStorage store mirroring the cart's
  `getCart()`/`setCart()` pattern — `getWishlist()`, `isWishlisted(id)`,
  `setWishlist(list)`, `toggleWishlist(id)`, `updateWishlistCount()`,
  `renderWishlist()`.
- `productCard()` gets a `.wishlist-toggle` heart button (top-right over the image,
  badges already occupy top-left), skipped for "Coming Soon" products; `renderDetail()`
  gets an inline variant (`.wishlist-toggle-inline`) in the CTA row.
- New `#/wishlist` route: `routes.wishlist`, a `navigate()` branch, and a
  `#view-wishlist` section (`index.html`) reusing the `.products-grid` layout and
  `productCard()` template — same empty-state pattern as the cart page.
- Header access point: a heart icon + count badge next to the cart icon in both
  `.nav-right` (mobile) and `.nav-links` (desktop, reusing the `.desktop-cart`
  show/hide breakpoint) — a plain link to the `#/wishlist` view, not a drawer.
- `css/style.css`: `.wishlist-toggle`/`.wishlist-toggle.active`/
  `.wishlist-toggle-inline`/`.wishlist-icon-wrap`.

### SEO
- `js/script.js`: `setPageMeta(title, description)` (sets `document.title` and the
  description meta tag's `content`) called from every `navigate()` branch, plus
  inside `renderDetail()` for product-specific title/description (before the
  Coming-Soon branch, so both cases get it).
- `resetProductJsonLd()` clears `#productJsonLd`'s content back to `{}` on every
  non-product route; `renderDetail()` populates it with schema.org `Product` JSON-LD
  (name, images, description, SKU, `Offer` with BDT price/availability, and
  `AggregateRating` when the product has reviews).
- `index.html`: removed the duplicate `<meta name="description">`; added the empty
  `<script type="application/ld+json" id="productJsonLd">{}</script>` placeholder.
- No changes to `js/partial.js`, `js/visitor.js`, the localStorage cart, or FormSubmit.

## Interim round 5 — what changed (accordion fix, badges, popup removed)

- **Accordion jump fix**: removed `name="detail-accordion"` from both the
  `accordionItem()` helper and the hardcoded "How to Use" `<details>` in
  `renderDetail()` (`js/script.js`), and updated the corresponding CSS comment in
  `css/style.css`. No other markup changes — sections still default to the same
  open/closed state ("How to Use" open, the rest collapsed).
- **Product card badges** (`js/script.js`, `css/style.css`): added a `BADGE_TYPES`
  lookup (`hot`/`new`/`sale`/`popular`, each with a Font Awesome icon and a fixed
  marketing color) and a `badge: null` field on every product. `productCard()` renders
  a `.product-badge` pill absolutely positioned over the product image when
  `p.badge` is set and the product isn't "Coming Soon". Documented in `README.MD`
  ("🏷️ Adding Product Card Badges") the same way `reviews`/`bestSeller` are documented.
  No product has a badge assigned yet — same "ships empty, owner curates" pattern.
- **Checkout popup removed**: see decisions log. `js/visitor.js` shrunk accordingly
  (one fewer timer, one fewer `TIMING` config pair, one fewer Swal call).
- No changes to `js/partial.js`, routing, the localStorage cart, or FormSubmit.

## Phase 4 — what changed (performance & polish) — final phase

### Performance
- `index.html`: added `<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>`
  (Font Awesome's stylesheet is render-blocking and was the only major third-party
  origin without a preconnect hint) and `fetchpriority="high"` on the detail page's
  main gallery image (`#mainImg` in `renderDetail()`, `js/script.js`) — it's the
  strongest Largest-Contentful-Paint candidate on `#/product/:id`.
- `js/script.js`: `navigate()` now calls `window.scrollTo(0, 0)` on every route change
  and uses `document.getElementById("app").focus({ preventScroll: true })` (was plain
  `.focus()`) so the explicit scroll and the a11y focus-shift don't fight each other.
  Previously, navigating to a new view kept whatever scroll position the last view was
  left at — e.g. clicking a product from partway down the grid landed you still
  scrolled down on its detail page.
- Deleted `images/hair.png`, `images/meditation.png`, `images/skincare.png` — confirmed
  (grepped) completely unreferenced since Phase 3/Interim round 4 replaced them with
  Font Awesome icons. Pure dead weight, safe removal.

### Image optimization — recommendations only (files untouched, per the user's choice)

| File(s) | Current | Displayed at (max) | Recommendation |
|---|---|---|---|
| `placeholder.webp` | 1946×1946, 222KB | ≤280px (coming-soon fallback) | Resize to ~800×800, re-save WebP quality ~80 → well under 30KB |
| `hayatiq_magnesium_oil_2.jpg` | 1024×1536, 212KB | ~700px gallery / 70px thumb | Resize longest edge to ~1200px, re-encode JPEG quality ~80, progressive → ~35-45KB |
| `hayatiq_magnesium_oil.jpg` | 1024×1536, 136KB | same as above | Same treatment → ~25-35KB |
| `hayatiq_magnesium_oil_3.jpg` | 1024×1024, 93KB | same as above | Same treatment → ~20-30KB |
| `logo.jpg` | 1024×1024, 40KB | 36px header icon **and** `og:image` social-share source | Don't shrink to icon size — moderate resize to ~512×512, quality ~82, keeps social-share previews sharp while still cutting size |
| Remaining 7 product photos (19-53KB each) | Already close to their display size | Gallery/cards/thumbs | Re-encode at JPEG quality ~80 (most were exported well above what's needed for web) for modest per-file savings |

Free tools to apply these without any build step (this is a no-build static site):
[squoosh.app](https://squoosh.app) (drag-and-drop, no install), or locally via Pillow
(`Image.open(f).resize(...).save(f, quality=80, optimize=True, progressive=True)`) or
ImageMagick (`convert in.jpg -resize 1200x -quality 80 out.jpg`).

### Motion and micro-interactions
- `.view.active` (`css/style.css`) now plays a short `viewIn` fade + slight rise-in
  (`opacity`/`translateY`) instead of an instant swap between routes.
- `.btn:active { transform: scale(0.97); }` added to the shared `.btn` class — every
  button site-wide now gets tactile press feedback (previously only
  `.btn-icon-add`/`.floating-cart-btn` had this).
- `.accordion-item summary:hover` gets a `--color-khaki` background shift — the
  accordion headers had no hover affordance at all before.
- Added `@media (prefers-reduced-motion: reduce)` disabling the view fade, the button
  press scale, and the existing (previously unconditional) `floatingCartPulse`
  animation for users who've indicated a motion-sensitivity preference.

### Color palette refinement
Audit only — see decisions log. No token values changed.

## Phase 3 — what changed (product detail redesign)

- **CTA hierarchy fixed** (`renderDetail()` in `js/script.js`): Add to Cart is now
  `button-primary`, Messenger is `button-ghost` — was backwards before (Messenger was
  primary), inconsistent with the cart/checkout-first decision made everywhere else
  on the site since Phase 1. No new sticky "Add to Cart" bar was added — the floating
  cart button already covers persistent cart access on this page too.
- **Accordion sections**: replaced four always-expanded `.soft-card` blocks with
  native `<details>/<summary>` elements sharing `name="detail-accordion"` (exclusive
  accordion behavior, zero custom JS). Reordered for relevance: How to Use (default
  open, still using the existing `renderHowToUseTags()` tab component unchanged
  inside its panel) → Ingredients → Cautions (moved up — safety info shouldn't be
  last) → For Optimal Benefits → Storage. `detailList()` was replaced by
  `accordionItem(title, arr, {open})`, same call-site shape.
- **Trust strip + delivery transparency**: added a `.usp-strip` row (Natural /
  Handmade / Quality Checked / Cash on Delivery) plus a delivery-pricing line. Added a
  shared `SHIPPING_RATES = { inside_dhaka: 80, outside_dhaka: 130 }` constant in
  `js/script.js`, used by both `updateCheckoutTotals()` (replacing its inline ternary)
  and the new detail-page line, so the two can't drift out of sync.
- **Reviews rebuilt as static data**: removed `REVIEWS_KEY`, `getAllReviews()`,
  `setAllReviews()`, `getReviewsFor()`, `addReview()`, and the dead commented-out
  review-submission form. Added `reviews: []` to every product in `PRODUCTS`. Kept
  `averageRating()`/`stars()` unchanged, now called with `p.reviews` directly. New
  "Customer Reviews" section is an always-visible `.soft-card` (not collapsed —
  trust signals should be seen, not hidden), with a modernized responsive
  `.review-item` card style; shows "No reviews yet." honestly when empty.
- **`README.MD`**: added a "🌟 Adding Customer Reviews" section documenting the
  `reviews: [{ name, rating, text }]` format for manual entry.
- No changes to `js/partial.js`, `js/visitor.js`, routing, or the localStorage cart.

## Interim round 4 — what changed (best sellers, category icon token, desktop gallery)

- **Homepage "Best Sellers"** (`index.html`, `js/script.js`): new section between the
  category tiles and Featured Products, `<div class="products-grid" id="bestSellerGrid">`.
  `renderBestSellers()` filters `PRODUCTS.filter(p => p.bestSeller)`, reuses the same
  `productCard()` template as Featured/Products-listing, and hides its own `<section>`
  entirely when no product is flagged yet (avoids ever showing an empty grid). Added
  `bestSeller: false` to every product — the owner flips specific ones to `true`.
  Wired into `navigate()`'s home branch alongside `renderFeatured()`.
- **Category icon background decoupled**: added `--color-category-icon` to all three
  theme blocks in `css/style.css` (`#E4D3B8` sand, `#CFEFE3` cool, `#F7E4E4` betterme —
  their real blush) and repointed `.category-tile-icon`/`.icon-img` to it instead of
  `--color-khaki`. See decisions log for why this was needed.
- **Betterme palette corrected** to the real fetched values (see decisions log) —
  `--color-earth` reverted to their exact `--gold-dark` (`#B8935A`), `--color-timberwolf`/
  `--color-khaki` reassigned to their real `--blush`/`--sage`, and a theme-scoped
  `body` background gradient (cream→blush) added to reproduce their signature wash.
- **Product detail desktop layout**: `.detail` gets a two-column grid
  (`grid-template-columns: minmax(0,1fr) minmax(0,1fr)`, tightening to `1.1fr 0.9fr`
  at `1100px`+) from `900px` up, with `.gallery` becoming `position: sticky; top: 1rem`
  so it stays in view while the (now longer, accordion-based) info column scrolls.
  Mobile layout is unchanged. The separate "Coming Soon" detail template doesn't use
  `.detail`'s grid and was unaffected.

## Interim — what changed (theme system & hero polish)

- **Named palette system** (`css/style.css`): every rule in the stylesheet already
  referenced color via `var(--color-*)` tokens, so the re-theme happens entirely by
  redefining those tokens per theme — no other selector needed to change. `:root` now
  holds theme-independent layout tokens (`--radius`, `--shadow-*`, etc.) plus a
  fallback palette; `[data-theme="sand"]` and `[data-theme="cool"]` blocks hold the
  actual color values. Switch the whole site by changing `data-theme` on `<html>` in
  `index.html` (currently `"sand"`, the original look). Along the way, deduped an
  accidental double declaration of `--color-moss` that existed in the old `:root`.
- **Theme-aware popups** (`js/script.js`, `js/visitor.js`): added a `cssVar(name)`
  helper that reads a CSS custom property via `getComputedStyle`. `toastBox()`,
  `showProductAlert()`, and `showCheckoutAlert()` previously hardcoded
  `'#95714F'`/`'#EADED0'`/`'#100f0f'` for their SweetAlert2 styling — these now pull
  from `--color-earth`/`--color-almond`/`--color-night` so popups always match
  whichever theme is active instead of always rendering brown.
- **Incidental fixes**: `.note-chars` (the checkout "0/200" character counter) had a
  near-white `color: #f3eded` on the light page background, making it effectively
  invisible — fixed to a muted `var(--color-night)` at 65% opacity, matching the
  existing `.muted`/`.deep-muted` convention. `.checkout-summary`'s hardcoded
  `background:#fff` was tokenized to `var(--color-white)`.
- **Homepage hero/category polish** (`index.html`, `css/style.css`) — layout-only,
  works under either theme: shortened the hero paragraph and CTA label ("Shop Now");
  collapsed the three stacked full-sentence USP lines into compact inline badge-pills
  nested directly in the hero card; replaced the unlabeled category pill row with a
  bold "Shop by Category" heading and white rounded card tiles (icon in a circular
  backdrop, label below) — same three categories/hrefs as Phase 1, just presented as
  tiles instead of pills, similar in spirit to ghorerbazar's category-tile layout.
- No changes to cart/checkout logic, routing, visitor analytics tracking, or
  FormSubmit integration.

## Interim round 2 — what changed (betterme theme, floating cart, fixes)

- **`[data-theme="betterme"]`** added to `css/style.css` alongside `sand`/`cool` — see
  decisions log for the source and the one adapted value.
- **USP row**: "Direct Order" badge removed; added "✅ Quality Checked" instead (ties
  back to the existing "Each batch is tested for quality, stability, and safety" claim
  already made in the "How It Works" section, rather than inventing a new one).
  Hero card padding, paragraph margin, CTA margin, and USP badge padding/font-size all
  tightened for a more compact top-of-page block.
- **Category icons**: `index.html`'s homepage tiles and Categories page both switched
  from `<img src="./images/{skincare,hair,meditation}.png">` to Font Awesome `<i>`
  icons; `.category-tile-icon`/`.icon-img` in `css/style.css` now size/color an icon
  font instead of an `<img>`. The old PNGs are unreferenced now (left on disk, not
  deleted, in case they're wanted elsewhere).
- **Sticky bar → floating button**: removed `#stickyCartBar` markup/CSS entirely;
  added `#floatingCartBtn` (`index.html`) — a fixed square (rounded, `--radius-lg`)
  button, `68px×68px`, vertically centered on the right (`top:50%;
  transform:translateY(-50%); right:8px`), showing an item-count badge and the
  running total, with an always-on `@keyframes floatingCartPulse` animation (not
  conditional on cart contents — see decisions log). `js/script.js`'s
  `updateStickyCartBar()` was renamed to `updateFloatingCartButton()` (same call sites
  in `setCart()`/`navigate()`) and now also computes/writes the total.
- **Toast/drawer overlap fix**: `addToCart()` in `js/script.js` now only shows the
  toast on the explicit-redirect path; the drawer-opening path shows no toast (the
  drawer itself is the confirmation) — see decisions log for why.
- **Header cart icon**: `.cart` in `css/style.css` now sets `color: var(--color-white)`
  explicitly (the SVG's `stroke`/`fill` use `currentColor`) so the icon reads clearly
  against the header regardless of which theme's `--color-earth` is active.
- No changes to routing, the localStorage cart schema, visitor analytics tracking, or
  FormSubmit integration.

## Interim round 3 — what changed (drawer no longer auto-opens)

- `js/script.js`'s `addToCart()`: removed the `openCartDrawer()` call from the
  no-`redirect` branch entirely. Adding to cart still calls `setCart(cart)` (which
  updates the floating cart button's count/total, the cart page, the drawer's
  contents if it happens to be open, and checkout), it just no longer opens the
  drawer as a side effect. The `redirect`-explicit branch (visitor.js's marketing
  "take me to checkout" flow) is unchanged.
- Drawer-opening triggers are now exactly three: the floating cart button
  (`#floatingCartBtn`) and the two header cart icons (`.cart-link`, `.desktop-cart`)
  — all still call `openCartDrawer()` via their existing `onclick` handlers.
- No changes to `js/partial.js` or `js/visitor.js`.

## Phase 2 — what changed

- **New slide-in cart drawer** (`index.html`, `css/style.css`, `js/script.js`): a
  right-side overlay (`#cartDrawer` / `#cartDrawerOverlay`) showing live cart contents
  with quantity steppers and remove buttons, a running total, and two actions ("View
  Full Cart" → `#/cart`, "Checkout" → `#/checkout`). Opens via `openCartDrawer()`,
  closes via `closeCartDrawer()`, the overlay click, or Escape. The existing `#/cart`
  and `#/checkout` routes/views are unchanged and still work directly (e.g. deep
  links, browser back) — the drawer is an additional fast path, not a replacement.
- **Header cart icon (mobile + desktop) and the Phase-1 sticky cart bar's "View Cart"
  button** now open the drawer instead of navigating to `#/cart` (their `href="#/cart"`
  stays in the markup as a fallback).
- **`addToCart()`** no longer force-navigates by default — see decisions log above.
  `js/visitor.js`'s `showProductAlert()` marketing popup still explicitly passes
  `"#/checkout"` and is completely unaffected.
- **`setCart()`** is now the single place that refreshes every cart-dependent view
  (cart count badge, sticky bar, cart page, drawer, checkout summary + totals) on every
  mutation — so adjusting quantity from the drawer, the cart page, or checkout itself
  all stay in sync everywhere immediately. This replaced several duplicated
  `renderCart()` calls that used to live in `removeFromCart`/`clearCart`/`incQty`/
  `decQty`/`updateQty`.
- **Checkout line items are now editable in place** (`renderCheckoutItems()`): each
  line has quantity +/− controls and a remove button (reusing the same cart-row
  primitives as the drawer/cart page), so adjusting an order no longer requires
  detouring back to `#/cart` — this is what makes checkout feel single-page in
  practice, not just in DOM structure.
- Shared markup helpers `qtyControlsHTML(id, qty)` and `cartRowHTML(row, p)` were
  extracted so the cart page, the drawer, and (partially, via the stepper) checkout
  don't each duplicate the same row/stepper HTML.
- No changes to `js/partial.js` (checkout/contact FormSubmit + validation) or the rest
  of `js/visitor.js` (analytics tracking, timed marketing popups).

## Phase 1 — what changed

- `index.html`: added a USP strip and a horizontally-scrollable category quick-links
  row directly under the hero (before Featured Products), reusing the existing
  `#/products?cat=X` links/icons from the Categories view. "Why HAYATIQ" + "How It
  Works" now render as a 2-column grid on mobile (was hardcoded to 1 column) to cut
  scroll depth. Added the sticky mobile cart bar markup near the end of `<body>`.
- `js/script.js`: simplified `productCard()` — removed "Quick View" and the full-width
  "Message" button; the add-to-cart action is now a compact icon button always visible
  next to the price (not hover-gated), with `stopPropagation` so it no longer triggers
  card navigation. Added `updateStickyCartBar()`, wired into `setCart()` (so it reflects
  every cart mutation) and `navigate()` (so it shows/hides correctly per route).
- `css/style.css`: added `.usp-strip`, `.category-chips`, `.how-it-works-grid`,
  `.product-footer`, `.btn-icon-add`, and `.sticky-cart-bar` styles; removed the
  now-unused hover-only `.product-overlay`/`.quick-view`/`.messenger-btn` rules and
  moved the card hover-lift effect to a `min-width:700px` (desktop-only) enhancement,
  since add-to-cart no longer depends on hover to be reachable; reserved bottom padding
  on mobile so the sticky bar never overlaps page content or the footer.
- No changes to `js/partial.js` or `js/visitor.js` — cart/contact form submission and
  visitor-behavior tracking are unaffected (tracking still keys off the `addToCart(...)`
  inline `onclick`, which is preserved).
