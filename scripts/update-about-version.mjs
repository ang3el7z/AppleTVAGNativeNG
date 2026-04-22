import { readFileSync, writeFileSync } from 'node:fs';

const rawTag = (process.argv[2] || '').trim();

if (!rawTag) {
  console.error('Usage: node scripts/update-about-version.mjs <tag-or-version>');
  process.exit(1);
}

const version = rawTag.replace(/^v/i, '');

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`Invalid version: ${rawTag}`);
  process.exit(1);
}

const files = [
  'src/i18n/en.js',
  'src/i18n/ru.js',
  'src/i18n/uk.js',
  'appletv_agnative.js',
  'release/appletv_agnative.js'
];

const aboutRegex = /(set_about_desc:\s*'Версия\s+)([^']+?)(\s+Авторы:[^']*')/g;
let changedCount = 0;

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  aboutRegex.lastIndex = 0;
  if (!aboutRegex.test(source)) {
    throw new Error(`set_about_desc pattern was not found in ${file}`);
  }

  aboutRegex.lastIndex = 0;
  const updated = source.replace(aboutRegex, `$1${version}$3`);
  if (updated !== source) {
    writeFileSync(file, updated, 'utf8');
    changedCount += 1;
    console.log(`updated ${file}`);
  } else {
    console.log(`up-to-date ${file}`);
  }
}

console.log(`Done. Updated files: ${changedCount}/${files.length}`);
