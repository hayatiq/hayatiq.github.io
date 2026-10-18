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

Developers can add products by editing `products.js`. Follow these steps carefully to avoid errors.

---

## 1. Locate the Products Array

Open `products.js` and find the constant:

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
  category: "Salves & Balms",
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
* **Variants**: If one product has options with different prices, weights, or images, keep one
  parent product and add a `variants` array. Each variant needs an `id`, `label`, `price`,
  `subtitle`, and `images`; add `default: true` to one variant when it should be selected first.
  If no variant is marked default, the first variant is selected. The selected variant is kept
  separate in the cart, so customers can buy multiple options of the same product.

  ```js
  variants: [
    { id: "bar", label: "Bar", subtitle: "83g+", price: 190, images: ["./images/bar.webp"] },
    { id: "block", label: "Block", subtitle: "500g", price: 750, images: ["./images/block.webp"], default: true },
  ],
  ```
* **Category Management**:

  * Categories are listed twice in `index.html`: the homepage "Shop by Category" tiles
    and the `#view-categories` page — both need a matching card/tile when you add a
    new category. The current categories are Hair Care, Magnesium Oil Spray,
    Salves & Balms, Bath Bombs, Footsoaks, Oral Care, and Cleaning Supply.
  * Add new category names there to match your product’s `category` field.
* **"Shop by Need" tags** (`concerns`, optional): an array of need/concern tags this
  product genuinely helps with, e.g. `concerns: ["Better Sleep", "Muscle Recovery"]`.
  Base these on the product's own real usage guidance (its `how`/`tips` fields), not
  guesswork. Leave `concerns: []` if none clearly apply yet. This powers the homepage
  "Find the Right Product" tiles — see `NEED_TILES` in `script.js` to add a new tile
  for a tag you've started using (e.g. once a few products are tagged "Stress Relief",
  add `{ label: "Stress Relief", icon: "fa-...", concern: "Stress Relief" }` there so a
  tile appears for it).
* **"You may also like"** (`related`, optional): a list of product ids shown first on this
  product's page, e.g. `related: ["11", "14"]`. Same-category products and best sellers fill the
  rest (up to 4), so `related: []` still shows suggestions.
* **Display order** (`display_order`, optional number): controls the order products
  appear in **everywhere** a product list renders — Top Selling Products, Shop Our
  Products, the full Products page, and every category/need filter of it. Lower
  numbers show first (`1` before `2`). Leave it `null`/unset on any product you don't
  care about ordering — it'll just sort after any product that does have a number, in
  its normal position in the `PRODUCTS` array. If two products share the same number
  (or both are left unset), which one shows first between just those two isn't
  guaranteed — don't rely on that case to break a tie. Setting it works by re-sorting
  the whole `PRODUCTS` array once when the site loads (see the `PRODUCTS.sort(...)`
  call at the end of `products.js`), so you only ever need to set the field — no
  other code to touch.

---

## 4. Test

1. Save `products.js`.
2. Reload the site.
3. Check that the product appears correctly in its category.
4. Confirm “Coming Soon” products do not have an active purchase button.

---

✅ That’s it! You can now safely add new products to the site.

---

# 🌟 Adding Customer Reviews

The site has no backend, so reviews aren't submitted through a form — they're added
manually by editing each product's `reviews` array in `products.js`, the same way
you'd edit any other product field.

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

1. Save `products.js` (per-product `reviews`) or `script.js` (`TESTIMONIALS`).
2. Reload the site and open that product's detail page.
3. Confirm the average rating/star count and each review card display correctly.
4. An empty `reviews: []` array correctly shows "No reviews yet." — that's expected
   for products you haven't added reviews to yet.
5. Add an entry to `TESTIMONIALS` and confirm the homepage "Customer Love" section
   appears; empty it back out and confirm the section disappears again.

✅ That's it! Reviews you add here show up for every visitor immediately.

---

# 🏷️ Adding Product Card Badges

Every product has a `badge` field in `products.js` (ships as `null` — no badge shown).
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

There's a fifth, automatic badge: setting `topSelling: true` on a product shows a gold
"⭐ Best Seller" badge without needing to also set `badge: "popular"` — an explicit
`badge` field always takes priority if both are set on the same product.

That same `topSelling` field also controls the homepage "Top Selling Products"
carousel (a different, carousel-sized card layout from the regular grid — see
`.product-card-carousel` in `style.css`): a product only appears there once
`topSelling` is set to `true`, and disappears the moment it's set back to `false`.
There's no automatic fallback — if nothing is marked `topSelling: true`, the whole
carousel section hides itself rather than showing an empty row.

**New Arrival convention:** when a "Coming Soon" product goes live (switch its `price`
from `"Coming Soon"` to a number), consider also setting `badge: "new"` for the first
2–4 weeks to flag it as a fresh arrival to returning visitors, then clear it back to
`null` once that window passes.

✅ That's it! Save `products.js` and reload to see the badge on that product's card.

---

# 📱 Order Notifications (email, Telegram, Google Sheet)

