# 🚀 Messenger Product Automation (ManyChat)

Set up auto-replies for products when users click a Messenger link (`m.me/username?ref=product-slug`).

**Also used for category "Notify Me" links:** any category page with zero live products shows a
"Notify Me" Messenger link using `ref=notify-{category}` (e.g. `ref=notify-skincare`) — see
`renderCategoryAvailability()`/`renderProducts()` in `script.js`. Follow the same steps below to set up
a ManyChat automation for each `notify-*` ref if you want an automated reply; until you do, the link
still works (it opens a normal Messenger conversation), it just won't auto-reply.

---

## Steps

### 1. New Automation

* Go to **Automation → + New Automation → Start From Scratch**.

### 2. Add Trigger

* Add a **Messenger Ref Parameter** trigger.
* Enter your **Custom Ref** (e.g., `scalp-elixir`).
* This must match your link:

  ```
  https://m.me/username?ref=scalp-elixir
  ```

### 3. Bot Field

* Go to **Settings → Fields → Bot Fields → + New Bot Field**.
* Name: `Product_Name` (or similar).
* Type: Text.
* Value: Product name (e.g., `Scalp Elixir`).

### 4. Message

* Add a **Send Message** card.
* Example:

  ```
  Hi {{first_name}} 👋,  
  I see you’re interested in {{Product_Name}}.
  ```

### 5. Publish

* Click **Set Live**.

### 6. Test

* Visit your link with the `ref` parameter.
* Confirm the bot replies with the product message.

---

✅ Done! You can repeat these steps for each new product.

---

# 📧 Sending Email with FormSubmit

Easily send form submissions to your email using [FormSubmit](https://formsubmit.co/).

---

## Steps

### 1. Form Action

Use this URL in your form’s `action`:

```html
<form action="https://formsubmit.co/YOUR_EMAIL" method="POST">
```

Replace `YOUR_EMAIL` with the email address where you want messages delivered.

---

### 2. Add Fields

Example form:

```html
<form action="https://formsubmit.co/youremail@example.com" method="POST">
  <input type="text" name="name" required placeholder="Your Name">
  <input type="email" name="email" required placeholder="Your Email">
  <textarea name="message" required placeholder="Your Message"></textarea>
  <button type="submit">Send</button>
</form>
```

---

### 3. Optional Settings

* Add a hidden field to redirect after submission:

  ```html
  <input type="hidden" name="_next" value="https://yoursite.com/thank-you">
  ```
* Add `_captcha=false` to disable captcha.

---

### 4. Test

* Fill out the form on your site.
* You must confirm the form first time.
* Check your email inbox for the submission.

---

✅ That’s it! Your form now sends emails without any backend.

---

# 🛒 Adding a Product

Developers can add products by editing `script.js`. Follow these steps carefully to avoid errors.

---

## 1. Locate the Products Array

Open `script.js` and find the constant:

```js
const PRODUCTS = [
  // existing product objects
];
```

---

## 2. Add a New Product Object

Add a new object with all the required keys. Example:

```js
{
  id: "2",
  name: "Loofah Soap Bar (Neem + Moringa)",
  slug: "loofah-soap",
  price: "Coming Soon", // Use a number (e.g., 540) to auto-enable product
  category: "Wellness",
  images: [
    "./images/hayatiq_loofah_soap.jpg",
    "https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?q=80&w=1200&auto=format&fit=crop",
  ],
  short: "Calming balm for pulse points & lips.",
  ingredients: ["Shea butter", "Lavender", "Beeswax"],
  how: ["Massage a small amount where needed."],
  tips: ["Shake well before use", "as deodorant", "muscle relief"],
  warns: ["Avoid during allergy flare‑ups."],
  storage: [
    "Keep bottle tightly sealed. Store in a cool, dry place away from direct sunlight, heat, or children’s reach.",
    "Use within 6 months of manufacture."
  ],
},
```

---

## 3. Key Notes

* **All keys are required**. Missing keys may cause errors on the site.
* **Price Handling**:

  * `"Coming Soon"` → product is not yet available for purchase.
  * Numeric value (e.g., `540`) → product is live and visible to users.
* **Category Management**:

  * Categories are listed in `index.html` around line 130.
  * Add new category names there to match your product’s `category` field.
* **"Shop by Need" tags** (`concerns`, optional): an array of need/concern tags this
  product genuinely helps with, e.g. `concerns: ["Better Sleep", "Muscle Recovery"]`.
  Base these on the product's own real usage guidance (its `how`/`tips` fields), not
  guesswork. Leave `concerns: []` if none clearly apply yet. This powers the homepage
  "Find the Right Product" tiles — see `NEED_TILES` in `script.js` to add a new tile
  for a tag you've started using (e.g. once a few products are tagged "Stress Relief",
  add `{ label: "Stress Relief", icon: "fa-...", concern: "Stress Relief" }` there so a
  tile appears for it).

