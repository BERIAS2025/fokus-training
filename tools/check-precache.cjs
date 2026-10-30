// Prüft, dass jede Datei der App im Offline-Cache (app/sw.js) steht und umgekehrt.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '../app');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const listed = new Set([...sw.matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean));
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : files.push(path.relative(root, p)); } })(root);
const skip = new Set(['sw.js']);
const missing = files.filter(f => !skip.has(f) && !listed.has(f));
const stale = [...listed].filter(f => !files.includes(f));
if (missing.length || stale.length) {
  if (missing.length) console.error('Nicht im Cache:', missing.join(', '));
  if (stale.length) console.error('Im Cache, aber nicht vorhanden:', stale.join(', '));
  process.exit(1);
}
console.log(`OK: ${listed.size} Dateien im Offline-Cache.`);
