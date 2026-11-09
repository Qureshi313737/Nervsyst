import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import { smoothCurve, taperedTube, radiusFn, controlPointT, classifyLobe, LOD } from './geometry.js';
import { buildNerves, BRAIN_CENTER, SEGMENT_Y, VY, cordZ, trunkPoint } from './anatomy.js';
import { buildSkin, buildSkeleton, buildOrgans, buildCNS, tissueMaterial, hologramMaterial, sharedUniforms, brainstemPart } from './body.js';
import { INFO, GROUP_COLORS, FN_COLORS, FILTER_GROUPS, FILTER_NOTES } from './info.js';
import { EXTRA, REFS, MICRO_INFO, spinalExtra, intercostalExtra } from './content.js';
import { t, setLang, getLang, pick, filterNote, LANGS } from './i18n.js';
import { Quality, guessTier } from './quality.js';
import { buildTours, TourPlayer, glowSprite } from './tours.js';
import { buildNerveScene, buildNeuronScene } from './micro.js';

const $ = (sel) => document.querySelector(sel);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem(`neuromap:${k}`); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(`neuromap:${k}`, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

setLang(new URLSearchParams(location.search).get('lang') || store.get('lang', 'en'));

// Let the Lumifya intro form its wordmark before the heavy 3D build blocks the thread.
await Promise.race([window.__splash?.formed ?? Promise.resolve(), new Promise((r) => setTimeout(r, 4500))]);

/* ============================================================== renderer */
const host = $('#stage');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', stencil: false });
} catch (err) {
  const f = $('#fatal');
  f.textContent = t('noWebgl');
  f.hidden = false;
  $('#intro').hidden = true;
  throw err;
}
renderer.setSize(host.clientWidth, host.clientHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
host.appendChild(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); toast('WebGL context lost — reload the page.'); });

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(host.clientWidth, host.clientHeight);
labelRenderer.domElement.className = 'label-layer';
host.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#03060b');
scene.fog = new THREE.FogExp2('#03060b', 0.012);
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envTex;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(32, host.clientWidth / host.clientHeight, 0.05, 400);
camera.position.set(2.4, 16.9, 3.2);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 16.4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 0.6;
controls.maxDistance = 60;
controls.autoRotateSpeed = 0.45;
controls.zoomSpeed = 0.9;

scene.add(new THREE.HemisphereLight('#9cc8ff', '#1a0f14', 0.55));
const key = new THREE.DirectionalLight('#ffe9d6', 1.6); key.position.set(6, 22, 12); scene.add(key);
const rimL = new THREE.DirectionalLight('#5aa8ff', 1.2); rimL.position.set(-10, 12, -10); scene.add(rimL);
const rimR = new THREE.DirectionalLight('#ff7aa8', 0.6); rimR.position.set(10, 8, -8); scene.add(rimR);

