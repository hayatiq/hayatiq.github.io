/**
 * Hayatiq order sheet — paste this into Extensions → Apps Script of a Google Sheet,
 * then deploy it as a web app (see README.MD "Order notifications").
 *
 * The Netlify function (netlify/functions/order.js) posts each order here. Every
 * order becomes one row with a Status dropdown the team updates by hand:
 * New → Confirmed → Shipped → Delivered (or Cancelled / Returned / Fake).
 * Repeated phone numbers are highlighted so duplicate or fake orders stand out.
 */

// Must match SHEET_TOKEN in Netlify's environment variables.
const TOKEN = "CHANGE-ME-to-a-long-random-text";

const SHEET_NAME = "Orders";
const HEADERS = [
  "Order number", "Time (Dhaka)", "Name", "Phone", "Address", "Delivery area", "Items",
  "Subtotal", "Delivery", "Total", "Note", "Source", "Status", "Courier tracking", "Team notes",
];
const STATUSES = ["New", "Confirmed", "Shipped", "Delivered", "Cancelled", "Returned", "Fake"];
const STATUS_COLUMN = 13;

function doPost(e) {
  if (!e || !e.postData) {
    throw new Error('doPost only runs when the website sends an order. To test, choose "testOrder" in the function dropdown and click Run.');
  }
  const data = JSON.parse(e.postData.contents);
  if (data.token !== TOKEN) return reply({ ok: false, error: "Wrong token" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getOrdersSheet();
    const o = data.order;

    // The same order sent twice (e.g. a retry) only gets one row.
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
      if (ids.indexOf(o.id) !== -1) return reply({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      o.id, o.time, o.name, "'" + o.phone, o.address, o.area, o.items,
      o.subtotal, o.delivery, o.total, o.note, o.source, "New", "", "",
    ]);
    const row = sheet.getLastRow();
    sheet.getRange(row, STATUS_COLUMN).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build()
    );
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Run this from the Apps Script editor (choose "testOrder" next to the Run button) to
 * check the sheet works before connecting the website. It adds a row marked TEST,
 * which you can delete afterwards.
 */
function testOrder() {
  const result = doPost({
    postData: {
      contents: JSON.stringify({
        token: TOKEN,
        order: {
          id: "TEST-" + new Date().getTime(), time: new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }),
          name: "Test order (delete me)", phone: "01700000000", address: "Test address", area: "Inside Dhaka",
          items: "Solid Conditioner Bar × 1", subtotal: 750, delivery: 80, total: 830, note: "", source: "test",
        },
      }),
    },
  });
  Logger.log(result.getContent());
}

function getOrdersSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (sheet) return sheet;

  sheet = book.insertSheet(SHEET_NAME);
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  // Highlight any phone number that appears on more than one order.
  const phones = sheet.getRange("D2:D");
  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied("=COUNTIF($D:$D,$D2)>1")
      .setBackground("#fde68a")
      .setRanges([phones])
      .build(),
  ]);
  return sheet;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
