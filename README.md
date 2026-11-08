# Neuromap — 3D Nervous System Atlas

**Live preview:** https://qureshi313737.github.io/Nervsyst/

An interactive, cinematic 3D model of the human nervous system, built for learning.
Every nerve, brain region and spinal segment is clickable and opens a detailed
anatomical dossier: origin, course, motor and sensory supply, branches, clinical
correlation, how it is examined, and a memory aid.

Functionality is deliberately simple (filter → look → click → read) so the focus
stays on the anatomy.

## Run it

It is a static site with no build step. ES modules need an HTTP server (opening
`index.html` directly from disk will not work):

```bash
cd Nervsyst
python3 -m http.server 8000
# open http://localhost:8000
```

The live preview is deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`. Any other static host works too. Three.js r170 loads from
the jsDelivr CDN, so the first load needs internet access.

## What is modelled

| System | Structures |
| --- | --- |
| **Brain** | Both cerebral hemispheres with procedural gyri, central and lateral sulci; click to identify frontal, parietal, temporal or occipital lobe. Cerebellum with folia, brainstem (click the midbrain, pons or medulla) |
| **Deep brain** | Thalamus, hypothalamus + pituitary + mammillary bodies, corpus callosum, caudate nucleus, lentiform nucleus, hippocampus + fornix, amygdala |
| **Spinal cord** | Cervical and lumbosacral enlargements, conus medullaris at L1–L2, filum terminale, dural sac. Clicking the cord reports the segment and the vertebral level it lies at |
| **Spinal nerves** | All 31 pairs (C1–Co1) with dorsal root ganglia, dorsal rami, and lumbar/sacral roots descending as the cauda equina. Each has its dermatome, myotome and reflex |
| **Cranial nerves** | I–XII, including optic tract/radiation, the three trigeminal divisions, five facial branches + chorda tympani + greater petrosal, and both recurrent laryngeal nerves (left under the aortic arch, right under the subclavian) |
| **Cervical plexus** | Lesser occipital, great auricular, transverse cervical, supraclavicular, phrenic (to the diaphragm), greater occipital |
| **Brachial plexus** | Roots → upper/middle/lower trunks → divisions → lateral/posterior/medial cords → musculocutaneous, axillary, radial (+ superficial branch and posterior interosseous), median (with the "M"), ulnar, long thoracic, suprascapular, thoracodorsal |
| **Thoracic** | Intercostal nerves T1–T11 + subcostal T12 following the ribs, with lateral cutaneous branches and the intercostobrachial nerve |
| **Lumbar plexus** | Iliohypogastric, ilioinguinal, genitofemoral, lateral femoral cutaneous, femoral (with quadriceps branches), saphenous, obturator |
| **Sacral plexus** | Lumbosacral trunk, sciatic, tibial (+ medial/lateral plantar), common fibular, deep and superficial fibular, sural, superior and inferior gluteal, posterior femoral cutaneous, pudendal |
| **Autonomic** | Sympathetic trunks with cervical, stellate, thoracic, lumbar and sacral ganglia meeting at the ganglion impar; rami communicantes; greater splanchnic to the coeliac ganglion; pelvic splanchnic nerves; vagus |
| **Context** | Holographic skin, ghost skeleton (vertebrae, ribs, costal cartilages, sternum, girdles, limb bones), eyes, inner ear, beating heart, diaphragm |

## Using it

- **Filters** (left panel): Systems, Plexuses, Brain, Function (motor / sensory / mixed) and Region. Matching structures stay lit, everything else ghosts out, and the camera flies to frame them.
- **Click** any nerve or brain part to open its dossier. **Focus** frames it; **Isolate** hides everything except it and the CNS.
- **Search** the structure list by English or Latin name or by root level ("median", "nervus", "L5").
- **Colour** modes:
  - *Systems* colours each plexus differently.
  - *Function* uses red for motor, blue for sensory, violet for mixed and teal for special sensory.
  - *Classic atlas* uses textbook yellow for nerves and green/violet for the autonomic divisions.
- **Signals**: light pulses travel along the nerves in their physiological direction. They move away from the CNS in motor (efferent) nerves and toward it in sensory (afferent) nerves, and both ways in mixed nerves.
- Toolbar: camera presets (Body, Head, Spine, Arm, Leg), layer toggles (skin, skeleton, organs, labels, signals, auto-rotate) and **Hide others**.
- Keyboard: `Esc` closes the dossier, `F` focuses the selected structure.

## Project layout

```
index.html        UI shell and import map
css/style.css     Interface styling
js/main.js        Renderer, post-processing (bloom, grade), filters, picking, UI
js/anatomy.js     Landmarks, spinal levels and every nerve's 3D path
js/body.js        Skin, skeleton, organs, brain, brainstem and cord meshes
js/geometry.js    Noise, tapered tubes, lofts, procedural brain and cerebellum
js/info.js        Knowledge base: every structure's anatomy and clinical notes
```

To add a nerve, add a path in `buildNerves()` in `js/anatomy.js` and an entry with the same key in `INFO` in `js/info.js`. Paths run from proximal to distal so that the signal pulses point the right way.

## Accuracy note

All geometry is procedural (no scanned models), scaled to a ~175 cm adult with
1 unit ≈ 10 cm. Courses, relations and levels follow standard anatomy texts, but
the model is a teaching schematic. Nerve diameters are exaggerated for visibility
and positions are approximate. Check details that matter clinically against a
reference atlas.