/* backdrop: gradient dome, floating dust, holographic floor */
let dust;
{
  const dome = new THREE.Mesh(new THREE.SphereGeometry(180, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vP;
      void main(){
        float h = vP.y;
        vec3 top = vec3(0.012, 0.03, 0.06), mid = vec3(0.02, 0.045, 0.075), bot = vec3(0.004, 0.006, 0.012);
        vec3 c = mix(mid, top, smoothstep(0.0, 0.8, h));
        c = mix(bot, c, smoothstep(-0.5, 0.05, h));
        c += vec3(0.1, 0.25, 0.45) * exp(-pow(h * 6.0, 2.0)) * 0.025;
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  dome.position.y = 9;
  scene.add(dome);
  const N = 1400, pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 3 + Math.random() * 22, a = Math.random() * Math.PI * 2;
    pos.set([Math.cos(a) * r, Math.random() * 26 - 2, Math.sin(a) * r], i * 3);
    seed[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  dust = new THREE.Points(g, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: sharedUniforms.uTime },
    vertexShader: `attribute float seed; uniform float uTime; varying float vA;
      void main(){
        vec3 p = position; p.y = mod(p.y + uTime * (0.08 + seed * 0.12) + 2.0, 28.0) - 2.0;
        p.x += sin(uTime * 0.2 + seed * 40.0) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.0 + seed * 3.0) * (14.0 / -mv.z);
        vA = 0.25 + 0.75 * seed;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA * 0.35; gl_FragColor = vec4(vec3(0.45, 0.7, 1.0) * a, a); }',
  }));
  scene.add(dust);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 96), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: sharedUniforms.uTime },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vUv; uniform float uTime;
      void main(){
        vec2 p = (vUv - 0.5) * 14.0; float r = length(p);
        float rings = smoothstep(0.035, 0.0, abs(fract(r * 0.8 - uTime * 0.12) - 0.5) - 0.46);
        float grid = smoothstep(0.03, 0.0, abs(fract(p.x) - 0.5) - 0.48) + smoothstep(0.03, 0.0, abs(fract(p.y) - 0.5) - 0.48);
        float a = (rings * 0.5 + grid * 0.12 + exp(-r * r * 0.25) * 0.5) * smoothstep(7.0, 1.0, r) * 0.5;
        gl_FragColor = vec4(vec3(0.25, 0.6, 1.0) * a, a);
      }`,
  }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;
  scene.add(floor);
}

/* ======================================================= post-processing */
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloom = new UnrealBloomPass(new THREE.Vector2(host.clientWidth, host.clientHeight), 0.55, 0.45, 0.78);
composer.addPass(bloom);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: sharedUniforms.uTime, uRes: { value: new THREE.Vector2(host.clientWidth, host.clientHeight) }, uFx: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; uniform float uFx; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5; float d = length(c);
      vec3 col;
      if (uFx > 0.5) {
        vec2 off = c * d * 0.0035;
        col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        col += (hash(vUv * uRes + fract(uTime)) - 0.5) * 0.016;
      } else col = texture2D(tDiffuse, vUv).rgb;
      col *= mix(1.0, smoothstep(0.85, 0.2, d), 0.55);
      col = mix(col, col * vec3(0.96, 1.0, 1.06), 0.5);
      gl_FragColor = vec4(col, 1.0);
    }`,
});
composer.addPass(grade);
composer.addPass(new OutputPass());

function resize() {
  const w = host.clientWidth, h = host.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  labelRenderer.setSize(w, h);
  grade.uniforms.uRes.value.set(w, h);
}
window.addEventListener('resize', resize);

/* lower geometry detail on weak devices before anything is built */
const qParam = new URLSearchParams(location.search).get('q');
const startMode = qParam || store.get('quality', 'auto');
LOD.k = { low: 0.55, medium: 0.8, high: 1, ultra: 1 }[startMode === 'auto' ? guessTier(renderer) : startMode] ?? 1;

const quality = new Quality({
  renderer, composer, bloom, grade, dust, onResize: resize,
  mode: startMode,
  onTierChange: (tier) => toast(t('q_toast', { q: t(`q_${tier}`) })),
});

/* ============================================================ materials */
const NERVE_VERT = `attribute float aDist; varying float vDist; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){ vUv = uv; vDist = aDist; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const NERVE_FRAG = `uniform vec3 uColor; uniform float uTime, uOpacity, uHighlight, uSelected, uFlow, uPulse;
  varying float vDist; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){
    vec3 n = normalize(vN); vec3 v = normalize(vV);
    float ndv = clamp(dot(n, v), 0.0, 1.0);
    float rim = pow(1.0 - ndv, 2.2);
    vec3 L = normalize(vec3(0.35, 0.8, 0.5));
    float diff = 0.45 + 0.55 * max(dot(n, L), 0.0);
    float spec = pow(max(dot(reflect(-L, n), v), 0.0), 24.0) * 0.35;
    float fib = 0.86 + 0.14 * sin(vUv.y * 31.4159 + vDist * 10.0);
    vec3 col = uColor * diff * fib * 0.62 + uColor * rim * 0.8 + vec3(spec);
    float spd = 1.15 + uSelected * 0.9;
    float pe = exp(-pow((fract((vDist - uTime * spd) / 1.5) - 0.5) * 9.0, 2.0));
    float pa = exp(-pow((fract((vDist + uTime * spd) / 1.5 + 0.37) - 0.5) * 9.0, 2.0));
    float p = uFlow > 0.5 ? pe : (uFlow < -0.5 ? pa : max(pe, pa) * 0.85);
    col += mix(uColor, vec3(1.0), 0.5) * p * uPulse * (0.9 + uSelected * 1.3);
    col *= 1.0 + uHighlight * 0.6 + uSelected * 0.35;
    col += uColor * rim * (uHighlight * 1.0 + uSelected * 1.1);
    gl_FragColor = vec4(col, uOpacity);
  }`;
const HALO_VERT = `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const HALO_FRAG = `uniform vec3 uColor; uniform float uTime, uOpacity; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){ float ndv = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0); float a = pow(ndv, 2.0) * (0.28 + 0.12 * sin(uTime * 3.0 - vUv.x * 12.0)) * uOpacity;
  gl_FragColor = vec4(uColor * a, a); }`;

const boneMat = tissueMaterial({ color: '#b9b2a3', roughness: 0.7, rim: '#e9dcc0', rimStrength: 0.22 });
boneMat.opacity = 0.11; boneMat.depthWrite = false;
const cartMat = tissueMaterial({ color: '#a9cfe2', roughness: 0.4, rim: '#cfeaff', rimStrength: 0.35 });
cartMat.opacity = 0.09; cartMat.depthWrite = false;
const skinMat = hologramMaterial('#6fb6ff');

/* ============================================================ structures */
const structs = new Map();
const pickables = [];
const groups = { nerves: new THREE.Group(), cns: new THREE.Group(), organs: new THREE.Group(), pick: new THREE.Group() };
Object.values(groups).forEach((g) => scene.add(g));
const skin = buildSkin(skinMat);
scene.add(skin);
const skeleton = buildSkeleton(boneMat, cartMat);
scene.add(skeleton);

const OVERVIEW_LABELS = new Set(['cerebrum', 'cerebellum', 'spinal-cord', 'conus', 'cn10', 'phrenic', 'median', 'ulnar', 'radial', 'sciatic', 'femoral', 'tibial', 'common-fibular', 'sympathetic-trunk']);
const fnTag = (fn) => (fn === 'special' ? 'sensory' : fn);
const flowOf = (fn) => (fn === 'motor' || fn === 'autonomic' ? 1 : fn === 'sensory' || fn === 'special' ? -1 : 0);
function tagsFor(info, extra = []) {
  const s = new Set([...(info.tags || []), ...extra]);
  s.add(`fn-${fnTag(info.fn)}`);
  s.add(`reg-${info.region}`);
  return s;
}

/** Localized display name for an INFO/EXTRA key. */
function nameOf(key, info = INFO[key]) {
  const ex = EXTRA[key];
  const l = getLang();
  if (l !== 'en' && ex?.name?.[l]) return ex.name[l];
  return info?.name ?? key;
}

function makeLabel(text, pos, struct, parent = scene) {
  const el = document.createElement('button');
  el.className = 'tag3d';
  el.type = 'button';
  el.dir = 'auto';
  el.textContent = text;
  el.addEventListener('click', (e) => { e.stopPropagation(); if (struct.micro) selectMicro(struct.micro); else select(struct.id, { fly: false }); });
  el.addEventListener('pointerenter', () => !struct.micro && setHover(struct));
  el.addEventListener('pointerleave', () => !struct.micro && setHover(null));
  const obj = new CSS2DObject(el);
  obj.position.copy(pos);
  obj.visible = false;
  parent.add(obj);
  return obj;
}

// --- nerves: one merged mesh per structure (fewer draw calls on phones)
for (const def of buildNerves()) {
  const info = INFO[def.key];
  if (!info) { console.warn('missing info', def.key); continue; }
  if (!EXTRA[def.key]) {
    if (def.key.startsWith('sp-')) EXTRA[def.key] = spinalExtra(def.key.slice(3));
    else if (def.key.startsWith('ic-')) EXTRA[def.key] = intercostalExtra(+def.key.slice(3));
  }
  const flow = flowOf(info.fn) * (def.reverse ? -1 : 1);
  const u = {
    uColor: { value: new THREE.Color(GROUP_COLORS[info.group]) }, uOpacity: { value: 1 }, uHighlight: { value: 0 },
    uSelected: { value: 0 }, uPulse: { value: 1 }, uTime: sharedUniforms.uTime, uFlow: { value: flow },
  };
  const struct = { id: def.id, key: def.key, side: def.side, kind: 'nerve', info, u, pathData: [], tags: tagsFor(info), box: new THREE.Box3(), shortLabel: def.label };
  const geos = [], pickGeos = [];
  def.paths.forEach((p, i) => {
    const curve = smoothCurve(p.pts);
    const bumps = p.tBumps ?? p.bumps.map(([idx, a, w]) => [controlPointT(p.pts, idx), a, w]);
    const rfn = radiusFn(p.r0, p.r1, bumps);
    const geo = taperedTube(curve, { radius: rfn, radial: p.r0 > 0.03 ? 14 : 9 });
    const len = geo.userData.length, phase = Math.random() * 1.5, uv = geo.attributes.uv;
    const dist = new Float32Array(uv.count);
    for (let k = 0; k < uv.count; k++) dist[k] = uv.getX(k) * len + phase;
    geo.setAttribute('aDist', new THREE.BufferAttribute(dist, 1));
    geos.push(geo);
    pickGeos.push(taperedTube(curve, { radius: (tt) => Math.max(0.05, rfn(tt) * 2.2), radial: 6, segments: Math.max(8, Math.ceil(len * 8)), capEnd: false }));
    struct.pathData.push({ curve, rfn });
    if (i === 0) struct.anchor = curve.getPointAt(def.key.startsWith('sp-') ? 0.98 : 0.5);
  });
  const mesh = new THREE.Mesh(mergeGeometries(geos), new THREE.ShaderMaterial({ uniforms: u, vertexShader: NERVE_VERT, fragmentShader: NERVE_FRAG, transparent: true }));
  mesh.userData.struct = struct;
  mesh.geometry.computeBoundingBox();
  struct.box.copy(mesh.geometry.boundingBox);
  groups.nerves.add(mesh);
  const pickMesh = new THREE.Mesh(mergeGeometries(pickGeos), new THREE.MeshBasicMaterial());
  pickMesh.visible = false;
  pickMesh.userData.struct = struct;
  groups.pick.add(pickMesh);
  struct.meshes = [mesh];
  struct.picks = [pickMesh];
  if (def.label && def.side !== 'R') struct.label = makeLabel(def.label, struct.anchor, struct);
  struct.major = !!def.major;
  structs.set(struct.id, struct);
  pickables.push(pickMesh);
}

// --- CNS + deep brain
const CNS_TAGS = {
  cerebrum: ['cns', 'lobes', 'reg-head'], cerebellum: ['cns'], brainstem: ['cns', 'cranial'], 'spinal-cord': ['cns', 'spinal'], conus: ['cns', 'spinal'],
};
const CNS_LABELS = { 'cerebrum-L': [[0.55, 17.0, 0.1], 'cerebrum'], cerebellum: [[0.45, 15.95, -0.85]], brainstem: [[0.12, 15.75, -0.05]], 'spinal-cord': [[0.08, 12.6, -0.7]], conus: [[0.1, 9.9, -0.35]] };
for (const item of buildCNS()) {
  const info = INFO[item.key];
  const struct = { ...item, kind: item.deep ? 'deep' : 'cns', info, tags: item.deep ? tagsFor(info) : new Set([...(CNS_TAGS[item.key] || []), `reg-${info.region}`]), box: new THREE.Box3() };
  struct.base = item.materials.map((m) => ({ rim: m.userData.uniforms.uRim.value, opacity: m.opacity }));
  for (const m of item.meshes) {
    m.userData.struct = struct;
    groups.cns.add(m);
    m.updateMatrixWorld(true);
    struct.box.expandByObject(m);
  }
  struct.picks = item.meshes;
  pickables.push(...item.meshes);
  const lab = CNS_LABELS[item.id];
  if (lab) struct.label = makeLabel('', new THREE.Vector3(...lab[0]), struct);
  else if (item.deep) struct.label = makeLabel('', struct.box.getCenter(new THREE.Vector3()).add(new THREE.Vector3(0.05, 0.06, 0)), struct);
  struct.major = !item.deep;
  structs.set(struct.id, struct);
}

// --- organs
let irisMeshes = [];
for (const item of buildOrgans()) {
  const info = INFO[item.key];
  const struct = { id: item.key, key: item.key, kind: 'organ', info, meshes: item.meshes, materials: item.materials, picks: item.meshes, tags: new Set(['organ', `reg-${info.region}`]), box: new THREE.Box3() };
  struct.base = item.materials.map((m) => ({ rim: m.userData.uniforms.uRim.value, opacity: m.opacity }));
  for (const m of item.meshes) {
    m.userData.struct = struct;
    groups.organs.add(m);
    m.updateMatrixWorld(true);
    struct.box.expandByObject(m);
  }
  if (item.key === 'eye') irisMeshes = item.meshes.map((e) => e.children[0]).filter(Boolean);
  pickables.push(...item.meshes);
  structs.set(struct.id, struct);
}

/* ================================================================ state */
const state = {
  filter: store.get('filter', 'all'),
  colorMode: store.get('colorMode', 'systems'),
  level: store.get('level', 'standard'),
  skin: store.get('skin', true), skeleton: store.get('skeleton', true), organs: store.get('organs', true),
  labels: store.get('labels', true), signals: store.get('signals', true), rotate: store.get('rotate', !reduceMotion),
  isolate: store.get('isolate', false),
  selected: null, hovered: null, isolatedId: null, lobeMix: 0,
  tourFocus: null, quiz: null, scale: 'body', heartRate: 1, heartTarget: 1, pupil: 1, pupilTarget: 1,
};
if (!FILTER_GROUPS.some((g) => g.items.some((i) => i.id === state.filter))) state.filter = 'all';

function inFilter(st, f) {
  if (f === 'all') return st.kind !== 'deep';
  if (f === 'cns') return st.kind === 'cns' || st.kind === 'deep';
  if (f === 'lobes') return st.key === 'cerebrum';
  if (f === 'deep') return st.kind === 'deep';
  return st.tags.has(f);
}

function colorFor(st) {
  const info = st.info;
  if (st.kind === 'deep') return `#${st.materials[0].color.getHexString()}`;
  if (st.kind !== 'nerve') return GROUP_COLORS[info.group];
  if (state.colorMode === 'function') return FN_COLORS[info.fn];
  if (state.colorMode === 'atlas') return info.group === 'sympathetic' ? '#3ddc84' : info.group === 'parasympathetic' ? '#c084fc' : '#f4d35e';
  return GROUP_COLORS[info.group];
}

