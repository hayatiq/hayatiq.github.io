#!/usr/bin/env node
/* Product and category pages that search engines, AI tools and link previews can read.

   Facebook, Messenger and WhatsApp don't run the site's JavaScript: a shared link's
   preview card comes from the page's own <head> tags, which in index.html are the
   homepage's. Netlify runs this script before each deploy (netlify.toml). For every
   product it writes preview/<slug>.html — index.html with that product's title,
   description, photo and price in the head — and adds a rewrite to _redirects so
   /product/<slug> serves it. Visitors get the same page; only the head differs.

   The same page also carries the product itself, for crawlers that don't run JavaScript
   (ChatGPT, Perplexity, Bing and others): the name as the page's <h1>, price, description,
   ingredients, how to use, cautions and links to the category and similar products,
   written into #detailWrap, plus the Product and Breadcrumb JSON-LD (js/seo.js). When the
   page's scripts run, renderDetail() replaces that block, so visitors see no difference.

   Each category gets the same: preview/category-<slug>.html for /category/<slug>, with
   its products listed in #productsGrid.

   Then two rules make a wrong product or category address a real 404 (the not-found
   view, with a 404 status). They are written only when this script succeeds; otherwise
   the /product/* and /category/* fallbacks in _redirects keep serving 200.

   It also writes sitemap.xml (the shop pages, categories and every product page) for
   search engines; robots.txt points them to it.

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
// Pages listed in sitemap.xml besides the products (not the cart, checkout or orders).
const SITEMAP_PAGES = ["/", "/products", "/categories", "/about", "/contact"];

// js/seo.js (categories, JSON-LD) and js/products.js, run as the page runs them.
function loadShop() {
  const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
  const sandbox = {};
  vm.runInNewContext(
    `${read("js/seo.js")}\n${read("js/products.js")}\n` +
      "this.shop = { PRODUCTS, CATEGORIES, categorySlug, categoryPath, productTitle, productJsonLd, breadcrumbJsonLd, jsonForScript };",
    sandbox
  );
  return sandbox.shop;
}

const escapeAttr = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const stripTags = (html) => String(html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const taka = (n) => `৳${Number(n).toLocaleString("en-US")}`;

// The product as a shopper first sees it: its default option's photo and price.
function productFacts(p, site, shop) {
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
  let description = stripTags(p.metaDescription || p.short);
  if (description.length > 180) description = `${description.slice(0, 177).trimEnd()}…`;
  // Search results show about 155 characters; add the delivery line only when it fits.
  const cod = " Cash on delivery across Bangladesh.";
  return {
    title: shop.productTitle(p, shop.PRODUCTS),
    cardTitle: `${p.name}${subtitle ? ` · ${subtitle}` : ""}${price ? ` — ${price}` : ""}`,
    description: description.length + cod.length <= 160 ? `${description}${cod}` : description,
    url: `${site}/product/${p.slug}`,
    image,
    photo: photo && !photo.includes("placeholder") ? photo : "",
    amount: low,
    price,
  };
}

function setMeta(html, attr, name, value) {
  const pattern = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`);
  if (!pattern.test(html)) throw new Error(`index.html has no <meta ${attr}="${name}">`);
  return html.replace(pattern, `$1${escapeAttr(value)}$2`);
}

const isLive = (p) => (Array.isArray(p.variants) && p.variants.length ? p.variants : [p]).some((v) => typeof v.price === "number");
const hasPhoto = (p) => {
  const first = ((Array.isArray(p.variants) && p.variants[0] && p.variants[0].images) || p.images || [])[0];
  return Boolean(first) && !first.includes("placeholder");
};
const list = (items) => (items && items.length ? `<ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>` : "");

function setJsonLd(html, id, json) {
  const pattern = new RegExp(`(<script type="application/ld\\+json" id="${id}">)[^<]*(</script>)`);
  if (!pattern.test(html)) throw new Error(`index.html has no JSON-LD script #${id}`);
  return html.replace(pattern, (all, open, close) => `${open}${json}${close}`);
}

// Fill an empty container from index.html (e.g. <div class="detail" id="detailWrap"></div>).
function fillContainer(html, id, inner) {
  const pattern = new RegExp(`(<div [^>]*id="${id}"[^>]*>)(</div>)`);
  if (!pattern.test(html)) throw new Error(`index.html has no empty #${id}`);
  return html.replace(pattern, (all, open, close) => `${open}\n${inner}\n${close}`);
}

// The homepage headline stays in every page (the homepage view is part of the one
// index.html); here it becomes an h2 so the product or category is the page's only h1.
const demoteHomeHeadline = (html) => html.replace(/<h1>([^<]*)<\/h1>/g, "<h2>$1</h2>");

// "Tab Name: point one; point two;" (see renderHowToUseTags in js/script.js).
function howToHtml(how) {
  return (how || [])
    .map((entry) => {
      const [tab, ...rest] = entry.split(":");
      const points = rest.join(":").split(";").map((x) => x.trim()).filter(Boolean);
      return `<h3>${tab.trim()}</h3>${list(points)}`;
    })
    .join("");
}

function priceLines(p) {
  const options = Array.isArray(p.variants) && p.variants.length ? p.variants : [p];
  return options
    .map((v) => {
      const label = v === p ? p.subtitle || "" : v.label || v.subtitle || "";
      const price = typeof v.price === "number" ? taka(v.price) : escapeAttr(v.price || "");
      return `<li>${escapeAttr(label || p.name)}: <strong>${price}</strong></li>`;
    })
    .join("");
}

function similarProducts(p, products) {
  const ok = (x) => x && x.id !== p.id && isLive(x) && hasPhoto(x);
  const picked = (p.related || []).map((id) => products.find((x) => x.id === id)).filter(ok);
  for (const x of products) if (picked.length < 4 && ok(x) && x.category === p.category && !picked.includes(x)) picked.push(x);
  return picked.slice(0, 4);
}

// What a crawler without JavaScript reads on a product page; renderDetail() replaces it.
function productBody(p, shop) {
  const cat = shop.categoryPath(p.category);
  const sections = [
    ["How to Use", howToHtml(p.how)],
    ["Ingredients", list(p.ingredients)],
    ["Cautions", list(p.warns)],
    ["For Optimal Benefits", list(p.tips)],
    ["Storage", list(p.storage)],
  ].filter(([, body]) => body);
  const similar = similarProducts(p, shop.PRODUCTS);
  return `<article class="prerendered-product">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="${cat}">${escapeAttr(p.category)}</a></nav>
          <h1 class="detail-title">${escapeAttr(p.name)}</h1>
          <ul>${priceLines(p)}</ul>
          <p>${p.short || ""}</p>
          ${list(p.benefits)}
          <p>Handmade by HAYATIQ in Bangladesh. Cash on delivery across Bangladesh: check your order before you pay.</p>
          ${sections.map(([title, body]) => `<section><h2>${title}</h2>${body}</section>`).join("\n          ")}
          ${similar.length ? `<section><h2>You may also like</h2><ul>${similar.map((x) => `<li><a href="/product/${x.slug}">${escapeAttr(x.name)}${x.subtitle ? ` · ${escapeAttr(x.subtitle)}` : ""}</a></li>`).join("")}</ul></section>` : ""}
          <p><a href="${cat}">All ${escapeAttr(p.category)} products</a></p>
        </article>`;
}

function productPage(template, facts, p, shop, site) {
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
  html = setJsonLd(html, "productJsonLd", shop.jsonForScript(shop.productJsonLd(p, site)));
  html = setJsonLd(html, "breadcrumbJsonLd", shop.jsonForScript(shop.breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: p.category, path: shop.categoryPath(p.category) },
    { name: p.name, path: `/product/${p.slug}` },
  ], site)));
  html = fillContainer(demoteHomeHeadline(html), "detailWrap", productBody(p, shop));
  return html;
}

// A category's own page, /category/<slug>; the router shows it with setupProductFilters().
function categoryPage(template, cat, shop, site, live) {
  const items = shop.PRODUCTS.filter((p) => p.category === cat);
  const forSale = items.filter(isLive);
  const names = [...new Set(forSale.map((p) => p.name))];
  const url = `${live}${shop.categoryPath(cat)}`;
  const title = `${cat} in Bangladesh — HAYATIQ`;
  // Same words as the router's setPageMeta() for this page.
  const description = names.length
    ? `Shop HAYATIQ ${cat.toLowerCase()}: ${names.join(", ")}. Handmade in Bangladesh, cash on delivery.`
    : `HAYATIQ ${cat.toLowerCase()} is coming soon. Handmade in Bangladesh, cash on delivery.`;
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  html = setJsonLd(html, "breadcrumbJsonLd", shop.jsonForScript(shop.breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: cat, path: shop.categoryPath(cat) },
  ], site)));
  // The listing's heading becomes this page's h1 (the router sets the same text).
  html = demoteHomeHeadline(html).replace(/<h2 id="productsHeading">[^<]*<\/h2>/, `<h1 id="productsHeading">${escapeAttr(cat)}</h1>`);
  if (!html.includes(`<h1 id="productsHeading">`)) throw new Error("index.html has no <h2 id=\"productsHeading\">");
  html = html.replace(/(<div class="pill pill-small" id="productCount">)[^<]*(<\/div>)/, `$1${items.length} item${items.length === 1 ? "" : "s"}$2`);
  const body = `<ul class="prerendered-list">
          ${items.map((p) => `<li><a href="/product/${p.slug}">${escapeAttr(p.name)}${p.subtitle ? ` · ${escapeAttr(p.subtitle)}` : ""}</a> — ${productFacts(p, site, shop).price || "Coming Soon"}. ${stripTags(p.metaDescription || p.short)}</li>`).join("\n          ")}
        </ul>
        <p>Handmade by HAYATIQ in Bangladesh. Cash on delivery across Bangladesh.</p>`;
  return fillContainer(html, "productsGrid", body);
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
  const urls = SITEMAP_PAGES.map((page) => `${live}${page === "/" ? "/" : page}`);
  const shop = loadShop();
  for (const cat of shop.CATEGORIES) {
    const slug = shop.categorySlug(cat);
    fs.writeFileSync(path.join(outDir, `category-${slug}.html`), categoryPage(template, cat, shop, site, live));
    rules.push(`/category/${slug}  /${PAGE_DIR}/category-${slug}.html  200`);
    urls.push(`${live}/category/${slug}`);
  }
  for (const p of shop.PRODUCTS) {
    if (!p.slug || !/^[a-z0-9-]+$/i.test(p.slug)) continue;
    fs.writeFileSync(path.join(outDir, `${p.slug}.html`), productPage(template, productFacts(p, site, shop), p, shop, site));
    rules.push(`/product/${p.slug}  /${PAGE_DIR}/${p.slug}.html  200`);
    urls.push(`${live}/product/${p.slug}`);
  }
  // Any other product or category address: the not-found view with a real 404 status.
  rules.push("/product/*  /index.html  404", "/category/*  /index.html  404");
  // Always the live address (as in robots.txt), even on a deploy preview.
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeAttr(url)}</loc></url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(local ? path.join(outDir, "sitemap.xml") : path.join(ROOT, "sitemap.xml"), sitemap);

  if (local) {
    console.log(`product-pages: wrote ${urls.length - SITEMAP_PAGES.length} pages and sitemap.xml to ${outDir}\n${rules.join("\n")}`);
    return;
  }
  // Rewrites go above the /* fallback: Netlify uses the first rule that matches.
  const redirectsFile = path.join(ROOT, "_redirects");
  const current = fs.readFileSync(redirectsFile, "utf8");
  if (!current.includes(MARK)) fs.writeFileSync(redirectsFile, `${MARK}\n${rules.join("\n")}\n\n${current}`);
  console.log(`product-pages: ${urls.length - SITEMAP_PAGES.length} product and category pages added`);
}

try {
  main();
} catch (err) {
  console.error("product-pages: skipped, product links keep the homepage preview.", err);
}
