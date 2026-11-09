// Renders the Neuromap promotional video frame by frame from the real app.
//   node marketing/promo-video.cjs            → store/video/neuromap-promo.mp4
// Env: FPS (30), W/H (1920x1080), Q (render quality: low|medium|high, default medium),
//      FROM/TO (seconds, to render a slice for previews), GPU=1 to use a real GPU.
// Needs ffmpeg on PATH and python3 with numpy (for the soundtrack).
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { ROOT, WWW, buildWww, launch } = require('./lib.cjs');

const FPS = +(process.env.FPS || 30);
const W = +(process.env.W || 1920), H = +(process.env.H || 1080);
const Q = process.env.Q || 'medium';
const DURATION = 39;
const FROM = +(process.env.FROM || 0), TO = +(process.env.TO || DURATION);
const OUT = path.join(ROOT, 'store/video');
const FRAMES = path.join(__dirname, '.frames');

// ---------------------------------------------------------------- storyboard
// actions run once when the timeline passes their time (seconds)
const ACTIONS = [
  [3.0, () => { const m = window.__neuromap; m.state.labels = false; m.controls.autoRotate = false; }],
  [9.0, () => { const m = window.__neuromap; m.controls.autoRotateSpeed = 1.6; m.controls.autoRotate = true; }],
  [13.0, () => { const m = window.__neuromap; m.controls.autoRotate = false; m.startTour('motor'); m.tours.go(3); }],
  [19.0, () => { const m = window.__neuromap; document.querySelector('#tour-exit').click(); m.setFilter('lobes'); }],
  [20.6, () => { const m = window.__neuromap; m.controls.autoRotateSpeed = 2.4; m.controls.autoRotate = true; }],
  [23.5, () => { const m = window.__neuromap; m.controls.autoRotate = false; m.setScale('nerve'); }],
  [27.5, () => { window.__neuromap.setScale('neuron'); }],
  [31.0, () => { const m = window.__neuromap; m.setScale('body'); m.setFilter('all', { fly: false }); document.documentElement.classList.add('show-info'); m.select('median-L', { fly: true }); }],
  [32.9, () => { const s = document.querySelector('#lang-sel'); s.value = 'hi'; s.dispatchEvent(new Event('change')); }],
  [34.0, () => { const s = document.querySelector('#lang-sel'); s.value = 'ur'; s.dispatchEvent(new Event('change')); }],
  [35.0, () => { const m = window.__neuromap; document.documentElement.classList.remove('show-info'); m.deselect(); m.setView('body'); m.controls.autoRotateSpeed = 1.2; m.controls.autoRotate = true; }],
];

const fade = (t, a, b, inD = 0.6, outD = 0.6) => Math.max(0, Math.min(1, (t - a) / inD, (b - t) / outD));
const CAPTIONS = [
  [9.2, 12.9, 'Complete nervous system', '200+ structures · 12 cranial pairs · 31 spinal pairs'],
  [14.0, 18.8, 'Cinematic pathway tours', 'Watch a motor command cross to the other side'],
  [20.0, 23.3, 'Explore the brain', 'Lobes, brainstem and deep structures'],
  [24.6, 27.4, 'From body to nerve fibre', 'Myelin · nodes of Ranvier · saltatory conduction'],
  [28.3, 30.9, 'Down to a single neuron', 'Synapse to muscle, animated'],
  [31.4, 34.9, 'Learn in your language', 'English · हिन्दी · اردو'],
];
function overlay(t) {
  const cap = CAPTIONS.find(([a, b]) => t >= a - 0.1 && t <= b + 0.1);
  return {
    title: fade(t, 4.6, 8.6, 0.9, 0.8),
    titleY: (t - 4.6) * 6,
    cap: cap ? { op: fade(t, cap[0], cap[1], 0.5, 0.5), h: cap[2], s: cap[3] } : null,
    bars: 1 - fade(t, 35.4, 99, 0.8, 1),
    end: fade(t, 35.6, 99, 1.0, 1),
    endScale: 1 + Math.max(0, 39 - t) * 0.012,
    black: fade(t, 38.4, 99, 0.6, 1),
  };
}

