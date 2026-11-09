// Micro levels of organisation:
//  1. Inside a peripheral nerve: epineurium → perineurium → fascicles → myelinated
//     and unmyelinated fibres, with saltatory conduction along one axon.
//  2. A spinal motor neuron and its neuromuscular junction, with an animated
//     cycle: synaptic input → action potential → transmitter release → contraction.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { taperedTube, smoothCurve, smoothstep, clamp } from './geometry.js';
import { tissueMaterial, sharedUniforms } from './body.js';
import { glowSprite } from './tours.js';

const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

function baseScene(env) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#040910');
  scene.fog = new THREE.FogExp2('#040910', 0.018);
  scene.environment = env;
  scene.environmentIntensity = 0.32;
  scene.add(new THREE.HemisphereLight('#a9d2ff', '#1b0f18', 0.45));
  const key = new THREE.DirectionalLight('#fff1e0', 1.35); key.position.set(6, 10, 8); scene.add(key);
  const rim = new THREE.DirectionalLight('#5aa8ff', 1.1); rim.position.set(-8, 4, -10); scene.add(rim);
  const fill = new THREE.DirectionalLight('#ff8fb8', 0.3); fill.position.set(4, -6, 6); scene.add(fill);
  // drifting particles (extracellular fluid)
  const N = 500, pos = new Float32Array(N * 3), r = rng(7);
  for (let i = 0; i < N; i++) pos.set([(r() - 0.5) * 30, (r() - 0.5) * 16, (r() - 0.5) * 16], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#6fb6ff', size: 0.05, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(pts);
  scene.userData.drift = pts;
  return scene;
}

function mat(color, { opacity = 1, rim = color, rimStrength = 0.5, emissive = '#000000', emissiveIntensity = 0, roughness = 0.55, side = THREE.FrontSide } = {}) {
  const m = tissueMaterial({ color, rim, rimStrength, emissive, emissiveIntensity, roughness });
  m.opacity = opacity;
  m.depthWrite = opacity > 0.95;
  m.side = side;
  return m;
}
const tag = (mesh, key) => { mesh.userData.micro = key; return mesh; };

