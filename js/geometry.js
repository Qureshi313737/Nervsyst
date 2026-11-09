// Procedural geometry helpers: noise, tapered tubes, lofted body parts,
// and the sculpted cerebral hemisphere / cerebellum.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/* ---------------------------------------------------------------- noise */
const GRAD3 = new Float32Array([
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
  1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
  0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1,
]);
const PERM = new Uint8Array(512);
(() => {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let seed = 1337;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
})();

/** 3D simplex noise, range roughly [-1, 1]. */
export function noise3(x, y, z) {
  const F3 = 1 / 3, G3 = 1 / 6;
  const s = (x + y + z) * F3;
  const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
  const t = (i + j + k) * G3;
  const x0 = x - (i - t), y0 = y - (j - t), z0 = z - (k - t);
  let i1, j1, k1, i2, j2, k2;
  if (x0 >= y0) {
    if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
    else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
  } else {
    if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
    else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
    else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
  }
  const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
  const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
  const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
  const ii = i & 255, jj = j & 255, kk = k & 255;
  const c = (g, a, b, d) => {
    let tt = 0.6 - a * a - b * b - d * d;
    if (tt < 0) return 0;
    tt *= tt;
    const o = (g % 12) * 3;
    return tt * tt * (GRAD3[o] * a + GRAD3[o + 1] * b + GRAD3[o + 2] * d);
  };
  const n0 = c(PERM[ii + PERM[jj + PERM[kk]]], x0, y0, z0);
  const n1 = c(PERM[ii + i1 + PERM[jj + j1 + PERM[kk + k1]]], x1, y1, z1);
  const n2 = c(PERM[ii + i2 + PERM[jj + j2 + PERM[kk + k2]]], x2, y2, z2);
  const n3 = c(PERM[ii + 1 + PERM[jj + 1 + PERM[kk + 1]]], x3, y3, z3);
  return 32 * (n0 + n1 + n2 + n3);
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
/** Global level of detail (1 = full). Lowered on weak devices before geometry is built. */
export const LOD = { k: 1 };
export const lerp = (a, b, t) => a + (b - a) * t;
export function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/* ------------------------------------------------------------- curves */
export function smoothCurve(points) {
  const v = points.map((p) => (p.isVector3 ? p : new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.CatmullRomCurve3(v, false, 'centripetal', 0.5);
}

/** Fraction of polyline length at which control point `idx` sits. */
export function controlPointT(points, idx) {
  let total = 0, upto = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    total += d;
    if (i <= idx) upto += d;
  }
  return total > 0 ? upto / total : 0;
}

/**
 * Tube along a curve whose radius varies with t (0..1 along the length).
 * uv.x = t along the nerve, uv.y = around the circumference.
 */
export function taperedTube(curve, { radius = () => 0.05, radial = 10, segments, capStart = false, capEnd = true } = {}) {
  const length = curve.getLength();
  const segs = segments ?? Math.min(420, Math.max(10, Math.ceil(length * 30 * LOD.k)));
  radial = Math.max(5, Math.round(radial * Math.sqrt(LOD.k)));
  const frames = curve.computeFrenetFrames(segs, false);
  const pos = [], nor = [], uv = [], idx = [];
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    curve.getPointAt(t, P);
    let r = radius(t);
    if (capEnd) r *= Math.sqrt(clamp((1 - t) / 0.025, 0, 1)) * 0.92 + 0.08 * (t < 1 ? 1 : 0);
    if (capStart) r *= Math.sqrt(clamp(t / 0.025, 0, 1));
    const n = frames.normals[i], b = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2;
      const sin = Math.sin(v), cos = -Math.cos(v);
      N.set(cos * n.x + sin * b.x, cos * n.y + sin * b.y, cos * n.z + sin * b.z).normalize();
      pos.push(P.x + r * N.x, P.y + r * N.y, P.z + r * N.z);
      nor.push(N.x, N.y, N.z);
      uv.push(t, j / radial);
    }
  }
  for (let j = 1; j <= segs; j++) {
    for (let i = 1; i <= radial; i++) {
      const a = (radial + 1) * (j - 1) + (i - 1);
      const b = (radial + 1) * j + (i - 1);
      const c = (radial + 1) * j + i;
      const d = (radial + 1) * (j - 1) + i;
      idx.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.userData.length = length;
  return g;
}

/** Radius function: linear taper r0 -> r1 plus gaussian swellings (ganglia). */
export function radiusFn(r0, r1, bumps = []) {
  return (t) => {
    let r = lerp(r0, r1, t);
    for (const [bt, amp, w] of bumps) r += amp * Math.exp(-(((t - bt) / w) ** 2));
    return r;
  };
}

/**
 * Lofted vertical body part from keyframes [{y, rx, rz, cx, cz}] (bottom → top).
 * Elliptical cross-sections, Catmull-Rom interpolated between keys.
 */
export function loft(keys, { rings = 80, radial = 56 } = {}) {
  const pos = [], idx = [];
  const n = keys.length;
  const get = (k, f) => keys[clamp(k, 0, n - 1)][f] ?? 0;
  const cr = (p0, p1, p2, p3, t) =>
    0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  for (let r = 0; r <= rings; r++) {
    const u = (r / rings) * (n - 1);
    const k = Math.min(n - 2, Math.floor(u));
    const t = u - k;
    const f = (field) => cr(get(k - 1, field), get(k, field), get(k + 1, field), get(k + 2, field), t);
    const y = f('y'), rx = f('rx'), rz = f('rz'), cx = f('cx'), cz = f('cz');
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      pos.push(cx + rx * Math.cos(a), y, cz + rz * Math.sin(a));
    }
  }
  for (let r = 0; r < rings; r++) {
    for (let j = 0; j < radial; j++) {
      const a = r * (radial + 1) + j, b = a + 1, d = a + radial + 1, c = d + 1;
      idx.push(a, d, b, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* -------------------------------------------------------------- brain */

/** Lateral sulcus (Sylvian fissure) height at a given z (hemisphere-local). */
const lateralSulcusY = (z) => -0.1 + (0.35 - z) * 0.32;
/** Central sulcus (Rolando) z at a given height y. */
const centralSulcusZ = (y) => 0.08 - y * 0.28;
/** Parieto-occipital boundary. */
const parietoOccipitalZ = (y) => -0.52 + y * 0.1;

/** Which cerebral lobe a hemisphere-local point belongs to (x is lateral distance). */
export function classifyLobe(x, y, z) {
  if (z < parietoOccipitalZ(y)) return 'occipital';
  if (y < lateralSulcusY(z) && z < 0.5 && x > 0.06) return 'temporal';
  if (z > centralSulcusZ(y)) return 'frontal';
  return 'parietal';
}

export const LOBE_COLORS = {
  frontal: new THREE.Color('#4f8ff7'),
  parietal: new THREE.Color('#f5c84b'),
  temporal: new THREE.Color('#3ccf8e'),
  occipital: new THREE.Color('#f2665c'),
};

/**
 * One cerebral hemisphere in local space (lateral = +x * side).
 * Returns geometry with `color` (natural tissue) and `lobeColor` attributes.
 */
export function hemisphereGeometry(side = 1) {
  let g = new THREE.SphereGeometry(1, Math.round(200 * Math.max(0.55, LOD.k)), Math.round(150 * Math.max(0.55, LOD.k)));
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let x = 0.2 + v.x * 0.5, y = v.y * 0.56, z = v.z * 0.82;
    if (x < 0.02) x = 0.02 + (x - 0.02) * 0.06; // flat medial surface (longitudinal fissure)
    const front = smoothstep(0.35, 0.82, z), back = smoothstep(-0.4, -0.82, z);
    x = 0.02 + (x - 0.02) * (1 - 0.2 * front - 0.24 * back);
    y *= 1 - 0.12 * back;
    if (y < -0.22) y = -0.22 + (y + 0.22) * 0.62; // basal surface
    if (y < 0) y += -y * 0.5 * smoothstep(0.22, 0.72, z); // orbital surface raised over the orbits
    if (y < 0) y += -y * 0.3 * smoothstep(-0.45, -0.8, z); // occipital lobe rests on tentorium
    if (y > 0.3) z -= (y - 0.3) * 0.12; // vertex slightly posterior
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  const nrm = g.attributes.normal;
  const colors = new Float32Array(p.count * 3);
  const lobeColors = new Float32Array(p.count * 3);
  const gyrus = new THREE.Color('#e3b3ad'), sulcus = new THREE.Color('#6d3a46'), tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n1 = noise3(x * 5.4 + 3.1, y * 6.2, z * 4.6);
    const n2 = noise3(x * 11 + 9.7, y * 12, z * 10.5);
    const s1 = 1 - smoothstep(0.0, 0.17, Math.abs(n1));
    const s2 = 1 - smoothstep(0.0, 0.13, Math.abs(n2));
    let d = -0.042 * s1 - 0.016 * s2 + 0.01 * noise3(x * 3, y * 3, z * 3);
    // Central sulcus
    const above = smoothstep(lateralSulcusY(z) - 0.02, lateralSulcusY(z) + 0.06, y);
    const cs = Math.exp(-(((z - centralSulcusZ(y)) / 0.022) ** 2)) * above;
    // Lateral (Sylvian) fissure on the lateral convexity
    const ls = Math.exp(-(((y - lateralSulcusY(z)) / 0.03) ** 2)) * smoothstep(0.22, 0.42, x) * smoothstep(0.45, 0.3, z) * smoothstep(-0.42, -0.25, z);
    // Parieto-occipital & calcarine hint on the medial side
    d -= 0.06 * cs + 0.075 * ls;
    const medial = smoothstep(0.02, 0.09, x);
    d *= 0.35 + 0.65 * medial;
    p.setXYZ(i, x + nrm.getX(i) * d, y + nrm.getY(i) * d, z + nrm.getZ(i) * d);
    const depth = clamp(Math.max(s1 * 0.85, s2 * 0.5, cs, ls), 0, 1);
    tmp.copy(gyrus).lerp(sulcus, depth * 0.85);
    colors.set([tmp.r, tmp.g, tmp.b], i * 3);
    const lc = LOBE_COLORS[classifyLobe(x, y, z)];
    tmp.copy(lc).multiplyScalar(1 - depth * 0.55);
    lobeColors.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  if (side < 0) {
    for (let i = 0; i < p.count; i++) p.setX(i, -p.getX(i));
    const index = g.index.array;
    for (let i = 0; i < index.length; i += 3) {
      const t = index[i + 1]; index[i + 1] = index[i + 2]; index[i + 2] = t;
    }
    g.index.needsUpdate = true;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.setAttribute('lobeColor', new THREE.BufferAttribute(lobeColors, 3));
  g.computeVertexNormals();
  return g;
}

/** Cerebellum with transverse folia and a midline vermis. */
export function cerebellumGeometry() {
  let g = new THREE.SphereGeometry(1, Math.round(160 * Math.max(0.55, LOD.k)), Math.round(110 * Math.max(0.55, LOD.k)));
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let x = v.x * 0.56, y = v.y * 0.27, z = v.z * 0.33;
    // two lateral hemispheres, vermis notch posteriorly
    const lobe = 1 + 0.12 * Math.cos(v.x * Math.PI);
    y *= lobe;
    if (y > 0) y *= 0.75; // flat superior surface under tentorium
    const notch = Math.exp(-((x / 0.07) ** 2)) * smoothstep(0.0, -0.3, z) * 0.06;
    z += notch;
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  const n = g.attributes.normal;
  const colors = new Float32Array(p.count * 3);
  const a = new THREE.Color('#e0aaa6'), b = new THREE.Color('#5e2f3c'), tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const ang = Math.atan2(y + 0.05, -z);
    const f = Math.abs(Math.sin(ang * 26 + noise3(x * 4, y * 4, z * 4) * 0.8));
    const groove = 1 - smoothstep(0.0, 0.35, f);
    const d = -0.018 * groove;
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
    tmp.copy(a).lerp(b, groove * 0.75);
    colors.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

/** A coiled tube (cochlea, 2.5 turns). */
export function cochleaCurve(center, scale = 0.06) {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const ang = t * Math.PI * 5;
    const r = scale * (1 - t * 0.75);
    pts.push(new THREE.Vector3(center.x + Math.cos(ang) * r * 0.4, center.y + Math.sin(ang) * r, center.z + Math.cos(ang) * r + t * scale * 0.8));
  }
  return new THREE.CatmullRomCurve3(pts);
}
