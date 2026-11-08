import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { smoothCurve, taperedTube, radiusFn, controlPointT, classifyLobe } from './geometry.js';
import { buildNerves, BRAIN_CENTER, SEGMENT_Y, VY } from './anatomy.js';
import { buildSkin, buildSkeleton, buildOrgans, buildCNS, tissueMaterial, hologramMaterial, sharedUniforms, brainstemPart } from './body.js';
import { INFO, GROUP_COLORS, GROUP_LABELS, FN_COLORS, FN_LABELS, FILTER_GROUPS, FILTER_NOTES } from './info.js';

const $ = (sel) => document.querySelector(sel);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem(`neuromap:${k}`); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(`neuromap:${k}`, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

/* ================================================================ scene */
const host = $('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(host.clientWidth, host.clientHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
host.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(host.clientWidth, host.clientHeight);
labelRenderer.domElement.className = 'label-layer';
host.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#03060b');
scene.fog = new THREE.FogExp2('#03060b', 0.012);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
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
const key = new THREE.DirectionalLight('#ffe9d6', 1.6);
key.position.set(6, 22, 12);
scene.add(key);
const rimL = new THREE.DirectionalLight('#5aa8ff', 1.2);
rimL.position.set(-10, 12, -10);
scene.add(rimL);
const rimR = new THREE.DirectionalLight('#ff7aa8', 0.6);
rimR.position.set(10, 8, -8);
scene.add(rimR);

/* backdrop: gradient dome, floating dust and a holographic floor */
{
  const dome = new THREE.Mesh(new THREE.SphereGeometry(180, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTime: sharedUniforms.uTime },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vP; uniform float uTime;
      void main(){
        float h = vP.y;
        vec3 top = vec3(0.012, 0.03, 0.06), mid = vec3(0.02, 0.045, 0.075), bot = vec3(0.004, 0.006, 0.012);
        vec3 c = mix(mid, top, smoothstep(0.0, 0.8, h));
        c = mix(bot, c, smoothstep(-0.5, 0.05, h));
        float band = exp(-pow(h * 6.0, 2.0)) * 0.025;
        c += vec3(0.1, 0.25, 0.45) * band;
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
  const dust = new THREE.Points(g, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: sharedUniforms.uTime, uScale: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float seed; uniform float uTime; uniform float uScale; varying float vA;
      void main(){
        vec3 p = position; p.y += mod(uTime * (0.08 + seed * 0.12) + seed * 30.0, 28.0) - 14.0 + 12.0;
        p.y = mod(p.y + 2.0, 28.0) - 2.0;
        p.x += sin(uTime * 0.2 + seed * 40.0) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.0 + seed * 3.0) * uScale * (14.0 / -mv.z);
        vA = 0.25 + 0.75 * seed;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vec3(0.45, 0.7, 1.0) * a * vA * 0.35, a * vA * 0.35); }`,
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
        float grid = smoothstep(0.03, 0.0, abs(fract(p.x * 1.0) - 0.5) - 0.48) + smoothstep(0.03, 0.0, abs(fract(p.y * 1.0) - 0.5) - 0.48);
        float fall = smoothstep(7.0, 1.0, r);
        float core = exp(-r * r * 0.25) * 0.5;
        float a = (rings * 0.5 + grid * 0.12 + core) * fall;
        gl_FragColor = vec4(vec3(0.25, 0.6, 1.0) * a * 0.5, a * 0.5);
      }`,
  }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;
  scene.add(floor);
}

/* ======================================================= post-processing */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(host.clientWidth, host.clientHeight), 0.55, 0.45, 0.78);
composer.addPass(bloom);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: sharedUniforms.uTime, uRes: { value: new THREE.Vector2(host.clientWidth, host.clientHeight) }, uVignette: { value: 1.0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; uniform float uVignette; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5; float d = length(c);
      vec2 off = c * d * 0.0035;
      vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      col *= mix(1.0, smoothstep(0.85, 0.2, d), 0.55 * uVignette);
      col = mix(col, col * vec3(0.96, 1.0, 1.06), 0.5);
      col += (hash(vUv * uRes + fract(uTime)) - 0.5) * 0.018;
      gl_FragColor = vec4(col, 1.0);
    }`,
});
composer.addPass(grade);
composer.addPass(new OutputPass());

/* ============================================================ materials */
const NERVE_VERT = `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const NERVE_FRAG = `uniform vec3 uColor; uniform float uTime, uOpacity, uHighlight, uSelected, uFlow, uLength, uPulse, uPhase;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){
    vec3 n = normalize(vN); vec3 v = normalize(vV);
    float ndv = clamp(dot(n, v), 0.0, 1.0);
    float rim = pow(1.0 - ndv, 2.2);
    vec3 L = normalize(vec3(0.35, 0.8, 0.5));
    float diff = 0.45 + 0.55 * max(dot(n, L), 0.0);
    float spec = pow(max(dot(reflect(-L, n), v), 0.0), 24.0) * 0.35;
    float fib = 0.86 + 0.14 * sin(vUv.y * 6.2832 * 5.0 + vUv.x * uLength * 10.0);
    vec3 col = uColor * diff * fib * 0.62 + uColor * rim * 0.8 + vec3(spec);
    float s = vUv.x * uLength;
    float spd = 1.15 + uSelected * 0.9;
    float pe = exp(-pow((fract((s - uTime * spd) / 1.5 + uPhase) - 0.5) * 9.0, 2.0));
    float pa = exp(-pow((fract((s + uTime * spd) / 1.5 + uPhase + 0.37) - 0.5) * 9.0, 2.0));
    float p = uFlow > 0.5 ? pe : (uFlow < -0.5 ? pa : max(pe, pa) * 0.85);
    col += mix(uColor, vec3(1.0), 0.5) * p * uPulse * (0.9 + uSelected * 1.3);
    col *= 1.0 + uHighlight * 0.6 + uSelected * 0.35;
    col += uColor * rim * (uHighlight * 1.0 + uSelected * 1.1);
    gl_FragColor = vec4(col, uOpacity);
  }`;
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
  const t = new Set([...(info.tags || []), ...extra]);
  t.add(`fn-${fnTag(info.fn)}`);
  t.add(`reg-${info.region}`);
  return t;
}

