// Guided pathway tours: a glowing "signal" travels along real routes through
// the model while the camera tracks it and captions explain each relay.
import * as THREE from 'three';
import { taperedTube } from './geometry.js';

/* ------------------------------------------------------------ tour data */
// Each step: cap {en,hi,ur}, path(h) → Vector3[] | null, dur (s), focus [ids],
// events [[name, 'start'|'end']], color (optional)
export function buildTours(h) {
  return [
    {
      id: 'reflex', color: '#ffd166', dir: [1, 0.15, 0.9],
      title: { en: 'Knee-jerk reflex arc', hi: 'घुटने का झटका (रिफ़्लेक्स आर्क)', ur: 'گھٹنے کا جھٹکا (ریفلیکس آرک)' },
      desc: { en: 'The simplest circuit in the body: one sensory neuron, one synapse, one motor neuron.', hi: 'शरीर का सबसे सरल सर्किट: एक संवेदी न्यूरॉन, एक सिनैप्स, एक मोटर न्यूरॉन।', ur: 'جسم کا سب سے سادہ سرکٹ: ایک حسی نیورون، ایک سائنیپس، ایک حرکی نیورون۔' },
      steps: [
        { dur: 2.2, events: [['flash', 'start']], path: () => h.P([[0.72, 5.02, 0.36], [0.76, 5.6, 0.5], [0.82, 6.3, 0.56]]),
          cap: { en: 'A tap on the patellar tendon suddenly stretches the quadriceps. Muscle spindles inside it fire.', hi: 'पटेलर टेंडन पर हल्की चोट quadriceps को अचानक खींचती है। इसके अंदर के muscle spindles सक्रिय हो जाते हैं।', ur: 'پٹیلر ٹینڈن پر ہلکی ضرب quadriceps کو اچانک کھینچتی ہے۔ اس کے اندر کے muscle spindles فعال ہو جاتے ہیں۔' } },
        { dur: 4.2, focus: ['femoral-L'], path: () => h.cat(h.seg('femoral-L', 2, 1, 0), h.seg('femoral-L', 0, 1, h.near('femoral-L', 0, [0.62, 9.6, 0.1])), h.seg('femoral-L', 1, 1, 0)),
          cap: { en: 'Type Ia sensory fibres, the fastest in the body (about 70–120 m/s), carry the signal up the femoral nerve.', hi: 'Type Ia संवेदी फ़ाइबर, जो शरीर में सबसे तेज़ हैं (लगभग 70–120 m/s), संकेत को femoral nerve से ऊपर ले जाते हैं।', ur: 'Type Ia حسی ریشے، جو جسم میں سب سے تیز ہیں (تقریباً 70–120 m/s)، اشارے کو femoral nerve سے اوپر لے جاتے ہیں۔' } },
        { dur: 4.4, focus: ['sp-L4-L', 'spinal-cord'], events: [['flash', 'end']], path: () => h.cat(h.seg('sp-L4-L', 0, 1, 0), h.P([[0.03, 11.06, h.cz(11.06) - 0.04]])),
          cap: { en: 'Through the L4 spinal nerve and its dorsal root ganglion (the sensory cell body), up the cauda equina, into the dorsal horn.', hi: 'L4 मेरु तंत्रिका और उसके dorsal root ganglion (संवेदी कोशिका-काय) से होकर, cauda equina में ऊपर, dorsal horn में प्रवेश।', ur: 'L4 نخاعی عصب اور اس کے dorsal root ganglion (حسی خلیے کا جسم) سے گزر کر، cauda equina میں اوپر، dorsal horn میں داخل۔' } },
        { dur: 1.8, events: [['synapse', 'end']], path: () => h.P([[0.03, 11.06, h.cz(11.06) - 0.04], [0.036, 11.06, h.cz(11.06)], [0.042, 11.06, h.cz(11.06) + 0.045]]),
          cap: { en: 'ONE synapse: the Ia fibre excites the α-motor neuron in the ventral horn directly. This is a monosynaptic reflex (L3–L4).', hi: 'सिर्फ़ एक सिनैप्स: Ia फ़ाइबर ventral horn के α-motor neuron को सीधे उत्तेजित करता है। यह monosynaptic रिफ़्लेक्स है (L3–L4)।', ur: 'صرف ایک سائنیپس: Ia ریشہ ventral horn کے α-motor neuron کو براہ راست اکساتا ہے۔ یہ monosynaptic ریفلیکس ہے (L3–L4)۔' } },
        { dur: 4.2, color: '#ff5a4e', path: () => h.cat(h.seg('sp-L4-L', 0, 0, 1), h.seg('femoral-L', 1, 0, 1), h.seg('femoral-L', 0, h.near('femoral-L', 0, [0.62, 9.6, 0.1]), 1), h.seg('femoral-L', 2, 0, 1)),
          cap: { en: 'The motor command leaves through the ventral root and runs back down the femoral nerve.', hi: 'मोटर आदेश ventral root से निकलकर femoral nerve से वापस नीचे जाता है।', ur: 'حرکی حکم ventral root سے نکل کر femoral nerve سے واپس نیچے جاتا ہے۔' } },
        { dur: 2.6, events: [['contract', 'start']], path: () => h.P([[0.82, 6.2, 0.55], [0.84, 6.9, 0.6]]),
          cap: { en: 'The quadriceps contracts and the leg kicks; an inhibitory interneuron relaxes the hamstrings (reciprocal inhibition). Absent reflex: L3–L4 root or femoral nerve damage. Brisk reflex: upper motor neuron lesion.', hi: 'Quadriceps सिकुड़ती है और टाँग उछलती है; एक inhibitory interneuron hamstrings को ढीला करता है। रिफ़्लेक्स न हो: L3–L4 जड़ या femoral nerve की चोट। बहुत तेज़ हो: upper motor neuron की क्षति।', ur: 'Quadriceps سکڑتا ہے اور ٹانگ اچھلتی ہے؛ ایک inhibitory interneuron hamstrings کو ڈھیلا کرتا ہے۔ ریفلیکس نہ ہو: L3–L4 جڑ یا femoral nerve کی چوٹ۔ بہت تیز ہو: upper motor neuron کا نقصان۔' } },
      ],
    },
    {
      id: 'motor', color: '#ff5a4e', dir: [0.9, 0.25, 1],
      title: { en: 'Voluntary movement (corticospinal tract)', hi: 'इच्छा से हरकत (कॉर्टिकोस्पाइनल ट्रैक्ट)', ur: 'ارادی حرکت (کارٹیکو اسپائنل ٹریکٹ)' },
      desc: { en: 'Why the left brain moves the right hand: follow a command from cortex to finger.', hi: 'बायाँ दिमाग़ दायाँ हाथ क्यों चलाता है: cortex से उँगली तक एक आदेश का पीछा करें।', ur: 'بایاں دماغ دایاں ہاتھ کیوں چلاتا ہے: cortex سے انگلی تک ایک حکم کا پیچھا کریں۔' },
      steps: [
        { dur: 2.4, events: [['flash', 'start']], path: () => h.P([[0.57, 16.98, -0.05], [0.5, 16.92, -0.06]]),
          cap: { en: 'You decide to move your RIGHT fingers. Upper motor neurons (including giant Betz cells, layer V) fire in the hand area of the LEFT precentral gyrus.', hi: 'आप अपनी दाईं उँगलियाँ हिलाने का फ़ैसला करते हैं। बाएँ precentral gyrus के हाथ वाले हिस्से में upper motor neurons (बड़ी Betz कोशिकाएँ, layer V) फ़ायर करते हैं।', ur: 'آپ اپنی دائیں انگلیاں ہلانے کا فیصلہ کرتے ہیں۔ بائیں precentral gyrus کے ہاتھ والے حصے میں upper motor neurons (بڑے Betz خلیے، layer V) فائر کرتے ہیں۔' } },
        { dur: 3, focus: ['thalamus', 'lentiform', 'caudate'], path: () => h.P([[0.5, 16.92, -0.06], [0.4, 16.78, -0.08], [0.3, 16.62, -0.1], [0.2, 16.45, -0.12]]),
          cap: { en: 'Axons descend through the corona radiata into the posterior limb of the internal capsule, between the thalamus and lentiform nucleus.', hi: 'एक्सॉन corona radiata से होकर internal capsule के posterior limb में उतरते हैं, जो thalamus और lentiform nucleus के बीच है।', ur: 'ایکسون corona radiata سے گزر کر internal capsule کے posterior limb میں اترتے ہیں، جو thalamus اور lentiform nucleus کے درمیان ہے۔' } },
        { dur: 3.2, focus: ['brainstem'], path: () => h.P([[0.2, 16.45, -0.12], [0.12, 16.25, -0.14], [0.08, 16.0, -0.04], [0.05, 15.75, -0.1], [0.04, 15.58, -0.13]]),
          cap: { en: 'Down the cerebral peduncle of the midbrain, through the basilar pons and into the pyramid of the medulla.', hi: 'मिडब्रेन के cerebral peduncle से नीचे, basilar pons से होकर medulla के pyramid में।', ur: 'مڈبرین کے cerebral peduncle سے نیچے، basilar pons سے گزر کر medulla کے pyramid میں۔' } },
        { dur: 2.6, events: [['cross', 'end']], path: () => h.P([[0.04, 15.58, -0.13], [0.02, 15.48, -0.18], [-0.02, 15.4, -0.22], [-0.045, 15.3, -0.25]]),
          cap: { en: 'Pyramidal decussation: about 85–90% of fibres cross to the opposite side here. That is why the left hemisphere controls the right side of the body.', hi: 'Pyramidal decussation: लगभग 85–90% फ़ाइबर यहाँ दूसरी तरफ़ क्रॉस करते हैं। इसीलिए बायाँ गोलार्ध शरीर का दायाँ हिस्सा चलाता है।', ur: 'Pyramidal decussation: تقریباً 85–90% ریشے یہاں دوسری طرف پار کرتے ہیں۔ اسی لیے بایاں نصف کرہ جسم کا دایاں حصہ چلاتا ہے۔' } },
        { dur: 3.4, focus: ['spinal-cord'], path: () => h.cordLine(-0.045, 15.3, 13.95, -0.03),
          cap: { en: 'The fibres descend in the RIGHT lateral corticospinal tract to cord segment C8.', hi: 'फ़ाइबर दाएँ lateral corticospinal tract में C8 खंड तक उतरते हैं।', ur: 'ریشے دائیں lateral corticospinal tract میں C8 حصے تک اترتے ہیں۔' } },
        { dur: 3, focus: ['sp-C8-R'], events: [['synapse', 'start']], path: () => h.cat(h.P([[-0.045, 13.95, h.cz(13.95) - 0.03], [-0.045, 13.94, h.cz(13.94) + 0.03]]), h.seg('sp-C8-R', 0, 0, 1)),
          cap: { en: 'Synapse on the lower motor neuron in the ventral horn. The impulse leaves through the C8 ventral root.', hi: 'Ventral horn के lower motor neuron पर सिनैप्स। आवेग C8 ventral root से बाहर निकलता है।', ur: 'Ventral horn کے lower motor neuron پر سائنیپس۔ تحریک C8 ventral root سے باہر نکلتی ہے۔' } },
        { dur: 6, focus: ['lower-trunk-R', 'medial-cord-R', 'ulnar-R'], events: [['contract', 'end']], path: () => h.cat(h.seg('lower-trunk-R', 0, 0, 1), h.seg('lower-trunk-R', 1, 0, 1), h.seg('medial-cord-R', 0, 0, 1), h.seg('ulnar-R', 0, 0, 1), h.seg('ulnar-R', 3, 0, 1)),
          cap: { en: 'Lower trunk → medial cord → ulnar nerve → the interossei and other intrinsic hand muscles that make fine finger movements.', hi: 'Lower trunk → medial cord → ulnar nerve → interossei और हाथ की दूसरी छोटी मांसपेशियाँ जो उँगलियों की बारीक हरकत करती हैं।', ur: 'Lower trunk ← medial cord ← ulnar nerve ← interossei اور ہاتھ کے دوسرے چھوٹے پٹھے جو انگلیوں کی باریک حرکت کرتے ہیں۔' } },
        { dur: 5, view: 'body', path: null,
          cap: { en: 'Clinical: a stroke in the LEFT internal capsule paralyses the RIGHT side with upper motor neuron signs (spasticity, brisk reflexes, Babinski sign). Damage to the ulnar nerve gives lower motor neuron signs: wasting and weakness.', hi: 'चिकित्सा: बाएँ internal capsule का स्ट्रोक दाएँ हिस्से को लकवा देता है, upper motor neuron लक्षणों के साथ (spasticity, तेज़ रिफ़्लेक्स, Babinski)। Ulnar nerve की चोट lower motor neuron लक्षण देती है: मांस सूखना और कमज़ोरी।', ur: 'طبی نکتہ: بائیں internal capsule کا اسٹروک دائیں حصے میں فالج کرتا ہے، upper motor neuron علامات کے ساتھ (spasticity، تیز ریفلیکس، Babinski)۔ Ulnar nerve کی چوٹ lower motor neuron علامات دیتی ہے: پٹھوں کا سوکھنا اور کمزوری۔' } },
      ],
    },
    {
      id: 'pain', color: '#ff8a3d', dir: [0.8, 0.2, 1],
      title: { en: 'Pain & temperature (spinothalamic tract)', hi: 'दर्द और तापमान (स्पाइनोथैलेमिक ट्रैक्ट)', ur: 'درد اور درجۂ حرارت (اسپائنو تھیلیمک ٹریکٹ)' },
      desc: { en: 'A pinprick on the left thumb reaches the RIGHT brain. Three neurons, crossing early in the cord.', hi: 'बाएँ अंगूठे की चुभन दाएँ दिमाग़ तक पहुँचती है। तीन न्यूरॉन, मेरुरज्जु में जल्दी क्रॉस।', ur: 'بائیں انگوٹھے کی چبھن دائیں دماغ تک پہنچتی ہے۔ تین نیورون، حرام مغز میں جلد پار۔' },
      steps: [
        { dur: 2, events: [['flash', 'start']], path: () => h.P([[2.92, 8.0, 0.08], [2.86, 8.2, 0.04]]),
          cap: { en: 'A pinprick on the back of the LEFT thumb activates free nerve endings (nociceptors).', hi: 'बाएँ अंगूठे के पीछे की चुभन free nerve endings (nociceptors) को सक्रिय करती है।', ur: 'بائیں انگوٹھے کی پشت پر چبھن free nerve endings (nociceptors) کو فعال کرتی ہے۔' } },
        { dur: 5, focus: ['radial-superficial-L', 'radial-L'], path: () => h.cat(h.seg('radial-superficial-L', 1, 1, 0), h.seg('radial-superficial-L', 0, 1, 0), h.seg('radial-L', 0, 1, 0)),
          cap: { en: 'Thin Aδ fibres (sharp, fast pain) and C fibres (dull, slow pain) run up the superficial radial and radial nerves.', hi: 'पतले Aδ फ़ाइबर (तेज़, तुरंत दर्द) और C फ़ाइबर (धीमा, कुंद दर्द) superficial radial और radial nerve से ऊपर जाते हैं।', ur: 'پتلے Aδ ریشے (تیز، فوری درد) اور C ریشے (ہلکا، دیر والا درد) superficial radial اور radial nerve سے اوپر جاتے ہیں۔' } },
        { dur: 4.4, focus: ['posterior-cord-L', 'upper-trunk-L', 'sp-C6-L'], path: () => h.cat(h.seg('posterior-cord-L', 0, 1, 0), h.seg('upper-trunk-L', 2, 1, 0), h.seg('upper-trunk-L', 0, 1, 0), h.seg('sp-C6-L', 0, 1, 0)),
          cap: { en: 'Through the posterior cord and upper trunk into the C6 spinal nerve. The first neuron\'s cell body sits in the dorsal root ganglion.', hi: 'Posterior cord और upper trunk से C6 मेरु तंत्रिका में। पहले न्यूरॉन का कोशिका-काय dorsal root ganglion में है।', ur: 'Posterior cord اور upper trunk سے C6 نخاعی عصب میں۔ پہلے نیورون کا خلیہ dorsal root ganglion میں ہے۔' } },
        { dur: 2.8, focus: ['spinal-cord'], events: [['synapse', 'start'], ['cross', 'end']], path: () => h.P([[0.04, 14.28, h.cz(14.28) - 0.04], [0.02, 14.3, h.cz(14.3)], [-0.03, 14.34, h.cz(14.34) + 0.02], [-0.065, 14.4, h.cz(14.4)]]),
          cap: { en: 'Synapse in the dorsal horn (substantia gelatinosa). The second neuron crosses in the anterior white commissure within one or two segments.', hi: 'Dorsal horn (substantia gelatinosa) में सिनैप्स। दूसरा न्यूरॉन एक-दो खंडों के भीतर anterior white commissure में क्रॉस करता है।', ur: 'Dorsal horn (substantia gelatinosa) میں سائنیپس۔ دوسرا نیورون ایک دو حصوں کے اندر anterior white commissure میں پار کرتا ہے۔' } },
        { dur: 4, focus: ['brainstem'], path: () => h.cat(h.cordLine(-0.065, 14.4, 15.35, 0.01), h.P([[-0.08, 15.6, -0.17], [-0.1, 15.95, -0.1], [-0.12, 16.25, -0.18]])),
          cap: { en: 'It ascends in the RIGHT anterolateral (spinothalamic) tract through the medulla, pons and midbrain.', hi: 'यह दाएँ anterolateral (spinothalamic) tract में medulla, pons और midbrain से ऊपर जाता है।', ur: 'یہ دائیں anterolateral (spinothalamic) tract میں medulla، pons اور midbrain سے اوپر جاتا ہے۔' } },
        { dur: 4, focus: ['thalamus'], events: [['synapse', 'start'], ['flash', 'end']], path: () => h.P([[-0.12, 16.25, -0.18], [-0.12, 16.48, -0.2], [-0.22, 16.62, -0.16], [-0.38, 16.8, -0.16], [-0.53, 16.9, -0.18]]),
          cap: { en: 'Synapse in the thalamus (VPL nucleus); the third neuron projects through the internal capsule to the postcentral gyrus, where the pain is located on the body map.', hi: 'Thalamus (VPL nucleus) में सिनैप्स; तीसरा न्यूरॉन internal capsule से postcentral gyrus तक जाता है, जहाँ शरीर के नक़्शे पर दर्द की जगह पहचानी जाती है।', ur: 'Thalamus (VPL nucleus) میں سائنیپس؛ تیسرا نیورون internal capsule سے postcentral gyrus تک جاتا ہے، جہاں جسم کے نقشے پر درد کی جگہ پہچانی جاتی ہے۔' } },
        { dur: 5, view: 'body', path: null,
          cap: { en: 'Clinical: because this pathway crosses early, cutting one half of the cord (Brown-Séquard syndrome) removes pain and temperature on the OPPOSITE side below the lesion.', hi: 'चिकित्सा: यह मार्ग जल्दी क्रॉस करता है, इसलिए मेरुरज्जु का आधा हिस्सा कटने (Brown-Séquard syndrome) पर चोट के नीचे उलटी तरफ़ दर्द और तापमान ख़त्म हो जाते हैं।', ur: 'طبی نکتہ: یہ راستہ جلد پار کرتا ہے، اس لیے حرام مغز کا آدھا حصہ کٹنے (Brown-Séquard syndrome) پر چوٹ کے نیچے مخالف طرف درد اور حرارت کا احساس ختم ہو جاتا ہے۔' } },
      ],
    },
    {
      id: 'touch', color: '#41c7ff', dir: [0.9, 0.2, -0.9],
      title: { en: 'Fine touch & vibration (dorsal columns)', hi: 'बारीक स्पर्श और कंपन (डॉर्सल कॉलम)', ur: 'باریک لمس اور ارتعاش (ڈورسل کالم)' },
      desc: { en: 'Large fast fibres climb on the SAME side and cross only in the medulla.', hi: 'मोटे तेज़ फ़ाइबर उसी तरफ़ ऊपर चढ़ते हैं और सिर्फ़ medulla में क्रॉस करते हैं।', ur: 'موٹے تیز ریشے اسی طرف اوپر چڑھتے ہیں اور صرف medulla میں پار کرتے ہیں۔' },
      steps: [
        { dur: 2, events: [['flash', 'start']], path: () => h.P([[2.72, 7.42, 0.24], [2.69, 7.7, 0.25]]),
          cap: { en: 'A light touch on the LEFT index fingertip deforms Meissner corpuscles; vibration activates Pacinian corpuscles.', hi: 'बाईं तर्जनी की नोक पर हल्का स्पर्श Meissner corpuscles को दबाता है; कंपन Pacinian corpuscles को सक्रिय करता है।', ur: 'بائیں شہادت کی انگلی کی نوک پر ہلکا لمس Meissner corpuscles کو دباتا ہے؛ ارتعاش Pacinian corpuscles کو فعال کرتا ہے۔' } },
        { dur: 6, focus: ['median-L', 'lateral-cord-L', 'middle-trunk-L', 'sp-C7-L'], path: () => h.cat(h.seg('median-L', 5, 1, 0), h.seg('median-L', 2, 1, 0), h.seg('median-L', 0, 1, 0), h.seg('lateral-cord-L', 0, 1, 0), h.seg('middle-trunk-L', 1, 1, 0), h.seg('middle-trunk-L', 0, 1, 0), h.seg('sp-C7-L', 0, 1, 0)),
          cap: { en: 'Thick Aβ fibres run up the median nerve, lateral cord and middle trunk into the C7 spinal nerve.', hi: 'मोटे Aβ फ़ाइबर median nerve, lateral cord और middle trunk से C7 मेरु तंत्रिका में जाते हैं।', ur: 'موٹے Aβ ریشے median nerve، lateral cord اور middle trunk سے C7 نخاعی عصب میں جاتے ہیں۔' } },
        { dur: 4, focus: ['spinal-cord'], path: () => h.cat(h.P([[0.05, 14.1, h.cz(14.1)]]), h.cordLine(0.035, 14.12, 15.45, -0.055)),
          cap: { en: 'The axon enters the cord and climbs WITHOUT crossing in the dorsal column (fasciculus cuneatus for the arm).', hi: 'एक्सॉन मेरुरज्जु में घुसकर बिना क्रॉस किए dorsal column (बाँह के लिए fasciculus cuneatus) में ऊपर चढ़ता है।', ur: 'ایکسون حرام مغز میں داخل ہو کر پار کیے بغیر dorsal column (بازو کے لیے fasciculus cuneatus) میں اوپر چڑھتا ہے۔' } },
        { dur: 3, focus: ['brainstem'], events: [['synapse', 'start'], ['cross', 'end']], path: () => h.P([[0.035, 15.47, -0.29], [0.02, 15.52, -0.25], [-0.02, 15.56, -0.2], [-0.04, 15.62, -0.17]]),
          cap: { en: 'Synapse in the nucleus cuneatus of the medulla. The second neuron crosses as internal arcuate fibres and forms the medial lemniscus.', hi: 'Medulla के nucleus cuneatus में सिनैप्स। दूसरा न्यूरॉन internal arcuate fibres के रूप में क्रॉस करके medial lemniscus बनाता है।', ur: 'Medulla کے nucleus cuneatus میں سائنیپس۔ دوسرا نیورون internal arcuate fibres کی صورت میں پار کر کے medial lemniscus بناتا ہے۔' } },
        { dur: 5, focus: ['thalamus'], events: [['flash', 'end']], path: () => h.P([[-0.04, 15.62, -0.17], [-0.06, 15.95, -0.1], [-0.1, 16.25, -0.17], [-0.12, 16.48, -0.2], [-0.22, 16.62, -0.16], [-0.38, 16.8, -0.16], [-0.53, 16.9, -0.18]]),
          cap: { en: 'Up the medial lemniscus to the thalamus (VPL), then to the primary somatosensory cortex of the RIGHT postcentral gyrus.', hi: 'Medial lemniscus से thalamus (VPL) तक, फिर दाएँ postcentral gyrus के primary somatosensory cortex तक।', ur: 'Medial lemniscus سے thalamus (VPL) تک، پھر دائیں postcentral gyrus کے primary somatosensory cortex تک۔' } },
        { dur: 5, view: 'body', path: null,
          cap: { en: 'Clinical: dorsal column damage (vitamin B12 deficiency, tabes dorsalis) causes loss of vibration and position sense: the patient sways with eyes closed (positive Romberg sign).', hi: 'चिकित्सा: dorsal column की क्षति (विटामिन B12 की कमी, tabes dorsalis) से कंपन और स्थिति का एहसास ख़त्म होता है: आँखें बंद करने पर मरीज़ डगमगाता है (Romberg sign पॉज़िटिव)।', ur: 'طبی نکتہ: dorsal column کے نقصان (وٹامن B12 کی کمی، tabes dorsalis) سے ارتعاش اور حالت کا احساس ختم ہوتا ہے: آنکھیں بند کرنے پر مریض ڈگمگاتا ہے (Romberg sign مثبت)۔' } },
      ],
    },
    {
      id: 'vision', color: '#5eead4', dir: [0.7, 0.9, 0.5],
      title: { en: 'The visual pathway', hi: 'दृष्टि मार्ग', ur: 'بینائی کا راستہ' },
      desc: { en: 'From retina to visual cortex, and why half of each optic nerve crosses.', hi: 'रेटिना से visual cortex तक, और हर optic nerve का आधा हिस्सा क्यों क्रॉस करता है।', ur: 'ریٹینا سے visual cortex تک، اور ہر optic nerve کا آدھا حصہ کیوں پار کرتا ہے۔' },
      steps: [
        { dur: 2.4, focus: ['eye'], events: [['flash', 'start']], path: () => h.P([[0.38, 16.11, 0.92], [0.32, 16.1, 0.72]]),
          cap: { en: 'Light from your LEFT visual field lands on the nasal half of the left retina. Rods and cones convert it; ganglion cells fire.', hi: 'आपके बाएँ दृष्टि-क्षेत्र की रोशनी बाईं रेटिना के nasal हिस्से पर पड़ती है। Rods और cones उसे बदलते हैं; ganglion cells फ़ायर करती हैं।', ur: 'آپ کے بائیں بصری میدان کی روشنی بائیں ریٹینا کے nasal حصے پر پڑتی ہے۔ Rods اور cones اسے بدلتے ہیں؛ ganglion cells فائر کرتے ہیں۔' } },
        { dur: 3, focus: ['cn2-L'], path: () => h.seg('cn2-L', 0, 0, 1),
          cap: { en: 'About 1.2 million ganglion-cell axons leave the eye as the optic nerve and pass through the optic canal.', hi: 'लगभग 12 लाख ganglion-cell एक्सॉन optic nerve बनकर आँख से निकलते हैं और optic canal से गुज़रते हैं।', ur: 'تقریباً 12 لاکھ ganglion-cell ایکسون optic nerve بن کر آنکھ سے نکلتے ہیں اور optic canal سے گزرتے ہیں۔' } },
        { dur: 2.4, events: [['cross', 'end']], path: () => h.P([[0.035, 16.1, 0.17], [0.0, 16.1, 0.16], [-0.035, 16.1, 0.15]]),
          cap: { en: 'Optic chiasm: nasal fibres cross, temporal fibres do not. So the RIGHT brain receives the whole LEFT visual field from both eyes.', hi: 'Optic chiasm: nasal फ़ाइबर क्रॉस करते हैं, temporal नहीं। इसलिए दायाँ दिमाग़ दोनों आँखों से पूरा बायाँ दृष्टि-क्षेत्र पाता है।', ur: 'Optic chiasm: nasal ریشے پار کرتے ہیں، temporal نہیں۔ اس لیے دایاں دماغ دونوں آنکھوں سے پورا بایاں بصری میدان لیتا ہے۔' } },
        { dur: 3, focus: ['optic-tract-R', 'thalamus'], events: [['synapse', 'end']], path: () => h.seg('optic-tract-R', 0, 0, h.near('optic-tract-R', 0, [-0.23, 16.25, -0.22])),
          cap: { en: 'Through the right optic tract to the lateral geniculate nucleus of the thalamus. A side branch goes to the midbrain for the pupillary light reflex.', hi: 'दाएँ optic tract से thalamus के lateral geniculate nucleus तक। एक शाखा पुतली के light reflex के लिए midbrain जाती है।', ur: 'دائیں optic tract سے thalamus کے lateral geniculate nucleus تک۔ ایک شاخ پتلی کے light reflex کے لیے midbrain جاتی ہے۔' } },
        { dur: 3.6, events: [['flash', 'end']], path: () => h.seg('optic-tract-R', 0, h.near('optic-tract-R', 0, [-0.23, 16.25, -0.22]), 1),
          cap: { en: "The optic radiation fans back (its lower fibres loop through the temporal lobe as Meyer's loop) to the primary visual cortex around the calcarine sulcus.", hi: "Optic radiation पीछे फैलती है (नीचे के फ़ाइबर temporal lobe से Meyer's loop बनाते हैं) और calcarine sulcus के आसपास primary visual cortex तक पहुँचती है।", ur: "Optic radiation پیچھے پھیلتی ہے (نیچے کے ریشے temporal lobe سے Meyer's loop بناتے ہیں) اور calcarine sulcus کے آس پاس primary visual cortex تک پہنچتی ہے۔" } },
        { dur: 5, view: 'head', path: null,
          cap: { en: 'Clinical: a pituitary tumour pressing on the chiasm causes bitemporal hemianopia; a right optic tract lesion causes left homonymous hemianopia.', hi: 'चिकित्सा: chiasm पर दबाने वाला pituitary ट्यूमर bitemporal hemianopia करता है; दाएँ optic tract की क्षति left homonymous hemianopia करती है।', ur: 'طبی نکتہ: chiasm پر دبانے والا pituitary رسولی bitemporal hemianopia کرتی ہے؛ دائیں optic tract کا نقصان left homonymous hemianopia کرتا ہے۔' } },
      ],
    },
    {
      id: 'autonomic', color: '#48e08c', dir: [1, 0.15, 0.7],
      title: { en: 'Fight-or-flight vs rest-and-digest', hi: 'लड़ो-या-भागो बनाम आराम-और-पाचन', ur: 'لڑو یا بھاگو بمقابلہ آرام اور ہاضمہ' },
      desc: { en: 'The two autonomic divisions acting on the eye and the heart.', hi: 'स्वायत्त तंत्र के दो हिस्से आँख और दिल पर कैसे काम करते हैं।', ur: 'خود مختار نظام کے دو حصے آنکھ اور دل پر کیسے کام کرتے ہیں۔' },
      steps: [
        { dur: 3, focus: ['hypothalamus'], events: [['flash', 'start']], path: () => h.P([[0, 16.22, 0.05], [0.04, 16.1, -0.05], [0.07, 15.8, -0.15], [0.07, 15.4, -0.24]]),
          cap: { en: 'Danger! The hypothalamus activates descending autonomic pathways through the brainstem.', hi: 'ख़तरा! Hypothalamus ब्रेनस्टेम से होकर नीचे जाने वाले स्वायत्त मार्ग सक्रिय करता है।', ur: 'خطرہ! Hypothalamus برین اسٹیم سے گزر کر نیچے جانے والے خود مختار راستے فعال کرتا ہے۔' } },
        { dur: 3.4, focus: ['spinal-cord'], events: [['synapse', 'end']], path: () => h.cordLine(0.06, 15.3, 13.76, 0.0),
          cap: { en: 'They reach preganglionic neurons in the lateral horn of T1. Sympathetic outflow only leaves the cord from T1 to L2.', hi: 'वे T1 के lateral horn के preganglionic न्यूरॉन तक पहुँचते हैं। सिम्पैथेटिक आउटफ़्लो सिर्फ़ T1 से L2 तक निकलता है।', ur: 'وہ T1 کے lateral horn کے preganglionic نیورونز تک پہنچتے ہیں۔ سمپیتھیٹک اخراج صرف T1 سے L2 تک نکلتا ہے۔' } },
        { dur: 5, focus: ['sp-T1-L', 'sympathetic-trunk-L'], path: () => h.cat(h.seg('sp-T1-L', 0, 0, h.near('sp-T1-L', 0, [0.36, 13.6, h.cz(13.6)]) ), h.seg('sympathetic-trunk-L', 1, 0, 1), h.seg('sympathetic-trunk-L', 0, h.near('sympathetic-trunk-L', 0, h.tp(13.58, 1)), 0)),
          cap: { en: 'The myelinated preganglionic fibre exits by the ventral root and white ramus into the sympathetic chain, then climbs to the superior cervical ganglion.', hi: 'माइलिन वाला preganglionic फ़ाइबर ventral root और white ramus से sympathetic chain में जाता है, फिर superior cervical ganglion तक चढ़ता है।', ur: 'مائلین والا preganglionic ریشہ ventral root اور white ramus سے sympathetic chain میں جاتا ہے، پھر superior cervical ganglion تک چڑھتا ہے۔' } },
        { dur: 3.4, focus: ['eye'], events: [['synapse', 'start'], ['pupilDilate', 'end']], path: () => h.cat(h.P([h.tp(15.18, 1)]), h.P([[0.3, 15.5, 0.02], [0.28, 15.9, 0.25], [0.3, 16.05, 0.5], [0.32, 16.1, 0.72]])),
          cap: { en: 'After a synapse in the superior cervical ganglion, postganglionic fibres ride the internal carotid artery to the eye: the pupil dilates (dilator pupillae).', hi: 'Superior cervical ganglion में सिनैप्स के बाद postganglionic फ़ाइबर internal carotid धमनी के साथ आँख तक जाते हैं: पुतली फैलती है (dilator pupillae)।', ur: 'Superior cervical ganglion میں سائنیپس کے بعد postganglionic ریشے internal carotid شریان کے ساتھ آنکھ تک جاتے ہیں: پتلی پھیلتی ہے (dilator pupillae)۔' } },
        { dur: 4, focus: ['greater-splanchnic-L', 'heart'], events: [['heartFast', 'start']], path: () => h.seg('greater-splanchnic-L', 0, 0, 1),
          cap: { en: 'Cardiac nerves (T1–T4) speed the heart, and the greater splanchnic nerve (T5–T9) drives the adrenal medulla to release adrenaline.', hi: 'Cardiac nerves (T1–T4) दिल तेज़ करती हैं, और greater splanchnic nerve (T5–T9) adrenal medulla से एड्रेनालिन छुड़वाती है।', ur: 'Cardiac nerves (T1–T4) دل کو تیز کرتی ہیں، اور greater splanchnic nerve (T5–T9) adrenal medulla سے ایڈرینالین خارج کرواتا ہے۔' } },
        { dur: 5, color: '#b89bff', focus: ['cn10-L', 'heart'], events: [['heartSlow', 'end'], ['pupilConstrict', 'end']], path: () => h.cat(h.seg('cn10-L', 0, 0, h.near('cn10-L', 0, [0.32, 13.35, 0.2])), h.seg('cn10-L', 3, 0, 1)),
          cap: { en: 'Rest-and-digest: the vagus nerve releases acetylcholine at the SA node and the heart slows; CN III constricts the pupil.', hi: 'आराम-और-पाचन: वेगस nerve SA node पर एसिटाइलकोलीन छोड़ती है और दिल धीमा होता है; CN III पुतली को सिकोड़ती है।', ur: 'آرام اور ہاضمہ: ویگس nerve SA node پر ایسیٹائل کولین چھوڑتا ہے اور دل آہستہ ہوتا ہے؛ CN III پتلی کو سکیڑتا ہے۔' } },
        { dur: 5, view: 'body', path: null,
          cap: { en: 'Both systems are active all the time. At rest, vagal tone holds the heart near 70 beats per minute instead of its own pacemaker rate of about 100.', hi: 'दोनों तंत्र हर समय सक्रिय रहते हैं। आराम में वेगस का असर दिल को लगभग 70 धड़कन/मिनट पर रखता है, जबकि उसका अपना pacemaker लगभग 100 पर चलता।', ur: 'دونوں نظام ہر وقت فعال رہتے ہیں۔ آرام میں ویگس کا اثر دل کو تقریباً 70 دھڑکن فی منٹ پر رکھتا ہے، جبکہ اس کا اپنا pacemaker تقریباً 100 پر چلتا۔' } },
      ],
    },
  ];
}

