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
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function titleFromFilename(filename) {
  return path
    .basename(filename, path.extname(filename))
    .replace(/[-_]+/g, ' ')
    .trim();
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
    return;
  }

  fs.writeFileSync(SITE_JSON, JSON.stringify(site, null, 2) + '\n', 'utf8');
  console.log(`تمت إضافة ${added} صورة جديدة إلى data/site.json.`);
  console.log('الخطوة التالية: git add -A && git commit -m "content: add photos" && git push');
}

main();