function makeLabel(text, pos, struct) {
  const el = document.createElement('button');
  el.className = 'tag3d';
  el.type = 'button';
  el.textContent = text;
  el.addEventListener('click', (e) => { e.stopPropagation(); select(struct.id, { fly: false }); });
  el.addEventListener('pointerenter', () => setHover(struct));
  el.addEventListener('pointerleave', () => setHover(null));
  const obj = new CSS2DObject(el);
  obj.position.copy(pos);
  obj.visible = false;
  scene.add(obj);
  return obj;
}

// --- nerves
for (const def of buildNerves()) {
  const info = INFO[def.key];
  if (!info) { console.warn('missing info', def.key); continue; }
  const flow = flowOf(info.fn) * (def.reverse ? -1 : 1);
  const u = {
    uColor: { value: new THREE.Color(GROUP_COLORS[info.group]) }, uOpacity: { value: 1 }, uHighlight: { value: 0 },
    uSelected: { value: 0 }, uPulse: { value: 1 }, uTime: sharedUniforms.uTime, uFlow: { value: flow },
  };
  const struct = { id: def.id, key: def.key, side: def.side, kind: 'nerve', info, u, meshes: [], picks: [], pathData: [], tags: tagsFor(info), box: new THREE.Box3() };
  def.paths.forEach((p, i) => {
    const curve = smoothCurve(p.pts);
    const bumps = p.tBumps ?? p.bumps.map(([idx, a, w]) => [controlPointT(p.pts, idx), a, w]);
    const rfn = radiusFn(p.r0, p.r1, bumps);
    const geo = taperedTube(curve, { radius: rfn, radial: p.r0 > 0.03 ? 14 : 9 });
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...u, uLength: { value: geo.userData.length }, uPhase: { value: Math.random() } },
      vertexShader: NERVE_VERT, fragmentShader: NERVE_FRAG, transparent: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.struct = struct;
    groups.nerves.add(mesh);
    struct.meshes.push(mesh);
    geo.computeBoundingBox();
    struct.box.union(geo.boundingBox);
    const pick = new THREE.Mesh(taperedTube(curve, { radius: (t) => Math.max(0.05, rfn(t) * 2.2), radial: 6, segments: Math.max(8, Math.ceil(geo.userData.length * 8)), capEnd: false }), new THREE.MeshBasicMaterial());
    pick.visible = false;
    pick.userData.struct = struct;
    groups.pick.add(pick);
    struct.picks.push(pick);
    struct.pathData.push({ curve, rfn });
    if (i === 0) struct.anchor = curve.getPointAt(def.key.startsWith('sp-') ? 0.98 : 0.5);
  });
  if (def.label && def.side !== 'R') struct.label = makeLabel(def.label, struct.anchor, struct);
  struct.major = !!def.major;
  structs.set(struct.id, struct);
  pickables.push(...struct.picks);
}