Every order gets a number like **HQ-261017-4K7P**. Who gets what is set in one place,
`NOTIFY` in **`js/config.js`**:

| Message | Business (hayatiq.life + main Telegram) | Developer (topukhan + developer Telegram) |
| --- | --- | --- |
| Order placed — email | ✓ | ✓ |
| Order placed — Telegram | ✓ | ✓ |
| Contact-form message — email | ✓ | ✓ |
| Contact-form message — Telegram | ✓ | ✓ |
| Visit summary — email | | ✓ |
| Order row in the Google Sheet | one shared sheet (owned by whoever creates it) | |

To change it, edit the lists (e.g. `visitSummaryEmails: ["developer"]`); `[]` turns that message
off. Each email is one FormSubmit submission, so every extra recipient uses quota. The order counts
as received if any channel works; if all fail, the customer sees their order with a "Send on
Messenger" button and their cart is kept.

**Secrets never go in the code.** Telegram chat IDs and the sheet address live in Netlify:
**Site configuration → Environment variables**. After adding or changing a variable, trigger a
new deploy (**Deploys → Trigger deploy → Deploy site**) — running sites only pick up variables on
the next deploy.

| Netlify variable | What it is | Needed for |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | The bot that sends alerts (already set) | All Telegram alerts |
| `TELEGRAM_CHAT_ID` | Business chat (already set) | Business Telegram |
| `TELEGRAM_DEV_CHAT_ID` | Developer chat | Developer Telegram |
| `TELEGRAM_DEV_BOT_TOKEN` | Optional — only if the developer chat uses a different bot | |
| `SHEET_WEBHOOK_URL` | The Google Apps Script web app address | Google Sheet |
| `SHEET_TOKEN` | A password shared with the sheet script | Google Sheet |

A chat or sheet whose variables aren't set yet is simply skipped; nothing breaks.

## Test mode

Orders, contact messages, Telegram alerts, sheet rows and visit emails are only sent from the live
address (`LIVE_HOSTS` in `js/config.js`). Anywhere else — your laptop, your phone over Wi-Fi, a Netlify
preview — a yellow **TEST MODE** bar shows and nothing is sent, so testing never uses FormSubmit quota.

## Testing real sends locally

To check that emails, Telegram alerts, sheet rows and visit summaries really arrive, without
deploying or logging in to Netlify:

1. Copy `.env.example` to `.env` and fill in the values (same names as the Netlify variables
   above). Git ignores `.env`, so the tokens never reach GitHub or the website. **Never put tokens
   in the code**: this repository and the site's scripts are public.
2. Run `node tools/dev-server.js` (Node 20.12 or newer) and open
   `http://localhost:8888/?send=real`. A red **REAL SENDS ON** bar shows; that tab now sends for
   real (emails go to the `NOTIFY` addresses, so use a test name like "TEST" on orders).
3. Click **turn off** in the bar (or open `?send=test`) when done. A new tab starts in test mode again.

**Switch each kind of message on or off** with these lines in `.env` (`true` or `false`; a missing
line means on). Restart the server after changing them (or after pulling new code), then reload
the page. If the page was served some other way, a yellow **REAL SENDS BLOCKED** bar shows and
nothing is sent. They only affect local testing; the live
site always sends everything in `NOTIFY`.

| `.env` line | Controls |
| --- | --- |
| `SEND_ORDER_EMAILS` | Order emails |
| `SEND_CONTACT_EMAILS` | Contact-form emails |
| `SEND_VISIT_EMAILS` | Visit summary emails |
| `SEND_ORDER_TELEGRAM` | Telegram order alerts |
| `SEND_CONTACT_TELEGRAM` | Telegram contact-form alerts |
| `SEND_ORDER_SHEET` | Google Sheet rows |

