#!/usr/bin/env node
/**
 * Scans selected-photos/ and adds any image not already referenced in
 * data/site.json's gallery array. Does not invent captions, years, or
 * events — only uses the filename as a starting caption. Run manually:
 *
 *   node scripts/sync-selected-photos.js
 *
 * Then commit + push data/site.json and selected-photos/ to publish.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PHOTOS_DIR = path.join(ROOT, 'selected-photos');
const SITE_JSON = path.join(ROOT, 'data', 'site.json');
// IMPORTANT: the live site does NOT fetch data/site.json at runtime — it
// reads window.INITIAL_SITE_DATA from assets/js/data.js instead. Both files
// must stay in sync or new photos silently never reach the public site.
const DATA_JS = path.join(ROOT, 'assets', 'js', 'data.js');
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function titleFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  // Auto-exported filenames like "photo_2026-11-16_04-20-55" carry no real
  // caption info — leave the caption empty rather than showing a timestamp.
  if (/^photo[_-]?\d{4}-\d{2}-\d{2}/.test(base)) return '';
  return base.replace(/[-_]+/g, ' ').trim();
}

function main() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.log('لا يوجد مجلد selected-photos/ — لا شيء لعمله.');
    return;
  }

  const files = fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => EXTS.has(path.extname(f).toLowerCase()));

  if (!files.length) {
    console.log('مجلد selected-photos/ فارغ — ضعي صوراً حقيقية فيه ثم أعيدي تشغيل هذا السكربت.');
    return;
  }

  const site = JSON.parse(fs.readFileSync(SITE_JSON, 'utf8'));
  site.gallery = site.gallery || [];

  const existingSrcs = new Set(site.gallery.map((item) => item.src));
  let added = 0;

  for (const file of files) {
    const src = `selected-photos/${file}`;
    if (existingSrcs.has(src)) continue;

    site.gallery.push({
      id: 'selected_' + Date.now() + '_' + added,
      src,
      caption: titleFromFilename(file),
      date: '',
      type: 'moments'
    });
    added++;
  }

  if (added === 0) {
    console.log('كل الصور الموجودة في selected-photos/ مضافة بالفعل إلى data/site.json.');
  } else {
    fs.writeFileSync(SITE_JSON, JSON.stringify(site, null, 2) + '\n', 'utf8');
  }

  // Always resync assets/js/data.js from the current data/site.json, even
  // when no new photo was added — e.g. after manually editing site.json.
  const dataJsContent =
    '// Initial Default Site Data for Shahad Adel Birthday Microsite\n' +
    'window.INITIAL_SITE_DATA = ' + JSON.stringify(site, null, 2) + ';\n';
  fs.writeFileSync(DATA_JS, dataJsContent, 'utf8');

  if (added > 0) {
    console.log(`تمت إضافة ${added} صورة جديدة. تم تحديث data/site.json و assets/js/data.js.`);
  } else {
    console.log('تم تحديث assets/js/data.js من data/site.json (لا صور جديدة).');
  }
  console.log('الخطوة التالية: git add -A && git commit -m "content: sync photos" && git push');
}

main();
