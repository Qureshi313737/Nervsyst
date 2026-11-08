// Builders for context anatomy: holographic skin, ghost skeleton, target
// organs and the central nervous system (brain, brainstem, cord).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { smoothCurve, taperedTube, radiusFn, loft, hemisphereGeometry, cerebellumGeometry, cochleaCurve, lerp, smoothstep } from './geometry.js';
import { BRAIN_CENTER, cordZ, VERT, RIBS, ribPoints, ribStart, CONUS_Y, VY } from './anatomy.js';

export const sharedUniforms = { uTime: { value: 0 } };

/* ------------------------------------------------------------ materials */

/** MeshStandardMaterial with fresnel rim, neural "activity" glints and optional lobe tint. */
export function tissueMaterial({ color = '#ffffff', vertexColors = false, roughness = 0.55, metalness = 0.0, rim = '#ff9db5', rimStrength = 0.6, activity = 0.0, lobes = false, emissive = '#000000', emissiveIntensity = 0 } = {}) {
  const m = new THREE.MeshStandardMaterial({ color, vertexColors, roughness, metalness, transparent: true, emissive, emissiveIntensity });
  const u = {
    uRim: { value: rimStrength }, uRimColor: { value: new THREE.Color(rim) }, uActivity: { value: activity },
    uLobeMix: { value: 0 }, uTime: sharedUniforms.uTime,
  };
  m.userData.uniforms = u;
  m.customProgramCacheKey = () => `tissue-${lobes ? 1 : 0}`;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWPos;${lobes ? '\nattribute vec3 lobeColor;\nvarying vec3 vLobe;' : ''}`)
      .replace('#include <project_vertex>', `#include <project_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;${lobes ? '\nvLobe = lobeColor;' : ''}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float uRim; uniform vec3 uRimColor; uniform float uActivity; uniform float uLobeMix; uniform float uTime;\nvarying vec3 vWPos;${lobes ? '\nvarying vec3 vLobe;' : ''}`)
      .replace('#include <color_fragment>', `#include <color_fragment>${lobes ? '\ndiffuseColor.rgb = mix(diffuseColor.rgb, vLobe, uLobeMix);' : ''}`)
      .replace('#include <opaque_fragment>', `
        float fres = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.6);
        outgoingLight += uRimColor * fres * uRim;
        float g = sin(vWPos.x * 13.0 + uTime * 1.3) * sin(vWPos.y * 11.0 - uTime * 1.1) * sin(vWPos.z * 9.0 + uTime * 0.9);
        outgoingLight += uRimColor * pow(max(g, 0.0), 7.0) * uActivity;
        ${lobes ? 'outgoingLight += vLobe * uLobeMix * 0.18;' : ''}
        #include <opaque_fragment>`);
  };
  return m;
}

