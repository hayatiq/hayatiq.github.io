#!/usr/bin/env node
/* IndexNow: tells Bing (and other search engines that support it) that pages were added or
   changed, so they re-crawl without waiting. Bing's guidelines (rules 4 and 19) recommend it.

   Two ways it runs:
   - automatically after each successful Netlify deploy: netlify/functions/deploy-succeeded.js
   - by hand:  node tools/indexnow.js            (pages changed in the last 2 days)
               node tools/indexnow.js --all      (every page in the sitemap)
               node tools/indexnow.js --dry-run  (show what would be sent, send nothing)

   It reads the LIVE sitemap (the pages Bing may fetch), so it only reports addresses that
   exist. The key below is public on purpose: the search engine downloads KEY_FILE from the
   site to check that the site's owner sent the request (see https://www.indexnow.org).
   It never throws into a deploy: every problem is returned or logged.
*/
const HOST = "hayatiq.netlify.app";
const KEY = "57857fab5eb61acf363592b6cda7efd3";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

// [{ loc, lastmod }] from sitemap XML.
function parseSitemap(xml) {
  return [...String(xml).matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: ((m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1] || "").replace(/&amp;/g, "&"),
    lastmod: (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] || "",
  })).filter((u) => u.loc.startsWith(`https://${HOST}/`));
}

// Changed pages: lastmod within the last `days` days. A sitemap with no dates (git history
// unavailable at build time) means "send everything", since nothing says what changed.
function pickUrls(entries, { all = false, days = 2, now = new Date() } = {}) {
  if (all || !entries.some((u) => u.lastmod)) return entries.map((u) => u.loc);
  const since = new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10);
  return entries.filter((u) => u.lastmod >= since).map((u) => u.loc);
}

async function submit(urls, { fetchImpl = fetch } = {}) {
  if (!urls.length) return { sent: 0, status: "nothing changed" };
  const res = await fetchImpl(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls.slice(0, 10000) }),
  });
  // 200 and 202 both mean accepted (202: key still being checked).
  return { sent: urls.length, status: res.status, ok: res.status === 200 || res.status === 202 };
}

async function run(options = {}) {
  const res = await fetch(SITEMAP);
  if (!res.ok) return { sent: 0, status: `sitemap answered ${res.status}` };
  const urls = pickUrls(parseSitemap(await res.text()), options);
  if (options.dryRun) return { sent: 0, status: "dry run", urls };
  return { ...(await submit(urls)), urls };
}

module.exports = { HOST, KEY, KEY_LOCATION, parseSitemap, pickUrls, submit, run };

if (require.main === module) {
  const args = process.argv.slice(2);
  run({ all: args.includes("--all"), dryRun: args.includes("--dry-run") })
    .then((r) => console.log(`indexnow: ${r.status}, ${r.urls ? r.urls.length : 0} address(es)${r.urls ? "\n" + r.urls.join("\n") : ""}`))
    .catch((e) => console.error("indexnow: failed:", e.message));
}
