// Adaptive quality: picks a tier from the device, then watches the frame rate
// and lowers resolution (and, if needed, the tier) so motion stays smooth.

export const TIERS = ['low', 'medium', 'high', 'ultra'];
const CFG = {
  low: { dpr: 1.0, bloom: false, msaa: 0, grade: false, dust: 0.25 },
  medium: { dpr: 1.3, bloom: true, msaa: 0, grade: true, dust: 0.55 },
  high: { dpr: 1.6, bloom: true, msaa: 4, grade: true, dust: 1 },
  ultra: { dpr: 2.0, bloom: true, msaa: 4, grade: true, dust: 1 },
};

export function guessTier(renderer) {
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const mem = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  let gpu = '';
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) gpu = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
  } catch { /* not exposed */ }
  const software = /swiftshader|llvmpipe|software|basic render/i.test(gpu);
  const weakMobile = /mali-[34]|mali-t[0-9]|adreno \(tm\) [1-4]\d\d|powervr sgx|videocore/i.test(gpu);
  if (software || !renderer.capabilities.isWebGL2) return 'low';
  if (touch) return weakMobile || mem <= 3 ? 'low' : mem >= 6 && cores >= 8 ? 'high' : 'medium';
  return mem >= 8 && window.devicePixelRatio >= 1.5 ? 'ultra' : 'high';
}

export class Quality {
  constructor({ renderer, composer, bloom, grade, dust, onResize, onTierChange, mode = 'auto' }) {
    Object.assign(this, { renderer, composer, bloom, grade, dust, onResize, onTierChange });
    this.auto = guessTier(renderer);
    this.mode = mode;
    this.tier = mode === 'auto' ? this.auto : mode;
    this.scale = 1;
    this.acc = 0; this.frames = 0; this.good = 0; this.warmup = 3.5;
    this.apply();
  }

  setMode(mode) {
    this.mode = mode;
    this.tier = mode === 'auto' ? this.auto : mode;
    this.scale = 1; this.warmup = 2;
    this.apply();
  }

  apply() {
    const c = CFG[this.tier];
    const dpr = Math.max(0.6, Math.min(window.devicePixelRatio || 1, c.dpr) * this.scale);
    this.renderer.setPixelRatio(dpr);
    this.composer.setPixelRatio(dpr);
    this.bloom.enabled = c.bloom;
    this.grade.uniforms.uFx.value = c.grade ? 1 : 0;
    const samples = this.renderer.capabilities.isWebGL2 ? c.msaa : 0;
    for (const rt of [this.composer.renderTarget1, this.composer.renderTarget2]) {
      if (rt.samples !== samples) { rt.samples = samples; rt.dispose(); }
    }
    if (this.dust) this.dust.geometry.setDrawRange(0, Math.floor(this.dust.geometry.attributes.position.count * c.dust));
    this.onResize?.();
  }

  /** Call once per frame with the frame time in seconds. */
  sample(dt) {
    if (document.hidden) return;
    if (this.warmup > 0) { this.warmup -= dt; return; }
    this.acc += dt; this.frames++;
    if (this.acc < 2) return;
    const fps = this.frames / this.acc;
    this.acc = 0; this.frames = 0;
    if (this.mode !== 'auto') return;
    if (fps < 40) {
      this.good = 0;
      if (this.scale > 0.62) { this.scale = Math.max(0.6, this.scale * 0.82); this.apply(); }
      else {
        const i = TIERS.indexOf(this.tier);
        if (i > 0) { this.tier = TIERS[i - 1]; this.scale = 1; this.warmup = 1.5; this.apply(); this.onTierChange?.(this.tier); }
      }
    } else if (fps > 56) {
      if (++this.good >= 3 && this.scale < 1) { this.scale = Math.min(1, this.scale * 1.12); this.good = 0; this.apply(); }
    } else this.good = 0;
  }
}