/** Additive fresnel hologram used for the skin. */
export function hologramMaterial(color = '#6fb8ff') {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: 0.32 }, uTime: sharedUniforms.uTime },
    vertexShader: `
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){
        vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz;
        vec4 mv = viewMatrix * wp; vV = -mv.xyz;
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uIntensity; uniform float uTime;
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){
        float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
        float rim = pow(f, 3.0);
        float scan = smoothstep(0.92, 1.0, sin(vW.y * 26.0 - uTime * 1.6)) * 0.12;
        float sweep = exp(-pow((vW.y - mod(uTime * 2.2, 26.0) + 4.0) * 1.6, 2.0)) * 0.35;
        float a = (rim * 0.85 + 0.012 + scan * rim + sweep * (0.12 + rim)) * uIntensity;
        gl_FragColor = vec4(uColor * a, a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
  });
}

/* --------------------------------------------------------------- skin */
const tube = (pts, rfn, radial = 28) => taperedTube(smoothCurve(pts), { radius: rfn, radial, capEnd: false });
const ellipsoid = (c, r, seg = 48) => {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75));
  g.scale(r[0], r[1], r[2]);
  g.translate(c[0], c[1], c[2]);
  return g;
};
const piecewise = (stops) => (t) => {
  for (let i = 1; i < stops.length; i++) {
    const [t0, r0] = stops[i - 1], [t1, r1] = stops[i];
    if (t <= t1) return lerp(r0, r1, smoothstep(t0, t1, t));
  }
  return stops[stops.length - 1][1];
};

export function buildSkin(material) {
  const group = new THREE.Group();
  const add = (g) => { const m = new THREE.Mesh(g, material); m.renderOrder = 20; group.add(m); };
  add(ellipsoid([0, 16.5, -0.1], [0.8, 0.92, 1.0], 64));
  add(ellipsoid([0, 15.62, 0.25], [0.6, 0.6, 0.7], 48));
  add(ellipsoid([0, 15.82, 0.98], [0.1, 0.2, 0.14], 24));
  for (const s of [1, -1]) add(ellipsoid([0.82 * s, 16.0, -0.12], [0.06, 0.17, 0.11], 24));
  add(loft([
    { y: 8.25, rx: 0.95, rz: 0.62, cz: -0.02 }, { y: 8.5, rx: 1.35, rz: 0.85, cz: -0.08 }, { y: 9.0, rx: 1.5, rz: 0.95, cz: -0.1 },
    { y: 9.6, rx: 1.45, rz: 0.9, cz: -0.06 }, { y: 10.2, rx: 1.32, rz: 0.86, cz: -0.04 }, { y: 10.8, rx: 1.3, rz: 0.9, cz: 0.0 },
    { y: 11.5, rx: 1.45, rz: 1.0, cz: 0.02 }, { y: 12.3, rx: 1.55, rz: 1.08, cz: 0.04 }, { y: 13.0, rx: 1.6, rz: 1.02, cz: 0.0 },
    { y: 13.5, rx: 1.62, rz: 0.92, cz: -0.05 }, { y: 13.8, rx: 1.25, rz: 0.78, cz: -0.08 }, { y: 14.05, rx: 0.64, rz: 0.6, cz: -0.06 },
    { y: 14.6, rx: 0.58, rz: 0.58, cz: -0.04 }, { y: 15.3, rx: 0.56, rz: 0.56, cz: -0.06 },
  ], { rings: 110, radial: 64 }));
  for (const s of [1, -1]) {
    add(ellipsoid([1.9 * s, 13.42, -0.05], [0.42, 0.42, 0.42], 40));
    add(tube([[1.9 * s, 13.5, -0.05], [1.98 * s, 12.6, -0.08], [2.1 * s, 11.9, -0.1], [2.2 * s, 11.15, -0.08], [2.32 * s, 10.2, 0.0], [2.45 * s, 8.9, 0.12]],
      piecewise([[0, 0.42], [0.25, 0.37], [0.47, 0.3], [0.58, 0.33], [1, 0.21]])));
    add(ellipsoid([2.55 * s, 8.32, 0.18], [0.3, 0.42, 0.11], 32));
    const fingers = [
      [[2.72, 8.55, 0.2], [2.86, 8.25, 0.24], [2.94, 7.98, 0.26], 0.065],
      [[2.66, 8.0, 0.2], [2.7, 7.65, 0.21], [2.72, 7.38, 0.21], 0.056],
      [[2.56, 7.95, 0.19], [2.57, 7.6, 0.2], [2.57, 7.25, 0.2], 0.058],
      [[2.46, 7.97, 0.18], [2.45, 7.62, 0.18], [2.44, 7.36, 0.18], 0.054],
      [[2.37, 8.02, 0.17], [2.34, 7.75, 0.17], [2.31, 7.55, 0.17], 0.046],
    ];
    for (const [a, b, c, r] of fingers) add(taperedTube(smoothCurve([[a[0] * s, a[1], a[2]], [b[0] * s, b[1], b[2]], [c[0] * s, c[1], c[2]]]), { radius: () => r, radial: 14, capEnd: true }));
    add(ellipsoid([0.6 * s, 8.62, -0.42], [0.62, 0.6, 0.48], 40));
    add(tube([[0.85 * s, 9.05, 0.0], [0.85 * s, 8.3, 0.05], [0.8 * s, 7.0, 0.05], [0.72 * s, 5.6, 0.04], [0.7 * s, 5.0, 0.04], [0.69 * s, 4.2, -0.02], [0.67 * s, 2.5, 0.0], [0.65 * s, 0.85, -0.02]],
      piecewise([[0, 0.72], [0.2, 0.64], [0.45, 0.45], [0.55, 0.47], [0.62, 0.5], [0.85, 0.32], [1, 0.25]])));
    add(ellipsoid([0.68 * s, 0.28, 0.42], [0.3, 0.24, 0.82], 40));
  }
  return group;
}

/* ----------------------------------------------------------- skeleton */
export function buildSkeleton(boneMat, cartilageMat) {
  const group = new THREE.Group();
  const bones = [], cart = [];
  const t = (pts, r, radial = 10) => bones.push(taperedTube(smoothCurve(pts), { radius: () => r, radial, capEnd: false }));
  const sph = (c, r) => bones.push(ellipsoid(c, Array.isArray(r) ? r : [r, r, r], 16));

  // vertebral column
  VERT.forEach(([name, y], i) => {
    const region = name[0];
    const cz = cordZ(y);
    if (region === 'S' || name === 'Co') {
      const w = name === 'Co' ? 0.08 : lerp(0.42, 0.12, (i - 24) / 5);
      const g = new THREE.BoxGeometry(w * 2, 0.17, 0.2);
      g.rotateX(-0.6);
      g.translate(0, y, cz + 0.12);
      bones.push(g);
      return;
    }
    const lumbar = region === 'L', cerv = region === 'C';
    const rb = cerv ? 0.11 : lumbar ? 0.19 : 0.14 + (i - 7) * 0.004;
    const off = cerv ? 0.2 : lumbar ? 0.3 : 0.24;
    const h = cerv ? 0.11 : lumbar ? 0.22 : 0.16;
    if (name !== 'C1') {
      const body = new THREE.CylinderGeometry(rb, rb, h, 18);
      body.translate(0, y, cz + off);
      bones.push(body);
    }
    const arch = new THREE.TorusGeometry(cerv ? 0.11 : 0.1, 0.02, 6, 22);
    arch.rotateX(Math.PI / 2);
    arch.translate(0, y, cz + 0.02);
    bones.push(arch);
    const spinous = new THREE.BoxGeometry(0.035, 0.05, cerv ? 0.18 : lumbar ? 0.22 : 0.3);
    spinous.translate(0, 0, -0.15);
    spinous.rotateX(cerv ? 0.15 : lumbar ? 0.05 : 0.55);
    spinous.translate(0, y - 0.02, cz - 0.08);
    bones.push(spinous);
    const tp = new THREE.BoxGeometry(cerv ? 0.5 : lumbar ? 0.62 : 0.5, 0.04, 0.05);
    tp.translate(0, y, cz - 0.04);
    bones.push(tp);
  });

  // ribs + costal cartilages + sternum
  for (let i = 1; i <= 12; i++) {
    for (const s of [1, -1]) {
      const yb = VY[`T${i}`];
      const pts = [[0.12 * s, yb + 0.02, cordZ(yb) + 0.18], [0.3 * s, yb, cordZ(yb) - 0.05], ...ribPoints(i, s, { steps: 18 })];
      bones.push(taperedTube(smoothCurve(pts), { radius: () => 0.032, radial: 8, capEnd: false }));
      const end = pts[pts.length - 1];
      if (i <= 7) {
        const sz = lerp(0.58, 0.95, (13.55 - end[1]) / 1.75);
        cart.push(taperedTube(smoothCurve([end, [end[0] * 0.55, end[1] + 0.02, end[2] + 0.03], [0.1 * s, end[1] + 0.05 * (i > 5 ? 2 : 1), sz]]), { radius: () => 0.026, radial: 8, capEnd: false }));
      } else if (i <= 10) {
        cart.push(taperedTube(smoothCurve([end, [end[0] * 0.8, end[1] + 0.2, end[2] + 0.06], [end[0] * 0.62, end[1] + 0.45, end[2] + 0.1]]), { radius: () => 0.022, radial: 8, capEnd: false }));
      }
    }
  }
  bones.push(taperedTube(smoothCurve([[0, 13.6, 0.55], [0, 13.2, 0.68], [0, 12.5, 0.85], [0, 11.95, 0.96], [0, 11.75, 0.92]]), { radius: piecewise([[0, 0.13], [0.2, 0.09], [0.9, 0.1], [1, 0.03]]), radial: 12, capEnd: false }));

  for (const s of [1, -1]) {
    const S = (pts) => pts.map(([x, y, z]) => [x * s, y, z]);
    // shoulder girdle
    t(S([[0.18, 13.62, 0.62], [0.6, 13.66, 0.6], [1.1, 13.75, 0.35], [1.5, 13.82, 0.08], [1.75, 13.78, -0.05]]), 0.04);
    t(S([[0.62, 13.25, -0.95], [1.1, 13.45, -0.8], [1.55, 13.65, -0.5], [1.75, 13.75, -0.22]]), 0.03);
    const scap = new THREE.BufferGeometry();
    const sv = S([[0.6, 13.55, -0.88], [1.6, 13.45, -0.55], [0.78, 12.0, -0.84], [1.25, 12.9, -0.78]]);
    scap.setAttribute('position', new THREE.Float32BufferAttribute(sv.flat(), 3));
    scap.setIndex([0, 1, 3, 0, 3, 2, 3, 1, 2]);
    scap.computeVertexNormals();
    scap.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(8).fill(0), 2));
    bones.push(scap);
    t(S([[0.6, 13.55, -0.88], [0.66, 12.8, -0.9], [0.78, 12.0, -0.84], [1.25, 12.75, -0.72], [1.6, 13.45, -0.55]]), 0.022);
    // arm
    sph(S([[1.86, 13.42, -0.06]])[0], 0.14);
    t(S([[1.86, 13.42, -0.06], [1.95, 12.7, -0.1], [2.08, 11.9, -0.12], [2.2, 11.2, -0.1]]), 0.065);
    sph(S([[1.98, 11.2, -0.14]])[0], 0.05); sph(S([[2.38, 11.2, -0.06]])[0], 0.045);
    t(S([[2.32, 11.08, -0.04], [2.45, 10.0, 0.08], [2.6, 8.92, 0.14]]), 0.038);
    t(S([[2.08, 11.15, -0.16], [2.18, 10.0, -0.02], [2.32, 8.92, 0.08]]), 0.036);
    sph(S([[2.08, 11.2, -0.2]])[0], 0.06);
    sph(S([[2.48, 8.75, 0.13]])[0], [0.18, 0.08, 0.07]);
    [[2.75, 8.6, 2.92, 7.98], [2.64, 8.55, 2.72, 7.38], [2.55, 8.55, 2.57, 7.25], [2.46, 8.55, 2.44, 7.36], [2.38, 8.55, 2.31, 7.55]].forEach(([x0, y0, x1, y1]) =>
      t(S([[x0, y0, 0.15], [lerp(x0, x1, 0.5), lerp(y0, y1, 0.5), 0.18], [x1, y1 + 0.05, 0.19]]), 0.02, 6));
    // pelvis
    t(S([[0.3, 9.85, -0.72], [0.75, 10.12, -0.6], [1.2, 10.2, -0.2], [1.25, 10.0, 0.25], [1.12, 9.62, 0.55]]), 0.05);
    t(S([[1.12, 9.62, 0.55], [1.05, 9.3, 0.45], [0.95, 9.05, 0.22]]), 0.04);
    t(S([[0.3, 9.85, -0.72], [0.36, 9.45, -0.6], [0.55, 9.05, -0.45], [0.66, 8.62, -0.3]]), 0.045);
    t(S([[0.82, 8.85, 0.3], [0.5, 8.8, 0.6], [0.12, 8.68, 0.68]]), 0.04);
    t(S([[0.8, 8.7, -0.15], [0.6, 8.4, -0.35], [0.48, 8.3, -0.3], [0.36, 8.42, 0.2], [0.14, 8.6, 0.64]]), 0.045);
    const ac = new THREE.TorusGeometry(0.16, 0.03, 8, 24);
    ac.rotateY(Math.PI / 2 - 0.5 * s);
    ac.translate(0.88 * s, 8.88, 0.05);
    bones.push(ac);
    const wing = new THREE.BufferGeometry();
    const wv = S([[0.3, 9.85, -0.72], [0.75, 10.12, -0.6], [1.2, 10.2, -0.2], [1.25, 10.0, 0.25], [1.12, 9.62, 0.55], [0.88, 8.95, 0.05], [0.55, 9.1, -0.45]]);
    wing.setAttribute('position', new THREE.Float32BufferAttribute(wv.flat(), 3));
    wing.setIndex([5, 0, 1, 5, 1, 2, 5, 2, 3, 5, 3, 4, 5, 6, 0]);
    wing.computeVertexNormals();
    wing.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(14).fill(0), 2));
    bones.push(wing);
    // leg
    sph(S([[0.85, 8.9, 0.05]])[0], 0.14);
    t(S([[0.85, 8.9, 0.05], [1.0, 8.85, 0.0], [1.12, 8.8, -0.02]]), 0.07);
    sph(S([[1.15, 8.82, -0.04]])[0], 0.1);
    t(S([[1.12, 8.78, -0.02], [0.98, 7.5, 0.08], [0.82, 6.2, 0.06], [0.72, 5.15, 0.02]]), 0.07);
    sph(S([[0.62, 5.05, -0.02]])[0], 0.09); sph(S([[0.82, 5.05, -0.04]])[0], 0.09);
    sph(S([[0.72, 5.12, 0.26]])[0], [0.07, 0.09, 0.04]);
    t(S([[0.68, 4.95, 0.02], [0.66, 3.0, 0.06], [0.6, 1.0, 0.06]]), 0.06);
    sph(S([[0.53, 0.85, 0.04]])[0], 0.05);
    t(S([[0.9, 4.78, -0.1], [0.9, 3.0, -0.08], [0.88, 0.85, -0.08]]), 0.032);
    sph(S([[0.9, 4.78, -0.1]])[0], 0.055); sph(S([[0.9, 0.8, -0.08]])[0], 0.05);
    sph(S([[0.68, 0.3, -0.12]])[0], [0.13, 0.14, 0.25]);
    sph(S([[0.66, 0.48, 0.15]])[0], [0.15, 0.1, 0.16]);
    [[0.52, 1.15], [0.6, 1.12], [0.68, 1.08], [0.76, 1.03], [0.84, 0.97]].forEach(([x, z]) => t(S([[0.66 + (x - 0.66) * 0.4, 0.42, 0.3], [x, 0.24, z - 0.3], [x, 0.14, z]]), 0.022, 6));
  }
  // skull: mandible arc
  const mand = [[-0.62, 15.75, -0.1], [-0.6, 15.35, 0.0], [-0.48, 15.15, 0.45], [-0.2, 15.05, 0.8], [0, 15.03, 0.85], [0.2, 15.05, 0.8], [0.48, 15.15, 0.45], [0.6, 15.35, 0.0], [0.62, 15.75, -0.1]];
  t(mand, 0.05, 10);
  group.add(new THREE.Mesh(mergeGeometries(bones.map((g) => g.index ? g : g)), boneMat));
  group.add(new THREE.Mesh(mergeGeometries(cart), cartilageMat));
  // cranium shell (very faint)
  const skull = new THREE.Mesh(ellipsoid([0, 16.5, -0.1], [0.74, 0.86, 0.93], 48), boneMat.clone());
  skull.material.opacity = 0.06;
  skull.material.side = THREE.FrontSide;
  skull.userData.isSkull = true;
  group.add(skull);
  return group;
}

/* --------------------------------------------------------------- organs */
export function buildOrgans() {
  const items = [];
  const eyeMat = tissueMaterial({ color: '#f1f4f8', roughness: 0.15, rim: '#9fd8ff', rimStrength: 0.5 });
  const irisMat = tissueMaterial({ color: '#2a6fb0', roughness: 0.2, rim: '#7cc8ff', rimStrength: 0.6, emissive: '#1d5b99', emissiveIntensity: 0.6 });
  const eyes = [];
  for (const s of [1, -1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 24), eyeMat);
    e.position.set(0.32 * s, 16.1, 0.8);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 12), irisMat);
    iris.scale.set(1, 1, 0.35);
    iris.position.set(0, 0, 0.105);
    e.add(iris);
    eyes.push(e);
  }
  items.push({ key: 'eye', meshes: eyes, materials: [eyeMat, irisMat] });

  const earMat = tissueMaterial({ color: '#f3d9a6', roughness: 0.3, rim: '#ffe7a8', rimStrength: 0.8, emissive: '#6a4a10', emissiveIntensity: 0.4 });
  const ears = [];
  for (const s of [1, -1]) {
    const c = new THREE.Vector3(0.63 * s, 15.81, -0.1);
    ears.push(new THREE.Mesh(taperedTube(cochleaCurve(c, 0.055), { radius: (t) => 0.018 * (1 - t * 0.5), radial: 8 }), earMat));
    const rots = [[Math.PI / 2, 0, 0], [0, Math.PI / 2, 0], [0, 0, 0]];
    rots.forEach((r, k) => {
      const tor = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 24), earMat);
      tor.rotation.set(r[0], r[1], r[2]);
      tor.position.set(c.x + 0.03 * s, c.y + 0.07 - k * 0.012, c.z - 0.1 + k * 0.02);
      ears.push(tor);
    });
  }
  items.push({ key: 'inner-ear', meshes: ears, materials: [earMat] });

  const heartMat = tissueMaterial({ color: '#b8384a', roughness: 0.45, rim: '#ff6b81', rimStrength: 0.7, activity: 0.2 });
  const heart = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 36), heartMat);
  heart.scale.set(0.38, 0.46, 0.33);
  heart.position.set(0.12, 12.28, 0.38);
  heart.rotation.set(0.35, 0.2, 0.55);
  heart.userData.beat = true;
  items.push({ key: 'heart', meshes: [heart], materials: [heartMat] });

  const diaMat = tissueMaterial({ color: '#c96a6a', roughness: 0.6, rim: '#ff9a9a', rimStrength: 0.6 });
  diaMat.side = THREE.DoubleSide;
  const dg = new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.42);
  const dia = new THREE.Mesh(dg, diaMat);
  dia.scale.set(1.28, 0.82, 0.92);
  dia.position.set(0, 10.95, -0.05);
  items.push({ key: 'diaphragm', meshes: [dia], materials: [diaMat] });
  return items;
}

/* ------------------------------------------------------------------ CNS */
export function buildCNS() {
  const items = [];
  // cerebral hemispheres
  for (const [side, s] of [['L', 1], ['R', -1]]) {
    const mat = tissueMaterial({ vertexColors: true, roughness: 0.62, rim: '#ff8fb0', rimStrength: 0.55, activity: 0.55, lobes: true });
    const mesh = new THREE.Mesh(hemisphereGeometry(s), mat);
    mesh.position.copy(BRAIN_CENTER);
    items.push({ id: `cerebrum-${side}`, key: 'cerebrum', side, meshes: [mesh], materials: [mat], kind: 'cerebrum' });
  }
  const cbMat = tissueMaterial({ vertexColors: true, roughness: 0.6, rim: '#ff9ab8', rimStrength: 0.5, activity: 0.4 });
  const cb = new THREE.Mesh(cerebellumGeometry(), cbMat);
  cb.position.set(0, 16.02, -0.6);
  cb.rotation.x = 0.18;
  items.push({ id: 'cerebellum', key: 'cerebellum', meshes: [cb], materials: [cbMat] });

  const bsMat = tissueMaterial({ color: '#e8b9a8', roughness: 0.5, rim: '#ffb39a', rimStrength: 0.6, activity: 0.3 });
  const bsCurve = smoothCurve([[0, 16.42, -0.2], [0, 16.2, -0.17], [0, 15.95, -0.12], [0, 15.68, -0.2], [0, 15.38, -0.26]]);
  const bs = new THREE.Mesh(taperedTube(bsCurve, { radius: piecewise([[0, 0.13], [0.3, 0.125], [0.5, 0.15], [0.7, 0.11], [1, 0.085]]), radial: 32, capEnd: false }), bsMat);
  const pons = new THREE.Mesh(ellipsoid([0, 15.98, -0.04], [0.17, 0.14, 0.13], 36), bsMat);
  items.push({ id: 'brainstem', key: 'brainstem', meshes: [bs, pons], materials: [bsMat], kind: 'brainstem' });

  // spinal cord (cervical + lumbosacral enlargements, tapering conus)
  const cordPts = [];
  for (let y = 15.38; y >= CONUS_Y; y -= 0.1) cordPts.push([0, y, cordZ(y)]);
  cordPts.push([0, CONUS_Y, cordZ(CONUS_Y)]);
  const yAt = (t) => lerp(15.38, CONUS_Y, t);
  const cordMat = tissueMaterial({ color: '#f0d2c4', roughness: 0.45, rim: '#ffc0a8', rimStrength: 0.7, activity: 0.35 });
  const cord = new THREE.Mesh(taperedTube(smoothCurve(cordPts), {
    radius: (t) => {
      const y = yAt(t);
      let r = 0.07 + 0.025 * Math.exp(-(((y - 14.2) / 0.45) ** 2)) + 0.02 * Math.exp(-(((y - 11.1) / 0.3) ** 2));
      r *= smoothstep(CONUS_Y - 0.02, CONUS_Y + 0.5, y) * 0.75 + 0.25;
      return r;
    }, radial: 24, capEnd: true,
  }), cordMat);
  items.push({ id: 'spinal-cord', key: 'spinal-cord', meshes: [cord], materials: [cordMat], kind: 'cord' });

  const filumPts = [];
  for (let y = CONUS_Y; y >= 8.32; y -= 0.15) filumPts.push([0, y, cordZ(y) + 0.02]);
  const filMat = tissueMaterial({ color: '#f0d2c4', roughness: 0.45, rim: '#ffc0a8', rimStrength: 0.7 });
  const filum = new THREE.Mesh(taperedTube(smoothCurve(filumPts), { radius: (t) => lerp(0.02, 0.008, t), radial: 8 }), filMat);
  // dural sac (very faint) around the cauda equina
  const sacPts = [];
  for (let y = 11.2; y >= 8.95; y -= 0.15) sacPts.push([0, y, cordZ(y)]);
  const sacMat = tissueMaterial({ color: '#9fb4c8', roughness: 0.4, rim: '#a8d4ff', rimStrength: 0.9 });
  const sac = new THREE.Mesh(taperedTube(smoothCurve(sacPts), { radius: (t) => 0.13 * (1 - smoothstep(0.75, 1, t) * 0.8), radial: 20 }), sacMat);
  sac.userData.baseOpacity = 0.12;
  items.push({ id: 'conus', key: 'conus', meshes: [filum, sac], materials: [filMat, sacMat] });

  // deep structures
  const deep = (key, meshesFn, color) => {
    const mat = tissueMaterial({ color, roughness: 0.35, rim: color, rimStrength: 0.9, emissive: color, emissiveIntensity: 0.25 });
    items.push({ id: key, key, meshes: meshesFn(mat), materials: [mat], deep: true });
  };
  deep('thalamus', (m) => [1, -1].map((s) => new THREE.Mesh(ellipsoid([0.1 * s, 16.5, -0.17], [0.085, 0.08, 0.16], 28), m)), '#7dd3fc');
  deep('hypothalamus', (m) => [
    new THREE.Mesh(ellipsoid([0, 16.22, 0.05], [0.07, 0.05, 0.08], 24), m),
    new THREE.Mesh(ellipsoid([0, 15.98, 0.1], [0.05, 0.04, 0.045], 20), m),
    new THREE.Mesh(taperedTube(smoothCurve([[0, 16.17, 0.07], [0, 16.06, 0.09], [0, 16.0, 0.1]]), { radius: () => 0.015, radial: 8 }), m),
    ...[1, -1].map((s) => new THREE.Mesh(ellipsoid([0.03 * s, 16.13, -0.02], [0.022, 0.022, 0.022], 12), m)),
  ], '#f9a8d4');
  deep('corpus-callosum', (m) => {
    const g = taperedTube(smoothCurve([[0, 16.45, 0.22], [0, 16.55, 0.3], [0, 16.72, 0.2], [0, 16.79, -0.05], [0, 16.74, -0.3], [0, 16.6, -0.42]]), { radius: piecewise([[0, 0.025], [0.2, 0.05], [0.8, 0.042], [1, 0.06]]), radial: 16, capEnd: true });
    const mesh = new THREE.Mesh(g, m);
    mesh.scale.set(3.4, 1, 1);
    return [mesh];
  }, '#e2e8f0');
  deep('caudate', (m) => [1, -1].map((s) => new THREE.Mesh(taperedTube(smoothCurve([[0.16 * s, 16.55, 0.25], [0.19 * s, 16.68, 0.08], [0.2 * s, 16.7, -0.12], [0.24 * s, 16.6, -0.32], [0.3 * s, 16.4, -0.3], [0.32 * s, 16.3, -0.1], [0.32 * s, 16.27, 0.05]]), { radius: (t) => lerp(0.075, 0.015, Math.sqrt(t)), radial: 14 }), m)), '#a3e635');
  deep('lentiform', (m) => [1, -1].map((s) => new THREE.Mesh(ellipsoid([0.27 * s, 16.47, 0.03], [0.07, 0.1, 0.16], 28), m)), '#facc15');
  deep('hippocampus', (m) => [1, -1].map((s) => new THREE.Mesh(taperedTube(smoothCurve([[0.33 * s, 16.25, 0.06], [0.33 * s, 16.27, -0.12], [0.28 * s, 16.33, -0.3], [0.18 * s, 16.45, -0.4], [0.08 * s, 16.6, -0.32], [0.05 * s, 16.66, -0.1], [0.04 * s, 16.55, 0.04], [0.035 * s, 16.32, 0.0]]), { radius: piecewise([[0, 0.055], [0.3, 0.045], [0.45, 0.022], [1, 0.016]]), radial: 14, capStart: true }), m)), '#fb923c');
  deep('amygdala', (m) => [1, -1].map((s) => new THREE.Mesh(ellipsoid([0.3 * s, 16.26, 0.15], [0.055, 0.05, 0.06], 20), m)), '#f87171');
  return items;
}

/** Which brainstem part a world y belongs to. */
export const brainstemPart = (y) => (y > 16.12 ? 'midbrain' : y > 15.8 ? 'pons' : 'medulla');

export { ellipsoid };