// --- CNS + deep brain
const CNS_TAGS = {
  cerebrum: ['cns', 'lobes', 'reg-head'], cerebellum: ['cns'], brainstem: ['cns', 'cranial'], 'spinal-cord': ['cns', 'spinal'], conus: ['cns', 'spinal'],
};
const CNS_LABELS = { 'cerebrum-L': ['Cerebrum', [0.55, 17.0, 0.1]], cerebellum: ['Cerebellum', [0.45, 15.95, -0.85]], brainstem: ['Brainstem', [0.12, 15.75, -0.05]], 'spinal-cord': ['Spinal cord', [0.08, 12.6, -0.7]], conus: ['Cauda equina', [0.1, 9.9, -0.35]] };
for (const item of buildCNS()) {
  const info = INFO[item.key] ?? INFO['lobe-frontal'];
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
  if (lab) struct.label = makeLabel(lab[0], new THREE.Vector3(...lab[1]), struct);
  else if (item.deep) {
    const c = struct.box.getCenter(new THREE.Vector3());
    struct.label = makeLabel(info.name.split(' (')[0], c.add(new THREE.Vector3(0.05, 0.06, 0)), struct);
  }
  struct.major = !item.deep;
  structs.set(struct.id, struct);
}

// --- organs
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
  pickables.push(...item.meshes);
  structs.set(struct.id, struct);
}

/* ================================================================ state */
const state = {
  filter: store.get('filter', 'all'),
  colorMode: store.get('colorMode', 'systems'),
  skin: store.get('skin', true), skeleton: store.get('skeleton', true), organs: store.get('organs', true),
  labels: store.get('labels', true), signals: store.get('signals', true), rotate: store.get('rotate', !reduceMotion),
  isolate: store.get('isolate', false),
  selected: null, hovered: null, isolatedId: null, lobeMix: 0,
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
  if (state.colorMode === 'function') return FN_COLORS[info.fn];
  if (state.colorMode === 'atlas') return info.group === 'sympathetic' ? '#3ddc84' : info.group === 'parasympathetic' ? '#c084fc' : '#f4d35e';
  return GROUP_COLORS[info.group];
}