const PROMO_CSS = `
#panel,#topbar,#toolbar,#legend,#intro,.brand,#tooltip,.label-layer,#tourbar,#quizbar,#microbar{display:none!important}
html:not(.show-info) #info{display:none!important}
html.show-info #info{top:120px!important;bottom:120px!important;right:90px!important;width:470px!important}
#promo{position:fixed;inset:0;pointer-events:none;z-index:70;font-family:'IBM Plex Sans','Noto Sans Devanagari','Noto Nastaliq Urdu',sans-serif}
#promo .bar{position:absolute;left:0;right:0;height:92px;background:#000}
#promo .bar.t{top:0}#promo .bar.b{bottom:0}
#promo .title{position:absolute;left:0;right:0;top:50%;text-align:center;color:#fff}
#promo .title h1{font:600 150px/1 'Cormorant Garamond',Georgia,serif;letter-spacing:.06em;text-shadow:0 0 60px rgba(242,193,78,.35)}
#promo .title p{margin-top:10px;font:500 22px 'IBM Plex Mono',monospace;letter-spacing:.42em;text-transform:uppercase;color:#cdd9e6}
#promo .cap{position:absolute;left:110px;bottom:150px;max-width:900px}
#promo .cap .h{font:600 66px/1.05 'Cormorant Garamond',Georgia,serif;color:#fff;text-shadow:0 0 30px rgba(0,0,0,.6)}
#promo .cap .s{margin-top:14px;font-size:28px;color:#d4e0ec;text-shadow:0 0 16px rgba(0,0,0,.8)}
#promo .cap .line{width:120px;height:3px;margin-bottom:22px;background:linear-gradient(90deg,#f2c14e,rgba(121,198,255,.0))}
#promo .end{position:absolute;inset:0;display:grid;place-items:center;text-align:center;background:radial-gradient(circle at 50% 45%,rgba(10,22,36,.86),rgba(1,3,6,.97) 70%)}
#promo .end .mark{width:120px;height:120px;margin:0 auto 22px;filter:drop-shadow(0 0 26px rgba(242,193,78,.6))}
#promo .end h1{font:600 140px/1 'Cormorant Garamond',Georgia,serif;color:#fff;letter-spacing:.04em}
#promo .end .by{margin-top:18px;font:500 24px 'IBM Plex Mono',monospace;letter-spacing:.5em;color:#f2c14e}
#promo .end .cta{margin-top:46px;display:inline-block;padding:16px 34px;border-radius:999px;border:1.5px solid rgba(242,193,78,.6);font-size:28px;color:#ffe9b0;background:rgba(242,193,78,.08)}
#promo .black{position:absolute;inset:0;background:#000}`;
const PROMO_HTML = `<div class="bar t"></div><div class="bar b"></div>
<div class="title"><h1>NEUROMAP</h1><p>The human nervous system in 3D</p></div>
<div class="cap"><div class="line"></div><div class="h"></div><div class="s"></div></div>
<div class="end"><div><svg class="mark" viewBox="0 0 40 40"><path d="M20 3v34M20 11c-6 0-9 3-12 7M20 11c6 0 9 3 12 7M20 20c-5 1-8 4-10 9M20 20c5 1 8 4 10 9M20 29c-3 1-5 3-6 7M20 29c3 1 5 3 6 7" stroke="#f2c14e" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="20" cy="4" r="2.6" fill="#f2c14e"/></svg>
<h1>Neuromap</h1><div class="by">BY LUMIFYA</div><div class="cta">Available on Google Play</div></div></div>
<div class="black"></div>`;

(async () => {
  if (!fs.existsSync(path.join(WWW, 'index.html')) || process.env.REBUILD) buildWww();
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[page]', e.message));
  await page.addInitScript({ path: path.join(__dirname, 'virtual-time.js') });
  await page.addInitScript(({ css, html }) => {
    window.addEventListener('DOMContentLoaded', () => {
      const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      const d = document.createElement('div'); d.id = 'promo'; d.innerHTML = html; document.body.appendChild(d);
      window.__promo = (o) => {
        const q = (s) => d.querySelector(s);
        q('.bar.t').style.transform = `translateY(${-(1 - o.bars) * 100}%)`;
        q('.bar.b').style.transform = `translateY(${(1 - o.bars) * 100}%)`;
        q('.title').style.opacity = o.title;
        q('.title').style.transform = `translateY(calc(-50% - ${o.titleY}px)) scale(${1 + o.titleY * 0.0006})`;
        const cap = q('.cap');
        cap.style.opacity = o.cap ? o.cap.op : 0;
        if (o.cap) { q('.cap .h').textContent = o.cap.h; q('.cap .s').textContent = o.cap.s; cap.style.transform = `translateX(${(1 - o.cap.op) * -30}px)`; }
        q('.end').style.opacity = o.end;
        q('.end > div').style.transform = `scale(${o.endScale})`;
        q('.black').style.opacity = o.black;
      };
    });
  }, { css: PROMO_CSS, html: PROMO_HTML });
  await page.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.host !== 'app.local') return route.abort();
    const f = path.join(WWW, decodeURIComponent(u.pathname));
    const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.woff2': 'font/woff2' };
    return fs.existsSync(f) ? route.fulfill({ path: f, contentType: mime[path.extname(f)] || 'application/octet-stream' }) : route.fulfill({ status: 404 });
  });
  await page.goto(`http://app.local/index.html?q=high`);
  await page.waitForFunction(() => window.__vt && window.__promo);
  await page.evaluate(() => document.fonts.ready);

  const dt = 1000 / FPS;
  const total = Math.round(DURATION * FPS);
  let next = 0;
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    const t = f / FPS;
    const due = [];
    while (next < ACTIONS.length && ACTIONS[next][0] <= t) due.push(ACTIONS[next++][1].toString());
    const o = overlay(t);
    const ready = await page.evaluate(({ due: fns, o: ov, ms, q }) => {
      const m = window.__neuromap;
      if (m && !window.__qset) { m.quality.setMode(q); window.__qset = true; }
      if (m) for (const fn of fns) (0, eval)(`(${fn})`)();
      window.__vt.step(ms);
      window.__promo(ov);
      return !!m;
    }, { due, o, ms: dt, q: Q });
    if (!ready && t > 6) throw new Error('app did not start');
    if (t < FROM || t > TO) continue;
    await page.screenshot({ path: path.join(FRAMES, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 93, timeout: 300000 });
    if (f % FPS === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`t=${t.toFixed(1)}s  frame ${f}/${total}  elapsed ${el.toFixed(0)}s  (${(el / (f + 1)).toFixed(2)} s/frame)`);
    }
  }
  await browser.close();

  if (FROM > 0 || TO < DURATION) { console.log('slice rendered to', FRAMES); return; }
  const wav = path.join(OUT, '_soundtrack.wav');
  execFileSync('python3', [path.join(__dirname, 'soundtrack.py'), wav, String(DURATION)], { stdio: 'inherit' });
  const mp4 = path.join(OUT, 'neuromap-promo-1080p.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(FRAMES, 'f%05d.jpg'), '-i', wav,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', mp4], { stdio: 'inherit' });
  fs.unlinkSync(wav);
  console.log('saved', path.relative(ROOT, mp4));
})();