/* ------------------------------------------------------------ glow sprite */
let glowTex = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.18, 'rgba(255,255,255,0.85)');
  grd.addColorStop(0.45, 'rgba(255,255,255,0.22)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}
export function glowSprite(color, size = 0.3) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size);
  s.renderOrder = 30;
  return s;
}

const TRAIL_VERT = `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`;
const TRAIL_FRAG = `uniform vec3 uColor; uniform float uHead, uLen, uTime, uFade; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){
    if (vUv.x > uHead) discard;
    float ndv = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
    float behind = (uHead - vUv.x) * uLen;
    float headGlow = exp(-behind * 2.2);
    float body = 0.35 + 0.15 * sin(vUv.x * uLen * 14.0 - uTime * 6.0);
    float a = (pow(ndv, 1.5) * (body + headGlow * 2.2)) * uFade;
    gl_FragColor = vec4(uColor * a, a);
  }`;

/* ------------------------------------------------------------ player */
export class TourPlayer {
  /** api: { scene, camera, controls, flyTo, frameBox, setFocus(ids), event(name, pos, color), ui(state), viewFor(name) } */
  constructor(api) {
    this.api = api;
    this.head = glowSprite('#ffffff', 0.32);
    this.head.visible = false;
    api.scene.add(this.head);
    this.light = new THREE.PointLight('#ffffff', 0, 1.6, 2);
    api.scene.add(this.light);
    this.trails = [];
    this.tour = null;
  }