/** Visual role of each structure: focus | dim | context | ghost | hidden */
function roleOf(st) {
  if (state.tourFocus) {
    if (state.tourFocus.has(st.id)) return 'focus';
    if (st.kind === 'cns') return 'context';
    if (st.kind === 'deep') return 'hidden';
    if (st.kind === 'organ') return state.organs ? 'context' : 'hidden';
    return 'ghost';
  }
  if (state.isolatedId) {
    if (st.id === state.isolatedId) return 'focus';
    if (st.kind === 'cns') return 'context';
    return 'hidden';
  }
  const on = inFilter(st, state.filter);
  if (st.kind === 'organ') return state.organs ? (on || state.filter === 'all' ? 'focus' : 'context') : 'hidden';
  if (on) return state.selected && st.kind === 'nerve' && state.selected !== st ? 'dim' : 'focus';
  if (st.kind === 'cns') return 'context';
  if (st.kind === 'deep') return 'hidden';
  return state.isolate ? 'hidden' : 'ghost';
}

function applyVisuals() {
  const touring = !!state.tourFocus;
  for (const st of structs.values()) {
    const role = roleOf(st);
    st.role = role;
    st.meshes.forEach((m) => { m.visible = role !== 'hidden'; });
    if (st.kind === 'nerve') {
      st.u.uColor.value.set(colorFor(st));
      st.targetOpacity = { focus: 1, dim: 0.32, ghost: touring ? 0.035 : 0.06, context: 0.2 }[role] ?? 0;
      st.u.uPulse.value = state.signals && role === 'focus' && !touring ? 1 : 0;
      st.meshes.forEach((m) => { m.material.depthWrite = role === 'focus'; m.renderOrder = role === 'focus' ? 2 : 1; });
    } else {
      const ctx = st.kind === 'organ' ? 0.06 : st.key === 'cerebrum' ? (state.filter === 'deep' || state.isolatedId || touring ? 0.07 : 0.16) : touring ? 0.12 : 0.2;
      st.materials.forEach((m, i) => {
        const base = st.base[i].opacity;
        const sacLike = st.meshes[i]?.userData.baseOpacity;
        let target = role === 'focus' ? (sacLike ?? base) : Math.min(ctx, sacLike ?? 1);
        if (touring && role === 'focus' && (st.kind === 'cns' || st.kind === 'deep')) target = 0.5;
        m.userData.targetOpacity = target;
        m.depthWrite = role === 'focus' && target > 0.9;
      });
    }
    if (st.label) {
      let want = state.labels && role === 'focus';
      if (want && !touring) want = state.isolatedId ? st.id === state.isolatedId : (state.filter === 'all' ? OVERVIEW_LABELS.has(st.key) : true);
      if (state.quiz && !state.quiz.answered) want = false;
      st.labelWanted = want;
    }
  }
  if (state.selected?.label && !state.quiz) state.selected.labelWanted = state.labels;
  skin.visible = state.skin;
  skeleton.visible = state.skeleton;
  boneMat.opacity = touring ? 0.045 : 0.11;
  cartMat.opacity = touring ? 0.035 : 0.09;
  state.lobeTarget = state.filter === 'lobes' && !touring ? 1 : 0;
  renderLegend();
  renderList();
}

/* ================================================================== i18n */
function labelText(st) {
  if (st.kind === 'nerve') {
    if (getLang() === 'en' || /^(C|T|L|S|Co)\d/.test(st.shortLabel) || /^V\d$/.test(st.shortLabel)) return st.shortLabel;
    return nameOf(st.key).replace(/\s*\(.*\)$/, '');
  }
  if (getLang() === 'en') return st.key === 'conus' ? 'Cauda equina' : st.info.name.split(' (')[0].split(' & ')[0];
  const n = nameOf(st.key);
  const short = n.replace(/\s*\(.*\)$/, '');
  return short.length >= 4 ? short : n;
}
function translateDom() {
  const l = LANGS.find((x) => x.id === getLang());
  document.documentElement.lang = l.id;
  document.body.dataset.lang = l.id;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); if (el.tagName !== 'OPTION') el.dir = 'auto'; });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $('#intro-sub').textContent = t('introSub', { n: [...structs.values()].filter((s) => s.kind === 'nerve').length });
  for (const st of structs.values()) if (st.label) st.label.element.textContent = labelText(st);
  for (const m of Object.values(micro.scenes)) for (const [obj, k] of m.labelObjs) obj.element.textContent = microName(k);
  renderFilters();
  $('#filter-note').textContent = filterNote(state.filter, FILTER_NOTES[state.filter] ?? '');
  renderLegend();
  renderList();
  renderSources();
  renderTourList();
  if (state.selected) select(state.selected.id, { point: state.selectedPoint, fly: false, keepCamera: true });
  if (micro.selected) selectMicro(micro.selected);
  if (tours.tour) updateTourUI(tours.state());
  if (state.quiz) renderQuiz();
  if (micro.active) renderMicroBar();
  $('#tour-play').textContent = tours.playing ? t('pause') : t('play');
}

/* ================================================================== UI */
function renderFilters() {
  const wrap = $('#filters');
  wrap.innerHTML = '';
  for (const g of FILTER_GROUPS) {
    const sec = document.createElement('section');
    sec.className = 'fgroup';
    sec.innerHTML = `<h3 class="eyebrow">${esc(t(`fg_${g.title}`))}</h3>`;
    const row = document.createElement('div');
    row.className = 'chips';
    for (const it of g.items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.id = `filter-${it.id}`;
      b.dir = 'auto';
      b.textContent = t(`f_${it.id}`);
      b.setAttribute('aria-pressed', String(state.filter === it.id));
      b.addEventListener('click', () => setFilter(it.id));
      row.appendChild(b);
    }
    sec.appendChild(row);
    wrap.appendChild(sec);
  }
}

