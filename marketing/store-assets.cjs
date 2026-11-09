// Renders every Google Play graphic asset from the real app:
//   node marketing/store-assets.cjs [phone|tablet|feature|icon|marketing ...]
// Output: store/graphics/
const path = require('path');
const fs = require('fs');
const { ROOT, WWW, buildWww, launch, openApp, renderTemplate } = require('./lib.cjs');

const OUT = path.join(ROOT, 'store/graphics');
const only = process.argv.slice(2);
const want = (k) => !only.length || only.includes(k);
const HIDE_UI = '#panel,#topbar,#toolbar,#legend,#intro,.brand,#tooltip,.label-layer,#info,#tourbar,#quizbar,#microbar{display:none!important}';

const PHONE = [
  ['01-overview', async () => {}],
  ['02-dossier', async (a) => { await a.eval(() => window.__neuromap.select('median-L', { fly: true })); }],
  ['03-tour', async (a) => { await a.eval(() => { window.__neuromap.startTour('motor'); window.__neuromap.tours.go(3); }); await a.settle(66); }],
  ['04-brain', async (a) => { await a.eval(() => window.__neuromap.setFilter('lobes')); }],
  ['05-nerve-fibre', async (a) => { await a.eval(() => window.__neuromap.setScale('nerve')); await a.settle(90); }],
  ['06-neuron', async (a) => { await a.eval(() => { window.__neuromap.setScale('neuron'); }); await a.settle(80); await a.eval(() => window.__neuromap.selectMicro('nmj')); }],
  ['07-languages', async (a) => {
    await a.eval(() => { const s = document.querySelector('#lang-sel'); s.value = 'hi'; s.dispatchEvent(new Event('change')); window.__neuromap.select('ulnar-L', { fly: true }); });
  }],
  ['08-quiz', async (a) => { await a.eval(() => window.__neuromap.startQuiz()); }],
];
const TABLET = [
  ['01-overview', async () => {}],
  ['02-dossier', async (a) => { await a.eval(() => { const s = document.querySelector('#level-sel'); s.value = 'advanced'; s.dispatchEvent(new Event('change')); window.__neuromap.select('sciatic-L', { fly: true }); }); }],
  ['03-tour', async (a) => { await a.eval(() => { window.__neuromap.startTour('pain'); window.__neuromap.tours.go(4); }); await a.settle(70); }],
  ['04-deep-brain', async (a) => { await a.eval(() => window.__neuromap.setFilter('deep')); }],
];

const HEADLINES = {
  '01-overview': ['Every nerve, in 3D', 'Over 200 clickable structures, from brain to toes'],
  '02-dossier': ['Tap a nerve. Learn it all.', 'Course, supply, clinical signs and how to examine'],
  '03-tour': ['Watch signals travel', 'Six cinematic pathway tours'],
  '04-brain': ['Explore the brain', 'Lobes, brainstem and deep structures'],
  '05-nerve-fibre': ['From body to nerve fibre', 'Myelin, nodes of Ranvier, saltatory conduction'],
  '06-neuron': ['Neuron to muscle', 'The neuromuscular junction, animated'],
  '07-languages': ['English · हिन्दी · اردو', 'Learn in your own language'],
  '08-quiz': ['Test yourself', 'Quick quizzes with score and streak'],
};

async function captureSet(browser, list, { width, height, dsf, dir }) {
  for (const [name, setup] of list) {
    const app = await openApp(browser, { width, height, dsf, query: '?q=ultra' });
    await app.settle(140); // intro camera flight
    await setup(app);
    await app.settle(60);
    await app.shot(path.join(dir, `${name}.png`));
    await app.close();
  }
}

const FONTS = '<link rel="stylesheet" href="http://fonts.local/fonts.css">';
const BASE_CSS = `*{box-sizing:border-box;margin:0}body{background:#03060b;color:#e7edf4;font-family:'IBM Plex Sans','Noto Sans Devanagari','Noto Nastaliq Urdu',sans-serif;overflow:hidden}
.serif{font-family:'Cormorant Garamond','Noto Sans Devanagari','Noto Nastaliq Urdu',Georgia,serif}.mono{font-family:'IBM Plex Mono',monospace}`;
const MARK = (size, glow = true) => `<svg viewBox="0 0 40 40" width="${size}" height="${size}" style="${glow ? 'filter:drop-shadow(0 0 18px rgba(242,193,78,.55))' : ''}"><path d="M20 3v34M20 11c-6 0-9 3-12 7M20 11c6 0 9 3 12 7M20 20c-5 1-8 4-10 9M20 20c5 1 8 4 10 9M20 29c-3 1-5 3-6 7M20 29c3 1 5 3 6 7" stroke="#f2c14e" stroke-width="1.7" fill="none" stroke-linecap="round"/><circle cx="20" cy="4" r="2.7" fill="#f2c14e"/></svg>`;