  start(tour) {
    this.stop(false);
    this.tour = tour;
    this.i = -1;
    this.playing = true;
    this.focus = new Set();
    this.next();
  }

  stop(notify = true) {
    for (const t of this.trails) { t.geometry.dispose(); t.material.dispose(); this.api.scene.remove(t); }
    this.trails = [];
    this.head.visible = false;
    this.light.intensity = 0;
    const had = !!this.tour;
    this.tour = null;
    if (had && notify) this.api.ui(null);
  }

  go(i) {
    if (!this.tour) return;
    const steps = this.tour.steps;
    if (i < 0) i = 0;
    if (i >= steps.length) { this.playing = false; this.api.ui(this.state()); return; }
    // rebuild trails up to step i-1 as completed, current step fresh
    for (const t of this.trails) { t.geometry.dispose(); t.material.dispose(); this.api.scene.remove(t); }
    this.trails = [];
    this.focus = new Set();
    for (let k = 0; k <= i; k++) (steps[k].focus || []).forEach((id) => this.focus.add(id));
    for (let k = 0; k < i; k++) { const tr = this.makeTrail(steps[k]); if (tr) { tr.material.uniforms.uHead.value = 1; tr.material.uniforms.uFade.value = 0.45; } }
    this.i = i;
    const step = steps[i];
    const trail = this.makeTrail(step);
    this.cur = { step, trail, points: trail ? this.curPoints : null, t: 0, phase: 'fly', phaseT: 0, fired: new Set(), follow: true };
    this.api.setFocus(this.focus);
    const color = step.color || this.tour.color;
    this.head.material.color.set(color);
    this.light.color.set(color);
    if (this.cur.trail) {
      const box = new THREE.Box3().setFromPoints(this.cur.points);
      const dir = new THREE.Vector3(...this.tour.dir).normalize();
      const r = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 0.35);
      this.cur.dist = THREE.MathUtils.clamp(r * 2.8, 3.0, 8.5);
      this.cur.dir = dir;
      const start = this.cur.points[0];
      this.api.flyTo(start.clone().add(dir.clone().multiplyScalar(this.cur.dist)), start, 1.3);
      this.head.position.copy(start);
      this.head.visible = true;
    } else {
      this.head.visible = false;
      this.light.intensity = 0;
      const v = this.api.viewFor(step.view || 'body');
      this.api.flyTo(v[0], v[1], 1.8);
    }
    this.fire('start');
    this.api.ui(this.state());
  }

  next() { this.go((this.i ?? -1) + 1); }
  prev() { this.go(Math.max(0, this.i - 1)); }
  toggle() { this.playing = !this.playing; if (this.playing && this.cur?.phase === 'done') this.next(); else this.api.ui(this.state()); }
  userMoved() { if (this.cur) this.cur.follow = false; }

  state() {
    return { tour: this.tour, i: this.i, n: this.tour?.steps.length ?? 0, playing: this.playing, step: this.cur?.step };
  }

  makeTrail(step) {
    const pts = step.path ? step.path() : null;
    if (!pts || pts.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const len = curve.getLength();
    const geo = taperedTube(curve, { radius: () => 0.017, radial: 8, segments: Math.min(600, Math.max(30, Math.ceil(len * 40))), capEnd: false });
    const mat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(step.color || this.tour.color) }, uHead: { value: 0 }, uLen: { value: len }, uTime: this.api.time, uFade: { value: 1 } },
      vertexShader: TRAIL_VERT, fragmentShader: TRAIL_FRAG, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 25;
    mesh.userData = { curve, len };
    this.api.scene.add(mesh);
    this.trails.push(mesh);
    this.curPoints = pts;
    return mesh;
  }

  fire(when) {
    const c = this.cur;
    if (!c) return;
    for (const [name, at] of c.step.events || []) {
      const key = `${name}:${at}`;
      if (at !== when || c.fired.has(key)) continue;
      c.fired.add(key);
      const pos = c.trail ? c.trail.userData.curve.getPointAt(at === 'start' ? 0 : 1) : null;
      this.api.event(name, pos, c.step.color || this.tour.color);
    }
  }

  update(dt) {
    const c = this.cur;
    if (!this.tour || !c) return;
    c.phaseT += dt;
    if (c.phase === 'fly') {
      if (c.phaseT > (c.trail ? 1.25 : 1.8)) { c.phase = 'run'; c.phaseT = 0; }
      return;
    }
    if (c.phase === 'run') {
      if (!this.playing) return;
      const dur = c.step.dur;
      c.t = Math.min(1, c.t + dt / dur);
      if (c.trail) {
        const k = c.t;
        c.trail.material.uniforms.uHead.value = k;
        const p = c.trail.userData.curve.getPointAt(Math.min(k, 1));
        this.head.position.copy(p);
        const pulse = 0.28 + 0.06 * Math.sin(performance.now() / 90);
        this.head.scale.setScalar(pulse);
        this.light.position.copy(p);
        this.light.intensity = 2.2;
        if (c.follow) {
          const target = this.api.controls.target;
          target.lerp(p, 1 - Math.pow(0.02, dt));
          const want = target.clone().add(c.dir.clone().multiplyScalar(c.dist));
          this.api.camera.position.lerp(want, 1 - Math.pow(0.08, dt));
        }
      }
      if (c.t >= 1) { c.phase = 'hold'; c.phaseT = 0; this.fire('end'); if (c.trail) c.trail.material.uniforms.uFade.value = 0.8; }
      return;
    }
    if (c.phase === 'hold') {
      this.light.intensity *= 0.95;
      const holdFor = c.trail ? 1.6 : Math.max(4.5, c.step.dur);
      if (c.phaseT > holdFor) {
        c.phase = 'done';
        if (this.playing) this.next();
        else this.api.ui(this.state());
      }
    }
  }
}