function setFilter(id, { fly = true } = {}) {
  if (tours.tour) stopTour();
  if (state.quiz) stopQuiz();
  state.filter = id;
  state.isolatedId = null;
  store.set('filter', id);
  document.querySelectorAll('#filters .chip').forEach((b) => b.setAttribute('aria-pressed', String(b.id === `filter-${id}`)));
  $('#filter-note').textContent = filterNote(id, FILTER_NOTES[id] ?? '');
  if (state.selected && !inFilter(state.selected, id)) deselect();
  applyVisuals();
  if (fly) frameFilter(id);
}

const GROUP_ORDER = ['cns', 'deep', 'cranial', 'cervical', 'brachial', 'thoracic', 'spinal', 'lumbar', 'sacral', 'sympathetic', 'parasympathetic', 'organ'];
function renderList() {
  const q = $('#search').value.trim().toLowerCase();
  const list = $('#list');
  const seen = new Map();
  for (const st of structs.values()) {
    if (st.role !== 'focus' && st.role !== 'dim') continue;
    if (st.kind === 'organ' && state.filter !== 'all') continue;
    if (seen.has(st.key)) continue;
    const info = st.info;
    const name = nameOf(st.key, info);
    const hay = `${info.name} ${info.latin} ${info.short} ${name}`.toLowerCase();
    if (q && !hay.includes(q)) continue;
    seen.set(st.key, { st, info, name });
  }
  const items = [...seen.values()].sort((a, b) => GROUP_ORDER.indexOf(a.info.group) - GROUP_ORDER.indexOf(b.info.group));
  list.innerHTML = '';
  $('#list-count').textContent = t('count', { n: items.length });
  if (!items.length) { list.innerHTML = `<li class="empty" dir="auto">${esc(t('empty'))}</li>`; return; }
  let lastGroup = null;
  for (const { st, info, name } of items) {
    if (info.group !== lastGroup) {
      const h = document.createElement('li');
      h.className = 'list-head';
      h.dir = 'auto';
      h.textContent = t(`g_${info.group}`);
      list.appendChild(h);
      lastGroup = info.group;
    }
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'item';
    if (state.selected?.key === st.key) b.classList.add('active');
    b.innerHTML = `<span class="dot" style="--c:${colorFor(st)}"></span><span class="iname" dir="auto">${esc(name)}</span><span class="ishort">${esc(info.short ?? '')}</span>`;
    b.addEventListener('click', () => { select(st.id, { fly: true }); document.body.classList.remove('panel-open'); });
    li.appendChild(b);
    list.appendChild(li);
  }
}

function renderLegend() {
  const el = $('#legend');
  let entries;
  if (state.colorMode === 'function') entries = ['motor', 'sensory', 'mixed', 'special', 'autonomic'].map((k) => [FN_COLORS[k], t(`fn_${k}`)]);
  else if (state.colorMode === 'atlas') entries = [['#f4d35e', t('lg_somatic')], ['#3ddc84', t('g_sympathetic')], ['#c084fc', t('g_parasympathetic')]];
  else entries = ['cranial', 'cervical', 'brachial', 'thoracic', 'spinal', 'lumbar', 'sacral', 'sympathetic', 'parasympathetic'].map((k) => [GROUP_COLORS[k], t(`g_${k}`)]);
  if (state.filter === 'lobes') entries = [['#4f8ff7', t('lobe_f')], ['#f5c84b', t('lobe_p')], ['#3ccf8e', t('lobe_t')], ['#f2665c', t('lobe_o')]];
  el.innerHTML = entries.map(([c, l]) => `<span class="lg" dir="auto"><i style="--c:${c}"></i>${esc(l)}</span>`).join('') +
    (state.signals && state.filter !== 'lobes' ? `<span class="lg flow" dir="auto">${esc(t('lg_flow'))}</span>` : '');
}

function listHTML(title, arr, cls = '') {
  if (!arr || !arr.length) return '';
  return `<section class="isec ${cls}"><h4 class="eyebrow">${esc(title)}</h4><ul class="blist">${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>`;
}
function textHTML(title, text, cls = '') {
  if (!text) return '';
  return `<section class="isec ${cls}"><h4 class="eyebrow">${esc(title)}</h4><p>${esc(text)}</p></section>`;
}
function refsHTML(ids) {
  if (!ids?.length) return '';
  return `<section class="isec refs"><h4 class="eyebrow">${esc(t('refs'))}</h4><ol class="rlist">${ids.filter((r) => REFS[r]).map((r) => `<li>${esc(REFS[r])}</li>`).join('')}</ol></section>`;
}