/** Visual role of each structure: focus | dim | context | ghost | hidden */
function roleOf(st) {
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
  for (const st of structs.values()) {
    const role = roleOf(st);
    st.role = role;
    const visible = role !== 'hidden';
    st.meshes.forEach((m) => { m.visible = visible; });
    if (st.kind === 'nerve') {
      st.u.uColor.value.set(colorFor(st));
      const op = { focus: 1, dim: 0.32, ghost: 0.06, context: 0.2 }[role] ?? 0;
      st.targetOpacity = op;
      st.u.uPulse.value = state.signals && role === 'focus' ? 1 : 0;
      st.meshes.forEach((m) => { m.material.depthWrite = role === 'focus'; m.renderOrder = role === 'focus' ? 2 : 1; });
    } else {
      const ctx = st.kind === 'organ' ? 0.06 : st.key === 'cerebrum' ? (state.filter === 'deep' || state.isolatedId ? 0.08 : 0.16) : 0.2;
      st.materials.forEach((m, i) => {
        const base = st.base[i].opacity;
        const sacLike = st.meshes[i]?.userData.baseOpacity;
        const target = role === 'focus' ? (sacLike ?? base) : Math.min(ctx, sacLike ?? 1);
        m.userData.targetOpacity = target;
        m.depthWrite = role === 'focus' && target > 0.9;
      });
    }
    if (st.label) st.labelWanted = state.labels && role === 'focus' && (state.isolatedId ? st.id === state.isolatedId : (state.filter === 'all' ? OVERVIEW_LABELS.has(st.key) : true));
  }
  if (state.selected?.label) state.selected.labelWanted = state.labels;
  skin.visible = state.skin;
  skeleton.visible = state.skeleton;
  state.lobeTarget = state.filter === 'lobes' ? 1 : 0;
  renderLegend();
  renderList();
}

/* ================================================================== UI */
function renderFilters() {
  const wrap = $('#filters');
  wrap.innerHTML = '';
  for (const g of FILTER_GROUPS) {
    const sec = document.createElement('section');
    sec.className = 'fgroup';
    sec.innerHTML = `<h3 class="eyebrow">${g.title}</h3>`;
    const row = document.createElement('div');
    row.className = 'chips';
    for (const it of g.items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.id = `filter-${it.id}`;
      b.textContent = it.label;
      b.setAttribute('aria-pressed', String(state.filter === it.id));
      b.addEventListener('click', () => setFilter(it.id));
      row.appendChild(b);
    }
    sec.appendChild(row);
    wrap.appendChild(sec);
  }
}

function setFilter(id, { fly = true } = {}) {
  state.filter = id;
  state.isolatedId = null;
  store.set('filter', id);
  document.querySelectorAll('#filters .chip').forEach((b) => b.setAttribute('aria-pressed', String(b.id === `filter-${id}`)));
  $('#filter-note').textContent = FILTER_NOTES[id] ?? '';
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
    const k = st.key === 'cerebrum' ? 'cerebrum' : st.key;
    if (seen.has(k)) continue;
    const info = st.key === 'cerebrum' ? { name: 'Cerebrum (4 lobes)', short: 'Cerebral hemispheres', group: 'cns', fn: 'cns', latin: 'Cerebrum' } : st.info;
    const hay = `${info.name} ${info.latin} ${info.short}`.toLowerCase();
    if (q && !hay.includes(q)) continue;
    seen.set(k, { st, info });
  }
  const items = [...seen.values()].sort((a, b) => GROUP_ORDER.indexOf(a.info.group) - GROUP_ORDER.indexOf(b.info.group));
  list.innerHTML = '';
  $('#list-count').textContent = `${items.length} structure${items.length === 1 ? '' : 's'}`;
  if (!items.length) {
    list.innerHTML = '<li class="empty">No structure matches that search in this filter. Try "Complete system".</li>';
    return;
  }
  let lastGroup = null;
  for (const { st, info } of items) {
    if (info.group !== lastGroup) {
      const h = document.createElement('li');
      h.className = 'list-head';
      h.textContent = GROUP_LABELS[info.group] ?? info.group;
      list.appendChild(h);
      lastGroup = info.group;
    }
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'item';
    if (state.selected && (state.selected.key === st.key)) b.classList.add('active');
    const col = st.kind === 'nerve' ? colorFor(st) : st.kind === 'deep' ? `#${st.materials[0].color.getHexString()}` : GROUP_COLORS[info.group];
    b.innerHTML = `<span class="dot" style="--c:${col}"></span><span class="iname">${info.name}</span><span class="ishort">${info.short ?? ''}</span>`;
    b.addEventListener('click', () => select(st.id, { fly: true }));
    li.appendChild(b);
    list.appendChild(li);
  }
}

