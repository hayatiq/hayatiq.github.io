// Local test server: serves the site the way Netlify does (every unknown path gets
// index.html) and runs netlify/functions/order.js at /.netlify/functions/order, with
// the secrets read from a .env file in the project folder. That file is ignored by git,
// so tokens never end up in the repository or on the website.
//
//   node tools/dev-server.js          → http://localhost:8888
//   node tools/dev-server.js 3000     → another port
//
// The site still runs in test mode here until you open it with ?send=real
// (see README.MD "Testing real sends locally").
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.argv[2] || 8888);

try {
  process.loadEnvFile(path.join(ROOT, ".env"));
} catch (e) {
  console.warn("No .env file found: Telegram and the sheet will report not-configured. Copy .env.example to .env.");
}

const { handler } = require(path.join(ROOT, "netlify/functions/order.js"));

// On/off switch per kind of message while testing real sends (SEND_* lines in .env;
// a missing line means on). Handed to the page, where js/config.js sendsOn() reads it.
const SWITCHES = {
  orderEmails: "SEND_ORDER_EMAILS",
  contactEmails: "SEND_CONTACT_EMAILS",
  visitSummaryEmails: "SEND_VISIT_EMAILS",
  orderTelegram: "SEND_ORDER_TELEGRAM",
  contactTelegram: "SEND_CONTACT_TELEGRAM",
  orderSheet: "SEND_ORDER_SHEET",
};
const switches = Object.fromEntries(
  Object.entries(SWITCHES).map(([kind, name]) => [kind, !/^(false|0|no|off)$/i.test((process.env[name] || "true").trim())])
);
const switchScript = `<script>window.HAYATIQ_LOCAL_SWITCHES = ${JSON.stringify(switches)};</script>`;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

async function runFunction(req, res) {
  let body = "";
  for await (const chunk of req) body += chunk;
  // The function only accepts the site's own address; here that's this server.
  process.env.URL = `http://${req.headers.host}`;
  const result = await handler({ httpMethod: req.method, headers: req.headers, body });
  console.log(`order → ${result.statusCode} ${result.body}`);
  res.writeHead(result.statusCode, result.headers || {});
  res.end(result.body);
}

function serveFile(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(ROOT, urlPath);
  // Never serve the secrets file or anything outside the project.
  if (!file.startsWith(ROOT) || path.basename(file).startsWith(".env")) file = "";
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.extname(urlPath) ? "" : path.join(ROOT, "index.html");
  }
  if (!file) {
    res.writeHead(404);
    return res.end("Not found");
  }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  if (file === path.join(ROOT, "index.html")) {
    return res.end(fs.readFileSync(file, "utf8").replace('<script src="./js/config.js">', `${switchScript}\n        <script src="./js/config.js">`));
  }
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    if (req.url.startsWith("/.netlify/functions/order")) {
      return runFunction(req, res).catch((err) => {
        console.error(err);
        res.writeHead(500);
        res.end("{}");
      });
    }
    serveFile(req, res);
  })
  .listen(PORT, () => {
    console.log(`Hayatiq test server: http://localhost:${PORT}`);
    console.log(`Real sends: http://localhost:${PORT}/?send=real`);
    console.log("Switches (.env):", Object.entries(SWITCHES).map(([kind, name]) => `${name}=${switches[kind]}`).join("  "));
  });
