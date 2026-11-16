/**
 * Google Apps Script Web App — public read/write proxy for the Wishes sheet.
 *
 * Setup:
 * 1. Open the "Shahad Birthday — Wishes" Google Sheet.
 * 2. Extensions > Apps Script.
 * 3. Delete any boilerplate code and paste this file's contents.
 * 4. Deploy > New deployment > type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Authorize when prompted (it's your own script/sheet).
 * 6. Copy the deployment URL and paste it into assets/js/app.js and
 *    admin/app.js as WISHES_API_URL.
 */

const SHEET_NAME = 'الورقة1';

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const [, ...data] = rows; // skip header row
  const wishes = data
    .filter(r => r[0])
    .map(r => ({ id: r[0], author: r[1], text: r[2], createdAt: r[3] }))
    .reverse();
  return jsonResponse({ wishes });
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const body = JSON.parse(e.postData.contents);

  if (body.action === 'delete') {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === body.id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return jsonResponse({ ok: true });
  }

  const id = 'w_' + Date.now();
  const author = String(body.author || 'صديق محب 🤍').slice(0, 120);
  const text = String(body.text || '').slice(0, 500);
  if (!text) return jsonResponse({ ok: false, error: 'empty text' });

  sheet.appendRow([id, author, text, new Date().toISOString()]);
  return jsonResponse({ ok: true, id });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