function renderLegend() {
  const el = $('#legend');
  let entries;
  if (state.colorMode === 'function') entries = ['motor', 'sensory', 'mixed', 'special', 'autonomic'].map((k) => [FN_COLORS[k], FN_LABELS[k]]);
  else if (state.colorMode === 'atlas') entries = [['#f4d35e', 'Somatic nerves'], ['#3ddc84', 'Sympathetic'], ['#c084fc', 'Parasympathetic']];
  else entries = ['cranial', 'cervical', 'brachial', 'thoracic', 'spinal', 'lumbar', 'sacral', 'sympathetic', 'parasympathetic'].map((k) => [GROUP_COLORS[k], GROUP_LABELS[k]]);
  if (state.filter === 'lobes') entries = [['#4f8ff7', 'Frontal'], ['#f5c84b', 'Parietal'], ['#3ccf8e', 'Temporal'], ['#f2665c', 'Occipital']];
  el.innerHTML = entries.map(([c, l]) => `<span class="lg"><i style="--c:${c}"></i>${l}</span>`).join('') +
    (state.signals && state.filter !== 'lobes' ? '<span class="lg flow">Pulses: motor → outward · sensory → inward</span>' : '');
}

function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function listHTML(title, arr) {
  if (!arr || !arr.length) return '';
  return `<section class="isec"><h4 class="eyebrow">${title}</h4><ul class="blist">${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>`;
}
function renderInfo(st, info, note) {
  const panel = $('#info');
  const sideTxt = st.side ? (st.side === 'L' ? 'Left' : 'Right') : '';
  const col = st.kind === 'nerve' ? colorFor(st) : st.kind === 'deep' ? `#${st.materials[0].color.getHexString()}` : GROUP_COLORS[info.group];
  panel.style.setProperty('--sel', col);
  $('#info-body').innerHTML = `
    <div class="ihead">
      <div class="badges">
        <span class="badge fn" style="--c:${FN_COLORS[info.fn]}">${FN_LABELS[info.fn]}</span>
        ${info.short ? `<span class="badge">${esc(info.short)}</span>` : ''}
        ${sideTxt ? `<span class="badge ghost">${sideTxt} side</span>` : ''}
      </div>
      <h2 id="info-title">${esc(info.name)}</h2>
      <p class="latin">${esc(info.latin)}</p>
    </div>
    ${note ? `<p class="note">${esc(note)}</p>` : ''}
    <p class="summary">${esc(info.summary)}</p>
    ${info.facts?.length ? `<dl class="facts">${info.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    ${info.course ? `<section class="isec"><h4 class="eyebrow">Course</h4><p>${esc(info.course)}</p></section>` : ''}
    ${listHTML('Motor supply', info.motor)}
    ${listHTML('Sensory supply', info.sensory)}
    ${listHTML(st.kind === 'nerve' ? 'Branches & components' : 'Parts & functional areas', info.branches)}
    ${info.clinical ? `<section class="isec clinical"><h4 class="eyebrow">Clinical correlation</h4><p>${esc(info.clinical)}</p></section>` : ''}
    ${info.test ? `<section class="isec"><h4 class="eyebrow">How it is examined</h4><p>${esc(info.test)}</p></section>` : ''}
    ${info.fact ? `<section class="isec fact"><h4 class="eyebrow">Remember</h4><p>${esc(info.fact)}</p></section>` : ''}
  `;
  $('#btn-isolate').textContent = state.isolatedId === st.id ? 'Show filter again' : 'Isolate';
  panel.hidden = false;
  document.body.classList.add('has-info');
  $('#info-body').scrollTop = 0;
}

/* ============================================================ selection */
let halos = [];
function clearHalos() { halos.forEach((h) => { h.geometry.dispose(); scene.remove(h); }); halos = []; }
const haloUniforms = { uColor: { value: new THREE.Color() }, uTime: sharedUniforms.uTime, uOpacity: { value: 0 } };
const haloMat = new THREE.ShaderMaterial({ uniforms: haloUniforms, vertexShader: NERVE_VERT, fragmentShader: HALO_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

function resolveInfo(st, point) {
  if (st.key === 'cerebrum' && point) {
    const local = point.clone().sub(BRAIN_CENTER);
    const lobe = classifyLobe(Math.abs(local.x), local.y, local.z);
    return { info: INFO[`lobe-${lobe}`], note: null };
  }
  if (st.key === 'cerebrum') return { info: INFO['lobe-frontal'], note: 'Click directly on a lobe to read about it.' };
  if (st.key === 'brainstem') return { info: INFO[point ? brainstemPart(point.y) : 'pons'] };
  if (st.key === 'spinal-cord' && point) {
    let best = 'C1', bd = 1e9;
    for (const [lvl, y] of Object.entries(SEGMENT_Y)) { const d = Math.abs(y - point.y); if (d < bd) { bd = d; best = lvl; } }
    let vert = 'C1', vd = 1e9;
    for (const [v, y] of Object.entries(VY)) { const d = Math.abs(y - point.y); if (d < vd) { vd = d; vert = v; } }
    return { info: INFO['spinal-cord'], note: `You clicked cord segment ≈ ${best}, which lies at about vertebral level ${vert}.` };
  }
  return { info: st.info };
}

function select(id, { point = null, fly = false } = {}) {
  const st = structs.get(id);
  if (!st) return;
  if (state.selected && state.selected !== st) unmarkSelected(state.selected);
  state.selected = st;
  const { info, note } = resolveInfo(st, point);
  renderInfo(st, info, note);
  clearHalos();
  if (st.kind === 'nerve') {
    st.u.uSelected.value = 1;
    haloUniforms.uColor.value.set(colorFor(st));
    for (const { curve, rfn } of st.pathData) {
      const h = new THREE.Mesh(taperedTube(curve, { radius: (t) => rfn(t) * 3.2 + 0.012, radial: 12 }), haloMat);
      h.renderOrder = 5;
      scene.add(h);
      halos.push(h);
    }
  } else {
    st.materials.forEach((m) => { m.userData.uniforms.uRim.value = 1.6; });
  }
  applyVisuals();
  if (fly) frameBox(st.box, null, 1.6);
  else retarget(point ?? st.box.getCenter(new THREE.Vector3()));
}

function unmarkSelected(st) {
  if (st.kind === 'nerve') st.u.uSelected.value = 0;
  else st.materials.forEach((m, i) => { m.userData.uniforms.uRim.value = st.base[i].rim; });
}

function deselect() {
  if (!state.selected) return;
  unmarkSelected(state.selected);
  state.selected = null;
  state.isolatedId = null;
  clearHalos();
  $('#info').hidden = true;
  document.body.classList.remove('has-info');
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

function pick(clientX, clientY) {
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const candidates = pickables.filter((m) => {
    const st = m.userData.struct;
    return st.role === 'focus' || st.role === 'dim' || (st.role === 'context' && st.kind !== 'organ');
  });
  const hits = raycaster.intersectObjects(candidates, false);
  if (!hits.length) return null;
  // prefer focused nerves over context tissue when both are close to the ray
  const best = hits.find((h) => h.object.userData.struct.role === 'focus') ?? hits[0];
  const focusTissue = hits[0].object.userData.struct;
  const chosen = focusTissue.role === 'focus' && focusTissue.kind !== 'nerve' && best.distance - hits[0].distance > 0.25 ? hits[0] : best;
  return { st: chosen.object.userData.struct, point: chosen.point };
}

let hoverQueued = null;
renderer.domElement.addEventListener('pointermove', (e) => {
  hoverQueued = { x: e.clientX, y: e.clientY };
  tip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
});
renderer.domElement.addEventListener('pointerleave', () => { hoverQueued = null; setHover(null); tip.hidden = true; });
function processHover() {
  if (!hoverQueued || dragging) return;
  const { x, y } = hoverQueued;
  hoverQueued = null;
  const hit = pick(x, y);
  setHover(hit?.st ?? null);
  if (hit) {
    const info = resolveInfo(hit.st, hit.point).info;
    tip.innerHTML = `<b>${esc(info.name)}</b><span>${esc(info.short ?? '')}${hit.st.side ? ` · ${hit.st.side === 'L' ? 'left' : 'right'}` : ''}</span>`;
    tip.hidden = false;
  } else tip.hidden = true;
}

let downAt = null, dragging = false;
renderer.domElement.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY, t: performance.now() }; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  downAt = null;
  if (moved > 6) return;
  const hit = pick(e.clientX, e.clientY);
  if (hit) select(hit.st.id, { point: hit.point });
  else deselect();
});
controls.addEventListener('start', () => { dragging = true; tween = null; });
controls.addEventListener('end', () => { dragging = false; });

/* =============================================================== camera */
let tween = null;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function flyTo(pos, target, dur = 1.6) {
  if (reduceMotion) dur = 0.01;
  tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: target.clone(), start: performance.now(), dur: dur * 1000 };
}
function retarget(target) {
  const offset = camera.position.clone().sub(controls.target);
  flyTo(target.clone().add(offset), target, 0.9);
}
function frameBox(box, dir, dur = 1.8) {
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.length() / 2, 0.7);
  const aspect = camera.aspect;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fitH = radius / Math.sin(fov / 2);
  const fitW = radius / Math.sin(Math.atan(Math.tan(fov / 2) * aspect));
  const dist = Math.max(fitH, fitW) * 1.15 + 0.3;
  const d = (dir ?? camera.position.clone().sub(controls.target)).clone().normalize();
  // keep subject clear of side panels
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
function setView(name) {
  const [p, t] = VIEWS[name];
  flyTo(new THREE.Vector3(...p), new THREE.Vector3(...t), 1.8);
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
bindToggle('t-labels', 'labels');
bindToggle('t-signals', 'signals');
bindToggle('t-rotate', 'rotate', () => { controls.autoRotate = state.rotate; });
bindToggle('t-isolate', 'isolate');
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
const colorSel = $('#color-mode');
colorSel.value = state.colorMode;
colorSel.addEventListener('change', () => { state.colorMode = colorSel.value; store.set('colorMode', state.colorMode); applyVisuals(); if (state.selected) select(state.selected.id); });
$('#search').addEventListener('input', renderList);
$('#btn-close').addEventListener('click', deselect);
$('#btn-focus').addEventListener('click', () => state.selected && frameBox(state.selected.box, null, 1.4));
$('#btn-isolate').addEventListener('click', () => {
  if (!state.selected) return;
  state.isolatedId = state.isolatedId === state.selected.id ? null : state.selected.id;
  $('#btn-isolate').textContent = state.isolatedId ? 'Show filter again' : 'Isolate';
  applyVisuals();
  if (state.isolatedId) frameBox(state.selected.box, null, 1.4);
});
$('#btn-panel').addEventListener('click', () => document.body.classList.toggle('panel-open'));
window.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select')) return;
  if (e.key === 'Escape') deselect();
  if (e.key === 'f' && state.selected) frameBox(state.selected.box, null, 1.4);
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

let frameNo = 0;
let viewShift = 0, viewShiftY = 0;
function updateViewOffset(dt) {
  const w = host.clientWidth, h = host.clientHeight;
  let target = 0;
  if (w > 860 && document.body.classList.contains('ready')) {
    const left = $('#panel').getBoundingClientRect().right;
    const right = document.body.classList.contains('has-info') ? w - $('#info').getBoundingClientRect().left : 0;
    target = (left - right) / 2;
  }
  let targetY = 0;
  if (w <= 860 && document.body.classList.contains('has-info')) targetY = ($('#info').getBoundingClientRect().height) / 2 + 20;
  const k = 1 - Math.pow(0.002, dt);
  viewShift += (target - viewShift) * k;
  viewShiftY += (targetY - viewShiftY) * k;
  if (Math.abs(viewShift) < 0.5 && Math.abs(viewShiftY) < 0.5 && target === 0 && targetY === 0) { if (camera.view?.enabled) camera.clearViewOffset(); return; }
  camera.setViewOffset(w, h, -viewShift, viewShiftY, w, h);
}
const labelBox = [];
function cullLabels() {
  const w = host.clientWidth, h = host.clientHeight;
  const cand = [];
  for (const st of structs.values()) {
    if (!st.label || !st.labelWanted) continue;
    tmpV.copy(st.label.position).project(camera);
    if (tmpV.z > 1) { st.label.element.style.visibility = 'hidden'; continue; }
    const x = (tmpV.x * 0.5 + 0.5) * w - viewShift * 0, y = (-tmpV.y * 0.5 + 0.5) * h;
    const pr = st === state.selected ? 3 : st === state.hovered ? 2 : OVERVIEW_LABELS.has(st.key) ? 1 : 0;
    cand.push({ st, x, y, pr, wd: st.label.element.textContent.length * 6.6 + 18 });
  }
  cand.sort((a, b) => b.pr - a.pr || a.y - b.y);
  labelBox.length = 0;
  for (const c of cand) {
    const r = { l: c.x + 8, r: c.x + 8 + c.wd, t: c.y - 10, b: c.y + 10 };
    const hit = labelBox.some((o) => r.l < o.r && r.r > o.l && r.t < o.b && r.b > o.t);
    c.st.label.element.style.visibility = hit ? 'hidden' : '';
    if (!hit) labelBox.push(r);
  }
}
const clock = new THREE.Clock();
const heart = structs.get('heart')?.meshes[0];
const heartBase = heart?.scale.clone();
const tmpV = new THREE.Vector3();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  sharedUniforms.uTime.value = t;
  if (tween) {
    const k = Math.min(1, (performance.now() - tween.start) / tween.dur);
    const e = ease(k);
    camera.position.lerpVectors(tween.p0, tween.p1, e);
    controls.target.lerpVectors(tween.t0, tween.t1, e);
    if (k >= 1) tween = null;
  }
  controls.update();
  const fade = 1 - Math.pow(0.0015, dt);
  for (const st of structs.values()) {
    if (st.kind === 'nerve') {
      st.u.uOpacity.value += ((st.targetOpacity ?? 1) - st.u.uOpacity.value) * fade;
    } else {
      st.materials.forEach((m) => { const tgt = m.userData.targetOpacity ?? 1; m.opacity += (tgt - m.opacity) * fade; });
    }
    if (st.label) {
      st.label.visible = !!st.labelWanted;
    }
  }
  state.lobeMix += ((state.lobeTarget ?? 0) - state.lobeMix) * fade;
  for (const side of ['L', 'R']) structs.get(`cerebrum-${side}`).materials[0].userData.uniforms.uLobeMix.value = state.lobeMix;
  haloUniforms.uOpacity.value += ((state.selected?.kind === 'nerve' ? 1 : 0) - haloUniforms.uOpacity.value) * fade;
  if (heart) {
    const beat = 1 + 0.045 * Math.pow(Math.max(0, Math.sin(t * 7.3)), 12) + 0.025 * Math.pow(Math.max(0, Math.sin(t * 7.3 - 0.9)), 10);
    heart.scale.copy(heartBase).multiplyScalar(beat);
  }
  updateViewOffset(dt);
  if ((frameNo++ & 3) === 0) cullLabels();
  processHover();
  composer.render();
  labelRenderer.render(scene, camera);
  requestAnimationFrame(frame);
}

/* ================================================================ boot */
renderFilters();
$('#filter-note').textContent = FILTER_NOTES[state.filter] ?? '';
applyVisuals();
const stats = { nerves: [...structs.values()].filter((s) => s.kind === 'nerve').length };
$('#stat-count').textContent = `${stats.nerves}`;
requestAnimationFrame(frame);
document.body.classList.add('loaded');
if (reduceMotion) {
  endIntro();
  const [p, tg] = VIEWS.body;
  camera.position.set(...p); controls.target.set(...tg);
} else {
  setTimeout(() => flyTo(new THREE.Vector3(...VIEWS.body[0]), new THREE.Vector3(...VIEWS.body[1]), 5.2), 700);
  setTimeout(endIntro, 4200);
}
if (state.filter !== 'all') setTimeout(() => frameFilter(state.filter), reduceMotion ? 0 : 6200);

// expose for debugging / screenshots
window.__neuromap = { structs, select, setFilter, setView, state, camera, controls, deselect };
