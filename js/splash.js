// Lumifya studio intro.
// A single neural "spark" bursts into points of light that fly in to form the
// LUMIFYA wordmark; a light sweep passes over it, PRESENTS fades in, and the
// particles later dissolve into the Neuromap title sequence.
// Classic script (not a module) so it starts before the 3D app has loaded.
// API: window.__splash.formed (Promise) · window.__splash.finish() → Promise
(function () {
  'use strict';
  var root = document.getElementById('splash');
  var api = { formed: Promise.resolve(), done: Promise.resolve(), finish: function () { return Promise.resolve(); } };
  window.__splash = api;
  if (!root) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = root.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var MAX = touch ? 950 : 1700;
  var particles = [], dust = [];
  var start = performance.now();
  var formedAt = 2550, finishing = null, sampled = false, skipped = false, shift = 0, fontReady = false;
  try {
    document.fonts.load('600 100px "Cormorant Garamond"').then(function () { fontReady = true; }, function () { fontReady = true; });
  } catch (e) { fontReady = true; }
  var resolveFormed, resolveDone;
  api.formed = new Promise(function (r) { resolveFormed = r; });
  api.done = new Promise(function (r) { resolveDone = r; });

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  // soft glow sprite
  var sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  (function () {
    var g = sprite.getContext('2d');
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0.18)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  })();
  // tinted sprites (gold → cyan) to avoid per-particle colour work
  var TINTS = 12, tinted = [];
  function mix(a, b, t) { return Math.round(a + (b - a) * t); }
  for (var k = 0; k < TINTS; k++) {
    var t = k / (TINTS - 1);
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d');
    g.drawImage(sprite, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = 'rgb(' + mix(255, 140, t) + ',' + mix(206, 214, t) + ',' + mix(110, 255, t) + ')';
    g.fillRect(0, 0, 64, 64);
    tinted.push(c);
  }

  var seed = 20261109;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  for (var i = 0; i < 90; i++) dust.push({ x: rnd(), y: rnd(), s: 0.4 + rnd() * 1.2, v: 0.004 + rnd() * 0.01, p: rnd() * 6.28 });

  function fontSize() { return Math.max(44, Math.min(W * (W < 600 ? 0.17 : 0.11), 150)); }

  function sample() {
    sampled = true;
    var fs = fontSize();
    var off = document.createElement('canvas');
    off.width = Math.ceil(W); off.height = Math.ceil(fs * 1.6);
    var o = off.getContext('2d');
    o.fillStyle = '#fff';
    o.textAlign = 'center'; o.textBaseline = 'middle';
    o.font = '600 ' + fs + 'px "Cormorant Garamond", Georgia, "Times New Roman", serif';
    try { o.letterSpacing = Math.round(fs * 0.14) + 'px'; } catch (e) { /* older engines */ }
    o.fillText('LUMIFYA', off.width / 2, off.height / 2);
    var data = o.getImageData(0, 0, off.width, off.height).data;
    var step = Math.max(2, Math.round(fs / 30));
    var pts = [];
    for (var y = 0; y < off.height; y += step) {
      for (var x = 0; x < off.width; x += step) {
        if (data[(y * off.width + x) * 4 + 3] > 140) pts.push([x, y]);
      }
    }
    while (pts.length > MAX) pts.splice(Math.floor(rnd() * pts.length), 1);
    var oy = H * 0.46 - off.height / 2;
    var minX = Infinity, maxX = -Infinity;
    pts.forEach(function (p) { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); });
    var cx = W / 2, cy = H * 0.46;
    particles = pts.map(function (p) {
      var tx = p[0], ty = p[1] + oy;
      var u = (tx - minX) / Math.max(1, maxX - minX);
      var ang = rnd() * Math.PI * 2, burst = 60 + rnd() * Math.min(W, H) * 0.42;
      return {
        tx: tx, ty: ty, u: u,
        sx: cx + Math.cos(ang) * 4, sy: cy + Math.sin(ang) * 4,
        mx: cx + Math.cos(ang) * burst, my: cy + Math.sin(ang) * burst * 0.75,
        delay: 520 + u * 420 + rnd() * 220, dur: 1050 + rnd() * 380,
        size: 2.2 + rnd() * 2.6, tw: rnd() * 6.28,
        tint: Math.min(TINTS - 1, Math.round(u * (TINTS - 1))),
        dx: (rnd() - 0.5) * 90, dy: -40 - rnd() * 140,
      };
    });
    api.fontSize = fs;
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function frame() {
    var now = performance.now();
    var t = now - start;
    if (!sampled && t > 430 && (fontReady || t > 1100)) { shift = Math.max(0, t - 430); sample(); }
    var tp = t - shift;
    var fin = finishing ? clamp((now - finishing) / 1000) : 0;

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    var bg = ctx.createRadialGradient(W / 2, H * 0.46, 0, W / 2, H * 0.46, Math.max(W, H) * 0.75);
    bg.addColorStop(0, '#0a1420'); bg.addColorStop(0.55, '#04080f'); bg.addColorStop(1, '#010204');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    // drifting dust
    for (var d = 0; d < dust.length; d++) {
      var q = dust[d];
      var yy = ((q.y - (t / 1000) * q.v + 2) % 1) * H;
      ctx.globalAlpha = (0.12 + 0.1 * Math.sin(t / 700 + q.p)) * (1 - fin);
      ctx.drawImage(tinted[8], q.x * W - q.s * 2, yy - q.s * 2, q.s * 4, q.s * 4);
    }

    // the spark
    var cx = W / 2, cy = H * 0.46;
    var sparkIn = clamp(t / 260), sparkOut = 1 - clamp((t - 900) / 500);
    var pulse = 1 + 0.25 * Math.sin(t / 70);
    var sr = (10 + 26 * easeOut(clamp(t / 500))) * pulse;
    ctx.globalAlpha = sparkIn * sparkOut;
    ctx.drawImage(tinted[0], cx - sr * 2, cy - sr * 2, sr * 4, sr * 4);
    ctx.drawImage(sprite, cx - sr, cy - sr, sr * 2, sr * 2);
    // shock ring
    var rk = clamp((t - 420) / 700);
    if (rk > 0 && rk < 1) {
      ctx.globalAlpha = (1 - rk) * 0.55;
      ctx.strokeStyle = '#ffd98a';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 20 + rk * Math.min(W, H) * 0.35, 0, Math.PI * 2); ctx.stroke();
    }

    // particles → wordmark
    var sweepX = (tp - 2050) / 900;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var k = clamp((tp - p.delay) / p.dur);
      if (k <= 0) continue;
      var e = easeInOut(k);
      // quadratic bezier: spark → burst point → letter
      var a = 1 - e;
      var x = a * a * p.sx + 2 * a * e * p.mx + e * e * p.tx;
      var y = a * a * p.sy + 2 * a * e * p.my + e * e * p.ty;
      var s = p.size * (1.8 - 0.8 * e);
      var alpha = 0.35 + 0.65 * e;
      if (k >= 1) {
        alpha = 0.78 + 0.22 * Math.sin(t / 260 + p.tw);
        var sw = Math.exp(-Math.pow((p.u - sweepX) * 7, 2));
        alpha += sw * 0.9; s *= 1 + sw * 0.9;
      }
      if (fin > 0) {
        var f = easeOut(fin);
        x += p.dx * f; y += p.dy * f;
        alpha *= 1 - f; s *= 1 + f * 1.5;
      }
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.drawImage(tinted[p.tint], x - s * 2, y - s * 2, s * 4, s * 4);
    }

    // PRESENTS
    var pk = clamp((tp - 2250) / 650) * (1 - fin);
    if (pk > 0 && api.fontSize) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = pk;
      var lineW = Math.min(W * 0.5, 280) * easeOut(pk);
      var ly = cy + api.fontSize * 0.62;
      var grd = ctx.createLinearGradient(cx - lineW / 2, 0, cx + lineW / 2, 0);
      grd.addColorStop(0, 'rgba(242,193,78,0)'); grd.addColorStop(0.5, 'rgba(242,193,78,0.9)'); grd.addColorStop(1, 'rgba(121,198,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(cx - lineW / 2, ly, lineW, 1.2);
      ctx.fillStyle = '#cfd9e6';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      var ps = Math.max(11, api.fontSize * 0.13);
      ctx.font = '500 ' + ps + 'px "IBM Plex Mono", ui-monospace, monospace';
      try { ctx.letterSpacing = Math.round(ps * 0.55) + 'px'; } catch (e2) { /* older engines */ }
      ctx.fillText('PRESENTS', cx + ps * 0.27, ly + ps * 1.1);
      try { ctx.letterSpacing = '0px'; } catch (e3) { /* older engines */ }
    }

    if (sampled && tp >= formedAt && resolveFormed) { resolveFormed(); resolveFormed = null; }
    if (finishing) root.style.opacity = String(1 - easeInOut(clamp((now - finishing - 250) / 750)));
    if (finishing && fin >= 1 && now - finishing > 1000) {
      root.remove();
      window.removeEventListener('resize', onResize);
      resolveDone();
      return;
    }
    requestAnimationFrame(frame);
  }

  function onResize() { resize(); if (sampled) sample(); }
  window.addEventListener('resize', onResize);

  api.finish = function () {
    if (!finishing) {
      // never cut the wordmark short: wait until it has formed
      var wait = Math.max(0, formedAt + shift + 350 - (performance.now() - start));
      setTimeout(function () { finishing = performance.now(); }, skipped ? 0 : wait);
    }
    return api.done;
  };
  root.addEventListener('click', function () {
    if (skipped) return;
    skipped = true;
    start = performance.now() - formedAt - 400; shift = 0;
    if (!sampled) sample();
    if (resolveFormed) { resolveFormed(); resolveFormed = null; }
  });

  if (reduce) {
    // no motion: show the finished wordmark briefly
    start = performance.now() - formedAt - 400;
    sample();
  }
  requestAnimationFrame(frame);
})();
