#!/usr/bin/env node
/* Self-check for what search engines and AI tools read. Run before deploying:

     node tools/check-seo.js

   It builds the product and category pages into a temp folder with
   tools/product-pages.js --out (writes nothing into the repo) and checks each one:
   one <h1> with the right name, valid Product/Breadcrumb/site JSON-LD with absolute
   photo URLs and the price, the product text in the page, unique titles, descriptions
   that fit search results, the sitemap, and that _redirects serves every route
   js/script.js knows and answers 404 for the rest. Exits 1 on any problem.
*/
const assert = require("assert");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "hayatiq-seo-"));
execFileSync(process.execPath, [path.join(__dirname, "product-pages.js"), "--out", out], { stdio: "pipe" });

const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const shop = {};
vm.runInNewContext(`${read("js/seo.js")}\n${read("js/products.js")}\nthis.s = { PRODUCTS, CATEGORIES, STATIC_PAGES, categorySlug };`, shop);
const { PRODUCTS, CATEGORIES, categorySlug } = shop.s;
const indexNow = require("./indexnow.js");

const problems = [];
const check = (ok, msg) => ok || problems.push(msg);
const jsonLd = (html, id) => {
  const m = html.match(new RegExp(`<script type="application/ld\\+json" id="${id}">([^<]*)</script>`));
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (e) { return "invalid"; }
};
const h1s = (html) => [...html.matchAll(/<h1[^>]*>([^<]*)<\/h1>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
const unescape = (t) => t.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const meta = (html, name) => unescape((html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`)) || [])[1] || "");
const title = (html) => (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";

const titles = new Map();
for (const p of PRODUCTS) {
  const file = path.join(out, `${p.slug}.html`);
  if (!fs.existsSync(file)) { problems.push(`${p.slug}: no page`); continue; }
  const html = fs.readFileSync(file, "utf8");
  const where = `/product/${p.slug}`;
  check(JSON.stringify(h1s(html)) === JSON.stringify([p.name]), `${where}: h1s are ${JSON.stringify(h1s(html))}, want only "${p.name}"`);
  const ld = jsonLd(html, "productJsonLd");
  check(ld && ld !== "invalid" && ld["@type"] === "Product", `${where}: Product JSON-LD missing or invalid`);
  if (ld && ld !== "invalid") {
    check((ld.image || []).every((u) => u.startsWith("https://")), `${where}: JSON-LD photo URLs must be absolute`);
    const prices = (p.variants || [p]).map((v) => v.price).filter((n) => typeof n === "number");
    if (prices.length) check(ld.offers && (ld.offers.price === Math.min(...prices) || ld.offers.lowPrice === Math.min(...prices)), `${where}: JSON-LD price is wrong`);
    check(ld.brand && ld.brand.name === "HAYATIQ", `${where}: JSON-LD brand missing`);
  }
  const crumbs = jsonLd(html, "breadcrumbJsonLd");
  check(crumbs && crumbs !== "invalid" && crumbs.itemListElement.length === 3, `${where}: breadcrumb JSON-LD missing`);
  check(jsonLd(html, "siteJsonLd") && jsonLd(html, "siteJsonLd") !== "invalid", `${where}: site JSON-LD missing or invalid`);
  check(html.includes(`<link rel="canonical" href="https://hayatiq.netlify.app${where}"`), `${where}: wrong canonical`);
  const body = html.slice(html.indexOf('id="detailWrap"'));
  check(body.includes(`href="/category/${categorySlug(p.category)}"`), `${where}: no link to its category`);
  const first = (p.ingredients || [])[0];
  if (first) check(body.includes(first), `${where}: ingredients not in the page`);
  const t = title(html);
  check(!titles.has(t), `${where}: same title as ${titles.get(t)} ("${t}")`);
  titles.set(t, where);
  check(meta(html, "description").length <= 200, `${where}: description too long`);
}

for (const cat of CATEGORIES) {
  const slug = categorySlug(cat);
  const file = path.join(out, `category-${slug}.html`);
  if (!fs.existsSync(file)) { problems.push(`${cat}: no category page`); continue; }
  const html = fs.readFileSync(file, "utf8");
  check(JSON.stringify(h1s(html)) === JSON.stringify([cat]), `/category/${slug}: h1s are ${JSON.stringify(h1s(html))}`);
  for (const p of PRODUCTS.filter((x) => x.category === cat)) check(html.includes(`href="/product/${p.slug}"`), `/category/${slug}: no link to ${p.slug}`);
  check(html.includes(`<link rel="canonical" href="https://hayatiq.netlify.app/category/${slug}"`), `/category/${slug}: wrong canonical`);
}

// /products, /categories, /about, /contact: their own title, canonical, one h1 (not the homepage's).
const { STATIC_PAGES } = shop.s;
for (const route of Object.keys(STATIC_PAGES)) {
  const file = path.join(out, `page-${route.slice(1)}.html`);
  if (!fs.existsSync(file)) { problems.push(`${route}: no page`); continue; }
  const html = fs.readFileSync(file, "utf8");
  const t = title(html);
  check(t === STATIC_PAGES[route].title, `${route}: title is "${t}"`);
  check(!titles.has(t), `${route}: same title as ${titles.get(t)}`);
  titles.set(t, route);
  check(meta(html, "description") === STATIC_PAGES[route].description, `${route}: description is not its own`);
  check(STATIC_PAGES[route].description.length <= 165 && t.length <= 70, `${route}: title or description too long`);
  check(html.includes(`<link rel="canonical" href="https://hayatiq.netlify.app${route}"`), `${route}: canonical is not itself`);
  check(h1s(html).length === 1, `${route}: h1s are ${JSON.stringify(h1s(html))}`);
}
check(!titles.has("Hayatiq — Handcrafted with Intention"), "a page still has the homepage title");

const sitemap = fs.readFileSync(path.join(out, "sitemap.xml"), "utf8");
// lastmod: either on every address (full git history) or on none (shallow clone), always YYYY-MM-DD.
const entries = indexNow.parseSitemap(sitemap);
const dates = entries.map((e) => e.lastmod);
check(dates.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)) || dates.every((d) => !d), "sitemap: lastmod must be on every address or none");
check(entries.length === PRODUCTS.length + CATEGORIES.length + 5, `sitemap: ${entries.length} addresses`);
for (const cat of CATEGORIES) check(sitemap.includes(`/category/${categorySlug(cat)}<`), `sitemap: no /category/${categorySlug(cat)}`);
for (const p of PRODUCTS) check(sitemap.includes(`/product/${p.slug}<`), `sitemap: no /product/${p.slug}`);

// Every route the router knows must be served with 200; the last rule must be the 404.
const redirects = read("_redirects").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
const served = redirects.filter((l) => / 200$/.test(l)).map((l) => l.split(/\s+/)[0]);
const routes = [...read("js/script.js").matchAll(/path === "(\/[a-z]+)"/g)].map((m) => m[1]);
for (const r of [...routes, "/products", "/product/*", "/category/*"]) check(served.includes(r), `_redirects: ${r} is not served with 200`);
check(redirects[redirects.length - 1].replace(/\s+/g, " ") === "/* /index.html 404", "_redirects: the last rule should be /* /index.html 404");

// The homepage itself keeps its single headline and valid site JSON-LD.
const index = read("index.html");
check(jsonLd(index, "siteJsonLd") && jsonLd(index, "siteJsonLd") !== "invalid", "index.html: site JSON-LD invalid");

// IndexNow: key file matches the module, changed-page picking, and the request it would send.
check(fs.existsSync(path.join(ROOT, `${indexNow.KEY}.txt`)) && read(`${indexNow.KEY}.txt`) === indexNow.KEY, "indexnow: key file missing or its text is not the key");
check(/^[a-f0-9]{16,128}$/.test(indexNow.KEY), "indexnow: key must be 8 to 128 letters or digits");
const sample = indexNow.parseSitemap(`<urlset><url><loc>https://hayatiq.netlify.app/a</loc><lastmod>2026-11-22</lastmod></url><url><loc>https://hayatiq.netlify.app/b?x=1&amp;y=2</loc><lastmod>2026-10-01</lastmod></url><url><loc>https://other.example/c</loc></url></urlset>`);
check(sample.length === 2 && sample[1].loc.endsWith("/b?x=1&y=2"), "indexnow: sitemap parsing");
const now = new Date("2026-11-23T10:00:00Z");
check(JSON.stringify(indexNow.pickUrls(sample, { now })) === JSON.stringify(["https://hayatiq.netlify.app/a"]), "indexnow: should send only recently changed pages");
check(indexNow.pickUrls(sample, { all: true }).length === 2, "indexnow: --all should send everything");
check(indexNow.pickUrls([{ loc: "https://hayatiq.netlify.app/a", lastmod: "" }], { now }).length === 1, "indexnow: undated sitemap should send everything");
let sentBody = null;
indexNow.submit(["https://hayatiq.netlify.app/a"], { fetchImpl: async (url, init) => { sentBody = { url, ...JSON.parse(init.body) }; return { status: 202 }; } }).then((r) => {
  check(r.ok && sentBody.host === "hayatiq.netlify.app" && sentBody.key === indexNow.KEY && sentBody.keyLocation === `https://hayatiq.netlify.app/${indexNow.KEY}.txt` && sentBody.urlList.length === 1, "indexnow: request format");
  finish();
});

function finish() {
fs.rmSync(out, { recursive: true, force: true });
if (problems.length) {
  console.error(`check-seo: ${problems.length} problem(s)\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`check-seo: ok (${PRODUCTS.length} product pages, ${CATEGORIES.length} category pages, ${Object.keys(STATIC_PAGES).length} fixed pages, ${routes.length + 3} routes, IndexNow)`);
}
