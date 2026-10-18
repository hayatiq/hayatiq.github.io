#!/usr/bin/env node
/* Lets browsers keep css/ and js/ files instead of checking them on every visit.

   Netlify runs this before tools/product-pages.js at each deploy (netlify.toml). It
   adds a version to every stylesheet and script link in index.html, taken from the
   file's contents (./js/script.js → ./js/script.js?v=1a2b3c4d5e), then adds a
   one-year cache rule for each of those files to _headers. A changed file gets a new
   version, so the next page load fetches it; unchanged files stay on the phone.

   Never fails the deploy: on any error it logs and changes nothing, and the files
   keep Netlify's default (checked on every visit).

   Local check (writes nothing):  node tools/asset-versions.js --dry-run
*/
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MARK = "# css/ and js/ versions (added by tools/asset-versions.js at deploy)";
const LINK = /(<(?:script|link)\b[^>]*\b(?:src|href)=")\.\/((?:css|js)\/[\w.-]+\.(?:css|js))(")/g;

function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (!dryRun && process.env.NETLIFY !== "true") {
    console.log("asset-versions: not on Netlify; use --dry-run to try it locally.");
    return;
  }
  const pageFile = path.join(ROOT, "index.html");
  const headersFile = path.join(ROOT, "_headers");
  const page = fs.readFileSync(pageFile, "utf8");
  const headers = fs.readFileSync(headersFile, "utf8");
  if (headers.includes(MARK)) return console.log("asset-versions: already done");

  const files = [];
  const stamped = page.replace(LINK, (all, start, file, end) => {
    const hash = crypto.createHash("sha1").update(fs.readFileSync(path.join(ROOT, file))).digest("hex").slice(0, 10);
    files.push(file);
    return `${start}./${file}?v=${hash}${end}`;
  });
  if (!files.length) throw new Error("no css/js links found in index.html");
  const rules = files.map((file) => `/${file}\n  Cache-Control: public, max-age=31536000, immutable`).join("\n");

  if (dryRun) {
    console.log(stamped.match(/<(?:script|link)\b[^>]*\?v=[^>]*>/g).join("\n"));
    console.log(`\n${MARK}\n${rules}`);
    return;
  }
  // index.html first: if that fails, no long cache rule is ever added for an unversioned file.
  fs.writeFileSync(pageFile, stamped);
  fs.writeFileSync(headersFile, `${headers.trimEnd()}\n\n${MARK}\n${rules}\n`);
  console.log(`asset-versions: ${files.length} files versioned`);
}

try {
  main();
} catch (err) {
  console.error("asset-versions: skipped, css/js keep the default caching.", err);
}