function marketingHTML(img, [title, sub]) {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
  body{width:540px;height:960px;background:radial-gradient(120% 70% at 50% 18%,#10243a 0%,#060c15 55%,#020408 100%)}
  .top{position:absolute;top:58px;left:0;right:0;text-align:center;padding:0 34px}
  .brand{display:flex;align-items:center;justify-content:center;gap:10px;font-size:11px;letter-spacing:.32em;color:#f2c14e;text-transform:uppercase}
  h1{margin-top:18px;font-size:46px;line-height:1.05;font-weight:600;color:#fff;text-shadow:0 0 30px rgba(242,193,78,.25)}
  p{margin-top:12px;font-size:17px;line-height:1.45;color:#b9c8d8}
  .phone{position:absolute;left:50%;bottom:-40px;transform:translateX(-50%);width:392px;height:697px;border-radius:44px;padding:11px;background:linear-gradient(160deg,#2b3646,#0b1018);box-shadow:0 0 0 1px rgba(255,255,255,.08),0 30px 90px rgba(0,0,0,.6),0 0 120px rgba(80,160,255,.18)}
  .phone img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:34px;display:block}
  .glow{position:absolute;left:50%;bottom:120px;width:520px;height:520px;transform:translateX(-50%);background:radial-gradient(circle,rgba(242,193,78,.16),transparent 65%)}
  </style></head><body><div class="glow"></div><div class="top"><div class="brand mono">${MARK(16, false)} Lumifya · Neuromap</div>
  <h1 class="serif">${title}</h1><p>${sub}</p></div><div class="phone"><img src="http://tpl.local/${img}"></div></body></html>`;
}

function featureHTML(img) {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
  body{width:1024px;height:500px;background:#03060b}
  .bg{position:absolute;inset:0;background:url(http://tpl.local/${img}) center/cover}
  .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,6,11,.96) 0%,rgba(3,6,11,.82) 34%,rgba(3,6,11,0) 62%)}
  .txt{position:absolute;left:64px;top:50%;transform:translateY(-50%);width:430px}
  .brand{display:flex;align-items:center;gap:10px;font-size:13px;letter-spacing:.36em;color:#f2c14e}
  h1{margin-top:14px;font-size:84px;line-height:.95;font-weight:600;color:#fff;text-shadow:0 0 40px rgba(242,193,78,.25)}
  p{margin-top:16px;font-size:21px;line-height:1.4;color:#c2d0de}
  .chips{margin-top:20px;display:flex;gap:8px;flex-wrap:wrap}.chips span{font-size:13px;padding:6px 11px;border-radius:999px;border:1px solid rgba(242,193,78,.45);color:#ffe6a6;background:rgba(242,193,78,.08)}
  </style></head><body><div class="bg"></div><div class="shade"></div><div class="txt">
  <div class="brand mono">${MARK(18, false)} LUMIFYA</div><h1 class="serif">Neuromap</h1><p>The human nervous system in cinematic 3D</p>
  <div class="chips"><span>Pathway tours</span><span>Body → neuron</span><span>हिन्दी · اردو</span></div></div></body></html>`;
}

function iconHTML() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
  body{width:512px;height:512px;background:radial-gradient(circle at 50% 42%,#16304b 0%,#081322 48%,#02050a 100%);display:grid;place-items:center}
  .ring{position:absolute;inset:70px;border-radius:50%;box-shadow:0 0 0 2px rgba(121,198,255,.22),0 0 60px rgba(121,198,255,.18) inset}
  .halo{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(242,193,78,.28),transparent 62%)}
  </style></head><body><div class="halo"></div><div class="ring"></div>${MARK(300)}</body></html>`;
}

(async () => {
  if (!fs.existsSync(path.join(WWW, 'index.html')) || process.env.REBUILD) buildWww();
  const browser = await launch();
  if (want('phone')) await captureSet(browser, PHONE, { width: 540, height: 960, dsf: 2, dir: path.join(OUT, 'phone') });
  if (want('tablet')) await captureSet(browser, TABLET, { width: 1280, height: 800, dsf: 2, dir: path.join(OUT, 'tablet') });
  if (want('feature')) {
    const app = await openApp(browser, { width: 1024, height: 500, dsf: 2, query: '?q=ultra' });
    await app.page.addStyleTag({ content: HIDE_UI });
    await app.settle(140);
    await app.eval(() => {
      const m = window.__neuromap;
      m.controls.autoRotate = false;
      m.camera.position.set(3.2, 15.4, 9.6);
      m.controls.target.set(-1.15, 14.25, 0);
    });
    await app.settle(30);
    await app.shot(path.join(OUT, '_feature-render.png'));
    await app.close();
    await renderTemplate(browser, featureHTML('_feature-render.png'), { width: 1024, height: 500, dsf: 1, file: path.join(OUT, 'feature-graphic-1024x500.png'), assetsDir: OUT });
    fs.unlinkSync(path.join(OUT, '_feature-render.png'));
  }
  if (want('icon')) await renderTemplate(browser, iconHTML(), { width: 512, height: 512, dsf: 1, file: path.join(OUT, 'icon-512.png'), assetsDir: OUT });
  if (want('marketing')) {
    const dir = path.join(OUT, 'phone');
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.png'))) {
      const name = f.replace('.png', '');
      fs.mkdirSync(path.join(OUT, 'phone-marketing'), { recursive: true });
      fs.copyFileSync(path.join(dir, f), path.join(OUT, `_m.png`));
      await renderTemplate(browser, marketingHTML('_m.png', HEADLINES[name]), { width: 540, height: 960, dsf: 2, file: path.join(OUT, 'phone-marketing', f), assetsDir: OUT });
    }
    fs.rmSync(path.join(OUT, '_m.png'), { force: true });
  }
  await browser.close();
})();