/* ================================================================ nerve */
export function buildNerveScene(env) {
  const scene = baseScene(env);
  const picks = [];
  const labels = [];
  const add = (mesh, key) => { scene.add(tag(mesh, key)); picks.push(mesh); return mesh; };
  const R = 2.1;

  // epineurium sleeve + cut face
  const epiMat = mat('#b88c69', { opacity: 0.94, rim: '#ffb98a', rimStrength: 0.32, roughness: 0.85 });
  const sleeve = new THREE.CylinderGeometry(R, R, 7, 96, 1, true);
  sleeve.rotateZ(-Math.PI / 2); sleeve.translate(-3.5, 0, 0);
  add(new THREE.Mesh(sleeve, epiMat), 'epineurium');
  const faceMat = mat('#b88f70', { roughness: 0.95, rim: '#ffcfa8', rimStrength: 0.15 });
  const face = new THREE.CircleGeometry(R, 96); face.rotateY(Math.PI / 2);
  add(new THREE.Mesh(face, faceMat), 'epineurium');
  labels.push(['epineurium', v3(-4.2, R + 0.05, 0.6)]);

  // vasa nervorum on the epineurium
  const vesselMat = mat('#c8243a', { rim: '#ff6b81', rimStrength: 0.7, emissive: '#5a0010', emissiveIntensity: 0.3, roughness: 0.35 });
  [0.9, 2.6, 4.4].forEach((a0, k) => {
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const x = -7 + i * 0.5;
      const a = a0 + Math.sin(i * 0.7 + k) * 0.12;
      pts.push([x, Math.sin(a) * (R + 0.04), Math.cos(a) * (R + 0.04)]);
    }
    const a = a0 + Math.sin(14 * 0.7 + k) * 0.12;
    pts.push([0.04, Math.sin(a) * (R - 0.15), Math.cos(a) * (R - 0.15)], [0.05, Math.sin(a + 0.3) * 1.75, Math.cos(a + 0.3) * 1.75]);
    add(new THREE.Mesh(taperedTube(smoothCurve(pts), { radius: (t) => 0.075 - 0.025 * t, radial: 10 }), vesselMat), 'vasa');
    if (k === 0) labels.push(['vasa', v3(-2.2, Math.sin(a0) * (R + 0.1), Math.cos(a0) * (R + 0.1))]);
  });

  // fascicles
  const fascicles = [{ y: 0, z: 0, r: 0.62, end: 3.6, main: true }];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.26;
    fascicles.push({ y: Math.sin(a) * 1.3, z: Math.cos(a) * 1.3, r: k % 2 ? 0.42 : 0.5, end: 1.1 + (k % 3) * 0.35 });
  }
  const periMat = mat('#c48c78', { opacity: 0.88, rim: '#ffb5a0', rimStrength: 0.45, side: THREE.DoubleSide });
  const periMain = mat('#c48c78', { opacity: 0.38, rim: '#ffb5a0', rimStrength: 0.6, side: THREE.DoubleSide });
  const capMat = mat('#d7b3a0', { roughness: 0.95, rim: '#ffd9c8', rimStrength: 0.15 });
  const myelinDots = [], axonDots = [];
  const r = rng(42);
  for (const f of fascicles) {
    const g = new THREE.CylinderGeometry(f.r, f.r, f.end, 64, 1, true);
    g.rotateZ(-Math.PI / 2); g.translate(f.end / 2, f.y, f.z);
    add(new THREE.Mesh(g, f.main ? periMain : periMat), 'perineurium');
    const cap = new THREE.CircleGeometry(f.r * 0.985, 48); cap.rotateY(Math.PI / 2); cap.translate(f.end, f.y, f.z);
    add(new THREE.Mesh(cap, capMat), f.main ? 'endoneurium' : 'fascicle');
    // fibre cross-sections on the cap
    const n = Math.round((f.r / 0.13) ** 2 * 0.9);
    for (let i = 0; i < n; i++) {
      const rr = Math.sqrt(r()) * (f.r - 0.09), aa = r() * Math.PI * 2;
      const sz = 0.03 + r() * 0.035;
      const p = v3(f.end + 0.012, f.y + Math.sin(aa) * rr, f.z + Math.cos(aa) * rr);
      myelinDots.push([p, sz]);
      axonDots.push([p.clone().setX(f.end + 0.02), sz * 0.45]);
    }
  }
  labels.push(['perineurium', v3(0.9, fascicles[2].y + fascicles[2].r, fascicles[2].z)]);
  labels.push(['fascicle', v3(fascicles[4].end + 0.05, fascicles[4].y, fascicles[4].z)]);
  labels.push(['endoneurium', v3(3.65, 0.38, 0.3)]);
  const dotGeo = new THREE.CylinderGeometry(1, 1, 0.02, 16); dotGeo.rotateZ(-Math.PI / 2);
  const myelinDot = new THREE.InstancedMesh(dotGeo, mat('#dfe6f2', { rim: '#cfe3ff', rimStrength: 0.25 }), myelinDots.length);
  const axonDot = new THREE.InstancedMesh(dotGeo, mat('#e9a44e', { emissive: '#7a4300', emissiveIntensity: 0.4 }), axonDots.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  myelinDots.forEach(([p, s], i) => myelinDot.setMatrixAt(i, m4.compose(p, q, v3(1, s, s))));
  axonDots.forEach(([p, s], i) => axonDot.setMatrixAt(i, m4.compose(p, q, v3(1.4, s, s))));
  add(myelinDot, 'myelin'); add(axonDot, 'axon');

  // adipocytes in the epineurium (cut face)
  const fat = [];
  for (let i = 0; i < 400 && fat.length < 34; i++) {
    const rr = 0.3 + Math.sqrt(r()) * 1.65, aa = r() * Math.PI * 2;
    const y = Math.sin(aa) * rr, z = Math.cos(aa) * rr;
    const s = 0.1 + r() * 0.1;
    if (rr + s > R - 0.05) continue;
    if (fascicles.some((f) => Math.hypot(f.y - y, f.z - z) < f.r + s + 0.04)) continue;
    if (fat.some(([fy, fz, fs]) => Math.hypot(fy - y, fz - z) < fs + s)) continue;
    fat.push([y, z, s]);
  }
  const fatMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), mat('#d9b44a', { opacity: 0.92, rim: '#fff2a8', rimStrength: 0.4, roughness: 0.3 }), fat.length);
  fat.forEach(([y, z, s], i) => fatMesh.setMatrixAt(i, m4.compose(v3(0.02, y, z), q, v3(s * 0.6, s, s))));
  add(fatMesh, 'fat');
  if (fat.length) labels.push(['fat', v3(0.1, fat[0][0], fat[0][1])]);

  // emerging myelinated axons from the main fascicle
  const axonMat = mat('#ffc978', { emissive: '#8a4a00', emissiveIntensity: 0.5, rim: '#ffe0a8', rimStrength: 0.6 });
  const myelinMat = mat('#c9d4e6', { opacity: 0.94, rim: '#9cc4ff', rimStrength: 0.4, roughness: 0.4 });
  const nodeMat = mat('#59e1ff', { emissive: '#1aa6d6', emissiveIntensity: 1.1, rim: '#9ff0ff', rimStrength: 1 });
  const internodes = [], nodes = [];
  const fibres = [[0, 0.05, 8.8], [0.28, 0.2, 6.6], [-0.3, 0.12, 7.4], [0.12, -0.35, 6.2], [-0.15, -0.3, 7.0], [0.36, -0.15, 5.6], [-0.38, -0.1, 6.0], [0.05, 0.42, 5.9]];
  let specialNodes = null;
  fibres.forEach(([y, z, end], fi) => {
    const len = end - 3.6;
    const ax = new THREE.CylinderGeometry(0.034, 0.034, len, 10); ax.rotateZ(-Math.PI / 2); ax.translate(3.6 + len / 2, y, z);
    add(new THREE.Mesh(ax, axonMat), 'axon');
    const internode = fi === 0 ? 0.62 : 0.5 + (fi % 3) * 0.08, gap = 0.08;
    const ns = [];
    for (let x = 3.62; x + internode < end - 0.15; x += internode + gap) {
      internodes.push([x + internode / 2, y, z, internode]);
      ns.push(v3(x + internode + gap / 2, y, z));
    }
    nodes.push(...ns);
    if (fi === 0) specialNodes = [v3(3.6, y, z), ...ns, v3(end, y, z)];
  });
  const capsule = new THREE.CapsuleGeometry(1, 1, 4, 14); capsule.rotateZ(-Math.PI / 2);
  const myelinSeg = new THREE.InstancedMesh(capsule, myelinMat, internodes.length);
  internodes.forEach(([x, y, z, l], i) => myelinSeg.setMatrixAt(i, m4.compose(v3(x, y, z), q, v3((l - 0.02) / 3, 0.082, 0.082))));
  add(myelinSeg, 'myelin');
  const ring = new THREE.TorusGeometry(0.05, 0.014, 6, 18); ring.rotateY(Math.PI / 2);
  const nodeMesh = new THREE.InstancedMesh(ring, nodeMat, nodes.length);
  nodes.forEach((p, i) => nodeMesh.setMatrixAt(i, m4.compose(p, q, v3(1, 1, 1))));
  add(nodeMesh, 'node');
  labels.push(['axon', v3(8.3, 0.12, 0.05)], ['myelin', v3(4.3, 0.36, 0.2)], ['node', specialNodes[4].clone().add(v3(0, 0.12, 0))]);

  // Remak bundle: thin unmyelinated C fibres in one Schwann cell
  const remakMat = mat('#b9c6dc', { opacity: 0.55, rim: '#d7e4ff', rimStrength: 0.6 });
  const sch = new THREE.CapsuleGeometry(0.12, 1.3, 6, 16); sch.rotateZ(-Math.PI / 2); sch.translate(4.6, -0.32, 0.36);
  add(new THREE.Mesh(sch, remakMat), 'remak');
  const cMat = mat('#ff9a6a', { emissive: '#7a2a00', emissiveIntensity: 0.6 });
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const g = new THREE.CylinderGeometry(0.014, 0.014, 3.2, 6); g.rotateZ(-Math.PI / 2);
    g.translate(3.6 + 1.6, -0.32 + Math.sin(a) * 0.06, 0.36 + Math.cos(a) * 0.06);
    add(new THREE.Mesh(g, cMat), 'remak');
  }
  labels.push(['remak', v3(5.3, -0.45, 0.36)]);

  // saltatory conduction
  const spark = glowSprite('#9ff6ff', 0.42);
  const burst = glowSprite('#ffffff', 0.2);
  const cSpark = glowSprite('#ffb27a', 0.18);
  scene.add(spark, burst, cSpark);
  const update = (t) => {
    const n = specialNodes.length;
    const cyc = (t * 7) % (n + 4);
    const i = Math.min(n - 1, Math.floor(cyc));
    const f = cyc - Math.floor(cyc);
    const a = specialNodes[i], b = specialNodes[Math.min(n - 1, i + 1)];
    spark.position.lerpVectors(a, b, smoothstep(0.55, 1, f));
    spark.visible = cyc < n;
    burst.position.copy(a);
    burst.scale.setScalar(0.15 + (1 - f) * 0.35);
    burst.material.opacity = cyc < n ? 1 - f : 0;
    // a C-fibre impulse crawls along (much slower)
    const ct = (t * 0.25) % 1;
    cSpark.position.set(3.6 + ct * 3.2, -0.32, 0.36);
    scene.userData.drift.rotation.x = t * 0.01;
  };
  return { scene, picks, labels, update, view: { pos: v3(3.6, 4.4, 9.6), target: v3(2.2, 0, 0) } };
}

