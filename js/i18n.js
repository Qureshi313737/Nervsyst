// Interface strings in English, Hindi and Urdu.
export const LANGS = [
  { id: 'en', label: 'English', dir: 'ltr' },
  { id: 'hi', label: 'हिन्दी', dir: 'ltr' },
  { id: 'ur', label: 'اردو', dir: 'rtl' },
];

const D = {
  tagline: ['Systema nervosum · 3D atlas', 'तंत्रिका तंत्र · 3D एटलस', 'اعصابی نظام · 3D اٹلس'],
  tours: ['Tours', 'टूर', 'ٹور'],
  quiz: ['Quiz', 'क्विज़', 'کوئز'],
  sources: ['Sources', 'स्रोत', 'حوالہ جات'],
  level: ['Level', 'स्तर', 'سطح'],
  lvl_basic: ['Basic', 'आसान', 'آسان'],
  lvl_standard: ['Standard', 'मानक', 'معیاری'],
  lvl_advanced: ['Advanced', 'उन्नत', 'اعلیٰ'],
  scale: ['Scale', 'पैमाना', 'پیمانہ'],
  sc_body: ['Body', 'शरीर', 'جسم'],
  sc_nerve: ['Nerve fibre', 'तंत्रिका फ़ाइबर', 'عصبی ریشہ'],
  sc_neuron: ['Neuron', 'न्यूरॉन', 'نیورون'],
  structures: ['Structures', 'संरचनाएँ', 'ساختیں'],
  search: ['Search: median, vagus, L5…', 'खोजें: median, vagus, L5…', 'تلاش: median، vagus، L5…'],
  count: ['{n} structures', '{n} संरचनाएँ', '{n} ساختیں'],
  empty: ['No structure matches that search in this filter. Try "Complete system".', 'इस फ़िल्टर में यह खोज नहीं मिली। "पूरा तंत्र" आज़माएँ।', 'اس فلٹر میں یہ تلاش نہیں ملی۔ "مکمل نظام" آزمائیں۔'],
  v_body: ['Body', 'शरीर', 'جسم'], v_head: ['Head', 'सिर', 'سر'], v_spine: ['Spine', 'रीढ़', 'ریڑھ'], v_arm: ['Arm', 'बाँह', 'بازو'], v_leg: ['Leg', 'टाँग', 'ٹانگ'],
  t_skin: ['Skin', 'त्वचा', 'جلد'], t_skeleton: ['Skeleton', 'कंकाल', 'ڈھانچہ'], t_organs: ['Organs', 'अंग', 'اعضاء'], t_labels: ['Labels', 'लेबल', 'لیبل'],
  t_signals: ['Signals', 'संकेत', 'اشارے'], t_rotate: ['Rotate', 'घुमाएँ', 'گھمائیں'], t_isolate: ['Hide others', 'बाक़ी छिपाएँ', 'باقی چھپائیں'],
  colour: ['Colour', 'रंग', 'رنگ'], c_systems: ['Systems', 'तंत्र', 'نظام'], c_function: ['Function', 'कार्य', 'فعل'], c_atlas: ['Classic atlas', 'क्लासिक एटलस', 'کلاسک اٹلس'],
  quality: ['Quality', 'गुणवत्ता', 'معیار'], q_auto: ['Auto', 'ऑटो', 'خودکار'], q_low: ['Low', 'कम', 'کم'], q_medium: ['Medium', 'मध्यम', 'درمیانہ'], q_high: ['High', 'उच्च', 'اعلیٰ'], q_ultra: ['Ultra', 'अल्ट्रा', 'الٹرا'],
  q_toast: ['Quality set to {q} for smooth playback', 'स्मूद चलने के लिए गुणवत्ता {q} की गई', 'ہموار چلنے کے لیے معیار {q} کیا گیا'],
  simple: ['In simple words', 'आसान शब्दों में', 'آسان الفاظ میں'],
  course: ['Course', 'मार्ग', 'راستہ'], motor: ['Motor supply', 'मोटर आपूर्ति', 'حرکی سپلائی'], sensory: ['Sensory supply', 'संवेदी आपूर्ति', 'حسی سپلائی'],
  branches: ['Branches & components', 'शाखाएँ और भाग', 'شاخیں اور اجزاء'], parts: ['Parts & functional areas', 'भाग और कार्य क्षेत्र', 'حصے اور فعلی علاقے'],
  clinical: ['Clinical correlation', 'नैदानिक महत्व', 'طبی اہمیت'], test: ['How it is examined', 'जाँच कैसे करें', 'معائنہ کیسے کریں'],
  fact: ['Remember', 'याद रखें', 'یاد رکھیں'], variations: ['Anatomical variations', 'शारीरिक विविधताएँ', 'تشریحی تغیرات'],
  embryology: ['Development (embryology)', 'विकास (भ्रूणविज्ञान)', 'نشوونما (جنینیات)'], refs: ['References', 'संदर्भ', 'حوالہ جات'],
  detailNote: ['', 'विस्तृत चिकित्सा पाठ अंग्रेज़ी में है, जो उद्धृत पाठ्यपुस्तकों की भाषा है।', 'تفصیلی طبی متن انگریزی میں ہے، جو حوالہ شدہ نصابی کتب کی زبان ہے۔'],
  focus: ['Focus', 'फ़ोकस', 'فوکس'], isolate: ['Isolate', 'अकेला दिखाएँ', 'الگ دکھائیں'], showFilter: ['Show filter again', 'फ़िल्टर फिर दिखाएँ', 'فلٹر دوبارہ دکھائیں'],
  inside: ['Zoom inside the nerve', 'तंत्रिका के अंदर देखें', 'عصب کے اندر دیکھیں'],
  left: ['Left side', 'बाईं तरफ़', 'بائیں طرف'], right: ['Right side', 'दाईं तरफ़', 'دائیں طرف'], l: ['left', 'बाएँ', 'بائیں'], r: ['right', 'दाएँ', 'دائیں'],
  fn_motor: ['Motor', 'मोटर (प्रेरक)', 'حرکی (موٹر)'], fn_sensory: ['Sensory', 'संवेदी', 'حسی'], fn_mixed: ['Mixed', 'मिश्रित', 'مخلوط'], fn_special: ['Special sensory', 'विशेष संवेदी', 'خاص حسی'],
  fn_autonomic: ['Autonomic', 'स्वायत्त', 'خود مختار'], fn_cns: ['CNS', 'केंद्रीय तंत्र', 'مرکزی نظام'], fn_organ: ['Organ', 'अंग', 'عضو'], fn_micro: ['Microanatomy', 'सूक्ष्म संरचना', 'خوردبینی ساخت'],
  g_cns: ['Central nervous system', 'केंद्रीय तंत्रिका तंत्र', 'مرکزی اعصابی نظام'], g_deep: ['Deep brain', 'मस्तिष्क के भीतरी भाग', 'دماغ کے اندرونی حصے'],
  g_cranial: ['Cranial nerves', 'कपाल तंत्रिकाएँ', 'قحفی اعصاب'], g_spinal: ['Spinal nerve roots', 'मेरु तंत्रिका जड़ें', 'نخاعی اعصاب کی جڑیں'],
  g_cervical: ['Cervical plexus', 'ग्रीवा जालक (सर्वाइकल)', 'گردنی شبکہ (سروائیکل)'], g_brachial: ['Brachial plexus', 'बाहु जालक (ब्रेकियल)', 'بازو کا شبکہ (بریکیئل)'],
  g_thoracic: ['Intercostal nerves', 'अंतरपर्शुक तंत्रिकाएँ', 'انٹرکوسٹل اعصاب'], g_lumbar: ['Lumbar plexus', 'कटि जालक (लम्बर)', 'کمری شبکہ (لمبر)'],
  g_sacral: ['Sacral plexus', 'त्रिक जालक (सेक्रल)', 'عجزی شبکہ (سیکرل)'], g_sympathetic: ['Sympathetic', 'अनुकंपी (सिम्पैथेटिक)', 'سمپیتھیٹک'],
  g_parasympathetic: ['Parasympathetic', 'परानुकंपी (पैरासिम्पैथेटिक)', 'پیراسمپیتھیٹک'], g_organ: ['Target organs', 'लक्ष्य अंग', 'ہدف اعضاء'],
  lg_somatic: ['Somatic nerves', 'कायिक तंत्रिकाएँ', 'جسمانی اعصاب'],
  lg_flow: ['Pulses: motor → outward · sensory → inward', 'संकेत: मोटर → बाहर · संवेदी → अंदर', 'اشارے: حرکی ← باہر · حسی ← اندر'],
  lobe_f: ['Frontal', 'फ्रंटल', 'فرنٹل'], lobe_p: ['Parietal', 'पैराइटल', 'پیرائٹل'], lobe_t: ['Temporal', 'टेम्पोरल', 'ٹیمپورل'], lobe_o: ['Occipital', 'ऑक्सिपिटल', 'آکسیپیٹل'],
  cordNote: ['You clicked cord segment ≈ {seg}, which lies at about vertebral level {vert}.', 'आपने मेरुरज्जु खंड ≈ {seg} पर क्लिक किया, जो लगभग कशेरुका {vert} के स्तर पर है।', 'آپ نے حرام مغز کے حصے ≈ {seg} پر کلک کیا، جو تقریباً مہرے {vert} کی سطح پر ہے۔'],
  brainNote: ['Click directly on a lobe to read about it.', 'किसी लोब पर सीधे क्लिक करके उसके बारे में पढ़ें।', 'کسی لوب پر براہ راست کلک کر کے اس کے بارے میں پڑھیں۔'],
  // tours
  toursTitle: ['Cinematic pathway tours', 'सिनेमैटिक पथ टूर', 'سنیمیٹک راستوں کے ٹور'],
  toursSub: ['Follow a real signal through the nervous system, step by step.', 'तंत्रिका तंत्र में एक असली संकेत को क़दम-दर-क़दम देखें।', 'اعصابی نظام میں ایک حقیقی اشارے کو قدم بہ قدم دیکھیں۔'],
  play: ['Play', 'चलाएँ', 'چلائیں'], pause: ['Pause', 'रोकें', 'روکیں'], next: ['Next', 'आगे', 'آگے'], prev: ['Back', 'पीछे', 'پیچھے'], exit: ['Exit', 'बाहर', 'باہر'],
  step: ['Step {i} of {n}', 'चरण {i} / {n}', 'مرحلہ {i} / {n}'], start: ['Start', 'शुरू करें', 'شروع کریں'], close: ['Close', 'बंद करें', 'بند کریں'],
  // quiz
  quizTitle: ['Identify the glowing structure', 'चमकती संरचना को पहचानें', 'چمکتی ساخت کو پہچانیں'],
  correct: ['Correct!', 'सही!', 'درست!'], wrong: ['Not quite. It is the {name}.', 'सही नहीं। यह {name} है।', 'درست نہیں۔ یہ {name} ہے۔'],
  score: ['Score {s}/{n}', 'स्कोर {s}/{n}', 'اسکور {s}/{n}'], nextQ: ['Next question', 'अगला सवाल', 'اگلا سوال'], streak: ['Streak {n}', 'लगातार {n}', 'مسلسل {n}'],
  // micro
  microNerve: ['Inside a peripheral nerve', 'परिधीय तंत्रिका के अंदर', 'محیطی عصب کے اندر'],
  microNerveCap: ['Myelinated fibres conduct by saltatory conduction: the impulse jumps from node to node, up to about 120 m/s. Thin unmyelinated C fibres crawl at 0.5–2 m/s.', 'माइलिन वाले फ़ाइबर में संकेत नोड से नोड तक छलाँग लगाता है (saltatory conduction), लगभग 120 m/s तक। पतले बिना माइलिन C फ़ाइबर 0.5–2 m/s पर धीरे चलते हैं।', 'مائلین والے ریشوں میں اشارہ نوڈ سے نوڈ تک چھلانگ لگاتا ہے (saltatory conduction)، تقریباً 120 m/s تک۔ پتلے بغیر مائلین C ریشے 0.5–2 m/s پر آہستہ چلتے ہیں۔'],
  microNeuron: ['Motor neuron & neuromuscular junction', 'मोटर न्यूरॉन और न्यूरोमस्कुलर जंक्शन', 'موٹر نیورون اور نیورومسکیولر جنکشن'],
  microNeuronCap: ['Dendrites collect inputs → the axon hillock fires at about −55 mV → the action potential jumps along the myelinated axon → Ca²⁺ entry releases acetylcholine → the muscle fibre contracts.', 'डेंड्राइट इनपुट लेते हैं → एक्सॉन हिलॉक लगभग −55 mV पर फ़ायर करता है → संकेत माइलिन वाले एक्सॉन पर छलाँग लगाता है → Ca²⁺ आने से एसिटाइलकोलीन निकलता है → मांसपेशी सिकुड़ती है।', 'ڈینڈرائٹس اشارے لیتے ہیں ← ایکسون ہلاک تقریباً −55 mV پر فائر کرتا ہے ← اشارہ مائلین والے ایکسون پر چھلانگ لگاتا ہے ← Ca²⁺ آنے سے ایسیٹائل کولین نکلتا ہے ← پٹھا سکڑتا ہے۔'],
  backBody: ['Back to body', 'शरीर पर वापस', 'جسم پر واپس'],
  // intro & sources
  introEyebrow: ['Interactive anatomy', 'इंटरैक्टिव शरीर रचना', 'انٹرایکٹو تشریح'],
  introSub: ['12 cranial pairs · 31 spinal pairs · {n} modelled nerve structures', '12 कपाल जोड़ी · 31 मेरु जोड़ी · {n} मॉडल की गई संरचनाएँ', '12 قحفی جوڑے · 31 نخاعی جوڑے · {n} ماڈل شدہ ساختیں'],
  introHint: ['Click any nerve to study it. Drag to orbit, scroll or pinch to zoom.', 'किसी भी तंत्रिका पर क्लिक करें। घुमाने के लिए खींचें, ज़ूम के लिए स्क्रॉल या पिंच करें।', 'کسی بھی عصب پر کلک کریں۔ گھمانے کے لیے کھینچیں، زوم کے لیے اسکرول یا پنچ کریں۔'],
  sourcesTitle: ['Sources & accuracy', 'स्रोत और सटीकता', 'حوالہ جات اور درستگی'],
  sourcesNote: ['Facts in this atlas were checked against the standard references below. The 3D model is a teaching schematic: nerve thickness is exaggerated and positions are approximate. Always confirm clinically important details in a current textbook.', 'इस एटलस के तथ्य नीचे दिए मानक संदर्भों से जाँचे गए हैं। 3D मॉडल पढ़ाने के लिए बनाया गया चित्र है: तंत्रिकाओं की मोटाई बढ़ाकर दिखाई गई है और स्थान अनुमानित हैं। चिकित्सा के लिए महत्वपूर्ण बातें हमेशा किसी नई पाठ्यपुस्तक से पक्की करें।', 'اس اٹلس کے حقائق نیچے دیے گئے معیاری حوالوں سے جانچے گئے ہیں۔ 3D ماڈل تدریسی خاکہ ہے: اعصاب کی موٹائی بڑھا کر دکھائی گئی ہے اور مقامات تقریبی ہیں۔ طبی لحاظ سے اہم باتیں ہمیشہ کسی تازہ نصابی کتاب سے تصدیق کریں۔'],
  noWebgl: ['This device or browser cannot run WebGL, which the 3D atlas needs. Try an up-to-date Chrome, Edge, Firefox or Safari.', 'यह डिवाइस या ब्राउज़र WebGL नहीं चला सकता, जो 3D एटलस के लिए ज़रूरी है। नया Chrome, Edge, Firefox या Safari आज़माएँ।', 'یہ ڈیوائس یا براؤزر WebGL نہیں چلا سکتا، جو 3D اٹلس کے لیے ضروری ہے۔ تازہ Chrome، Edge، Firefox یا Safari آزمائیں۔'],
  // filter groups
  fg_Systems: ['Systems', 'तंत्र', 'نظام'], fg_Plexuses: ['Plexuses', 'जालक (प्लेक्सस)', 'شبکے (پلیکسس)'], fg_Brain: ['Brain', 'मस्तिष्क', 'دماغ'], fg_Function: ['Function', 'कार्य', 'فعل'], fg_Region: ['Region', 'क्षेत्र', 'علاقہ'],
  f_all: ['Complete system', 'पूरा तंत्र', 'مکمل نظام'], f_cns: ['Central NS', 'केंद्रीय तंत्र', 'مرکزی نظام'], f_cranial: ['Cranial nerves', 'कपाल तंत्रिकाएँ', 'قحفی اعصاب'],
  f_spinal: ['Spinal nerves', 'मेरु तंत्रिकाएँ', 'نخاعی اعصاب'], f_sympathetic: ['Sympathetic', 'सिम्पैथेटिक', 'سمپیتھیٹک'], f_parasympathetic: ['Parasympathetic', 'पैरासिम्पैथेटिक', 'پیراسمپیتھیٹک'],
  f_cervical: ['Cervical', 'ग्रीवा', 'گردنی'], f_brachial: ['Brachial', 'ब्रेकियल', 'بریکیئل'], f_thoracic: ['Intercostal', 'इंटरकोस्टल', 'انٹرکوسٹل'], f_lumbar: ['Lumbar', 'लम्बर', 'لمبر'], f_sacral: ['Sacral', 'सेक्रल', 'سیکرل'],
  f_lobes: ['Cerebral lobes', 'मस्तिष्क के लोब', 'دماغ کے لوب'], f_deep: ['Deep structures', 'भीतरी संरचनाएँ', 'اندرونی ساختیں'],
  'f_fn-motor': ['Motor', 'मोटर', 'حرکی'], 'f_fn-sensory': ['Sensory', 'संवेदी', 'حسی'], 'f_fn-mixed': ['Mixed', 'मिश्रित', 'مخلوط'],
  'f_reg-head': ['Head & neck', 'सिर और गर्दन', 'سر اور گردن'], 'f_reg-upper': ['Upper limb', 'ऊपरी अंग', 'بالائی عضو'], 'f_reg-trunk': ['Trunk', 'धड़', 'دھڑ'], 'f_reg-lower': ['Lower limb', 'निचला अंग', 'زیریں عضو'],
};