After a test order, a red-bordered **Test details** box on the order page shows what each channel
did (sent, switched off, not-configured, or FormSubmit's own error message). It only appears on
your computer, never on the live site.

Real sends can only be switched on at `localhost` and home-network addresses, never on the live
site or a Netlify preview. The first email from a new address may make FormSubmit send an
activation email; click its link once.

## 1. Developer Telegram chat (same bot)

1. In the developer's Telegram, open the existing order bot (search its @username) and press
   **Start** (or send "hi"). A bot can't message anyone who hasn't started it.
2. Get that account's chat ID: message **@userinfobot**; it replies with your `Id` (a number).
   For a group instead: add the bot to the group and use the group's ID (starts with `-`).
3. In Netlify add `TELEGRAM_DEV_CHAT_ID` = that number, then trigger a deploy.

The next real order goes to both chats. (Setting up a brand-new bot instead? Create it with
**@BotFather** `/newbot`, start it from the developer account, and also add its token as
`TELEGRAM_DEV_BOT_TOKEN`.)

## 2. Google order sheet

**Create the sheet and add the script**

1. Signed in to the Google account that should own the orders (e.g. the developer's), open
   [sheets.new](https://sheets.new) and name the sheet **Hayatiq Orders**.
2. Menu **Extensions → Apps Script**. A code editor opens in a new tab.
3. Delete everything in `Code.gs`, paste the whole of `google-apps-script/orders.gs` from this
   repository, and click **Save** (disk icon).
4. On the line `const TOKEN = "CHANGE-ME-to-a-long-random-text";` replace the text between the
   quotes with your own long random password (e.g. 30+ letters and numbers). Save again.

**Check it works**

5. In the toolbar, pick **testOrder** in the function dropdown and click **Run**.
6. The first time, Google asks for permission: **Review permissions → choose your account**. If you
   see "Google hasn't verified this app", click **Advanced → Go to (project name) (unsafe)** — it's
   your own script — then **Allow**.
7. Go back to the sheet: a new **Orders** tab has a header row and one "Test order (delete me)" row.
   Delete that row (right-click the row number → Delete row).

**Publish it so the website can send rows**

8. In Apps Script click **Deploy → New deployment**. Click the gear next to "Select type" and choose
   **Web app**. Description: "Hayatiq orders". **Execute as: Me**. **Who has access: Anyone**.
   Click **Deploy** (approve permissions again if asked).
9. Copy the **Web app URL** (ends in `/exec`).
10. In Netlify add `SHEET_WEBHOOK_URL` = that URL and `SHEET_TOKEN` = the same password you put in
    `TOKEN`. Trigger a deploy.

"Anyone" only means the address can be called; nobody can read your sheet through it, and rows are
only added when the password matches. Keep the URL and password private.

**Using it**

- Change each order's **Status** from the dropdown: New → Confirmed → Shipped → Delivered (or
  Cancelled / Returned / Fake). Use **Courier tracking** and **Team notes** freely.
- Phone numbers that appear on more than one order are highlighted yellow.
- To let the business see it, use the sheet's **Share** button.
- If you edit the script later: **Deploy → Manage deployments → ✏️ Edit → Version: New version →
  Deploy**. This keeps the same URL, so Netlify needs no change.

## 3. Visit summaries and Umami analytics

- **Visit summary emails** (one per visit, plus an update only if the visitor does something new)
  go to the recipients in `NOTIFY.visitSummaryEmails`. The subject shows what happened: 🎉 order
  placed, 📬 contact message, 🔥 checkout filled but not ordered, 🛒 abandoned checkout, 🛍️ cart,
  👀 browsed. The email includes what's in the cart right now (even items added on an earlier visit).
- **Limit:** each phone/browser sends at most **2 visit emails per 10 minutes**
  (`VISIT_EMAIL_LIMIT` in `js/visitor.js`). A summary held back by the limit is sent later, marked
  "(sent late)", when that visitor switches tabs again or next opens the site (within a day).
- **Your own devices:** open `https://hayatiq.netlify.app/?notrack` once on each phone and browser
  you use (the Facebook app's browser counts separately). That browser then sends no visit emails
  and no Umami stats; orders still work. `?track` turns it back on.
- **Umami** (free, no cookies): create a site at [cloud.umami.is](https://cloud.umami.is), copy its
  **Website ID** into `UMAMI_WEBSITE_ID` in `js/config.js`. It records page views plus these events:
  `product_view`, `add_to_cart`, `begin_checkout`, `order_placed`, `order_failed`. Compare it with the
  visit emails for a while to see which numbers you trust.
- **Tag the links you share** so both reports show which post or ad brought each visitor and order:
  `https://hayatiq.netlify.app/product/magnesium-oil?utm_source=facebook&utm_medium=post&utm_campaign=oct-offer`
  (`utm_source`: facebook / instagram / messenger; `utm_medium`: post / story / bio / ad / reply).

---

# 🖼️ Adding or Replacing Product Photos

Each photo needs these files with the same name:

1. `images/<name>.webp` — the main photo, at most about **1,100px wide**.
2. `images/cards/<name>.webp` — a **600px-wide** copy used on product cards and in the cart.
3. `images/md/<name>.webp` — an **800px-wide** copy, the product page photo on phones.
4. `images/og/<name>.jpg` — the picture shown when the product link is shared on Facebook,
   Messenger or WhatsApp.

You make only the first one; two commands make the rest. **Every time you add or replace a
photo:**

1. Make the main photo with [Squoosh](https://squoosh.app) (free, in the browser): open the
   photo, choose **WebP**, set the width to about 1,100px, and download it.
2. Save it in `images/` under a **new file name**, even when it replaces an old photo
   (e.g. `hayatiq_footsoak_2.webp`). Phones keep photos for 7 days, so a new photo saved under
   the old name may not show for some visitors until then — and the scripts below never
   redo a card copy that already exists.
3. Point the product at the new name in `js/products.js` (its `images` list).
4. Run, from the project folder (needs Pillow once: `pip install pillow`):
   ```bash
   python3 tools/photo-sizes.py   # makes images/cards/ and images/md/ copies
   python3 tools/og-images.py     # makes the link-preview pictures in images/og/
   ```
5. Commit the new files from `images/`, `images/cards/`, `images/md/` and `images/og/`
   together with `js/products.js`. You can delete the old photo's files once no product uses them.

Keeping photos small is what keeps the site fast on mobile data.
