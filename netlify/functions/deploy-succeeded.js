// Runs by itself after every successful Netlify deploy (Netlify event-triggered function:
// the file name is the event). It tells Bing which pages changed (IndexNow, tools/indexnow.js).
// It always answers 200 and never throws: a failed ping must not matter to the shop.
const { run } = require("../../tools/indexnow.js");

exports.handler = async (event) => {
  try {
    let context = "";
    try { context = (JSON.parse(event.body || "{}").payload || {}).context || ""; } catch (e) {}
    // A deploy preview or branch deploy is not the live site; skip those when Netlify says so.
    if (context && context !== "production") return { statusCode: 200, body: `skipped (${context})` };
    const result = await run();
    console.log("indexnow:", JSON.stringify({ status: result.status, sent: result.sent }));
    return { statusCode: 200, body: JSON.stringify({ status: result.status, sent: result.sent }) };
  } catch (err) {
    console.error("indexnow: skipped:", err && err.message);
    return { statusCode: 200, body: "skipped" };
  }
};