---

## 4. Test

1. Save `script.js`.
2. Reload the site.
3. Check that the product appears correctly in its category.
4. Confirm “Coming Soon” products do not have an active purchase button.

---

✅ That’s it! You can now safely add new products to the site.

---

# 🌟 Adding Customer Reviews

The site has no backend, so reviews aren't submitted through a form — they're added
manually by editing each product's `reviews` array in `script.js`, the same way you'd
edit any other product field.

## 1. Find the Product

Locate the product in the `PRODUCTS` array and find its `reviews` key (it ships empty):

```js
reviews: [],
```

## 2. Add a Real Review

Add one object per review, using only genuine feedback you've actually received
(e.g. from a customer over Messenger or Facebook):

```js
reviews: [
  { name: "Nusrat A.", rating: 5, text: "Absorbs fast and the tingling fades within a minute. Repurchasing!" },
  { name: "Rafiul H.", rating: 4, text: "Good product, wish the bottle were a bit bigger." },
],
```

* `name` — the reviewer's name (or however they'd like to be credited).
* `rating` — a whole number from 1–5.
* `text` — the review text.

Two more optional fields are supported on any review:

```js
{ name: "Nusrat A.", rating: 5, text: "...", image: "./images/reviews/nusrat-1.jpg", source: "Messenger" }
```

* `image` — a photo the customer shared (their own photo of the product, or a screenshot of their
  conversation with you). Before publishing any screenshot, crop out phone numbers or other personal
  details, and confirm the customer is okay with it being shared.
* `source` — where the feedback came from (e.g. `"Messenger"`, `"Facebook"`). Shown as a small "via ..."
  label under the review.

Leave both out for a plain text review — nothing changes for existing reviews.

## 3. Adding Site-Wide Testimonials (Customer Love)

Some customer feedback isn't about one specific product — a Messenger screenshot praising the whole
ordering experience, for example. That kind of content goes in the separate `TESTIMONIALS` array in
`script.js` (ships empty, same pattern as `reviews`), not into a single product's `reviews` list:

```js
const TESTIMONIALS = [
  {
    type: "screenshot",      // "text" | "photo" | "screenshot"
    customerName: "Farhana S.",
    rating: 5,               // optional
    content: "Ordered on Wednesday, arrived exactly as described!", // optional
    image: "./images/testimonials/farhana-screenshot.jpg", // required for photo/screenshot
    source: "Messenger",     // optional
  },
];
```

The homepage "Customer Love" section shows these automatically once at least one entry exists, and
hides itself entirely while the array is empty — so there's nothing else to wire up. Same privacy rule
as review screenshots: redact personal details and get the customer's okay before publishing.

## 4. Test

1. Save `script.js`.
2. Reload the site and open that product's detail page.
3. Confirm the average rating/star count and each review card display correctly.
4. An empty `reviews: []` array correctly shows "No reviews yet." — that's expected
   for products you haven't added reviews to yet.
5. Add an entry to `TESTIMONIALS` and confirm the homepage "Customer Love" section
   appears; empty it back out and confirm the section disappears again.

✅ That's it! Reviews you add here show up for every visitor immediately.

---

# 🏷️ Adding Product Card Badges

Every product has a `badge` field in `script.js` (ships as `null` — no badge shown).
Set it to one of the following to show a small colored badge on that product's card
in the shop grid:

```js
badge: "hot",      // 🔥 red "Hot" badge
badge: "new",      // ⚡ blue "New" badge
badge: "sale",     // 🏷️ green "Sale" badge
badge: "popular",  // 👑 amber "Popular" badge
badge: null,       // no badge (default)
```

Badges don't show on "Coming Soon" products (the coming-soon overlay already covers
the image). The colors are fixed regardless of which theme (`sand`/`cool`/`betterme`)
is active — shoppers expect "Hot"/"Sale" to look the same everywhere.

There's a fifth, automatic badge: setting `bestSeller: true` on a product shows a gold
"⭐ Best Seller" badge without needing to also set `badge: "popular"` — an explicit
`badge` field always takes priority if both are set on the same product. This is the
mechanism that replaced the old separate homepage "Best Sellers" grid: there's now one
unified product grid, and best sellers are surfaced by badge instead of a duplicate
section.

**New Arrival convention:** when a "Coming Soon" product goes live (switch its `price`
from `"Coming Soon"` to a number), consider also setting `badge: "new"` for the first
2–4 weeks to flag it as a fresh arrival to returning visitors, then clear it back to
`null` once that window passes.

✅ That's it! Save `script.js` and reload to see the badge on that product's card.