/** Shared dossier renderer for macro structures and micro parts. */
function renderDossier({ info, extra, color, badges, note, isNerve }) {
  const panel = $('#info');
  panel.style.setProperty('--sel', color);
  const l = getLang();
  const lvl = state.level;
  const locName = l !== 'en' ? extra?.name?.[l] : null;
  const simple = pick(extra?.simple);
  const adv = lvl === 'advanced', std = lvl !== 'basic';
  $('#info-body').innerHTML = `
    <div class="ihead">
      <div class="badges">${badges}</div>
      <h2 id="info-title" dir="auto">${esc(locName || info.name)}</h2>
      ${locName ? `<p class="en-name">${esc(info.name)}</p>` : ''}
      <p class="latin">${esc(info.latin)}</p>
    </div>
    ${note ? `<p class="note" dir="auto">${esc(note)}</p>` : ''}
    ${simple ? `<section class="simple" lang="${l}" dir="auto"><h4 class="eyebrow">${esc(t('simple'))}</h4><p>${esc(simple)}</p></section>` : ''}
    ${l !== 'en' && std ? `<p class="detail-note" dir="auto">${esc(t('detailNote'))}</p>` : ''}
    <p class="summary">${esc(info.summary)}</p>
    ${std && info.facts?.length ? `<dl class="facts">${info.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    ${std ? textHTML(t('course'), info.course) : ''}
    ${listHTML(t('motor'), std ? info.motor : info.motor?.slice(0, 3))}
    ${listHTML(t('sensory'), std ? info.sensory : info.sensory?.slice(0, 3))}
    ${std ? listHTML(isNerve ? t('branches') : t('parts'), info.branches) : ''}
    ${std ? textHTML(t('clinical'), info.clinical, 'clinical') : ''}
    ${std ? textHTML(t('test'), info.test) : ''}
    ${adv ? textHTML(t('variations'), extra?.variations, 'adv') : ''}
    ${adv ? textHTML(t('embryology'), extra?.embryology, 'adv') : ''}
    ${textHTML(t('fact'), info.fact, 'fact')}
    ${adv ? refsHTML(extra?.refs) : ''}
  `;
  panel.hidden = false;
  document.body.classList.add('has-info');
  $('#info-body').scrollTop = 0;
}

function renderInfo(st, info, key, note) {
  const sideTxt = st.side ? (st.side === 'L' ? t('left') : t('right')) : '';
  const badges = `<span class="badge fn" style="--c:${FN_COLORS[info.fn]}">${esc(t(`fn_${info.fn}`))}</span>
    ${info.short ? `<span class="badge">${esc(info.short)}</span>` : ''}
    ${sideTxt ? `<span class="badge ghost">${esc(sideTxt)}</span>` : ''}`;
  renderDossier({ info, extra: EXTRA[key], color: colorFor(st), badges, note, isNerve: st.kind === 'nerve' });
  $('#btn-isolate').textContent = state.isolatedId === st.id ? t('showFilter') : t('isolate');
  $('#btn-isolate').hidden = false;
  $('#btn-focus').hidden = false;
  $('#btn-inside').hidden = st.kind !== 'nerve';
}

/* ============================================================ selection */
let halos = [];
function clearHalos() { halos.forEach((h) => { h.geometry.dispose(); scene.remove(h); }); halos = []; }
const haloUniforms = { uColor: { value: new THREE.Color() }, uTime: sharedUniforms.uTime, uOpacity: { value: 0 } };
const haloMat = new THREE.ShaderMaterial({ uniforms: haloUniforms, vertexShader: HALO_VERT, fragmentShader: HALO_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

function resolveInfo(st, point) {
  if (st.key === 'cerebrum') {
    if (!point) return { info: INFO.cerebrum, key: 'cerebrum', note: t('brainNote') };
    const local = point.clone().sub(BRAIN_CENTER);
    const k = `lobe-${classifyLobe(Math.abs(local.x), local.y, local.z)}`;
    return { info: INFO[k], key: k };
  }
  if (st.key === 'brainstem') { const k = point ? brainstemPart(point.y) : 'brainstem'; return { info: INFO[k], key: k }; }
  if (st.key === 'spinal-cord' && point) {
    let best = 'C1', bd = 1e9;
    for (const [lvl, y] of Object.entries(SEGMENT_Y)) { const d = Math.abs(y - point.y); if (d < bd) { bd = d; best = lvl; } }
    let vert = 'C1', vd = 1e9;
    for (const [v, y] of Object.entries(VY)) { const d = Math.abs(y - point.y); if (d < vd) { vd = d; vert = v; } }
    return { info: INFO['spinal-cord'], key: 'spinal-cord', note: t('cordNote', { seg: best, vert }) };
  }
  return { info: st.info, key: st.key };
}

function select(id, { point = null, fly = false, keepCamera = false } = {}) {
  const st = structs.get(id);
  if (!st) return;
  if (state.selected && state.selected !== st) unmarkSelected(state.selected);
  state.selected = st;
  state.selectedPoint = point;
  const { info, key, note } = resolveInfo(st, point);
  renderInfo(st, info, key, note);
  clearHalos();
  if (st.kind === 'nerve') {
    st.u.uSelected.value = 1;
    haloUniforms.uColor.value.set(colorFor(st));
    for (const { curve, rfn } of st.pathData) {
      const h = new THREE.Mesh(taperedTube(curve, { radius: (tt) => rfn(tt) * 3.2 + 0.012, radial: 12 }), haloMat);
      h.renderOrder = 5;
      scene.add(h);
      halos.push(h);
    }
  } else {
    st.materials.forEach((m) => { m.userData.uniforms.uRim.value = 1.6; });
  }
  applyVisuals();
  if (keepCamera) return;
  if (fly) frameBox(st.box, null, 1.6);
  else retarget(point ?? st.box.getCenter(new THREE.Vector3()));
}

function unmarkSelected(st) {
  if (st.kind === 'nerve') st.u.uSelected.value = 0;
  else st.materials.forEach((m, i) => { m.userData.uniforms.uRim.value = st.base[i].rim; });
}

function closeInfo() {
  $('#info').hidden = true;
  document.body.classList.remove('has-info');
}
function deselect() {
  if (micro.active) { micro.selected = null; closeInfo(); return; }
  if (!state.selected) return;
  unmarkSelected(state.selected);
  state.selected = null;
  state.isolatedId = null;
  clearHalos();
  closeInfo();
  applyVisuals();
}

/* ================================================================ hover */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tip = $('#tooltip');
function setHover(st) {
  if (state.hovered === st) return;
  if (state.hovered?.kind === 'nerve') state.hovered.u.uHighlight.value = 0;
  else if (state.hovered && state.hovered !== state.selected) state.hovered.materials?.forEach((m, i) => { m.userData.uniforms.uRim.value = state.hovered.base[i].rim; });
  state.hovered = st;
  if (st?.kind === 'nerve') st.u.uHighlight.value = 1;
  else if (st && st !== state.selected) st.materials?.forEach((m) => { m.userData.uniforms.uRim.value = 1.2; });
  renderer.domElement.style.cursor = st ? 'pointer' : 'grab';
}

function setRay(clientX, clientY) {
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
}
function pickMacro(clientX, clientY) {
  setRay(clientX, clientY);
  const candidates = pickables.filter((m) => {
    const st = m.userData.struct;
    return st.role === 'focus' || st.role === 'dim' || (st.role === 'context' && st.kind !== 'organ');
  });
  const hits = raycaster.intersectObjects(candidates, false);
  if (!hits.length) return null;
  const best = hits.find((h) => h.object.userData.struct.role === 'focus') ?? hits[0];
  const front = hits[0].object.userData.struct;
  const chosen = front.role === 'focus' && front.kind !== 'nerve' && best.distance - hits[0].distance > 0.25 ? hits[0] : best;
  return { st: chosen.object.userData.struct, point: chosen.point };
}
function pickMicro(clientX, clientY) {
  setRay(clientX, clientY);
  const hits = raycaster.intersectObjects(micro.active.picks, false);
  return hits.length ? hits[0].object.userData.micro : null;
}

let hoverQueued = null;
renderer.domElement.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  hoverQueued = { x: e.clientX, y: e.clientY };
  tip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
});
renderer.domElement.addEventListener('pointerleave', () => { hoverQueued = null; setHover(null); tip.hidden = true; });
function processHover() {
  if (!hoverQueued || dragging) return;
  const { x, y } = hoverQueued;
  hoverQueued = null;
  if (micro.active) {
    const k = pickMicro(x, y);
    renderer.domElement.style.cursor = k ? 'pointer' : 'grab';
    if (k) { tip.innerHTML = `<b dir="auto">${esc(microName(k))}</b><span>${esc(MICRO_INFO[k].latin)}</span>`; tip.hidden = false; } else tip.hidden = true;
    return;
  }
  if (state.quiz && !state.quiz.answered) { tip.hidden = true; return; }
  const hit = pickMacro(x, y);
  setHover(hit?.st ?? null);
  if (hit) {
    const { info, key } = resolveInfo(hit.st, hit.point);
    tip.innerHTML = `<b dir="auto">${esc(nameOf(key, info))}</b><span>${esc(info.short ?? '')}${hit.st.side ? ` · ${t(hit.st.side === 'L' ? 'l' : 'r')}` : ''}</span>`;
    tip.hidden = false;
  } else tip.hidden = true;
}

let downAt = null, dragging = false;
renderer.domElement.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  downAt = null;
  if (moved > 8) return;
  if (micro.active) { const k = pickMicro(e.clientX, e.clientY); if (k) selectMicro(k); else deselect(); return; }
  if (state.quiz && !state.quiz.answered) return;
  const hit = pickMacro(e.clientX, e.clientY);
  if (hit) select(hit.st.id, { point: hit.point });
  else deselect();
});
controls.addEventListener('start', () => { dragging = true; tween = null; tours.userMoved(); });
controls.addEventListener('end', () => { dragging = false; });

/* =============================================================== camera */
let tween = null;
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
function flyTo(pos, target, dur = 1.6) {
  if (reduceMotion) dur = 0.01;
  tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: target.clone(), start: performance.now(), dur: dur * 1000 };
}
function retarget(target) {
  const offset = camera.position.clone().sub(controls.target);
  flyTo(target.clone().add(offset), target, 0.9);
}
function frameBox(box, dir, dur = 1.8, fit = 1.15) {
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.length() / 2, 0.7);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fitH = radius / Math.sin(fov / 2);
  const fitW = radius / Math.sin(Math.atan(Math.tan(fov / 2) * camera.aspect));
  const dist = Math.max(fitH, fitW) * fit + 0.3;
  const d = (dir ?? camera.position.clone().sub(controls.target)).clone().normalize();
  flyTo(center.clone().add(d.multiplyScalar(dist)), center, dur);
}
const FILTER_DIR = {
  all: [0.35, 0.1, 1], cns: [1, 0.25, 0.45], cranial: [0.75, -0.35, 1], spinal: [0.75, 0.1, -1], sympathetic: [1, 0.12, 0.7], parasympathetic: [0.7, 0.1, 1],
  cervical: [1, 0.1, 0.8], brachial: [0.45, 0.15, 1], thoracic: [1, 0.15, 0.6], lumbar: [0.45, 0.1, 1], sacral: [0.85, 0.05, -1], lobes: [1, 0.35, 0.5], deep: [1, 0.35, 0.6],
};
function frameFilter(id) {
  const box = new THREE.Box3();
  for (const st of structs.values()) {
    if (st.role !== 'focus' || st.kind === 'organ') continue;
    if (st.kind === 'cns' && !['lobes', 'deep', 'cns'].includes(id)) continue;
    if (id === 'cranial' || id === 'reg-head') { const b = st.box.clone(); b.min.y = Math.max(b.min.y, 14.4); if (b.min.y < b.max.y) box.union(b); continue; }
    box.union(st.box);
  }
  if (id === 'all' || box.isEmpty()) return setView('body');
  frameBox(box, new THREE.Vector3(...(FILTER_DIR[id] ?? [0.35, 0.1, 1])));
}
const VIEWS = {
  body: [[7.5, 12.5, 32], [0, 8.9, 0]],
  head: [[2.6, 16.8, 4.4], [0, 16.0, 0]],
  spine: [[4.5, 13.0, -9.5], [0, 11.6, -0.4]],
  arm: [[7.0, 11.5, 8.0], [2.1, 10.9, 0]],
  leg: [[5.0, 5.5, 12.5], [0.75, 4.6, 0]],
};
const viewFor = (name) => VIEWS[name].map((a) => new THREE.Vector3(...a));
function setView(name) {
  if (micro.active) setScale('body');
  const [p, tg] = viewFor(name);
  flyTo(p, tg, 1.8);
}

/* ================================================================ tours */
const P = (arr) => arr.map((a) => (a.isVector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2])));
const H = {
  P,
  cz: cordZ,
  tp: (y, s) => trunkPoint(y, s),
  seg(id, pi, t0, t1, n) {
    const st = structs.get(id);
    const curve = st.pathData[pi].curve;
    const count = n ?? Math.max(6, Math.ceil(Math.abs(t1 - t0) * curve.getLength() * 6));
    const out = [];
    for (let i = 0; i <= count; i++) out.push(curve.getPointAt(Math.min(1, Math.max(0, t0 + ((t1 - t0) * i) / count))));
    return out;
  },
  near(id, pi, xyz) {
    const curve = structs.get(id).pathData[pi].curve;
    const p = new THREE.Vector3(...(xyz.isVector3 ? xyz.toArray() : xyz));
    let best = 0, bd = Infinity;
    for (let i = 0; i <= 300; i++) { const d = curve.getPointAt(i / 300).distanceToSquared(p); if (d < bd) { bd = d; best = i / 300; } }
    return best;
  },
  cordLine(x, y0, y1, dz) {
    const out = [], n = Math.ceil(Math.abs(y1 - y0) / 0.08);
    for (let i = 0; i <= n; i++) { const y = y0 + ((y1 - y0) * i) / n; out.push(new THREE.Vector3(x, y, cordZ(y) + dz)); }
    return out;
  },
  cat(...parts) {
    const out = [];
    for (const part of parts) for (const p of part) if (!out.length || out[out.length - 1].distanceTo(p) > 0.006) out.push(p);
    return out;
  },
};
const TOURS = buildTours(H);
const flashes = [];
function flash(pos, color, size = 0.6, life = 0.9) {
  if (!pos) return;
  const s = glowSprite(color, 0.05);
  s.position.copy(pos);
  scene.add(s);
  flashes.push({ s, age: 0, life, size });
}
const tours = new TourPlayer({
  scene, camera, controls, flyTo, viewFor, time: sharedUniforms.uTime,
  setFocus(ids) { state.tourFocus = new Set(ids); applyVisuals(); },
  event(name, pos, color) {
    if (name === 'flash') flash(pos, color, 0.8);
    if (name === 'synapse') { flash(pos, '#ffffff', 0.9, 1.1); flash(pos, color, 1.5, 1.4); }
    if (name === 'cross') flash(pos, '#ffffff', 1.1, 1.2);
    if (name === 'contract') { flash(pos, '#ff6b6b', 1.8, 1.4); flash(pos, '#ffffff', 0.9, 0.8); }
    if (name === 'heartFast') { state.heartTarget = 1.8; setTimeout(() => { state.heartTarget = 1; }, 9000); }
    if (name === 'heartSlow') { state.heartTarget = 0.55; setTimeout(() => { state.heartTarget = 1; }, 9000); }
    if (name === 'pupilDilate') state.pupilTarget = 1.7;
    if (name === 'pupilConstrict') state.pupilTarget = 0.6;
  },
  ui: updateTourUI,
});

function renderTourList() {
  const wrap = $('#tour-list');
  wrap.innerHTML = '';
  for (const tour of TOURS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tour-card';
    b.style.setProperty('--c', tour.color);
    b.innerHTML = `<span class="tc-dot"></span><span class="tc-text"><b dir="auto">${esc(pick(tour.title))}</b><span dir="auto">${esc(pick(tour.desc))}</span></span><span class="tc-n">${tour.steps.length}</span>`;
    b.addEventListener('click', () => { closeModal('#tours-modal'); startTour(tour); });
    wrap.appendChild(b);
  }
}
function startTour(tour) {
  if (micro.active) setScale('body');
  if (state.quiz) stopQuiz();
  deselect();
  state.prevRotate = controls.autoRotate;
  controls.autoRotate = false;
  document.body.classList.add('touring');
  $('#tourbar').hidden = false;
  tours.start(tour);
}
function stopTour() {
  tours.stop();
  state.tourFocus = null;
  state.pupilTarget = 1;
  document.body.classList.remove('touring');
  $('#tourbar').hidden = true;
  controls.autoRotate = state.rotate;
  applyVisuals();
}
function updateTourUI(s) {
  if (!s || !s.tour) { if (!tours.tour) { $('#tourbar').hidden = true; } return; }
  $('#tourbar').style.setProperty('--c', s.step?.color || s.tour.color);
  $('#tour-title').textContent = pick(s.tour.title);
  $('#tour-step').textContent = t('step', { i: s.i + 1, n: s.n });
  $('#tour-cap').textContent = pick(s.step?.cap);
  $('#tour-cap').lang = getLang();
  $('#tour-play').textContent = s.playing ? t('pause') : t('play');
  $('#tour-prev').disabled = s.i <= 0;
  $('#tour-next').disabled = s.i >= s.n - 1;
  $('#tour-dots').innerHTML = Array.from({ length: s.n }, (_, i) => `<i class="${i < s.i ? 'done' : i === s.i ? 'on' : ''}"></i>`).join('');
}
$('#tour-play').addEventListener('click', () => tours.toggle());
$('#tour-next').addEventListener('click', () => tours.next());
$('#tour-prev').addEventListener('click', () => tours.prev());
$('#tour-exit').addEventListener('click', stopTour);

/* ================================================================ micro */
const micro = { scenes: {}, active: null, selected: null, saved: null };
function microName(k) {
  const m = MICRO_INFO[k];
  return getLang() === 'en' ? m.name : (m[getLang()] || m.name);
}
function renderMicroBar() {
  const isNerve = state.scale === 'nerve';
  $('#micro-title').textContent = t(isNerve ? 'microNerve' : 'microNeuron');
  $('#micro-cap').textContent = t(isNerve ? 'microNerveCap' : 'microNeuronCap');
  $('#micro-cap').lang = getLang();
}
function setScale(scale) {
  if (scale === state.scale) return;
  if (tours.tour) stopTour();
  if (state.quiz) stopQuiz();
  document.querySelectorAll('[data-scale]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scale === scale)));
  if (micro.active) for (const [obj] of micro.active.labelObjs) { obj.visible = false; obj.element.style.display = 'none'; }
  closeInfo();
  micro.selected = null;
  if (scale === 'body') {
    state.scale = 'body';
    micro.active = null;
    renderPass.scene = scene;
    document.body.classList.remove('micro');
    $('#microbar').hidden = true;
    controls.minDistance = 0.6;
    controls.autoRotate = state.rotate;
    if (micro.saved) { camera.position.copy(micro.saved.p); controls.target.copy(micro.saved.t); micro.saved = null; }
    applyVisuals();
    return;
  }
  if (state.scale === 'body') {
    micro.saved = { p: camera.position.clone(), t: controls.target.clone() };
    if (state.selected) deselect();
    for (const st of structs.values()) if (st.label) st.label.element.style.display = 'none';
  }
  state.scale = scale;
  if (!micro.scenes[scale]) {
    const m = scale === 'nerve' ? buildNerveScene(envTex) : buildNeuronScene(envTex);
    m.labelObjs = m.labels.map(([k, pos]) => [makeLabel(microName(k), pos, { micro: k }, m.scene), k]);
    micro.scenes[scale] = m;
  }
  micro.active = micro.scenes[scale];
  for (const [obj] of micro.active.labelObjs) obj.visible = state.labels;
  renderPass.scene = micro.active.scene;
  document.body.classList.add('micro');
  $('#microbar').hidden = false;
  renderMicroBar();
  controls.minDistance = 1.2;
  controls.autoRotate = false;
  const { pos, target } = micro.active.view;
  if (!micro.active.box) { micro.active.box = new THREE.Box3(); for (const m of micro.active.picks) micro.active.box.expandByObject(m); }
  camera.position.copy(pos).add(new THREE.Vector3(3, 2, 8));
  controls.target.copy(target);
  frameBox(micro.active.box, pos.clone().sub(target), reduceMotion ? 0.01 : 2.2, host.clientWidth > 860 ? 0.72 : 0.86);
}
function selectMicro(k) {
  micro.selected = k;
  const m = MICRO_INFO[k];
  const info = { ...m, short: null };
  const extra = { name: { hi: m.hi, ur: m.ur }, simple: { en: m.simple[0], hi: m.simple[1], ur: m.simple[2] }, refs: m.refs };
  renderDossier({ info, extra, color: '#79c6ff', badges: `<span class="badge fn" style="--c:#79c6ff">${esc(t('fn_micro'))}</span>`, isNerve: false });
  $('#btn-isolate').hidden = true;
  $('#btn-focus').hidden = true;
  $('#btn-inside').hidden = true;
}
document.querySelectorAll('[data-scale]').forEach((b) => b.addEventListener('click', () => setScale(b.dataset.scale)));
$('#micro-back').addEventListener('click', () => setScale('body'));
$('#btn-inside').addEventListener('click', () => setScale('nerve'));

/* ================================================================= quiz */
const QUIZ_POOL = [...structs.values()].filter((s) => (s.kind === 'nerve' && s.side === 'L' && !/^(sp|ic)-/.test(s.key)) || s.kind === 'deep' || s.key === 'cerebellum');
function startQuiz() {
  if (micro.active) setScale('body');
  if (tours.tour) stopTour();
  deselect();
  state.quiz = { score: 0, n: 0, streak: 0 };
  controls.autoRotate = false;
  document.body.classList.add('quizzing');
  $('#quizbar').hidden = false;
  nextQuestion();
}
function stopQuiz() {
  if (!state.quiz) return;
  state.quiz = null;
  state.isolatedId = null;
  document.body.classList.remove('quizzing');
  $('#quizbar').hidden = true;
  controls.autoRotate = state.rotate;
  applyVisuals();
}
function nextQuestion() {
  const q = state.quiz;
  const target = QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)];
  const same = QUIZ_POOL.filter((s) => s.key !== target.key && s.info.group === target.info.group);
  const others = QUIZ_POOL.filter((s) => s.key !== target.key && s.info.group !== target.info.group);
  const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((a1, b1) => a1[0] - b1[0]).map((x) => x[1]);
  const opts = shuffle([target, ...shuffle(same).slice(0, 2), ...shuffle(others)].filter((s, i, arr) => arr.findIndex((o) => o.key === s.key) === i).slice(0, 4));
  if (!opts.includes(target)) opts[0] = target;
  Object.assign(q, { target, opts: shuffle(opts), answered: false, picked: null });
  state.isolatedId = target.id;
  if (state.selected) { unmarkSelected(state.selected); state.selected = null; clearHalos(); closeInfo(); }
  if (target.kind === 'nerve') target.u.uSelected.value = 1;
  applyVisuals();
  const dir = target.kind === 'nerve' ? new THREE.Vector3(0.6, 0.25, 1) : new THREE.Vector3(1, 0.35, 0.6);
  frameBox(target.box, dir, 1.4);
  renderQuiz();
}
function renderQuiz() {
  const q = state.quiz;
  $('#quiz-score').textContent = t('score', { s: q.score, n: q.n });
  $('#quiz-streak').textContent = q.streak > 1 ? t('streak', { n: q.streak }) : '';
  const wrap = $('#quiz-options');
  wrap.innerHTML = '';
  for (const o of q.opts) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'qopt';
    b.dir = 'auto';
    b.textContent = nameOf(o.key);
    if (q.answered) {
      b.disabled = true;
      if (o === q.target) b.classList.add('right');
      else if (o === q.picked) b.classList.add('wrong');
    }
    b.addEventListener('click', () => answer(o));
    wrap.appendChild(b);
  }
  const fb = $('#quiz-feedback');
  fb.hidden = !q.answered;
  if (q.answered) {
    const ok = q.picked === q.target;
    fb.className = ok ? 'ok' : 'bad';
    fb.textContent = `${ok ? t('correct') : t('wrong', { name: nameOf(q.target.key) })} ${pick(EXTRA[q.target.key]?.simple)}`;
  }
  $('#quiz-next').hidden = !q.answered;
}
function answer(o) {
  const q = state.quiz;
  if (q.answered) return;
  q.answered = true;
  q.picked = o;
  q.n++;
  if (o === q.target) { q.score++; q.streak++; } else q.streak = 0;
  applyVisuals();
  renderQuiz();
}
$('#btn-quiz').addEventListener('click', () => (state.quiz ? stopQuiz() : startQuiz()));
$('#quiz-next').addEventListener('click', () => { if (state.quiz.target.kind === 'nerve') state.quiz.target.u.uSelected.value = 0; nextQuestion(); });
$('#quiz-exit').addEventListener('click', () => { if (state.quiz?.target.kind === 'nerve') state.quiz.target.u.uSelected.value = 0; stopQuiz(); });

/* ========================================================= modals, toast */
function openModal(sel) { $(sel).hidden = false; $(sel).querySelector('button')?.focus(); }
function closeModal(sel) { $(sel).hidden = true; }
document.querySelectorAll('.modal').forEach((m) => {
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.modal-close')) m.hidden = true; });
});
$('#btn-tours').addEventListener('click', () => openModal('#tours-modal'));
$('#btn-sources').addEventListener('click', () => openModal('#sources-modal'));
function renderSources() {
  $('#ref-list').innerHTML = Object.values(REFS).map((r) => `<li>${esc(r)}</li>`).join('');
}
let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
}

/* =============================================================== toolbar */
function bindToggle(id, keyName, after) {
  const b = $(`#${id}`);
  const sync = () => b.setAttribute('aria-pressed', String(state[keyName]));
  sync();
  b.addEventListener('click', () => { state[keyName] = !state[keyName]; store.set(keyName, state[keyName]); sync(); after?.(); applyVisuals(); });
}
bindToggle('t-skin', 'skin');
bindToggle('t-skeleton', 'skeleton');
bindToggle('t-organs', 'organs');
bindToggle('t-labels', 'labels', () => { if (micro.active) for (const [obj] of micro.active.labelObjs) obj.visible = state.labels; });
bindToggle('t-signals', 'signals');
bindToggle('t-rotate', 'rotate', () => { controls.autoRotate = state.rotate && !micro.active && !tours.tour; });
bindToggle('t-isolate', 'isolate');
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
const colorSel = $('#color-mode');
colorSel.value = state.colorMode;
colorSel.addEventListener('change', () => { state.colorMode = colorSel.value; store.set('colorMode', state.colorMode); applyVisuals(); if (state.selected) select(state.selected.id, { point: state.selectedPoint, keepCamera: true }); });
const qualSel = $('#quality-sel');
qualSel.value = quality.mode;
qualSel.addEventListener('change', () => { quality.setMode(qualSel.value); store.set('quality', qualSel.value); });
const levelSel = $('#level-sel');
levelSel.value = state.level;
levelSel.addEventListener('change', () => {
  state.level = levelSel.value;
  store.set('level', state.level);
  if (micro.selected) selectMicro(micro.selected);
  else if (state.selected) select(state.selected.id, { point: state.selectedPoint, keepCamera: true });
});
const langSel = $('#lang-sel');
langSel.value = getLang();
langSel.addEventListener('change', () => { setLang(langSel.value); store.set('lang', langSel.value); translateDom(); });
$('#search').addEventListener('input', renderList);
$('#btn-close').addEventListener('click', deselect);
$('#btn-focus').addEventListener('click', () => state.selected && frameBox(state.selected.box, null, 1.4));
$('#btn-isolate').addEventListener('click', () => {
  if (!state.selected) return;
  state.isolatedId = state.isolatedId === state.selected.id ? null : state.selected.id;
  $('#btn-isolate').textContent = state.isolatedId ? t('showFilter') : t('isolate');
  applyVisuals();
  if (state.isolatedId) frameBox(state.selected.box, null, 1.4);
});
$('#btn-panel').addEventListener('click', () => document.body.classList.toggle('panel-open'));
window.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select')) return;
  if (e.key === 'Escape') {
    const open = [...document.querySelectorAll('.modal')].find((m) => !m.hidden);
    if (open) { open.hidden = true; return; }
    if (tours.tour) return stopTour();
    if (state.quiz) return stopQuiz();
    deselect();
  }
  if (e.key === 'f' && state.selected) frameBox(state.selected.box, null, 1.4);
  if (e.key === ' ' && tours.tour) { e.preventDefault(); tours.toggle(); }
  if (e.key === 'ArrowRight' && tours.tour) tours.next();
  if (e.key === 'ArrowLeft' && tours.tour) tours.prev();
});