const NOTES = {
  all: [null, 'पूरा तंत्रिका तंत्र। किसी भी तंत्रिका, या दिमाग़ और मेरुरज्जु के किसी हिस्से पर क्लिक करके पढ़ें।', 'مکمل اعصابی نظام۔ کسی بھی عصب، یا دماغ اور حرام مغز کے کسی حصے پر کلک کر کے پڑھیں۔'],
  cns: [null, 'दिमाग़ और मेरुरज्जु: नियंत्रण केंद्र। बाक़ी सब परिधीय तंत्रिका तंत्र है।', 'دماغ اور حرام مغز: کنٹرول مرکز۔ باقی سب محیطی اعصابی نظام ہے۔'],
  cranial: [null, '12 जोड़ी जो सीधे दिमाग़ से निकलती हैं। याद रखने के लिए: "Some Say Marry Money, But My Brother Says Big Brains Matter More" = I–XII के लिए संवेदी/मोटर/दोनों।', '12 جوڑے جو براہ راست دماغ سے نکلتے ہیں۔ یاد رکھنے کے لیے: "Some Say Marry Money, But My Brother Says Big Brains Matter More" = I–XII کے لیے حسی/حرکی/دونوں۔'],
  spinal: [null, '31 जोड़ी: 8 ग्रीवा, 12 वक्ष, 5 कटि, 5 त्रिक, 1 अनुत्रिक। देखें कैसे कमर और त्रिक की जड़ें नली में नीचे उतरकर cauda equina बनाती हैं।', '31 جوڑے: 8 گردنی، 12 سینے کے، 5 کمری، 5 عجزی، 1 دمچی۔ دیکھیں کیسے کمر اور عجزی جڑیں نالی میں نیچے اتر کر cauda equina بناتی ہیں۔'],
  sympathetic: [null, 'T1–L2 से निकलने वाला तंत्र: लड़ो या भागो। गैंग्लियन की ज़ंजीर कशेरुकाओं के दोनों ओर चलती है।', 'T1–L2 سے نکلنے والا نظام: لڑو یا بھاگو۔ گینگلیا کی زنجیر مہروں کے دونوں طرف چلتی ہے۔'],
  parasympathetic: [null, 'कपाल-त्रिक तंत्र: CN III, VII, IX, X और S2–S4। आराम और पाचन।', 'قحفی و عجزی نظام: CN III، VII، IX، X اور S2–S4۔ آرام اور ہاضمہ۔'],
  cervical: [null, 'C1–C4 की वेंट्रल शाखाएँ। त्वचा की शाखाएँ Erb\'s point से फैलती हैं; फ़्रेनिक तंत्रिका डायाफ्राम तक जाती है।', 'C1–C4 کی وینٹرل شاخیں۔ جلد کی شاخیں Erb\'s point سے پھیلتی ہیں؛ فرینک عصب ڈایافرام تک جاتا ہے۔'],
  brachial: [null, 'C5–T1: जड़ें, ट्रंक, विभाजन, कॉर्ड, शाखाएँ। axillary धमनी के सामने median nerve का "M" देखें।', 'C5–T1: جڑیں، ٹرنک، تقسیم، کارڈ، شاخیں۔ axillary شریان کے سامنے median nerve کا "M" دیکھیں۔'],
  thoracic: [null, 'T1–T12 की वेंट्रल शाखाएँ हर पसली के नीचे अलग-अलग चलती हैं। कोई जालक नहीं, इसलिए dermatome साफ़ पट्टियाँ हैं।', 'T1–T12 کی وینٹرل شاخیں ہر پسلی کے نیچے الگ الگ چلتی ہیں۔ کوئی شبکہ نہیں، اس لیے dermatome صاف پٹیاں ہیں۔'],
  lumbar: [null, 'psoas मांसपेशी के अंदर L1–L4। फ़ेमोरल (psoas के बाहर) और ऑब्ट्यूरेटर (अंदर) दो बड़ी शाखाएँ हैं।', 'psoas پٹھے کے اندر L1–L4۔ فیمورل (psoas کے باہر) اور اوبچوریٹر (اندر) دو بڑی شاخیں ہیں۔'],
  sacral: [null, 'piriformis के सामने L4–S4। साइटिक शरीर की सबसे बड़ी तंत्रिका है।', 'piriformis کے سامنے L4–S4۔ سائٹک جسم کا سب سے بڑا عصب ہے۔'],
  lobes: [null, 'फ्रंटल (नीला), पैराइटल (सुनहरा), टेम्पोरल (हरा), ऑक्सिपिटल (लाल)। किसी लोब पर क्लिक करें।', 'فرنٹل (نیلا)، پیرائٹل (سنہرا)، ٹیمپورل (سبز)، آکسیپیٹل (سرخ)۔ کسی لوب پر کلک کریں۔'],
  deep: [null, 'थैलेमस, बेसल गैंग्लिया, लिम्बिक संरचनाएँ और कॉर्पस कैलोसम, धुँधले cortex के आर-पार।', 'تھیلیمس، بیسل گینگلیا، لمبک ساختیں اور کارپس کیلوسم، دھندلے cortex کے آر پار۔'],
  'fn-motor': [null, 'सिर्फ़ मोटर तंत्रिकाएँ। संकेत CNS से बाहर की ओर चलते हैं।', 'صرف حرکی اعصاب۔ اشارے CNS سے باہر کی طرف چلتے ہیں۔'],
  'fn-sensory': [null, 'सिर्फ़ संवेदी तंत्रिकाएँ। संकेत CNS की ओर चलते हैं।', 'صرف حسی اعصاب۔ اشارے CNS کی طرف چلتے ہیں۔'],
  'fn-mixed': [null, 'मिश्रित तंत्रिकाएँ दोनों ले जाती हैं; संकेत दोनों दिशाओं में चलते हैं।', 'مخلوط اعصاب دونوں لے جاتے ہیں؛ اشارے دونوں سمتوں میں چلتے ہیں۔'],
  'reg-head': [null, 'कपाल तंत्रिकाएँ, ग्रीवा जालक और दिमाग़।', 'قحفی اعصاب، گردنی شبکہ اور دماغ۔'],
  'reg-upper': [null, 'ब्रेकियल प्लेक्सस और उसकी अंतिम शाखाएँ।', 'بریکیئل پلیکسس اور اس کی آخری شاخیں۔'],
  'reg-trunk': [null, 'मेरुरज्जु, जड़ें, इंटरकोस्टल, स्वायत्त ज़ंजीरें और अंगों की तंत्रिकाएँ।', 'حرام مغز، جڑیں، انٹرکوسٹل، خود مختار زنجیریں اور اعضاء کے اعصاب۔'],
  'reg-lower': [null, 'टाँग तक जाने वाली लम्बर और सेक्रल प्लेक्सस की शाखाएँ।', 'ٹانگ تک جانے والی لمبر اور سیکرل پلیکسس کی شاخیں۔'],
};

let current = 'en';
const idx = () => (current === 'hi' ? 1 : current === 'ur' ? 2 : 0);
export const getLang = () => current;
export function setLang(l) { current = LANGS.some((x) => x.id === l) ? l : 'en'; }
export function t(key, vars) {
  const row = D[key];
  let s = row ? (row[idx()] || row[0]) : key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}
/** Filter note: English source lives in info.js, translations here. */
export function filterNote(id, english) { return idx() === 0 ? english : (NOTES[id]?.[idx()] ?? english); }
/** Pick the current language from an {en, hi, ur} object or [en, hi, ur] array. */
export function pick(v) {
  if (!v) return '';
  if (Array.isArray(v)) return v[idx()] || v[0];
  return v[current] || v.en || '';
}
