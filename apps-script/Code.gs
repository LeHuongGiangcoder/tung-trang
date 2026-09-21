/**
 * RSVP backend for the Trang & Tung wedding site (replaces the n8n webhook).
 *
 * The Next.js route /api/rsvp POSTs JSON here. Two request shapes:
 *
 *   Lookup  { fullName }
 *     → { matches: [{ found: true, guest: { row_number, ...columns }, displayName }] }
 *       Matches the typed name against "Guest name" OR "Name of other guest",
 *       ignoring case, accents (Tùng = Tung) and word order (Nguyen Bruce = Bruce Nguyen).
 *       Zero matches → { matches: [] } (site shows "can't find you").
 *       Several matches → site asks the guest to pick one, labelled by displayName.
 *
 *   Update  { action: 'update', row_number, "Guest name", "Join? from Guest", ... }
 *     → { success: true }
 *       Writes only the six answer columns on that row, after checking the row
 *       still belongs to that guest (so a re-sorted sheet can't get the wrong row).
 *
 * Errors come back as { error } — Apps Script web apps always answer HTTP 200,
 * so the Next.js route turns these into a failed response.
 *
 * SETUP
 *   1. Open the "Anh Tùng & Chị Trang RSVP" sheet → Extensions → Apps Script.
 *   2. Paste this file in as Code.gs and save.
 *   3. Project Settings → Script properties → add RSVP_SECRET = <a long random string>.
 *   4. Deploy → New deployment → type "Web app":
 *        Execute as: Me   ·   Who has access: Anyone
 *   5. Copy the /exec URL. In Vercel (and .env.local for local dev) set:
 *        RSVP_SCRIPT_URL = <the /exec URL>
 *        RSVP_SECRET     = <same string as step 3>
 *   After editing this script later: Deploy → Manage deployments → edit → New version
 *   (keeps the same URL).
 */

const SHEET_NAME = 'RSVP';
const HEADER_ROW = 1;

const GUEST_COL = 'Guest name';
const PARTNER_COL = 'Name of other guest';

// The only columns the site is allowed to write
const JOIN_COLS = ['Join? from Guest', 'Join? from Partner'];
const TEXT_COLS = [
  'Meal preferences from Guest',
  'Meal preferences from Partner',
  'Wish to couples from Guest',
  'Wish to couples from Partner',
];

const MAX_TEXT_LENGTH = 2000;

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    checkSecret_(body.secret);

    const result = body.action === 'update'
      ? updateRsvp_(body)
      : lookupGuest_(body.fullName || body[GUEST_COL]);

    return json_(result);
  } catch (err) {
    console.error(err);
    return json_({ error: String((err && err.message) || err) });
  }
}

// Handy for checking the deployment is live in a browser; never returns guest data
function doGet() {
  return json_({ ok: true });
}

// ---------------------------------------------------------------------------
// Lookup

function lookupGuest_(fullName) {
  const target = nameKey_(fullName);
  if (!target) throw new Error('Full name is required');

  const { headers, rows } = readSheet_();

  const matches = [];
  rows.forEach(({ rowNumber, values }) => {
    const guest = toGuest_(headers, values, rowNumber);
    const guestKey = nameKey_(guest[GUEST_COL]);
    const partnerKey = nameKey_(guest[PARTNER_COL]);
    if (target === guestKey || target === partnerKey) {
      matches.push({
        found: true,
        guest,
        displayName: guest[PARTNER_COL]
          ? `${guest[GUEST_COL]} & ${guest[PARTNER_COL]}`
          : guest[GUEST_COL],
      });
    }
  });

  return { matches };
}

// ---------------------------------------------------------------------------
// Update

function updateRsvp_(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const sheet = getSheet_();
    const headers = readHeaders_(sheet);
    const rowNumber = Number(body.row_number);

    if (!Number.isInteger(rowNumber) || rowNumber <= HEADER_ROW || rowNumber > sheet.getLastRow()) {
      throw new Error('Invalid row_number');
    }

    // Make sure the row still belongs to this guest before writing anything
    const guestIdx = columnIndex_(headers, GUEST_COL);
    const currentName = sheet.getRange(rowNumber, guestIdx + 1).getDisplayValue();
    if (!nameKey_(currentName) || nameKey_(currentName) !== nameKey_(body[GUEST_COL])) {
      throw new Error('Row does not match guest');
    }

    JOIN_COLS.forEach((col) => {
      if (!(col in body)) return;
      const value = body[col] === 'Yes' || body[col] === 'No' ? body[col] : '';
      sheet.getRange(rowNumber, columnIndex_(headers, col) + 1).setValue(value);
    });

    TEXT_COLS.forEach((col) => {
      if (!(col in body)) return;
      sheet.getRange(rowNumber, columnIndex_(headers, col) + 1).setValue(cleanText_(body[col]));
    });

    SpreadsheetApp.flush();
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Helpers

function checkSecret_(secret) {
  const expected = PropertiesService.getScriptProperties().getProperty('RSVP_SECRET');
  if (expected && secret !== expected) throw new Error('Unauthorized');
}

function getSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found`);
  return sheet;
}

function readHeaders_(sheet) {
  return sheet
    .getRange(HEADER_ROW, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0]
    .map((h) => String(h).trim());
}

function readSheet_() {
  const sheet = getSheet_();
  const headers = readHeaders_(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) return { headers, rows: [] };

  const values = sheet
    .getRange(HEADER_ROW + 1, 1, lastRow - HEADER_ROW, headers.length)
    .getDisplayValues();

  const rows = values
    .map((v, i) => ({ rowNumber: HEADER_ROW + 1 + i, values: v }))
    .filter(({ values: v }) => String(v[headers.indexOf(GUEST_COL)] || '').trim());

  return { headers, rows };
}

// Row → { row_number, "Guest name": ..., ... } — same shape n8n returned
function toGuest_(headers, values, rowNumber) {
  const guest = { row_number: rowNumber };
  headers.forEach((h, i) => {
    if (h) guest[h] = String(values[i] == null ? '' : values[i]).trim();
  });
  return guest;
}

function columnIndex_(headers, name) {
  const idx = headers.indexOf(name);
  if (idx === -1) throw new Error(`Column "${name}" not found`);
  return idx;
}

// Comparable form of a name: lowercase, no accents, words sorted
function nameKey_(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ');
}

// Trim, cap length, and stop text starting with = + - @ being read as a formula
function cleanText_(value) {
  let text = String(value == null ? '' : value).trim().slice(0, MAX_TEXT_LENGTH);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