/* ================================================================ intro */
const intro = $('#intro');
function endIntro() {
  if (intro.classList.contains('done')) return;
  intro.classList.add('done');
  document.body.classList.add('ready');
  controls.autoRotate = state.rotate;
}
intro.addEventListener('click', () => { endIntro(); setView('body'); });

/* ================================================================= loop */
let frameNo = 0;
let viewShift = 0, viewShiftY = 0;
function updateViewOffset(dt) {
  const w = host.clientWidth, h = host.clientHeight;
  let target = 0, targetY = 0;
  if (w > 860 && document.body.classList.contains('ready')) {
    const panelVisible = !document.body.classList.contains('micro');
    const left = panelVisible ? $('#panel').getBoundingClientRect().right : 0;
    const right = document.body.classList.contains('has-info') ? w - $('#info').getBoundingClientRect().left : 0;
    target = (left - right) / 2;
  }
  if (w > 860 && (tours.tour || state.quiz)) targetY = ($(tours.tour ? '#tourbar' : '#quizbar').getBoundingClientRect().height) / 2 + 10;
  if (w <= 860) {
    if (document.body.classList.contains('has-info')) targetY = $('#info').getBoundingClientRect().height / 2 + 20;
    else if (tours.tour) targetY = $('#tourbar').getBoundingClientRect().height / 2;
    else if (state.quiz) targetY = $('#quizbar').getBoundingClientRect().height / 2;
  }
  const k = 1 - Math.pow(0.002, dt);
  viewShift += (target - viewShift) * k;
  viewShiftY += (targetY - viewShiftY) * k;
  if (Math.abs(viewShift) < 0.5 && Math.abs(viewShiftY) < 0.5 && target === 0 && targetY === 0) { if (camera.view?.enabled) camera.clearViewOffset(); return; }
  camera.setViewOffset(w, h, -viewShift, viewShiftY, w, h);
}
const tmpV = new THREE.Vector3();
function cullLabels() {
  const w = host.clientWidth, h = host.clientHeight;
  const cand = [];
  const list = micro.active ? micro.active.labelObjs.map(([obj]) => ({ label: obj, pr: 1 })) : [...structs.values()].filter((st) => st.label && st.labelWanted).map((st) => ({ label: st.label, pr: st === state.selected ? 3 : st === state.hovered ? 2 : OVERVIEW_LABELS.has(st.key) ? 1 : 0 }));
  for (const c of list) {
    if (!c.label.visible) continue;
    tmpV.copy(c.label.position).project(camera);
    if (tmpV.z > 1) { c.label.element.style.visibility = 'hidden'; continue; }
    cand.push({ ...c, x: (tmpV.x * 0.5 + 0.5) * w, y: (-tmpV.y * 0.5 + 0.5) * h, wd: c.label.element.textContent.length * 6.6 + 18 });
  }
  cand.sort((a, b) => b.pr - a.pr || a.y - b.y);
  const boxes = [];
  for (const c of cand) {
    const r = { l: c.x + 8, r: c.x + 8 + c.wd, t: c.y - 10, b: c.y + 10 };
    const hit = boxes.some((o) => r.l < o.r && r.r > o.l && r.t < o.b && r.b > o.t);
    c.label.element.style.visibility = hit ? 'hidden' : '';
    if (!hit) boxes.push(r);
  }
}

