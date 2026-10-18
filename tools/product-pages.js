#!/usr/bin/env node
/* Link previews for product pages.

   Facebook, Messenger and WhatsApp don't run the site's JavaScript: a shared link's
   preview card comes from the page's own <head> tags, which in index.html are the
   homepage's. Netlify runs this script before each deploy (netlify.toml). For every
   product it writes preview/<slug>.html — index.html with that product's title,
   description, photo and price in the head — and adds a rewrite to _redirects so
   /product/<slug> serves it. Visitors get the same page; only the head differs.

   Never fails the deploy: on any error it logs and exits 0, and product links keep
   working through the normal /* fallback (with the homepage preview).

   Local check (writes nothing into the repo):  node tools/product-pages.js --out /tmp/previews
*/
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const PAGE_DIR = "preview"; // served at /preview/<slug>.html
const MARK = "# Product link previews (added by tools/product-pages.js at deploy)";

function loadProducts() {
  const code = fs.readFileSync(path.join(ROOT, "js/products.js"), "utf8");
  const sandbox = {};
  vm.runInNewContext(`${code}\nthis.PRODUCTS = PRODUCTS;`, sandbox);
  return sandbox.PRODUCTS;
}

const escapeAttr = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const stripTags = (html) => String(html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const taka = (n) => `৳${Number(n).toLocaleString("en-US")}`;

// The product as a shopper first sees it: its default option's photo and price.
function productFacts(p, site) {
  const options = Array.isArray(p.variants) && p.variants.length ? p.variants : [p];
  const main = options.find((v) => v.default) || options[0];
  const prices = options.map((v) => v.price).filter((n) => typeof n === "number");
  const low = prices.length ? Math.min(...prices) : null;
  const price = low === null ? "" : prices.some((n) => n !== low) ? `from ${taka(low)}` : taka(low);
  const photo = (main.images || p.images || [])[0] || "";
  const stem = path.basename(photo, path.extname(photo));
  const og = path.join(ROOT, "images/og", `${stem}.jpg`);
  // No real photo yet: the brand card (images/og/brand.jpg), not another product's photo.
  const image =
    photo && !photo.includes("placeholder")
      ? fs.existsSync(og)
        ? { url: `${site}/images/og/${stem}.jpg`, sized: true }
        : { url: `${site}/${photo.replace(/^\.\//, "")}`, sized: false }
      : { url: `${site}/images/og/brand.jpg`, sized: true };
  const subtitle = p.subtitle || "";
  let description = stripTags(p.short);
  if (description.length > 180) description = `${description.slice(0, 177).trimEnd()}…`;
  return {
    title: p.seoTitle || `${p.name} — Hayatiq`,
    cardTitle: `${p.name}${subtitle ? ` · ${subtitle}` : ""}${price ? ` — ${price}` : ""}`,
    description: `${description} Cash on delivery across Bangladesh.`,
    url: `${site}/product/${p.slug}`,
    image,
    photo: photo && !photo.includes("placeholder") ? photo : "",
    amount: low,
  };
}

function setMeta(html, attr, name, value) {
  const pattern = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`);
  if (!pattern.test(html)) throw new Error(`index.html has no <meta ${attr}="${name}">`);
  return html.replace(pattern, `$1${escapeAttr(value)}$2`);
}

function productPage(template, facts) {
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(facts.title)}</title>`);
  html = setMeta(html, "name", "description", facts.description);
  html = setMeta(html, "property", "og:title", facts.cardTitle);
  html = setMeta(html, "property", "og:description", facts.description);
  html = setMeta(html, "property", "og:type", "product");
  html = setMeta(html, "property", "og:url", facts.url);
  html = setMeta(html, "name", "twitter:title", facts.cardTitle);
  html = setMeta(html, "name", "twitter:description", facts.description);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${facts.url}$2`);
  html = setMeta(html, "property", "og:image", facts.image.url);
  html = setMeta(html, "name", "twitter:image", facts.image.url);
  // The width/height tags describe the 1200x630 JPEGs; drop them for anything else.
  if (!facts.image.sized) html = html.replace(/\s*<meta property="og:image:(width|height)" content="\d+">/g, "");
  if (facts.amount !== null) {
    html = html.replace(
      /(<meta property="og:url"[^>]*>)/,
      `$1\n        <meta property="product:price:amount" content="${facts.amount}">\n        <meta property="product:price:currency" content="BDT">`
    );
  }
  // Start the product photo with the page instead of after all the scripts have run:
  // the copy renderDetail() will show (pagePhoto() in js/script.js: images/md/ on phones).
  if (facts.photo) {
    const md = facts.photo.replace("./images/", "./images/md/");
    const tags = fs.existsSync(path.join(ROOT, md))
      ? [`<link rel="preload" as="image" href="${md}" media="(max-width: 800px)" fetchpriority="high">`,
         `<link rel="preload" as="image" href="${facts.photo}" media="(min-width: 801px)" fetchpriority="high">`]
      : [`<link rel="preload" as="image" href="${facts.photo}" fetchpriority="high">`];
    html = html.replace("</head>", `    ${tags.join("\n        ")}\n    </head>`);
  }
  return html;
}

function main() {
  const outArg = process.argv.indexOf("--out");
  const local = outArg > -1;
  if (!local && process.env.NETLIFY !== "true") {
    console.log("product-pages: not on Netlify; use --out <dir> to try it locally.");
    return;
  }
  const outDir = local ? path.resolve(process.argv[outArg + 1]) : path.join(ROOT, PAGE_DIR);
  const template = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  // The live address (index.html's canonical link); a Netlify deploy preview or branch
  // deploy uses its own address instead, so its previews can be tried before going live.
  const live = (template.match(/<link rel="canonical" href="([^"]+)"/) || [])[1]?.replace(/\/+$/, "");
  const preview = ["deploy-preview", "branch-deploy"].includes(process.env.CONTEXT) && process.env.DEPLOY_PRIME_URL;
  const site = (preview || live || "").replace(/\/+$/, "");
  if (!site) throw new Error("index.html has no canonical link to take the site address from");

  fs.mkdirSync(outDir, { recursive: true });
  const rules = [];
  for (const p of loadProducts()) {
    if (!p.slug || !/^[a-z0-9-]+$/i.test(p.slug)) continue;
    fs.writeFileSync(path.join(outDir, `${p.slug}.html`), productPage(template, productFacts(p, site)));
    rules.push(`/product/${p.slug}  /${PAGE_DIR}/${p.slug}.html  200`);
  }

  if (local) {
    console.log(`product-pages: wrote ${rules.length} pages to ${outDir}\n${rules.join("\n")}`);
    return;
  }
  // Rewrites go above the /* fallback: Netlify uses the first rule that matches.
  const redirectsFile = path.join(ROOT, "_redirects");
  const current = fs.readFileSync(redirectsFile, "utf8");
  if (!current.includes(MARK)) fs.writeFileSync(redirectsFile, `${MARK}\n${rules.join("\n")}\n\n${current}`);
  console.log(`product-pages: ${rules.length} product previews added`);
}

try {
  main();
} catch (err) {
  console.error("product-pages: skipped, product links keep the homepage preview.", err);
}