/* =============================================================== neuron */
export function buildNeuronScene(env) {
  const scene = baseScene(env);
  const picks = [];
  const labels = [];
  const add = (mesh, key) => { scene.add(tag(mesh, key)); picks.push(mesh); return mesh; };
  const S = v3(-6, 0.2, 0);
  const r = rng(11);

  // dendrites (recursive branching) + spines
  const dendDirs = [[-1, 0.3, 0.1], [-0.6, 0.8, 0.35], [-0.45, -0.85, 0.2], [0.1, 0.92, -0.4], [0.25, -0.8, -0.5], [-0.5, 0.1, -0.9], [-0.3, 0.25, 0.95]].map((d) => v3(...d).normalize());
  const dendGeos = [], spines = [], dendCurves = [];
  const branch = (start, dir, len, rad, depth) => {
    const mid = start.clone().add(dir.clone().multiplyScalar(len * 0.5)).add(v3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(len * 0.18));
    const end = start.clone().add(dir.clone().multiplyScalar(len)).add(v3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(len * 0.12));
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    dendGeos.push(taperedTube(curve, { radius: (t) => rad * (1 - 0.38 * t), radial: 10, capEnd: depth >= 2 }));
    if (depth === 0) dendCurves.push(curve);
    if (depth >= 1) for (let k = 0; k < 6; k++) spines.push(curve.getPointAt(0.15 + r() * 0.8).add(v3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(rad * 0.9)));
    if (depth < 3) {
      const axis = v3(r() - 0.5, r() - 0.5, r() - 0.5).cross(dir).normalize();
      for (const sgn of [1, -1]) {
        const d2 = dir.clone().applyAxisAngle(axis, sgn * (0.42 + r() * 0.25)).normalize();
        branch(end, d2, len * 0.68, rad * 0.62, depth + 1);
      }
    }
  };
  dendDirs.forEach((d) => branch(S.clone().add(d.clone().multiplyScalar(0.78)), d, 1.7, 0.15, 0));
  const dendMat = mat('#9a74e0', { rim: '#d9c2ff', rimStrength: 0.55, emissive: '#2d1060', emissiveIntensity: 0.3, roughness: 0.5 });
  add(new THREE.Mesh(mergeGeometries(dendGeos), dendMat), 'dendrite');
  const spineMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 8, 6), dendMat, spines.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = v3(1, 1, 1);
  spines.forEach((p, i) => spineMesh.setMatrixAt(i, m4.compose(p, q, one)));
  add(spineMesh, 'dendrite');
  labels.push(['dendrite', S.clone().add(v3(-2.3, 1.5, 0.5))]);

  // soma pulled toward each dendrite (multipolar shape)
  const somaGeo = new THREE.SphereGeometry(0.95, 64, 48);
  const p = somaGeo.attributes.position, d = v3();
  const pulls = [...dendDirs, v3(1, 0, 0)];
  for (let i = 0; i < p.count; i++) {
    d.fromBufferAttribute(p, i).normalize();
    let k = 0;
    for (const pd of pulls) k = Math.max(k, Math.pow(Math.max(d.dot(pd), 0), 7));
    p.setXYZ(i, ...d.clone().multiplyScalar(0.82 * (1 + 0.32 * k)).toArray());
  }
  somaGeo.computeVertexNormals(); somaGeo.translate(S.x, S.y, S.z);
  const somaMat = mat('#a688e0', { opacity: 0.46, rim: '#e0ccff', rimStrength: 0.75, emissive: '#3b1d7a', emissiveIntensity: 0.2, roughness: 0.35 });
  add(new THREE.Mesh(somaGeo, somaMat), 'soma');
  labels.push(['soma', S.clone().add(v3(0.2, 1.1, 0.4))]);
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.34, 40, 30), mat('#6c4be0', { opacity: 0.92, rim: '#b9a6ff', rimStrength: 0.9, emissive: '#2a1680', emissiveIntensity: 0.4 }));
  nucleus.position.copy(S).add(v3(-0.12, 0.04, 0));
  add(nucleus, 'nucleus');
  const nucleolus = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), mat('#ff86cf', { emissive: '#a0206a', emissiveIntensity: 0.8 }));
  nucleolus.position.copy(nucleus.position).add(v3(0.08, 0.06, 0.12));
  add(nucleolus, 'nucleus');
  labels.push(['nucleus', nucleus.position.clone().add(v3(-0.1, -0.42, 0.2))]);
  const nissl = [];
  while (nissl.length < 80) {
    const dir = v3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    if (dir.x > 0.55) continue;
    nissl.push(S.clone().add(dir.multiplyScalar(0.48 + r() * 0.36)));
  }
  const nisslMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), mat('#2a2196', { emissive: '#120c55', emissiveIntensity: 0.4 }), nissl.length);
  nissl.forEach((pt, i) => nisslMesh.setMatrixAt(i, m4.compose(pt, new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)), v3(0.06, 0.022, 0.045))));
  add(nisslMesh, 'nissl');
  labels.push(['nissl', S.clone().add(v3(-0.55, 0.55, 0.55))]);

  // axon hillock + initial segment
  const hillCurve = smoothCurve([[S.x + 0.82, S.y, 0], [S.x + 1.2, S.y, 0], [S.x + 1.5, S.y, 0]]);
  const hillMat = mat('#c8a8ff', { opacity: 0.85, rim: '#ffe7a3', rimStrength: 0.9 });
  add(new THREE.Mesh(taperedTube(hillCurve, { radius: (t) => 0.36 * (1 - t) ** 1.6 + 0.07, radial: 24, capEnd: false }), hillMat), 'hillock');
  const aisMat = mat('#ffd166', { emissive: '#a46b00', emissiveIntensity: 0.9, rim: '#fff0b0', rimStrength: 1 });
  const ais = smoothCurve([[S.x + 1.5, S.y, 0], [S.x + 2.05, S.y + 0.02, 0]]);
  add(new THREE.Mesh(taperedTube(ais, { radius: () => 0.075, radial: 14, capEnd: false }), aisMat), 'hillock');
  labels.push(['hillock', v3(S.x + 1.5, S.y + 0.42, 0.1)]);

  // axon, myelin internodes with Schwann nuclei, nodes
  const axonCurve = smoothCurve([[S.x + 2.05, S.y + 0.02, 0], [-2, 0.45, 0.2], [0, 0.1, -0.15], [2, -0.3, 0.1], [4, -0.1, 0.25], [6, 0.15, 0], [7.0, 0.05, 0]]);
  const axMat = mat('#ffc978', { emissive: '#7a4100', emissiveIntensity: 0.5, rim: '#ffe0a8', rimStrength: 0.6 });
  add(new THREE.Mesh(taperedTube(axonCurve, { radius: () => 0.07, radial: 12, capEnd: false }), axMat), 'axon');
  const L = axonCurve.getLength();
  const myMat = mat('#c9d4e6', { opacity: 0.95, rim: '#9cc4ff', rimStrength: 0.45, roughness: 0.4 });
  const schMat = mat('#7f9fdc', { emissive: '#1f3b7a', emissiveIntensity: 0.4 });
  const nodeMat = mat('#59e1ff', { emissive: '#1aa6d6', emissiveIntensity: 1.2, rim: '#9ff0ff', rimStrength: 1 });
  const myGeos = [], schGeos = [], nodePts = [], nodeTs = [];
  const IN = 1.22, GAP = 0.14;
  for (let s = 0.12; s + IN < L - 0.35; s += IN + GAP) {
    const pts = [];
    for (let k = 0; k <= 12; k++) pts.push(axonCurve.getPointAt((s + (IN * k) / 12) / L));
    myGeos.push(taperedTube(new THREE.CatmullRomCurve3(pts), { radius: (t) => 0.072 + 0.15 * smoothstep(0, 0.1, t) * smoothstep(1, 0.9, t), radial: 18, capEnd: false }));
    const mid = axonCurve.getPointAt((s + IN / 2) / L);
    const sg = new THREE.SphereGeometry(1, 12, 8); sg.scale(0.22, 0.06, 0.09); sg.translate(mid.x, mid.y + 0.215, mid.z);
    schGeos.push(sg);
    nodeTs.push(Math.min(1, (s + IN + GAP / 2) / L));
    nodePts.push(axonCurve.getPointAt(nodeTs[nodeTs.length - 1]));
  }
  nodePts.pop(); nodeTs.pop();
  add(new THREE.Mesh(mergeGeometries(myGeos), myMat), 'myelin');
  add(new THREE.Mesh(mergeGeometries(schGeos), schMat), 'myelin');
  const ringGeo = new THREE.TorusGeometry(0.085, 0.022, 8, 20);
  nodePts.forEach((np, i) => {
    const ring = new THREE.Mesh(ringGeo, nodeMat);
    ring.position.copy(np);
    ring.lookAt(np.clone().add(axonCurve.getTangentAt(nodeTs[i])));
    add(ring, 'node');
  });
  labels.push(['axon', axonCurve.getPointAt(0.55).add(v3(0, -0.4, 0.2))], ['myelin', axonCurve.getPointAt(0.3).add(v3(0, 0.45, 0))], ['node', nodePts[3].clone().add(v3(0, -0.32, 0))]);

  // recurrent axon collateral
  const n2 = nodePts[1];
  const coll = smoothCurve([n2, n2.clone().add(v3(0.3, 0.7, 0.3)), n2.clone().add(v3(0.2, 1.5, 0.45))]);
  add(new THREE.Mesh(taperedTube(coll, { radius: (t) => 0.035 - 0.012 * t, radial: 8 }), axMat), 'axon');

  // muscle fibre with striations
  const M = v3(9.3, 0, 0);
  const muscleU = { uTime: sharedUniforms.uTime, uFlash: { value: 0 }, uContract: { value: 0 } };
  const muscleMat = new THREE.ShaderMaterial({
    uniforms: muscleU,
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; uniform float uContract;
      void main(){ vP = position; vec3 p = position; p.y *= 1.0 - uContract * 0.06; vec4 mv = modelViewMatrix * vec4(p,1.0); vN = normalize(normalMatrix*normal); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; uniform float uFlash; uniform float uContract;
      void main(){
        float f = 26.0 * (1.0 + uContract * 0.08);
        float band = 0.5 + 0.5 * sin(vP.y * f);
        float zline = smoothstep(0.96, 1.0, abs(sin(vP.y * f * 0.5)));
        vec3 aBand = vec3(0.55, 0.08, 0.14), iBand = vec3(0.95, 0.36, 0.42);
        vec3 col = mix(iBand, aBand, smoothstep(0.35, 0.65, band));
        col = mix(col, vec3(0.25, 0.02, 0.06), zline * 0.6);
        vec3 n = normalize(vN), v = normalize(vV);
        float diff = 0.45 + 0.55 * max(dot(n, normalize(vec3(0.4, 0.7, 0.6))), 0.0);
        float rim = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.5);
        col = col * diff + vec3(1.0, 0.45, 0.55) * rim * 0.6 + vec3(1.0, 0.7, 0.75) * uFlash * 0.5;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mg = new THREE.CylinderGeometry(0.9, 0.9, 9, 64, 60);
  const muscle = new THREE.Mesh(mg, muscleMat);
  muscle.rotation.x = Math.PI / 2;
  muscle.position.copy(M);
  add(muscle, 'muscle');
  labels.push(['muscle', M.clone().add(v3(0.4, 0.95, 2.6))]);
  const nucMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), mat('#5b2a86', { emissive: '#2a0d44', emissiveIntensity: 0.4 }), 12);
  for (let i = 0; i < 12; i++) {
    const a = r() * Math.PI * 2, z = -4 + i * 0.7;
    nucMesh.setMatrixAt(i, m4.compose(v3(M.x + Math.cos(a) * 0.9, Math.sin(a) * 0.9, z), q, v3(0.05, 0.05, 0.22)));
  }
  add(nucMesh, 'muscle');

  // motor end plate + terminal branches + boutons with vesicles
  const plate = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), mat('#7d1f45', { emissive: '#3a0820', emissiveIntensity: 0.6, rim: '#ff7ab0', rimStrength: 0.8 }));
  plate.scale.set(0.07, 0.7, 0.85);
  plate.position.set(M.x - 0.88, 0, 0);
  add(plate, 'nmj');
  labels.push(['nmj', v3(M.x - 0.95, -0.85, 0.6)]);
  const E = axonCurve.getPointAt(1);
  const boutonPos = [[0.45, 0.5], [-0.38, 0.58], [0.32, -0.55], [-0.42, -0.38]].map(([y, z]) => v3(M.x - 0.98, y, z));
  const termGeos = [], termCurves = [];
  for (const b of boutonPos) {
    const c = smoothCurve([E, E.clone().add(v3(0.6, b.y * 0.45, b.z * 0.45)), b.clone().add(v3(-0.22, 0, 0)), b]);
    termCurves.push(c);
    termGeos.push(taperedTube(c, { radius: (t) => 0.05 - 0.02 * t, radial: 10, capEnd: false }));
  }
  add(new THREE.Mesh(mergeGeometries(termGeos), axMat), 'terminal');
  const boutonMat = mat('#ffd36b', { opacity: 0.7, rim: '#fff0b0', rimStrength: 1, emissive: '#8a5a00', emissiveIntensity: 0.4 });
  const vesicles = [];
  for (const b of boutonPos) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), boutonMat);
    m.position.copy(b);
    m.scale.set(0.8, 1, 1);
    add(m, 'terminal');
    for (let k = 0; k < 12; k++) vesicles.push(b.clone().add(v3(r() - 0.6, r() - 0.5, r() - 0.5).multiplyScalar(0.17)));
  }
  labels.push(['terminal', boutonPos[0].clone().add(v3(-0.3, 0.3, 0.2))]);
  const vesMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6), mat('#fff6c8', { emissive: '#ffd000', emissiveIntensity: 0.6 }), vesicles.length);
  vesicles.forEach((pt, i) => vesMesh.setMatrixAt(i, m4.compose(pt, q, one)));
  add(vesMesh, 'terminal');

  // animation: EPSPs → spike → release → contraction (4.4 s loop)
  const epsps = dendCurves.slice(0, 4).map(() => { const s = glowSprite('#c9a2ff', 0.26); scene.add(s); return s; });
  const spike = glowSprite('#9ff6ff', 0.55);
  const trig = glowSprite('#ffe066', 0.2);
  const terms = termCurves.map(() => { const s = glowSprite('#ffe066', 0.3); scene.add(s); return s; });
  const cleft = glowSprite('#ffffff', 0.2);
  scene.add(spike, trig, cleft);
  const route = [v3(S.x + 1.5, S.y, 0), v3(S.x + 2.05, S.y + 0.02, 0), ...nodePts, E];
  const update = (t) => {
    const T = t % 4.4;
    epsps.forEach((s, i) => {
      const k = clamp((T - i * 0.12) / 0.8, 0, 1);
      s.visible = T < 1.0;
      s.position.copy(dendCurves[i].getPointAt(1 - k));
    });
    trig.visible = T > 0.85 && T < 1.25;
    trig.position.copy(route[0]);
    trig.scale.setScalar(0.2 + (T - 0.85) * 1.6);
    const ks = clamp((T - 1.0) / 1.15, 0, 1);
    spike.visible = T > 1.0 && T < 2.2;
    if (spike.visible) {
      const fi = ks * (route.length - 1);
      const i = Math.min(route.length - 2, Math.floor(fi));
      spike.position.lerpVectors(route[i], route[i + 1], smoothstep(0.5, 1, fi - i));
    }
    const kt = clamp((T - 2.15) / 0.4, 0, 1);
    terms.forEach((s, i) => { s.visible = T > 2.15 && T < 2.65; s.position.copy(termCurves[i].getPointAt(kt)); });
    const rel = clamp((T - 2.55) / 0.35, 0, 1);
    boutonMat.emissiveIntensity = 0.4 + (T > 2.55 && T < 3.1 ? 1.6 * (1 - Math.abs(rel * 2 - 1)) : 0);
    cleft.visible = T > 2.6 && T < 3.1;
    cleft.position.set(M.x - 0.9, 0, 0);
    cleft.scale.setScalar(0.3 + rel * 1.6);
    cleft.material.opacity = 1 - rel;
    const c = T > 2.85 ? Math.max(0, 1 - (T - 2.85) / 1.1) : 0;
    muscleU.uFlash.value = c;
    muscleU.uContract.value = c;
    scene.userData.drift.rotation.y = t * 0.008;
  };
  return { scene, picks, labels, update, view: { pos: v3(1.5, 5.5, 13.5), target: v3(1.2, 0.2, 0) } };
}
