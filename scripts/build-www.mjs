// Assembles a fully offline copy of the site for the Android app:
// three.js and fonts are vendored so nothing loads from the network.
// Usage: node scripts/build-www.mjs [outDir]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(ROOT, process.argv[2] ?? 'android/app/src/main/assets/www');
const NM = path.join(ROOT, 'node_modules');
const THREE = path.join(NM, 'three');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); };
const copyDir = (from, to) => { for (const f of fs.readdirSync(from)) { const s = path.join(from, f); fs.statSync(s).isDirectory() ? copyDir(s, path.join(to, f)) : copy(s, path.join(to, f)); } };

// 1. app sources
copyDir(path.join(ROOT, 'css'), path.join(OUT, 'css'));
copyDir(path.join(ROOT, 'js'), path.join(OUT, 'js'));

// 2. three.js core + every addon the app imports (resolved recursively)
copy(path.join(THREE, 'build/three.module.js'), path.join(OUT, 'vendor/three/build/three.module.js'));
const addonImports = new Set();
for (const f of fs.readdirSync(path.join(ROOT, 'js'))) {
  const src = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
  for (const m of src.matchAll(/from\s+'three\/addons\/([^']+)'/g)) addonImports.add(m[1]);
}
const queue = [...addonImports];
const done = new Set();
while (queue.length) {
  const rel = queue.pop();
  if (done.has(rel)) continue;
  done.add(rel);
  const file = path.join(THREE, 'examples/jsm', rel);
  copy(file, path.join(OUT, 'vendor/three/examples/jsm', rel));
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/from\s+'(\.{1,2}\/[^']+)'/g)) queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[1])));
}

// 3. fonts (only the script subsets each face is used for, woff2 only)
const FONTS = [
  ['cormorant-garamond', ['500', '600', '500-italic'], ['latin', 'latin-ext']],
  ['ibm-plex-sans', ['400', '500', '600'], ['latin', 'latin-ext']],
  ['ibm-plex-mono', ['400', '500'], ['latin', 'latin-ext']],
  ['noto-sans-devanagari', ['400', '500', '600'], ['devanagari']],
  ['noto-nastaliq-urdu', ['400', '600'], ['arabic']],
];
let css = '';
for (const [pkg, weights, subsets] of FONTS) {
  const subset = new RegExp(`^/\\* ${pkg}-(${subsets.join('|')})-\\d`);
  for (const w of weights) {
    const text = fs.readFileSync(path.join(NM, '@fontsource', pkg, `${w}.css`), 'utf8');
    for (const block of text.split(/\n(?=\/\*)/)) {
      if (!subset.test(block.split('\n')[0])) continue;
      const out = block.replace(/src:[^;]+;/, (src) => {
        const woff2 = src.match(/url\(\.\/files\/([^)]+\.woff2)\)/)[1];
        copy(path.join(NM, '@fontsource', pkg, 'files', woff2), path.join(OUT, 'vendor/fonts', woff2));
        return `src: url(./${woff2}) format('woff2');`;
      });
      css += out.trim() + '\n\n';
    }
  }
}
fs.writeFileSync(path.join(OUT, 'vendor/fonts/fonts.css'), css);

// 4. index.html pointing at the vendored copies
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
html = html
  .replace(/<link rel="preconnect"[^>]*>\n/g, '')
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="vendor/fonts/fonts.css">')
  .replace('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', './vendor/three/build/three.module.js')
  .replace('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/', './vendor/three/examples/jsm/');
if (/https?:\/\/(cdn|fonts)\./.test(html)) throw new Error('index.html still references a CDN');
fs.writeFileSync(path.join(OUT, 'index.html'), html);

const size = (d) => fs.readdirSync(d).reduce((n, f) => { const p = path.join(d, f); return n + (fs.statSync(p).isDirectory() ? size(p) : fs.statSync(p).size); }, 0);
console.log(`www built → ${path.relative(ROOT, OUT)} (${(size(OUT) / 1024 / 1024).toFixed(2)} MB, ${done.size} three.js addons)`);
