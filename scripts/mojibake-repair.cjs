// Repairs UTF-8 text that was mis-decoded as Windows-1252 (mojibake).
// For each run of non-ASCII chars: encode as cp1252 bytes, decode as UTF-8.
// Only replaces when the decode succeeds — legit non-ASCII is left alone.
// Usage: node scripts/mojibake-repair.cjs [--dry] [dir ...]
const fs = require('fs');
const path = require('path');

const dry = process.argv.includes('--dry');
const roots = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!roots.length) roots.push('.');

// cp1252 bytes 0x80-0x9F map to these codepoints (reverse: codepoint -> byte)
const cp1252special = {
  0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A,
  0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92,
  0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C,
  0x017E: 0x9E, 0x0178: 0x9F,
};

function encodeCp1252(str) {
  const bytes = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp <= 0x7F) bytes.push(cp);
    else if (cp >= 0x80 && cp <= 0xFF) bytes.push(cp); // latin-1 + undefined cp1252 slots
    else if (cp1252special[cp] !== undefined) bytes.push(cp1252special[cp]);
    else return null;
  }
  return Buffer.from(bytes);
}

const decoder = new TextDecoder('utf-8', { fatal: true });
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'android', 'ios', 'coverage', '.wrangler', 'release']);
const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.md', '.mjs', '.cjs', '.vue', '.svelte', '.txt', '.ejs', '.hbs']);
const SKIP_FILES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']);

const skipped = [];
let filesChanged = 0, runsFixed = 0;

function processFile(file) {
  let src;
  try { src = fs.readFileSync(file, 'utf8'); } catch { return; }
  if (!/[^\x00-\x7F]/.test(src)) return;
  let changed = 0;
  const out = src.replace(/[^\x00-\x7F]+/g, (run) => {
    const bytes = encodeCp1252(run);
    if (!bytes) { skipped.push(`${file}: unencodable ${JSON.stringify(run.slice(0, 40))}`); return run; }
    try {
      const decoded = decoder.decode(bytes);
      if (decoded === run) return run;
      changed++;
      return decoded;
    } catch {
      skipped.push(`${file}: undecodable ${JSON.stringify(run.slice(0, 40))}`);
      return run;
    }
  });
  if (changed > 0) {
    if (!dry) fs.writeFileSync(file, out, 'utf8');
    console.log(`${dry ? '[dry] ' : ''}${file}: ${changed} run(s) fixed`);
    filesChanged++; runsFixed += changed;
  }
}

function walk(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p); }
    else if (EXTS.has(path.extname(e.name)) && !SKIP_FILES.has(e.name)) processFile(p);
  }
}

for (const r of roots) walk(path.resolve(r));
console.log(`\n${filesChanged} file(s) changed, ${runsFixed} mojibake run(s) fixed.`);
if (skipped.length) {
  console.log(`\n${skipped.length} run(s) left unchanged (legit chars or unrecoverable):`);
  skipped.slice(0, 60).forEach(s => console.log('  ' + s));
  if (skipped.length > 60) console.log(`  ... and ${skipped.length - 60} more`);
}
