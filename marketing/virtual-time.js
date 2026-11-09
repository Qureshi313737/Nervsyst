// Injected before the page loads (Playwright addInitScript).
// Replaces the page clock so every animation advances in exact, fixed steps
// regardless of how long a frame takes to render. The capture script calls
// window.__vt.step(ms) once per video frame.
(() => {
  let now = 0;
  const epoch = Date.now();
  let raf = [];
  const timers = [];
  let nextId = 1;
  const realPerf = performance.now.bind(performance);
  performance.now = () => now;
  Date.now = () => epoch + now;
  window.requestAnimationFrame = (cb) => { raf.push(cb); return raf.length; };
  window.cancelAnimationFrame = () => {};
  window.setTimeout = (cb, ms = 0, ...args) => {
    const id = nextId++;
    timers.push({ id, at: now + Math.max(0, +ms || 0), cb, args });
    return id;
  };
  window.clearTimeout = (id) => {
    const i = timers.findIndex((tm) => tm.id === id);
    if (i >= 0) timers.splice(i, 1);
  };
  window.setInterval = (cb, ms = 0, ...args) => {
    const id = nextId++;
    const tick = () => { cb(...args); timers.push({ id, at: now + ms, cb: tick, args: [] }); };
    timers.push({ id, at: now + ms, cb: tick, args: [] });
    return id;
  };
  window.clearInterval = window.clearTimeout;
  window.__vt = {
    get now() { return now; },
    realNow: realPerf,
    step(ms) {
      now += ms;
      timers.sort((a, b) => a.at - b.at);
      while (timers.length && timers[0].at <= now) {
        const tm = timers.shift();
        try { tm.cb(...tm.args); } catch (e) { console.error(e); }
      }
      const q = raf; raf = [];
      for (const cb of q) { try { cb(now); } catch (e) { console.error(e); } }
    },
  };
  // CSS transitions/animations cannot be stepped: in capture mode they are off.
  const css = 'html.capture *, html.capture *::before, html.capture *::after { transition: none !important; animation: none !important; }';
  const mark = () => {
    const de = document.documentElement;
    if (!de) return false;
    de.classList.add('capture');
    const st = document.createElement('style');
    st.textContent = css;
    de.appendChild(st);
    return true;
  };
  if (!mark()) {
    const mo = new MutationObserver(() => { if (mark()) mo.disconnect(); });
    mo.observe(document, { childList: true });
  }
})();
