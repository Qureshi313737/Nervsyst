// Shared helpers for rendering store assets and the promo video from the real app.
// Requires: `npm ci` (three + fonts) and Playwright with Chromium:
//   npm i --no-save playwright && npx playwright install chromium
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(__dirname, '.www');
const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

/** Build the offline bundle (vendored three.js + fonts) that the renders use. */
function buildWww() {
  execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-www.mjs'), WWW], { stdio: 'inherit' });
}

async function launch() {
  // Software GL works everywhere (CI, servers); a real GPU is faster when available.
  const args = process.env.GPU ? [] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
  return chromium.launch({ args });
}

/** Serve local files at http://app.local/ and block every other host. */
async function serve(page, dir = WWW) {
  await page.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.host !== 'app.local') return route.abort();
    const f = path.join(dir, decodeURIComponent(u.pathname === '/' ? '/index.html' : u.pathname));
    if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'not found' });
    return route.fulfill({ path: f, contentType: MIME[path.extname(f)] || 'application/octet-stream' });
  });
}

/** Open the app with a virtual clock. Returns helpers bound to the page. */
async function openApp(browser, { width, height, dsf = 1, query = '' }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf, hasTouch: width < 860, isMobile: width < 860 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[page]', e.message));
  await page.addInitScript({ path: path.join(__dirname, 'virtual-time.js') });
  await serve(page);
  await page.goto(`http://app.local/index.html${query}`);
  await page.waitForFunction(() => window.__vt);
  const step = (n = 1, ms = 1000 / 30) => page.evaluate(([n2, ms2]) => { for (let i = 0; i < n2; i++) window.__vt.step(ms2); }, [n, ms]);
  // run the Lumifya intro and the app boot to completion
  for (let i = 0; i < 400; i++) {
    await step(3);
    // render boot frames at low quality: full-detail geometry, cheap pixels
    const st = await page.evaluate(() => {
      if (window.__neuromap && !window.__lowSet) { window.__neuromap.quality.setMode('low'); window.__lowSet = true; }
      return !!window.__neuromap && !document.getElementById('splash');
    });
    if (st) break;
  }
  const app = {
    page, ctx, step,
    eval: (fn, arg) => page.evaluate(fn, arg),
    /** Advance time at low quality (fast in software GL). */
    async settle(frames = 45) {
      await page.evaluate(() => window.__neuromap.quality.setMode('low'));
      await step(frames);
    },
    /** Switch to the requested quality, render two frames, save. */
    async shot(file, { quality = 'ultra', type = 'png' } = {}) {
      await page.evaluate((q) => window.__neuromap.quality.setMode(q), quality);
      await step(2);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await page.screenshot({ path: file, type, timeout: 300000, ...(type === 'jpeg' ? { quality: 92 } : {}) });
      console.log('saved', path.relative(ROOT, file));
    },
    close: () => ctx.close(),
  };
  return app;
}

/** Render a standalone HTML template (with local images) to PNG. */
async function renderTemplate(browser, html, { width, height, dsf = 1, file, assetsDir }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf });
  const page = await ctx.newPage();
  const tmp = path.join(assetsDir, '__template.html');
  fs.writeFileSync(tmp, html);
  await page.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.host === 'tpl.local') {
      const f = path.join(assetsDir, decodeURIComponent(u.pathname));
      return fs.existsSync(f) ? route.fulfill({ path: f, contentType: MIME[path.extname(f)] || 'application/octet-stream' }) : route.fulfill({ status: 404 });
    }
    if (u.host === 'fonts.local') {
      const f = path.join(WWW, 'vendor/fonts', decodeURIComponent(u.pathname));
      return fs.existsSync(f) ? route.fulfill({ path: f, contentType: MIME[path.extname(f)] || 'text/css' }) : route.fulfill({ status: 404 });
    }
    return route.abort();
  });
  await page.goto('http://tpl.local/__template.html');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: file, timeout: 120000 });
  fs.unlinkSync(tmp);
  await ctx.close();
  console.log('saved', path.relative(ROOT, file));
}

module.exports = { ROOT, WWW, buildWww, launch, openApp, renderTemplate };