const clock = new THREE.Clock();
const heart = structs.get('heart')?.meshes[0];
const heartBase = heart?.scale.clone();
let heartPhase = 0;
function frame() {
  requestAnimationFrame(frame);
  if (document.hidden) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;
  sharedUniforms.uTime.value = time;
  quality.sample(dt);
  if (tween) {
    const k = Math.min(1, (performance.now() - tween.start) / tween.dur);
    const e = ease(k);
    camera.position.lerpVectors(tween.p0, tween.p1, e);
    controls.target.lerpVectors(tween.t0, tween.t1, e);
    if (k >= 1) tween = null;
  }
  tours.update(dt);
  controls.update();
  const fade = 1 - Math.pow(0.0015, dt);
  if (micro.active) micro.active.update(time, dt);
  else {
    for (const st of structs.values()) {
      if (st.kind === 'nerve') st.u.uOpacity.value += ((st.targetOpacity ?? 1) - st.u.uOpacity.value) * fade;
      else st.materials.forEach((m) => { const tgt = m.userData.targetOpacity ?? 1; m.opacity += (tgt - m.opacity) * fade; });
      if (st.label) st.label.visible = !!st.labelWanted;
    }
    state.lobeMix += ((state.lobeTarget ?? 0) - state.lobeMix) * fade;
    for (const side of ['L', 'R']) structs.get(`cerebrum-${side}`).materials[0].userData.uniforms.uLobeMix.value = state.lobeMix;
    haloUniforms.uOpacity.value += ((state.selected?.kind === 'nerve' ? 1 : 0) - haloUniforms.uOpacity.value) * fade;
    state.heartRate += (state.heartTarget - state.heartRate) * (1 - Math.pow(0.3, dt));
    heartPhase += dt * 7.3 * state.heartRate;
    if (heart) {
      const beat = 1 + 0.045 * Math.pow(Math.max(0, Math.sin(heartPhase)), 12) + 0.025 * Math.pow(Math.max(0, Math.sin(heartPhase - 0.9)), 10);
      heart.scale.copy(heartBase).multiplyScalar(beat);
    }
    state.pupil += (state.pupilTarget - state.pupil) * (1 - Math.pow(0.05, dt));
    for (const iris of irisMeshes) iris.scale.set(state.pupil, state.pupil, 0.35);
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      f.age += dt;
      const k = f.age / f.life;
      f.s.scale.setScalar(f.size * (0.3 + k * 1.2));
      f.s.material.opacity = Math.max(0, 1 - k);
      if (k >= 1) { scene.remove(f.s); f.s.material.dispose(); flashes.splice(i, 1); }
    }
  }
  updateViewOffset(dt);
  if ((frameNo++ & 3) === 0) cullLabels();
  processHover();
  composer.render();
  labelRenderer.render(micro.active ? micro.active.scene : scene, camera);
}

/* ================================================================ boot */
translateDom();
applyVisuals();
requestAnimationFrame(frame);
document.body.classList.add('loaded');
requestAnimationFrame(() => window.__splash?.finish());
document.querySelectorAll('[data-scale]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scale === 'body')));
if (reduceMotion) {
  endIntro();
  const [p, tg] = VIEWS.body;
  camera.position.set(...p); controls.target.set(...tg);
} else {
  setTimeout(() => flyTo(...viewFor('body'), 5.2), 700);
  setTimeout(endIntro, 4200);
}
if (state.filter !== 'all') setTimeout(() => frameFilter(state.filter), reduceMotion ? 0 : 6200);

// expose for debugging / screenshots
window.__neuromap = { structs, select, setFilter, setView, setScale, state, camera, controls, deselect, startTour: (id) => startTour(TOURS.find((x) => x.id === id)), tours, startQuiz, quality, selectMicro };
