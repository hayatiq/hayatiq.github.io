# 🧭 Overview

The Hayatiq shop is a plain HTML/CSS/JavaScript site: no npm, no build tools, no database.
The live shop is **https://hayatiq.netlify.app**, deployed by Netlify from the `main` branch
(the old `hayatiq.github.io` address just forwards visitors there).

| What | Where |
| --- | --- |
| Products, prices, photos, reviews | `js/products.js` |
| Shop settings: who gets order emails/Telegram, delivery times, Bangla switch, homepage top section, analytics | `js/config.js` |
| Delivery charges (`SHIPPING_RATES`), categories on the products page, homepage "Shop by need" chips, site-wide testimonials | `js/script.js` |
| Bangla text for the interface | `js/i18n.js` |
| Telegram alerts and the order sheet (runs on Netlify) | `netlify/functions/order.js` |
| The order sheet's own script | `google-apps-script/orders.gs` |
| Helper scripts (photos, link previews, local test server) | `tools/` |

## Running it on your computer (and phone)

```bash
node tools/dev-server.js
```

Open `http://localhost:8888`. To try it on your phone, connect it to the same Wi-Fi and open
`http://<your computer's Wi-Fi IP>:8888`. Reload after editing a file (there's no auto-reload).

Away from the live address the site is in **test mode**: a yellow **TEST MODE** bar shows, and
orders, emails, Telegram alerts and visit summaries go through their normal flow but nothing is
sent (see "Order Notifications" below for testing real sends).

## Deploying

Push to `main` and Netlify publishes it within a minute. At each deploy Netlify runs two small
steps (`netlify.toml`); neither can break a deploy:

- `tools/asset-versions.js` gives every css/js link a version, so phones keep those files and
  only download what changed.
- `tools/product-pages.js` makes each product link show that product's photo, name and price
  when shared on Facebook, Messenger or WhatsApp. It also writes `sitemap.xml` for Google
  (`robots.txt` points to it).

**Trying a change before it goes live:** push a branch and open a pull request on GitHub. Netlify
adds a **Deploy Preview** link to the pull request: a full copy of the site (in test mode, so
nothing is sent), where link previews work too. Merge the pull request to go live.

**Link previews** only work on a deployed address, never on your computer: Facebook and WhatsApp
fetch the link from their own servers. Facebook remembers a link's preview; to refresh one that
was shared before a change, paste the link into the
[Sharing Debugger](https://developers.facebook.com/tools/debug/) and click **Scrape Again**.

---

# 🚀 Messenger Product Automation (ManyChat)

Set up auto-replies for when someone opens a Messenger link from the site
(`m.me/hayatiq.life?ref=...`). These are the `ref` values the site uses:

| `ref` | Where the link is |
| --- | --- |
| the product's `slug`, e.g. `magnesium-oil` | "Ask a Question" on a product page, and "Ask about this" on Coming Soon products |
| `notify-<category or need>`, e.g. `notify-hair-care`, `notify-better-sleep` | "Notify me" on a category or need page with no products yet |
| `order-<order number>`, e.g. `order-HQ-261017-4K7P` | "Ask about this order" on the order page and in My Orders |
| `cart-help`, `checkout-help`, `featured-help`, `contact`, `page-not-found` | help links on those pages |

Every link works without an automation (it opens a normal Messenger conversation); it just
won't auto-reply until you set one up.

---

## Steps

### 1. New Automation

* Go to **Automation → + New Automation → Start From Scratch**.

### 2. Add Trigger

* Add a **Messenger Ref Parameter** trigger.
* Enter your **Custom Ref** (e.g., `scalp-elixir`).
* This must match your link:

  ```
  https://m.me/hayatiq.life?ref=scalp-elixir
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

Order emails, contact-form messages and visit summaries are sent through
[FormSubmit](https://formsubmit.co/), so the site needs no email server. The site sends them
itself (`js/partial.js` and `js/visitor.js`, to `https://formsubmit.co/ajax/<address>`), so
there's no form `action` to set up.

---

## Steps

### 1. Choose the addresses

The addresses are in `NOTIFY.emails` in `js/config.js` (`business` and `developer`), and which
messages each one gets is in the lists below them. See "Order Notifications" below.

### 2. Activate a new address

The first email FormSubmit sends to a new address is an **activation email** instead of the
message. Open it and click the link once; after that, messages arrive normally.

### 3. Mind the quota

Every email to every recipient is one FormSubmit submission, and FormSubmit limits how many a
site can send. That's why testing never sends anything (test mode), and why visit summaries are
capped per device.

### 4. Test

* Send a test from your computer with real sends on (see "Testing real sends locally" below), or
  place a real order on the live site with a name like "TEST".
* Check the inbox (and spam folder) for the email.

---

✅ That’s it! Emails go out without any backend.

---

# 🛒 Adding a Product

Products live only in `js/products.js`. Follow these steps carefully to avoid errors.

---

## 1. Locate the Products Array

Open `js/products.js` and find the constant:

```js
const PRODUCTS = [
  // existing product objects
];
```

---

## 2. Add a New Product Object

Copy an existing product of the same kind and change it, or start from this example:

```js
{
  id: "19",                          // unique, never reused
  name: "Rosemary Hair Oil",
  subtitle: "100ml",                 // optional: size or weight, shown under the name
  slug: "rosemary-hair-oil",         // the page address: /product/rosemary-hair-oil
  price: 650,                        // a number, or "Coming Soon"
  category: "Hair Care",
  images: ["./images/hayatiq_rosemary_oil.webp"],
  short: "A light rosemary oil for scalp massage.",
  ingredients: ["Rosemary", "Coconut oil"],
  how: ["Scalp Massage: Warm a few drops in your palms.; Massage into the scalp for 5 minutes.;"],
  tips: ["Leave it on overnight for a deeper treatment."],
  warns: ["Patch test before first use."],
  storage: ["Store in a cool, dry place away from sunlight."],
  benefits: [],                      // optional, see below
  concerns: [],
  reviews: [],
  topSelling: false,
  badge: null,
  related: [],
  display_order: null,
},
```

---

## 3. Key Notes

* **Required keys**: `id`, `name`, `slug`, `price`, `category`, `images`, `short`, `ingredients`,
  `how`, `tips`, `warns`, `storage` (a product with `variants` may keep `price` and `images` on
  its variants instead). Everything else is optional.
* **Content not ready yet?** `ingredients`, `how` and `tips` can be `[]`; the product page just
  leaves that section out. `warns: PLACEHOLDER_WARNS` and `storage: PLACEHOLDER_STORAGE` give
  standard "coming soon" text.
* **No photo yet?** Use `images: ["./images/placeholder.webp"]`. Such products show a green
  name tile instead of a picture, stay off the homepage and "You may also like", and are listed
  last. For real photos, see "Adding or Replacing Product Photos" below.
* **Price Handling**:

  * `"Coming Soon"` → product is not yet available for purchase (its page shows "Coming Soon").
  * Numeric value (e.g., `540`) → product is live and can be ordered.
* **Slug**: don't change it once the product is live. It's the product's address, so old links,
  Messenger refs and Google results would stop working.
* **How to Use** (`how`): each entry is one tab, written `"Tab Name: point one; point two;"`.
  Keep the `:` and the `;` after each point. `howToUseNote` (optional) shows one line above the
  tabs, e.g. `"Shake well before use."`.
* **Benefits** (`benefits`, optional): up to 3 short ticks under the description, e.g.
  `["Better sleep", "Muscle cramps"]`. Word them only from the product's own text; never claim
  something the product copy doesn't say.
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
* **Choices** (shape, scent, color…): for a product made to order from several choices, use
  `attributes` (each with `id`, `label`, `choices`, and optional `showIf` to show it only after
  another choice), `defaultSelections`, and `priceMatrix` for choices that cost more. The Bath
  Bomb (`id: "12"`) is the working example to copy.
* **Bangla** (`bn`, optional but every product has one): the product's Bangla text. See
  "Bangla Version" below.
* **Category Management**:

  * A new category has to be added in four places: the homepage "Shop by Category" tiles and the
    `#view-categories` page in `index.html`, `FILTER_CATEGORIES` in `js/script.js` (the
    products page chips), and its Bangla name in `BN` in `js/i18n.js`. The current categories
    are Hair Care, Magnesium Oil Spray, Salves & Balms, Bath Bombs, Footsoaks, Oral Care, and
    Cleaning Supply.
  * The product's `category` must match one of these names exactly.
* **"Shop by need" tags** (`concerns`, optional): an array of need/concern tags this
  product genuinely helps with, e.g. `concerns: ["Better Sleep", "Muscle Recovery"]`.
  Base these on the product's own real usage guidance (its `how`/`tips` fields), not
  guesswork. Leave `concerns: []` if none clearly apply yet. This powers the homepage
  "Shop by need" chips — see `NEED_TILES` in `js/script.js` to add a chip for a new tag
  (e.g. `{ label: "Stress Relief", icon: "fa-...", concern: "Stress Relief" }`). The icon must
  exist in `js/icons.js`, and the label needs a Bangla entry in `js/i18n.js`.
* **"You may also like"** (`related`, optional): a list of product ids shown first on this
  product's page, e.g. `related: ["11", "14"]`. Same-category products and best sellers fill the
  rest (up to 4), so `related: []` still shows suggestions.
* **Search results** (`seoTitle`, `metaKeywords`, optional): replace the page title and keywords
  Google sees for this product. The description Google sees is always `short`.
* **Display order** (`display_order`, optional number): controls the order products
  appear in **everywhere** a product list renders — Best Sellers, Shop Our Products, the
  full Products page, and every category/need filter of it. Lower numbers show first (`1`
  before `2`). Leave it `null` on any product you don't care about ordering — it'll sort
  after every product that does have a number, in its normal position in the `PRODUCTS`
  array. Two products with the same number keep their order in the array. No other code
  to touch: the `PRODUCTS.sort(...)` call at the end of `js/products.js` does the rest.

---

## 4. Test

1. Save `js/products.js`.
2. Reload the site.
3. Check that the product appears correctly in its category, and open its page.
4. Confirm “Coming Soon” products do not have an active purchase button.
5. Switch to **বাং** in the header and check the Bangla page too.
6. After deploying, share the product link in Messenger to check its preview.

---

✅ That’s it! You can now safely add new products to the site.

---

# 🌟 Adding Customer Reviews

The site has no backend, so reviews aren't submitted through a form — they're added
manually by editing each product's `reviews` array in `js/products.js`, the same way
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
* `text` — the review text, shown as written (a review in Bangla stays in Bangla).

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
`js/script.js` (ships empty, same pattern as `reviews`), not into a single product's `reviews` list:

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

1. Save `js/products.js` (per-product `reviews`) or `js/script.js` (`TESTIMONIALS`).
2. Reload the site and open that product's page.
3. Confirm the average rating/star count under the price and each review card in the
   "Customer Reviews" box display correctly.
4. A product with `reviews: []` shows no rating and no reviews box at all — that's expected.
5. Add an entry to `TESTIMONIALS` and confirm the homepage "Customer Love" section
   appears; empty it back out and confirm the section disappears again.

✅ That's it! Reviews you add here show up for every visitor once deployed.

---

# 🏷️ Adding Product Card Badges

Every product has a `badge` field in `js/products.js` (ships as `null` — no badge shown).
Set it to one of the following to show a small colored badge on that product's card
in the shop grid:

```js
badge: "hot",      // 🔥 red "Hot" badge
badge: "new",      // ⚡ blue "New" badge
badge: "sale",     // 🏷️ green "Sale" badge
badge: "popular",  // 👑 amber "Popular" badge
badge: null,       // no badge (default)
```

Badges don't show on "Coming Soon" products (their cards show an "Ask about this" Messenger
button instead). The colors are fixed regardless of which theme (`sand`/`cool`/`betterme`,
`data-theme` at the top of `index.html`) is active — shoppers expect "Hot"/"Sale" to look the
same everywhere.

There's a fifth, automatic badge: setting `topSelling: true` on a product shows a gold
"⭐ Best Seller" badge without needing to also set `badge: "popular"` — an explicit
`badge` field always takes priority if both are set on the same product.

That same `topSelling` field also controls the homepage "Best Sellers" carousel (a
sideways-scrolling row with its own card size — see `.product-card-carousel` in
`css/style.css`): a product only appears there once `topSelling` is set to `true`, and
disappears the moment it's set back to `false`. There's no automatic fallback — if nothing
is marked `topSelling: true`, the whole section hides itself rather than showing an empty row.

**New Arrival convention:** when a "Coming Soon" product goes live (switch its `price`
from `"Coming Soon"` to a number), consider also setting `badge: "new"` for the first
2–4 weeks to flag it as a fresh arrival to returning visitors, then clear it back to
`null` once that window passes.

✅ That's it! Save `js/products.js` and reload to see the badge on that product's card.

---

# 🇧🇩 Bangla Version

A **বাং / EN** button in the header switches the whole site to Bangla; the choice is remembered
on that phone. `SHOW_BANGLA` in `js/config.js` turns the button on (`true`) or off (`false`).

- **Interface text** (buttons, headings, messages) is translated in `js/i18n.js`: `BN` for exact
  text, `BN_PATTERNS` for text with numbers or names in it. **Any new text you add to the site
  needs a Bangla entry there**, or it stays English in Bangla mode.
- **Product text** comes from each product's `bn` block in `js/products.js`. It must keep the
  English shape: the same number of items in each list, in the same order, the same `<b>`/`<i>`
  tags, and the same number of `;` points in each `how` tab. Fields you leave out stay English.

  ```js
  bn: {
    name: "রোজমেরি হেয়ার অয়েল",
    subtitle: "১০০ মিলি",
    short: "মাথার ত্বকে ম্যাসাজের জন্য হালকা রোজমেরি অয়েল।",
    ingredients: ["রোজমেরি", "নারকেল তেল"],
    how: ["স্ক্যাল্প ম্যাসাজ: কয়েক ফোঁটা হাতের তালুতে গরম করুন।; ৫ মিনিট মাথার ত্বকে ম্যাসাজ করুন।;"],
    tips: ["আরও ভালো ফলের জন্য সারারাত রেখে দিন।"],
    warns: ["প্রথমবার ব্যবহারের আগে প্যাচ টেস্ট করুন।"],
    storage: ["ঠান্ডা, শুকনো জায়গায় রোদ থেকে দূরে রাখুন।"],
  },
  ```
  Variant names go in `bn.variants` (by variant `id`), and choice names in `bn.choices`.
- Prices keep English digits (৳850), because ৳ and ৮ look almost the same in Bangla. Sizes,
  counts and dates use Bangla digits.
- Order emails, Telegram alerts, the order sheet and the PDF invoice always stay English.
- If a Bangla `how` tab has a different number of points than the English one, it's skipped
  (the browser console says which one).

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
off, and `orderSheet: false` turns off the sheet. Each email is one FormSubmit submission, so every
extra recipient uses quota. The order counts as received if any channel works; if all fail, the
customer sees their order with a "Send on Messenger" button and their cart is kept.

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

## What the customer gets

- After ordering, the order page shows the order number and an invoice they can save
  (**Download PDF**; inside the Facebook app it opens as a picture to long-press and save).
- **My Orders** (`/orders`) lists the orders placed from that phone, kept only on the phone (latest
  10, up to 90 days; never the address or phone number). From there they can **Ask about this
  order** (opens Messenger with `ref=order-<number>` and copies the number) or **Order again**
  (refills the cart; they still have to press Place Order).
- Checkout remembers their name, phone, address and delivery area on that phone.

## Limits that protect the quota

Each phone/browser can send at most **5 orders per 20 minutes** and **3 contact messages per
hour** (`js/partial.js`). Placing the same items again within 30 minutes asks "Place it again?"
first (`SAME_ORDER_MINUTES` in `js/script.js`), so a double tap doesn't make two orders.

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
- Phone numbers that appear on more than one order are highlighted yellow. The same order number
  never gets two rows.
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
  **Website ID** into `UMAMI_WEBSITE_ID` in `js/config.js` (empty turns it off). It records page
  views plus these events: `product_view`, `add_to_cart`, `begin_checkout`, `order_placed`,
  `order_failed`, `share`, `order_again`. Compare it with the visit emails for a while to see which
  numbers you trust.
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
