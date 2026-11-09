// Learning layer on top of info.js:
//  • REFS: the bibliography every statement is checked against
//  • per-structure plain-language explanation in English / हिन्दी / اردو
//  • translated names, anatomical variations, embryology and references
// Detailed clinical text stays in English (the language of the cited texts);
// anatomical terms are kept in English inside Hindi and Urdu sentences, as in
// South-Asian medical teaching, to avoid mistranslating technical terms.

export const REFS = {
  GRAY: "Standring S (ed). Gray's Anatomy: The Anatomical Basis of Clinical Practice, 42nd ed. Elsevier; 2020.",
  MOORE: 'Moore KL, Dalley AF, Agur AMR. Clinically Oriented Anatomy, 9th ed. Wolters Kluwer; 2022.',
  NETTER: 'Netter FH. Atlas of Human Anatomy, 8th ed. Elsevier; 2022.',
  SNELL: "Splittgerber R. Snell's Clinical Neuroanatomy, 8th ed. Wolters Kluwer; 2019.",
  KANDEL: 'Kandel ER, Koester JD, Mack SH, Siegelbaum SA (eds). Principles of Neural Science, 6th ed. McGraw Hill; 2021.',
  PURVES: 'Purves D, Augustine GJ, Fitzpatrick D, et al. Neuroscience, 6th ed. Oxford University Press; 2018.',
  BLUMENFELD: 'Blumenfeld H. Neuroanatomy through Clinical Cases, 3rd ed. Sinauer / Oxford University Press; 2021.',
  WILSON: 'Wilson-Pauwels L, Stewart PA, Akesson EJ, Spacey SD. Cranial Nerves: Function and Dysfunction, 3rd ed. PMPH-USA; 2010.',
  GUYTON: 'Hall JE, Hall ME. Guyton and Hall Textbook of Medical Physiology, 14th ed. Elsevier; 2021.',
  AIDS: 'Guarantors of Brain. Aids to the Examination of the Peripheral Nervous System, 5th ed. Saunders Elsevier; 2010.',
  RUSSELL: 'Russell SM. Examination of Peripheral Nerve Injuries: An Anatomical Approach, 2nd ed. Thieme; 2015.',
  LANGMAN: "Sadler TW. Langman's Medical Embryology, 15th ed. Wolters Kluwer; 2023.",
  TA2: 'FIPAT. Terminologia Anatomica, 2nd ed. Federative International Programme for Anatomical Terminology; 2019.',
  ISNCSCI: 'Kirshblum SC, Burns SP, Biering-Sorensen F, et al. International standards for neurological classification of spinal cord injury (revised 2011). J Spinal Cord Med. 2011;34(6):535–546.',
  LEE2008: 'Lee MWL, McPhee RW, Stringer MD. An evidence-based approach to human dermatomes. Clin Anat. 2008;21(5):363–373.',
  AZEVEDO: 'Azevedo FAC, Carvalho LRB, Grinberg LT, et al. Equal numbers of neuronal and nonneuronal cells make the human brain an isometrically scaled-up primate brain. J Comp Neurol. 2009;513(5):532–541.',
  SERENO: 'Sereno MI, Diedrichsen J, Tachrount M, et al. The human cerebellum has almost 80% of the surface area of the neocortex. PNAS. 2020;117(32):19538–19543.',
  SMOLL: 'Smoll NR. Variations of the piriformis and sciatic nerve with clinical consequence: a review. Clin Anat. 2010;23(1):8–17.',
  SCOVILLE: 'Scoville WB, Milner B. Loss of recent memory after bilateral hippocampal lesions. J Neurol Neurosurg Psychiatry. 1957;20(1):11–21.',
  OKEEFE: "O'Keefe J, Dostrovsky J. The hippocampus as a spatial map. Brain Res. 1971;34(1):171–175.",
  PENFIELD: 'Penfield W, Boldrey E. Somatic motor and sensory representation in the cerebral cortex of man as studied by electrical stimulation. Brain. 1937;60(4):389–443.',
  BRODMANN: 'Brodmann K. Vergleichende Lokalisationslehre der Grosshirnrinde. Leipzig: Barth; 1909.',
  GAZZANIGA: 'Gazzaniga MS. Forty-five years of split-brain research and still going strong. Nat Rev Neurosci. 2005;6(8):653–659.',
  FEINSTEIN: 'Feinstein JS, Adolphs R, Damasio A, Tranel D. The human amygdala and the induction and experience of fear. Curr Biol. 2011;21(1):34–38.',
  KLUVER: 'Klüver H, Bucy PC. Preliminary analysis of functions of the temporal lobes in monkeys. Arch Neurol Psychiatry. 1939;42(6):979–1000.',
  HARLOW: 'Harlow JM. Recovery from the passage of an iron bar through the head. Publ Mass Med Soc. 1868;2:327–347.',
  BAUGH: "Baugh RF, Basura GJ, Ishii LE, et al. Clinical practice guideline: Bell's palsy. Otolaryngol Head Neck Surg. 2013;149(3 Suppl):S1–S27.",
  PADUA: 'Padua L, Coraci D, Erra C, et al. Carpal tunnel syndrome: clinical features, diagnosis, and management. Lancet Neurol. 2016;15(12):1273–1284.',
  HH1952: 'Hodgkin AL, Huxley AF. A quantitative description of membrane current and its application to conduction and excitation in nerve. J Physiol. 1952;117(4):500–544.',
  HS1949: 'Huxley AF, Stämpfli R. Evidence for saltatory conduction in peripheral myelinated nerve fibres. J Physiol. 1949;108(3):315–339.',
  SEDDON: 'Seddon HJ. Three types of nerve injury. Brain. 1943;66(4):237–288.',
  SUNDERLAND: 'Sunderland S. A classification of peripheral nerve injuries producing loss of function. Brain. 1951;74(4):491–516.',
  KATZ: 'Del Castillo J, Katz B. Quantal components of the end-plate potential. J Physiol. 1954;124(3):560–573.',
};

/* ------------------------------------------------------------------------
   x(key, [hindiName, urduName], [simpleEN, simpleHI, simpleUR], {v, e, r})
   v = variations, e = embryology, r = reference ids
------------------------------------------------------------------------- */
export const EXTRA = {};
function x(key, names, simple, more = {}) {
  EXTRA[key] = {
    name: { hi: names[0], ur: names[1] },
    simple: { en: simple[0], hi: simple[1], ur: simple[2] },
    variations: more.v, embryology: more.e, refs: more.r ?? ['GRAY', 'MOORE'],
  };
}

/* ================================================================ BRAIN */
x('cerebrum', ['प्रमस्तिष्क (सेरेब्रम)', 'مخ (سیریبرم)'], [
  'The thinking brain: two hemispheres whose folded surface (cortex) handles thought, movement, senses and language.',
  'सोचने वाला दिमाग़: दो हिस्से (hemispheres) जिनकी सिलवटों वाली सतह (cortex) सोच, हरकत, इन्द्रियाँ और भाषा संभालती है।',
  'سوچنے والا دماغ: دو حصے (hemispheres) جن کی تہہ دار سطح (cortex) سوچ، حرکت، حواس اور زبان کو سنبھالتی ہے۔',
], { e: 'From the telencephalon (forebrain vesicle). The cranial neuropore closes around day 25; failure causes anencephaly. Cortical neurons migrate outward along radial glia in an inside-out sequence, forming six layers.', r: ['GRAY', 'KANDEL', 'LANGMAN', 'AZEVEDO'] });

x('lobe-frontal', ['अग्र पालि (फ्रंटल लोब)', 'فرنٹل لوب (جبہی لوب)'], [
  'The front of the brain. It plans and starts movement, produces speech and controls personality, judgement and self-control.',
  'दिमाग़ का अगला हिस्सा। यह हरकत की योजना बनाता और शुरू करता है, बोलना पैदा करता है और व्यक्तित्व, फ़ैसले और आत्म-नियंत्रण को चलाता है।',
  'دماغ کا اگلا حصہ۔ یہ حرکت کا منصوبہ بناتا اور شروع کرتا ہے، بولنے کی صلاحیت دیتا ہے اور شخصیت، فیصلے اور ضبطِ نفس کو کنٹرول کرتا ہے۔',
], { v: "Broca's area is in the left hemisphere in about 95% of right-handers and roughly 70% of left-handers.", r: ['GRAY', 'KANDEL', 'BLUMENFELD', 'PENFIELD', 'BRODMANN', 'HARLOW'] });

x('lobe-parietal', ['पार्श्विका पालि (पैराइटल लोब)', 'پیرائٹل لوب (جداری لوب)'], [
  'The top-back of the brain. It feels touch and body position and builds a map of where you and objects are in space.',
  'दिमाग़ का ऊपरी-पिछला हिस्सा। यह छूने और शरीर की स्थिति को महसूस करता है और बताता है कि आप और चीज़ें जगह में कहाँ हैं।',
  'دماغ کا اوپری پچھلا حصہ۔ یہ لمس اور جسم کی حالت کو محسوس کرتا ہے اور بتاتا ہے کہ آپ اور چیزیں جگہ میں کہاں ہیں۔',
], { r: ['GRAY', 'KANDEL', 'BLUMENFELD', 'PENFIELD'] });

x('lobe-temporal', ['शंख पालि (टेम्पोरल लोब)', 'ٹیمپورل لوب (صدغی لوب)'], [
  'The side of the brain, above the ear. It hears, understands language, recognises faces and stores memories.',
  'कान के ऊपर दिमाग़ का बगल वाला हिस्सा। यह सुनता है, भाषा समझता है, चेहरे पहचानता है और यादें सहेजता है।',
  'کان کے اوپر دماغ کا پہلو والا حصہ۔ یہ سنتا ہے، زبان سمجھتا ہے، چہرے پہچانتا ہے اور یادیں محفوظ کرتا ہے۔',
], { r: ['GRAY', 'KANDEL', 'BLUMENFELD', 'SCOVILLE'] });

x('lobe-occipital', ['पश्चकपाल पालि (ऑक्सिपिटल लोब)', 'آکسیپیٹل لوب (قذالی لوب)'], [
  'The back of the brain. It is the vision centre that turns signals from the eyes into the images you see.',
  'दिमाग़ का पिछला हिस्सा। यह देखने का केंद्र है जो आँखों के सिग्नल को वह तस्वीर बनाता है जो आप देखते हैं।',
  'دماغ کا پچھلا حصہ۔ یہ بینائی کا مرکز ہے جو آنکھوں کے سگنل کو وہ تصویر بناتا ہے جو آپ دیکھتے ہیں۔',
], { r: ['GRAY', 'KANDEL', 'PURVES', 'BRODMANN'] });

x('cerebellum', ['अनुमस्तिष्क (सेरिबेलम)', 'مخیخ (سیریبیلم)'], [
  "The 'little brain' at the back. It keeps movements smooth, accurate and balanced, and helps you learn skills like cycling.",
  "पीछे का 'छोटा दिमाग़'। यह हरकतों को सधा, सटीक और संतुलित रखता है और साइकिल चलाने जैसे हुनर सीखने में मदद करता है।",
  "پیچھے کا 'چھوٹا دماغ'۔ یہ حرکات کو ہموار، درست اور متوازن رکھتا ہے اور سائیکل چلانے جیسی مہارتیں سیکھنے میں مدد کرتا ہے۔",
], { e: 'From the metencephalon (rhombic lips). Its external granular layer keeps producing granule cells after birth, so the cerebellum keeps maturing through the first year of life.', r: ['GRAY', 'KANDEL', 'SNELL', 'AZEVEDO', 'SERENO'] });

x('brainstem', ['मस्तिष्क स्तंभ (ब्रेनस्टेम)', 'دماغی تنا (برین اسٹیم)'], [
  'The stalk joining brain to spinal cord. It runs breathing, heartbeat and consciousness, and is where most cranial nerves start.',
  'दिमाग़ को मेरुरज्जु से जोड़ने वाला डंठल। यह साँस, धड़कन और होश को चलाता है और ज़्यादातर कपाल तंत्रिकाएँ यहीं से निकलती हैं।',
  'دماغ کو حرام مغز سے جوڑنے والا ڈنٹھل۔ یہ سانس، دل کی دھڑکن اور ہوش کو چلاتا ہے اور زیادہ تر قحفی اعصاب یہیں سے نکلتے ہیں۔',
], { e: 'Midbrain = mesencephalon; pons = metencephalon; medulla = myelencephalon. Motor nuclei come from the basal plate and sensory nuclei from the alar plate, separated by the sulcus limitans.', r: ['GRAY', 'SNELL', 'BLUMENFELD', 'LANGMAN'] });

x('midbrain', ['मध्य मस्तिष्क (मिडब्रेन)', 'وسطی دماغ (مڈبرین)'], [
  'The top of the brainstem. It controls eye movements and pupils, and its dopamine cells are the ones lost in Parkinson\'s disease.',
  'ब्रेनस्टेम का ऊपरी भाग। यह आँखों की हरकत और पुतली को नियंत्रित करता है; पार्किंसन रोग में इसी की डोपामिन कोशिकाएँ नष्ट होती हैं।',
  'برین اسٹیم کا اوپری حصہ۔ یہ آنکھوں کی حرکت اور پتلیوں کو کنٹرول کرتا ہے؛ پارکنسن بیماری میں اسی کے ڈوپامین خلیے ختم ہوتے ہیں۔',
], { e: 'From the mesencephalon; its cavity remains narrow as the cerebral aqueduct.', r: ['GRAY', 'SNELL', 'BLUMENFELD', 'KANDEL'] });

x('pons', ['सेतु (पोन्स)', 'پونز (جسر)'], [
  'The bulging middle of the brainstem. It links the cortex with the cerebellum and controls face sensation, chewing, facial expression and side-to-side gaze.',
  'ब्रेनस्टेम का उभरा बीच वाला हिस्सा। यह cortex को cerebellum से जोड़ता है और चेहरे की संवेदना, चबाने, चेहरे के हाव-भाव और दाएँ-बाएँ देखने को नियंत्रित करता है।',
  'برین اسٹیم کا ابھرا ہوا درمیانی حصہ۔ یہ cortex کو cerebellum سے جوڑتا ہے اور چہرے کی حس، چبانے، چہرے کے تاثرات اور دائیں بائیں دیکھنے کو کنٹرول کرتا ہے۔',
], { r: ['GRAY', 'SNELL', 'BLUMENFELD'] });

x('medulla', ['मेरुशीर्ष (मेडुला ऑब्लोंगेटा)', 'میڈولا آبلونگیٹا (بصلہ)'], [
  'The lowest part of the brainstem. Its centres keep you breathing and your blood pressure steady; here motor fibres cross to the other side.',
  'ब्रेनस्टेम का सबसे निचला हिस्सा। इसके केंद्र साँस और ब्लड प्रेशर को बनाए रखते हैं; यहीं मोटर फ़ाइबर दूसरी तरफ़ क्रॉस करते हैं।',
  'برین اسٹیم کا سب سے نچلا حصہ۔ اس کے مراکز سانس اور بلڈ پریشر کو قائم رکھتے ہیں؛ یہیں موٹر ریشے دوسری طرف پار ہوتے ہیں۔',
], { r: ['GRAY', 'SNELL', 'BLUMENFELD', 'GUYTON'] });

x('spinal-cord', ['मेरुरज्जु (स्पाइनल कॉर्ड)', 'حرام مغز (اسپائنل کارڈ)'], [
  "The body's main cable inside the backbone. It carries messages between brain and body and handles fast reflexes by itself.",
  'रीढ़ की हड्डी के अंदर शरीर की मुख्य केबल। यह दिमाग़ और शरीर के बीच संदेश ले जाती है और तेज़ रिफ़्लेक्स ख़ुद संभालती है।',
  'ریڑھ کی ہڈی کے اندر جسم کی مرکزی تار۔ یہ دماغ اور جسم کے درمیان پیغام لے جاتی ہے اور تیز ریفلیکس خود سنبھالتی ہے۔',
], { v: 'The adult conus usually ends at L1–L2 but ranges from about T12 to L3.', e: 'From the caudal neural tube; the caudal neuropore closes around day 27–28 (failure: spina bifida). Basal plate → ventral horn (motor); alar plate → dorsal horn (sensory); neural crest → dorsal root ganglia, autonomic ganglia and Schwann cells.', r: ['GRAY', 'SNELL', 'KANDEL', 'LANGMAN', 'ISNCSCI'] });

x('conus', ['कोनस मेडुलैरिस और कॉडा इक्वाइना', 'کونس میڈولیرس اور کاڈا اکوائنا'], [
  "Where the spinal cord ends (around the first lumbar bone). Below it, nerve roots hang down like a horse's tail.",
  'जहाँ मेरुरज्जु ख़त्म होती है (लगभग पहली कमर की हड्डी पर)। उसके नीचे नसों की जड़ें घोड़े की पूँछ की तरह लटकती हैं।',
  'جہاں حرام مغز ختم ہوتا ہے (تقریباً کمر کے پہلے مہرے پر)۔ اس کے نیچے اعصاب کی جڑیں گھوڑے کی دُم کی طرح لٹکتی ہیں۔',
], { v: 'Conus level ranges roughly T12–L3 in adults; a conus below L2 in an adult is investigated for tethered cord.', e: 'At about 24 weeks the cord reaches S1, at birth about L3, and in adults L1–L2, because the vertebral column outgrows the cord.', r: ['GRAY', 'MOORE', 'LANGMAN'] });

x('thalamus', ['चेतक (थैलेमस)', 'تھیلیمس'], [
  "The brain's relay station. Almost every sense (except smell) passes through it before reaching the cortex.",
  'दिमाग़ का रिले स्टेशन। गंध को छोड़कर लगभग हर संवेदना cortex तक पहुँचने से पहले इससे होकर गुज़रती है।',
  'دماغ کا ریلے اسٹیشن۔ سونگھنے کے علاوہ تقریباً ہر حس cortex تک پہنچنے سے پہلے اس سے گزرتی ہے۔',
], { v: 'The interthalamic adhesion is absent in roughly a fifth to a third of brains.', e: 'From the diencephalon (alar plate).', r: ['GRAY', 'SNELL', 'KANDEL'] });

x('hypothalamus', ['अधश्चेतक और पीयूष ग्रंथि', 'ہائپوتھیلیمس اور پیچوٹری غدہ'], [
  "The body's thermostat and hormone boss: it controls hunger, thirst, temperature, sleep rhythm and the pituitary gland.",
  'शरीर का थर्मोस्टेट और हार्मोन का मालिक: यह भूख, प्यास, तापमान, नींद की लय और पीयूष ग्रंथि (pituitary) को नियंत्रित करता है।',
  'جسم کا تھرموسٹیٹ اور ہارمون کا نگران: یہ بھوک، پیاس، درجۂ حرارت، نیند کی ترتیب اور پیچوٹری غدود کو کنٹرول کرتا ہے۔',
], { e: 'Hypothalamus and posterior pituitary arise from the diencephalon (infundibulum); the anterior pituitary arises from Rathke\'s pouch, an outgrowth of the oral ectoderm.', r: ['GRAY', 'GUYTON', 'KANDEL', 'LANGMAN'] });

x('corpus-callosum', ['महासंयोजिका (कॉर्पस कैलोसम)', 'کارپس کیلوسم'], [
  'A thick bridge of about 200 million fibres that lets the left and right brain share information.',
  'लगभग 20 करोड़ फ़ाइबर का मोटा पुल जो बाएँ और दाएँ दिमाग़ को जानकारी साझा करने देता है।',
  'تقریباً 20 کروڑ ریشوں کا موٹا پل جو بائیں اور دائیں دماغ کو معلومات بانٹنے دیتا ہے۔',
], { v: 'Partial or complete agenesis is one of the commonest brain malformations; many people with it have few symptoms.', e: 'Forms from the lamina terminalis between about weeks 12 and 20, front (genu) to back (splenium), with the rostrum last.', r: ['GRAY', 'KANDEL', 'GAZZANIGA'] });

x('caudate', ['पुच्छी केन्द्रक (कॉडेट न्यूक्लियस)', 'کاڈیٹ نیوکلیئس'], [
  'A curved nucleus deep in the brain that helps start wanted movements and stop unwanted ones; it shrinks in Huntington\'s disease.',
  'दिमाग़ के अंदर एक मुड़ा हुआ केन्द्रक जो चाही गई हरकत शुरू करने और अनचाही रोकने में मदद करता है; हंटिंगटन रोग में यह सिकुड़ जाता है।',
  'دماغ کے اندر ایک خم دار مرکزہ جو مطلوبہ حرکت شروع کرنے اور غیر مطلوب کو روکنے میں مدد کرتا ہے؛ ہنٹنگٹن بیماری میں یہ سکڑ جاتا ہے۔',
], { r: ['GRAY', 'KANDEL', 'BLUMENFELD'] });

x('lentiform', ['लेंटिफ़ॉर्म केन्द्रक', 'لینٹی فارم نیوکلیئس'], [
  'A lens-shaped nucleus (putamen and globus pallidus) that fine-tunes movement; it is a target for deep brain stimulation.',
  'लेंस जैसा केन्द्रक (putamen और globus pallidus) जो हरकत को बारीकी से नियंत्रित करता है; deep brain stimulation का लक्ष्य यही है।',
  'عدسے جیسا مرکزہ (putamen اور globus pallidus) جو حرکت کو باریکی سے کنٹرول کرتا ہے؛ deep brain stimulation کا ہدف یہی ہے۔',
], { r: ['GRAY', 'KANDEL', 'BLUMENFELD'] });

x('hippocampus', ['हिप्पोकैम्पस और फ़ॉर्निक्स', 'ہپوکیمپس اور فورنکس'], [
  'A seahorse-shaped area that turns today\'s experiences into long-term memories and helps you find your way.',
  'समुद्री घोड़े जैसा हिस्सा जो आज के अनुभवों को लंबी यादों में बदलता है और रास्ता पहचानने में मदद करता है।',
  'سمندری گھوڑے جیسا حصہ جو آج کے تجربات کو دیرپا یادوں میں بدلتا ہے اور راستہ پہچاننے میں مدد کرتا ہے۔',
], { e: 'Archicortex (three-layered), older than the six-layered neocortex.', r: ['GRAY', 'KANDEL', 'SCOVILLE', 'OKEEFE'] });

x('amygdala', ['प्रमस्तिष्कखंड (एमिग्डाला)', 'امیگڈالا'], [
  'An almond-shaped alarm centre that detects danger and creates fear and emotional memories.',
  'बादाम जैसा अलार्म केंद्र जो ख़तरा पहचानता है और डर तथा भावनात्मक यादें बनाता है।',
  'بادام جیسا خطرے کا مرکز جو خطرہ پہچانتا ہے اور خوف اور جذباتی یادیں بناتا ہے۔',
], { r: ['GRAY', 'KANDEL', 'FEINSTEIN', 'KLUVER'] });

/* ======================================================= CRANIAL NERVES */
x('cn1', ['घ्राण तंत्रिका (CN I)', 'شامہ کا عصب (CN I)'], [
  'The nerve of smell. Tiny fibres from the roof of the nose pass through holes in the skull to the brain.',
  'सूँघने की तंत्रिका। नाक की छत के बारीक फ़ाइबर खोपड़ी के छेदों से होकर दिमाग़ तक जाते हैं।',
  'سونگھنے کا عصب۔ ناک کی چھت کے باریک ریشے کھوپڑی کے سوراخوں سے گزر کر دماغ تک جاتے ہیں۔',
], { e: 'From the olfactory placode (ectoderm); its axons induce the olfactory bulb. Failure of olfactory neuron and GnRH-cell migration causes Kallmann syndrome (anosmia + hypogonadism).', r: ['GRAY', 'WILSON', 'KANDEL', 'LANGMAN'] });

x('cn2', ['दृष्टि तंत्रिका (CN II)', 'بصری عصب (CN II)'], [
  'The nerve of sight. It carries what the eye sees to the brain; it is really an extension of the brain itself.',
  'देखने की तंत्रिका। आँख जो देखती है उसे दिमाग़ तक ले जाती है; असल में यह दिमाग़ का ही हिस्सा है।',
  'دیکھنے کا عصب۔ آنکھ جو دیکھتی ہے اسے دماغ تک لے جاتا ہے؛ دراصل یہ دماغ ہی کا حصہ ہے۔',
], { e: 'The retina and optic nerve grow out of the diencephalon (optic vesicle → optic cup), which is why the optic nerve is CNS tissue wrapped in meninges.', r: ['GRAY', 'WILSON', 'PURVES', 'LANGMAN'] });

x('optic-tract', ['दृष्टि पथ और विकिरण', 'بصری راستہ اور شعاعیں'], [
  'The visual highway behind the eyes. Each side carries the opposite half of what you see to the vision centre at the back of the brain.',
  'आँखों के पीछे का दृष्टि-राजमार्ग। हर तरफ़ का पथ देखे गए दृश्य का उलटा आधा हिस्सा दिमाग़ के पिछले दृष्टि केंद्र तक ले जाता है।',
  'آنکھوں کے پیچھے بینائی کی شاہراہ۔ ہر طرف کا راستہ دیکھے گئے منظر کا مخالف آدھا حصہ دماغ کے پچھلے بصری مرکز تک لے جاتا ہے۔',
], { r: ['GRAY', 'PURVES', 'BLUMENFELD'] });

x('cn3', ['नेत्रप्रेरक तंत्रिका (CN III)', 'اوکولوموٹر عصب (CN III)'], [
  'Moves most eye muscles, lifts the eyelid and makes the pupil small.',
  'आँख की ज़्यादातर मांसपेशियों को हिलाती है, पलक उठाती है और पुतली छोटी करती है।',
  'آنکھ کے زیادہ تر پٹھوں کو حرکت دیتا ہے، پلک اٹھاتا ہے اور پتلی کو چھوٹا کرتا ہے۔',
], { r: ['GRAY', 'WILSON', 'BLUMENFELD'] });

x('cn4', ['चक्रक तंत्रिका (CN IV)', 'ٹروکلئیر عصب (CN IV)'], [
  'The thinnest cranial nerve. It works one eye muscle that turns the eye down and in, as when reading or walking downstairs.',
  'सबसे पतली कपाल तंत्रिका। यह एक मांसपेशी चलाती है जो आँख को नीचे-अंदर घुमाती है, जैसे पढ़ते या सीढ़ी उतरते समय।',
  'سب سے باریک قحفی عصب۔ یہ ایک پٹھا چلاتا ہے جو آنکھ کو نیچے اور اندر گھماتا ہے، جیسے پڑھتے یا سیڑھیاں اترتے وقت۔',
], { r: ['GRAY', 'WILSON', 'BLUMENFELD'] });

x('cn5', ['त्रिधारा तंत्रिका (CN V)', 'ٹرائی جیمنل عصب (CN V)'], [
  'The face\'s feeling nerve, with three branches for forehead, cheek and jaw. It also powers the chewing muscles.',
  'चेहरे की संवेदना वाली तंत्रिका, जिसकी तीन शाखाएँ माथे, गाल और जबड़े के लिए हैं। यह चबाने की मांसपेशियाँ भी चलाती है।',
  'چہرے کی حس کا عصب، جس کی تین شاخیں پیشانی، گال اور جبڑے کے لیے ہیں۔ یہ چبانے کے پٹھے بھی چلاتا ہے۔',
], { e: 'Nerve of the 1st pharyngeal arch, which forms the muscles of mastication, mylohyoid, anterior belly of digastric, tensor tympani and tensor veli palatini.', r: ['GRAY', 'WILSON', 'LANGMAN'] });

x('cn5-v1', ['नेत्र शाखा (V1)', 'آفتھیلمک شاخ (V1)'], [
  'The top branch of the face nerve: feeling in the forehead, eye and tip of the nose.',
  'चेहरे की तंत्रिका की ऊपरी शाखा: माथे, आँख और नाक की नोक की संवेदना।',
  'چہرے کے عصب کی اوپری شاخ: پیشانی، آنکھ اور ناک کی نوک کی حس۔',
], { r: ['GRAY', 'WILSON'] });

x('cn5-v2', ['ऊर्ध्वहनु शाखा (V2)', 'میکزیلری شاخ (V2)'], [
  'The middle branch: feeling in the cheek, upper lip and upper teeth.',
  'बीच की शाखा: गाल, ऊपरी होंठ और ऊपरी दाँतों की संवेदना।',
  'درمیانی شاخ: گال، اوپری ہونٹ اور اوپری دانتوں کی حس۔',
], { r: ['GRAY', 'WILSON'] });

x('cn5-v3', ['अधोहनु शाखा (V3)', 'مینڈیبلر شاخ (V3)'], [
  'The lower branch: feeling in the chin, lower teeth and front of the tongue, plus the muscles you chew with.',
  'नीचे की शाखा: ठुड्डी, निचले दाँत और जीभ के अगले हिस्से की संवेदना, साथ ही चबाने की मांसपेशियाँ।',
  'نچلی شاخ: ٹھوڑی، نچلے دانتوں اور زبان کے اگلے حصے کی حس، اور چبانے کے پٹھے۔',
], { r: ['GRAY', 'WILSON', 'MOORE'] });

x('cn6', ['अपवर्तनी तंत्रिका (CN VI)', 'ابڈیوسنس عصب (CN VI)'], [
  'Turns the eye outward. Because of its long path it is often affected when pressure inside the skull rises.',
  'आँख को बाहर की तरफ़ घुमाती है। लंबे रास्ते की वजह से खोपड़ी में दबाव बढ़ने पर अक्सर प्रभावित होती है।',
  'آنکھ کو باہر کی طرف گھماتا ہے۔ لمبے راستے کی وجہ سے کھوپڑی میں دباؤ بڑھنے پر اکثر متاثر ہوتا ہے۔',
], { r: ['GRAY', 'WILSON', 'BLUMENFELD'] });

x('cn7', ['आननी तंत्रिका (CN VII)', 'فیشل عصب (CN VII)'], [
  'The nerve of facial expression: smiling, closing the eyes, raising eyebrows. It also carries taste from the front of the tongue and makes tears and saliva.',
  'चेहरे के हाव-भाव की तंत्रिका: मुस्कुराना, आँखें बंद करना, भौंहें उठाना। यह जीभ के अगले हिस्से का स्वाद भी लाती है और आँसू व लार बनवाती है।',
  'چہرے کے تاثرات کا عصب: مسکرانا، آنکھیں بند کرنا، بھنویں اٹھانا۔ یہ زبان کے اگلے حصے کا ذائقہ بھی لاتا ہے اور آنسو اور لعاب بنواتا ہے۔',
], { v: 'Branching inside the parotid is highly variable; surgeons classify the patterns (e.g. Davis) and locate the trunk by landmarks such as the tragal pointer.', e: 'Nerve of the 2nd pharyngeal arch, which forms the muscles of facial expression, stapedius, stylohyoid and posterior belly of digastric.', r: ['GRAY', 'WILSON', 'BAUGH', 'LANGMAN'] });

x('cn8', ['श्रवण-संतुलन तंत्रिका (CN VIII)', 'سماعت و توازن کا عصب (CN VIII)'], [
  'The nerve of hearing and balance, coming from the inner ear.',
  'सुनने और संतुलन की तंत्रिका, जो भीतरी कान से आती है।',
  'سننے اور توازن کا عصب، جو اندرونی کان سے آتا ہے۔',
], { e: 'Neurons arise from the otic placode / otic vesicle, which also forms the membranous labyrinth.', r: ['GRAY', 'WILSON', 'PURVES', 'LANGMAN'] });

x('cn9', ['जिह्वा-ग्रसनी तंत्रिका (CN IX)', 'گلوسوفیرنجیئل عصب (CN IX)'], [
  'Feeling and taste from the back of the tongue and throat; it starts the gag reflex and senses blood pressure in the neck artery.',
  'जीभ के पिछले हिस्से और गले की संवेदना और स्वाद; यह उबकाई (gag) रिफ़्लेक्स शुरू करती है और गर्दन की धमनी में ब्लड प्रेशर महसूस करती है।',
  'زبان کے پچھلے حصے اور گلے کی حس اور ذائقہ؛ یہ گیگ ریفلیکس شروع کرتا ہے اور گردن کی شریان میں بلڈ پریشر محسوس کرتا ہے۔',
], { e: 'Nerve of the 3rd pharyngeal arch, whose only muscle is stylopharyngeus.', r: ['GRAY', 'WILSON', 'LANGMAN'] });

x('cn10', ['वेगस तंत्रिका (CN X)', 'ویگس عصب (CN X)'], [
  "The 'wandering' nerve from brainstem to belly. It slows the heart, drives digestion and controls your voice box.",
  "दिमाग़ से पेट तक 'भटकने वाली' तंत्रिका। यह दिल की धड़कन धीमी करती है, पाचन चलाती है और आवाज़ की नली (larynx) को नियंत्रित करती है।",
  "دماغ سے پیٹ تک 'آوارہ گرد' عصب۔ یہ دل کی دھڑکن کو آہستہ کرتا ہے، ہاضمہ چلاتا ہے اور آواز کی نالی (larynx) کو کنٹرول کرتا ہے۔",
], { e: 'Nerve of the 4th and 6th pharyngeal arches: the superior laryngeal nerve belongs to the 4th, the recurrent laryngeal nerve to the 6th.', r: ['GRAY', 'WILSON', 'GUYTON', 'LANGMAN'] });

x('rln', ['प्रत्यावर्ती कंठ तंत्रिका', 'ریکرنٹ لیرنجیئل عصب'], [
  'A vagus branch that loops down around a big artery and climbs back up to move the vocal cords.',
  'वेगस की शाखा जो एक बड़ी धमनी के नीचे से घूमकर वापस ऊपर चढ़ती है और स्वर-रज्जु (vocal cords) को हिलाती है।',
  'ویگس کی شاخ جو ایک بڑی شریان کے نیچے سے گھوم کر واپس اوپر چڑھتی ہے اور آواز کی ڈوریوں کو حرکت دیتی ہے۔',
], { v: 'A right NON-recurrent laryngeal nerve occurs in under 1% of people, almost always with an aberrant right subclavian artery (arteria lusoria); it is a recognised thyroidectomy hazard.', e: 'It hooks under the 6th-arch artery. On the left this persists as the ductus arteriosus (ligamentum arteriosum); on the right the distal 6th-arch artery disappears, so the nerve moves up to hook under the subclavian (4th-arch) artery.', r: ['GRAY', 'MOORE', 'WILSON', 'LANGMAN'] });

x('cn11', ['सहायक तंत्रिका (CN XI)', 'ایکسیسری عصب (CN XI)'], [
  'Works two neck muscles: one that turns the head and one that shrugs the shoulder.',
  'गर्दन की दो मांसपेशियाँ चलाती है: एक जो सिर घुमाती है और एक जो कंधे उचकाती है।',
  'گردن کے دو پٹھے چلاتا ہے: ایک جو سر گھماتا ہے اور ایک جو کندھے اچکاتا ہے۔',
], { r: ['GRAY', 'WILSON', 'MOORE'] });

x('cn12', ['अधोजिह्वा तंत्रिका (CN XII)', 'ہائپوگلوسل عصب (CN XII)'], [
  'The tongue\'s motor nerve, used for speaking, chewing and swallowing.',
  'जीभ की मोटर तंत्रिका, जो बोलने, चबाने और निगलने में काम आती है।',
  'زبان کا حرکی عصب، جو بولنے، چبانے اور نگلنے میں کام آتا ہے۔',
], { e: 'Supplies muscles derived from the occipital somites, which migrate into the tongue; this explains its looping course.', r: ['GRAY', 'WILSON', 'LANGMAN'] });

/* ====================================================== CERVICAL PLEXUS */
x('lesser-occipital', ['लघु पश्चकपाल तंत्रिका', 'لیسر آکسیپیٹل عصب'], [
  'Gives feeling to the skin behind the ear.', 'कान के पीछे की त्वचा को संवेदना देती है।', 'کان کے پیچھے کی جلد کو حس دیتا ہے۔',
], { r: ['GRAY', 'MOORE'] });
x('great-auricular', ['महा कर्ण तंत्रिका', 'گریٹ آریکولر عصب'], [
  'Gives feeling to the ear lobe and the skin over the angle of the jaw.', 'कान की लौ और जबड़े के कोने की त्वचा को संवेदना देती है।', 'کان کی لو اور جبڑے کے کونے کی جلد کو حس دیتا ہے۔',
], { r: ['GRAY', 'MOORE'] });
x('transverse-cervical', ['अनुप्रस्थ ग्रीवा तंत्रिका', 'ٹرانسورس سروائیکل عصب'], [
  'Gives feeling to the skin of the front of the neck.', 'गर्दन के सामने की त्वचा को संवेदना देती है।', 'گردن کے سامنے کی جلد کو حس دیتا ہے۔',
], { r: ['GRAY', 'MOORE'] });
x('supraclavicular', ['अधिजत्रुक तंत्रिकाएँ', 'سپرا کلیویکولر اعصاب'], [
  'Give feeling to the skin over the collarbone and the top of the shoulder.', 'हँसली (collarbone) और कंधे के ऊपरी हिस्से की त्वचा को संवेदना देती हैं।', 'ہنسلی کی ہڈی اور کندھے کے اوپری حصے کی جلد کو حس دیتے ہیں۔',
], { r: ['GRAY', 'MOORE'] });
x('phrenic', ['मध्यच्छदा तंत्रिका (फ़्रेनिक)', 'فرینک عصب'], [
  'The breathing nerve. It comes from the neck (C3–C5) and is the only nerve that makes the diaphragm contract.',
  'साँस की तंत्रिका। यह गर्दन (C3–C5) से निकलती है और अकेली तंत्रिका है जो डायाफ्राम को सिकोड़ती है।',
  'سانس کا عصب۔ یہ گردن (C3–C5) سے نکلتا ہے اور واحد عصب ہے جو ڈایافرام کو سکیڑتا ہے۔',
], { v: 'An accessory phrenic nerve (usually from C5, often via the nerve to subclavius) is common and can keep the diaphragm working after phrenic injury.', e: 'The diaphragm\'s muscle forms in the neck region (septum transversum at the C3–C5 level) and then descends, dragging its nerve along: that is why a neck nerve supplies a muscle in the abdomen\'s roof.', r: ['GRAY', 'MOORE', 'LANGMAN'] });
x('greater-occipital', ['महा पश्चकपाल तंत्रिका', 'گریٹر آکسیپیٹل عصب'], [
  'Gives feeling to the back of the scalp; a common source of headache at the back of the head.', 'सिर के पिछले हिस्से की त्वचा को संवेदना देती है; सिर के पीछे होने वाले दर्द का आम स्रोत।', 'سر کے پچھلے حصے کی جلد کو حس دیتا ہے؛ سر کے پیچھے ہونے والے درد کا عام سبب۔',
], { r: ['GRAY', 'MOORE'] });

/* ====================================================== BRACHIAL PLEXUS */
const bp = { v: 'A "prefixed" plexus takes a large contribution from C4 and a "postfixed" one from T2; branching patterns also vary considerably.', e: 'Spinal nerves C5–T1 grow into the upper limb bud during week 5; the dorsal (posterior) divisions supply the extensor muscle mass and the ventral (anterior) divisions the flexors.', r: ['GRAY', 'MOORE', 'NETTER', 'LANGMAN'] };
x('upper-trunk', ['ऊपरी ट्रंक (C5–C6)', 'اپر ٹرنک (C5–C6)'], [
  'Formed by the C5 and C6 roots; it controls the shoulder and bending of the elbow.', 'C5 और C6 जड़ों से बनता है; कंधे और कोहनी मोड़ने को नियंत्रित करता है।', 'C5 اور C6 جڑوں سے بنتا ہے؛ کندھے اور کہنی موڑنے کو کنٹرول کرتا ہے۔',
], bp);
x('middle-trunk', ['मध्य ट्रंक (C7)', 'مڈل ٹرنک (C7)'], [
  'The continuation of the C7 root; it helps straighten the elbow, wrist and fingers.', 'C7 जड़ का ही आगे का हिस्सा; कोहनी, कलाई और उँगलियाँ सीधी करने में मदद करता है।', 'C7 جڑ کا اگلا حصہ؛ کہنی، کلائی اور انگلیاں سیدھی کرنے میں مدد کرتا ہے۔',
], bp);
x('lower-trunk', ['निचला ट्रंक (C8–T1)', 'لوئر ٹرنک (C8–T1)'], [
  'Formed by C8 and T1; it controls the small muscles of the hand.', 'C8 और T1 से बनता है; हाथ की छोटी मांसपेशियों को नियंत्रित करता है।', 'C8 اور T1 سے بنتا ہے؛ ہاتھ کے چھوٹے پٹھوں کو کنٹرول کرتا ہے۔',
], bp);
x('lateral-cord', ['पार्श्व कॉर्ड', 'لیٹرل کارڈ'], [
  'The outer cord in the armpit; it feeds the arm flexors and half of the median nerve.', 'बगल की बाहरी कॉर्ड; बाँह मोड़ने वाली मांसपेशियों और median nerve के आधे हिस्से को फ़ाइबर देती है।', 'بغل کی بیرونی کارڈ؛ بازو موڑنے والے پٹھوں اور median nerve کے آدھے حصے کو ریشے دیتی ہے۔',
], bp);
x('posterior-cord', ['पश्च कॉर्ड', 'پوسٹیریئر کارڈ'], [
  'The back cord in the armpit; it feeds every muscle that straightens the arm.', 'बगल की पिछली कॉर्ड; बाँह सीधी करने वाली हर मांसपेशी को फ़ाइबर देती है।', 'بغل کی پچھلی کارڈ؛ بازو سیدھا کرنے والے ہر پٹھے کو ریشے دیتی ہے۔',
], bp);
x('medial-cord', ['मध्य कॉर्ड', 'میڈیل کارڈ'], [
  'The inner cord in the armpit; it feeds the ulnar nerve and the hand\'s small muscles.', 'बगल की भीतरी कॉर्ड; ulnar nerve और हाथ की छोटी मांसपेशियों को फ़ाइबर देती है।', 'بغل کی اندرونی کارڈ؛ ulnar nerve اور ہاتھ کے چھوٹے پٹھوں کو ریشے دیتی ہے۔',
], bp);
x('musculocutaneous', ['मस्कुलोक्यूटेनियस तंत्रिका', 'مسکولوکیوٹینیئس عصب'], [
  'Powers the biceps to bend the elbow and gives feeling to the outer forearm.', 'बाइसेप्स को चलाकर कोहनी मोड़ती है और बाँह के बाहरी अग्रभाग को संवेदना देती है।', 'بائسیپس کو چلا کر کہنی موڑتا ہے اور بازو کے بیرونی اگلے حصے کو حس دیتا ہے۔',
], { v: 'Communications with the median nerve are frequent; occasionally the nerve is absent and its fibres travel inside the median nerve.', r: ['GRAY', 'MOORE', 'RUSSELL'] });
x('axillary', ['कक्षीय तंत्रिका (एक्सिलरी)', 'ایکسیلری عصب'], [
  'Powers the deltoid, the round shoulder muscle that lifts the arm sideways; often hurt in shoulder dislocation.', 'डेल्टॉइड चलाती है, कंधे की गोल मांसपेशी जो बाँह को बगल में उठाती है; कंधा उतरने पर अक्सर घायल होती है।', 'ڈیلٹائڈ کو چلاتا ہے، کندھے کا گول پٹھا جو بازو کو پہلو میں اٹھاتا ہے؛ کندھا اترنے پر اکثر زخمی ہوتا ہے۔',
], { r: ['GRAY', 'MOORE', 'AIDS'] });
x('radial', ['रेडियल तंत्रिका', 'ریڈیل عصب'], [
  'The nerve of straightening: it opens the elbow, wrist and fingers. Damage causes "wrist drop".', 'सीधा करने की तंत्रिका: कोहनी, कलाई और उँगलियाँ खोलती है। चोट से "कलाई लटकना" (wrist drop) होता है।', 'سیدھا کرنے کا عصب: کہنی، کلائی اور انگلیاں کھولتا ہے۔ چوٹ سے "کلائی لٹکنا" (wrist drop) ہوتا ہے۔',
], { r: ['GRAY', 'MOORE', 'AIDS', 'RUSSELL', 'SEDDON'] });
x('radial-superficial', ['रेडियल की सतही शाखा', 'ریڈیل کی سطحی شاخ'], [
  'A pure feeling branch to the back of the thumb side of the hand.', 'हाथ के अंगूठे वाली तरफ़ की पीठ को संवेदना देने वाली शाखा।', 'ہاتھ کے انگوٹھے والی طرف کی پشت کو حس دینے والی شاخ۔',
], { r: ['GRAY', 'MOORE'] });
x('pin', ['पश्च अंतरास्थि तंत्रिका (PIN)', 'پوسٹیریئر انٹراوسیئس عصب (PIN)'], [
  'The deep motor branch of the radial nerve that straightens the fingers and thumb.', 'रेडियल की गहरी मोटर शाखा जो उँगलियाँ और अंगूठा सीधा करती है।', 'ریڈیل کی گہری حرکی شاخ جو انگلیاں اور انگوٹھا سیدھا کرتی ہے۔',
], { r: ['GRAY', 'MOORE', 'RUSSELL'] });
x('median', ['मीडियन तंत्रिका', 'میڈین عصب'], [
  'The nerve of the precise thumb grip and of feeling in the thumb, index and middle fingers. It is squeezed in carpal tunnel syndrome.',
  'अंगूठे की सटीक पकड़ और अंगूठे, तर्जनी व बीच की उँगली की संवेदना की तंत्रिका। कार्पल टनल सिंड्रोम में यही दबती है।',
  'انگوٹھے کی درست گرفت اور انگوٹھے، شہادت اور درمیانی انگلی کی حس کا عصب۔ کارپل ٹنل سنڈروم میں یہی دبتا ہے۔',
], { v: 'Martin–Gruber anastomosis (median-to-ulnar fibres in the forearm) is present in roughly 15–20% of forearms; the recurrent (thenar) branch may arise below, through or above the flexor retinaculum.', r: ['GRAY', 'MOORE', 'AIDS', 'PADUA', 'RUSSELL'] });
x('ulnar', ['अल्नर तंत्रिका', 'النر عصب'], [
  'The "funny bone" nerve. It controls the fine finger movements of the hand and feeling in the little and ring fingers.',
  '"फ़नी बोन" वाली तंत्रिका। यह हाथ की बारीक उँगली की हरकतें और छोटी व अनामिका उँगली की संवेदना संभालती है।',
  '"فنی بون" والا عصب۔ یہ ہاتھ کی باریک انگلیوں کی حرکات اور چھوٹی اور انگوٹھی والی انگلی کی حس سنبھالتا ہے۔',
], { v: 'Martin–Gruber and Riche–Cannieu anastomoses can shift muscles between median and ulnar supply, changing the expected signs after injury.', r: ['GRAY', 'MOORE', 'AIDS', 'RUSSELL'] });
x('long-thoracic', ['दीर्घ वक्ष तंत्रिका', 'لانگ تھوراسک عصب'], [
  'Powers serratus anterior, which holds the shoulder blade flat on the ribs. Damage makes the shoulder blade stick out ("winging").',
  'सेराटस एंटीरियर चलाती है जो कंधे की हड्डी (scapula) को पसलियों से सटाए रखती है। चोट से scapula बाहर निकल आती है ("winging")।',
  'سیریٹس اینٹیریئر کو چلاتا ہے جو کندھے کی ہڈی کو پسلیوں سے لگائے رکھتا ہے۔ چوٹ سے کندھے کی ہڈی باہر نکل آتی ہے ("winging")۔',
], { v: 'The C7 contribution is absent in a minority of people.', r: ['GRAY', 'MOORE'] });
x('suprascapular', ['अधिअंसफलक तंत्रिका', 'سپرا اسکیپولر عصب'], [
  'Powers two rotator-cuff muscles that start lifting the arm and turn it outward.', 'रोटेटर कफ़ की दो मांसपेशियाँ चलाती है जो बाँह उठाना शुरू करती और बाहर घुमाती हैं।', 'روٹیٹر کف کے دو پٹھے چلاتا ہے جو بازو اٹھانا شروع کرتے اور باہر گھماتے ہیں۔',
], { r: ['GRAY', 'MOORE'] });
x('thoracodorsal', ['वक्षपृष्ठीय तंत्रिका', 'تھوراکو ڈورسل عصب'], [
  'Powers latissimus dorsi, the big back muscle used in climbing and swimming.', 'लैटिसिमस डॉर्सी चलाती है, पीठ की बड़ी मांसपेशी जो चढ़ने और तैरने में काम आती है।', 'لیٹیسیمس ڈورسائی کو چلاتا ہے، کمر کا بڑا پٹھا جو چڑھنے اور تیرنے میں کام آتا ہے۔',
], { r: ['GRAY', 'MOORE'] });

/* ====================================================== LUMBAR PLEXUS */
const lp = { v: 'The lumbar plexus can be prefixed (more T12) or postfixed (more L5). An accessory obturator nerve is present in roughly 10% of people.', e: 'The lower limb bud rotates medially during development, which is why the knee faces forward and the dermatomes spiral down the leg.', r: ['GRAY', 'MOORE', 'NETTER', 'LANGMAN'] };
x('iliohypogastric', ['इलियोहाइपोगैस्ट्रिक तंत्रिका', 'الیو ہائپوگیسٹرک عصب'], [
  'Gives feeling just above the pubic bone and helps tighten the lower belly muscles.', 'जघन हड्डी के ठीक ऊपर संवेदना देती है और पेट के निचले हिस्से की मांसपेशियाँ कसने में मदद करती है।', 'زیرِ ناف ہڈی کے بالکل اوپر حس دیتا ہے اور پیٹ کے نچلے پٹھوں کو کسنے میں مدد کرتا ہے۔',
], lp);
x('ilioinguinal', ['इलियोइंग्विनल तंत्रिका', 'الیو انگوائنل عصب'], [
  'Runs through the groin canal; gives feeling to the upper inner thigh and genital skin.', 'जाँघ के जोड़ की नली (inguinal canal) से गुज़रती है; ऊपरी भीतरी जाँघ और जननांग की त्वचा को संवेदना देती है।', 'نالی (inguinal canal) سے گزرتا ہے؛ اوپری اندرونی ران اور تناسلی جلد کو حس دیتا ہے۔',
], lp);
x('genitofemoral', ['जेनिटोफ़ेमोरल तंत्रिका', 'جینیٹو فیمورل عصب'], [
  'Pierces the psoas muscle; it lifts the testis (cremaster) and gives feeling to the groin.', 'सोआस मांसपेशी को भेदती है; अंडकोष उठाती है (cremaster) और जाँघ के जोड़ को संवेदना देती है।', 'سوآس پٹھے کو چیرتا ہے؛ خصیے کو اٹھاتا ہے (cremaster) اور نالی کے حصے کو حس دیتا ہے۔',
], lp);
x('lfcn', ['पार्श्व ऊरु त्वचीय तंत्रिका', 'لیٹرل فیمورل کیوٹینیئس عصب'], [
  'Gives feeling to the outer thigh; tight belts or jeans can squeeze it and cause burning numbness.', 'जाँघ के बाहरी हिस्से को संवेदना देती है; तंग बेल्ट या जींस से दबकर जलन और सुन्नपन हो सकता है।', 'ران کے بیرونی حصے کو حس دیتا ہے؛ تنگ بیلٹ یا جینز سے دب کر جلن اور سن پن ہو سکتا ہے۔',
], { v: 'It may pass through, above or below the inguinal ligament, or even over the iliac crest, lateral to the ASIS.', r: ['GRAY', 'MOORE'] });
x('femoral', ['ऊरु तंत्रिका (फ़ेमोरल)', 'فیمورل عصب'], [
  'Powers the big front-thigh muscle (quadriceps) that straightens the knee; it carries the knee-jerk reflex.', 'जाँघ की आगे की बड़ी मांसपेशी (quadriceps) चलाती है जो घुटना सीधा करती है; घुटने का झटका (knee-jerk) इसी से होता है।', 'ران کے اگلے بڑے پٹھے (quadriceps) کو چلاتا ہے جو گھٹنا سیدھا کرتا ہے؛ گھٹنے کا جھٹکا (knee-jerk) اسی سے ہوتا ہے۔',
], lp);
x('saphenous', ['सैफ़ेनस तंत्रिका', 'سیفینس عصب'], [
  'The longest feeling branch of the femoral nerve, down the inner leg to the foot.', 'फ़ेमोरल की सबसे लंबी संवेदी शाखा, जो टाँग के भीतरी हिस्से से पैर तक जाती है।', 'فیمورل کی سب سے لمبی حسی شاخ، جو ٹانگ کے اندرونی حصے سے پاؤں تک جاتی ہے۔',
], { r: ['GRAY', 'MOORE'] });
x('obturator', ['ऑब्ट्यूरेटर तंत्रिका', 'اوبچوریٹر عصب'], [
  'Powers the inner-thigh muscles that pull the legs together.', 'जाँघ के भीतरी हिस्से की मांसपेशियाँ चलाती है जो टाँगों को आपस में मिलाती हैं।', 'ران کے اندرونی پٹھے چلاتا ہے جو ٹانگوں کو آپس میں ملاتے ہیں۔',
], lp);

/* ====================================================== SACRAL PLEXUS */
const sp = { e: 'The lower limb bud rotates medially, so the extensor (dorsal-division) muscles end up at the front of the thigh and leg and the flexors (ventral-division) at the back.', r: ['GRAY', 'MOORE', 'NETTER', 'LANGMAN'] };
x('lumbosacral-trunk', ['कटि-त्रिक ट्रंक', 'لمبو سیکرل ٹرنک'], [
  'The link (L4–L5) that joins the lower back nerves to the pelvic nerve plexus.', 'वह कड़ी (L4–L5) जो कमर की तंत्रिकाओं को श्रोणि के तंत्रिका जाल से जोड़ती है।', 'وہ کڑی (L4–L5) جو کمر کے اعصاب کو پیڑو کے اعصابی جال سے جوڑتی ہے۔',
], sp);
x('superior-gluteal', ['ऊर्ध्व नितंब तंत्रिका', 'سپیریئر گلوٹیل عصب'], [
  'Powers the hip muscles that keep your pelvis level when you stand on one leg.', 'कूल्हे की वे मांसपेशियाँ चलाती है जो एक पैर पर खड़े होने पर श्रोणि को सीधा रखती हैं।', 'کولہے کے وہ پٹھے چلاتا ہے جو ایک ٹانگ پر کھڑے ہونے پر پیڑو کو سیدھا رکھتے ہیں۔',
], sp);
x('inferior-gluteal', ['अधो नितंब तंत्रिका', 'انفیریئر گلوٹیل عصب'], [
  'Powers gluteus maximus, used for climbing stairs and standing up from a chair.', 'ग्लूटियस मैक्सिमस चलाती है, जो सीढ़ी चढ़ने और कुर्सी से उठने में काम आती है।', 'گلوٹیئس میکسیمس کو چلاتا ہے، جو سیڑھیاں چڑھنے اور کرسی سے اٹھنے میں کام آتا ہے۔',
], sp);
x('pfcn', ['पश्च ऊरु त्वचीय तंत्रिका', 'پوسٹیریئر فیمورل کیوٹینیئس عصب'], [
  'Gives feeling to the back of the thigh.', 'जाँघ के पिछले हिस्से को संवेदना देती है।', 'ران کے پچھلے حصے کو حس دیتا ہے۔',
], { r: ['GRAY', 'MOORE'] });
x('sciatic', ['कटिस्नायु तंत्रिका (साइटिक)', 'عرق النسا کا عصب (سائٹک)'], [
  'The thickest nerve in the body, running down the back of the thigh. It controls almost everything below the knee; its irritation is "sciatica".',
  'शरीर की सबसे मोटी तंत्रिका, जो जाँघ के पीछे से नीचे जाती है। घुटने के नीचे लगभग सब कुछ यही चलाती है; इसकी जलन को "साइटिका" कहते हैं।',
  'جسم کا سب سے موٹا عصب، جو ران کے پیچھے سے نیچے جاتا ہے۔ گھٹنے کے نیچے تقریباً سب کچھ یہی چلاتا ہے؛ اس کی سوزش کو "عرق النسا" (سائیٹیکا) کہتے ہیں۔',
], { v: 'In a cadaveric meta-analysis about 16.9% of limbs had a non-standard sciatic–piriformis relationship, most often the common fibular division passing through piriformis. The nerve may also divide high, even inside the pelvis.', e: sp.e, r: ['GRAY', 'MOORE', 'SMOLL', 'AIDS'] });
x('tibial', ['टिबियल तंत्रिका', 'ٹبیئل عصب'], [
  'Powers the calf muscles that push you onto your toes and gives feeling to the sole.', 'पिंडली की मांसपेशियाँ चलाती है जो आपको पंजों पर उठाती हैं और तलवे को संवेदना देती है।', 'پنڈلی کے پٹھے چلاتا ہے جو آپ کو پنجوں پر اٹھاتے ہیں اور تلوے کو حس دیتا ہے۔',
], sp);
x('common-fibular', ['सामान्य फ़िबुलर (पेरोनियल) तंत्रिका', 'کامن فبیولر (پیرونیئل) عصب'], [
  'Wraps just under the skin around the knee bone on the outside. Pressure here causes "foot drop".',
  'घुटने के बाहर हड्डी के चारों ओर त्वचा के ठीक नीचे लिपटी रहती है। यहाँ दबाव से "पैर लटकना" (foot drop) होता है।',
  'گھٹنے کے باہر ہڈی کے گرد جلد کے بالکل نیچے لپٹا رہتا ہے۔ یہاں دباؤ سے "پاؤں لٹکنا" (foot drop) ہوتا ہے۔',
], sp);
x('deep-fibular', ['गहरी फ़िबुलर तंत्रिका', 'ڈیپ فبیولر عصب'], [
  'Lifts the foot and toes upward; gives feeling only to the web between the first two toes.', 'पैर और उँगलियाँ ऊपर उठाती है; सिर्फ़ पहली दो उँगलियों के बीच की त्वचा को संवेदना देती है।', 'پاؤں اور انگلیاں اوپر اٹھاتا ہے؛ صرف پہلی دو انگلیوں کے درمیان کی جلد کو حس دیتا ہے۔',
], sp);
x('superficial-fibular', ['सतही फ़िबुलर तंत्रिका', 'سپرفیشل فبیولر عصب'], [
  'Turns the foot outward and gives feeling to the top of the foot.', 'पैर को बाहर की ओर मोड़ती है और पैर के ऊपरी हिस्से को संवेदना देती है।', 'پاؤں کو باہر کی طرف موڑتا ہے اور پاؤں کے اوپری حصے کو حس دیتا ہے۔',
], sp);
x('sural', ['सूरल तंत्रिका', 'سورل عصب'], [
  'Gives feeling to the outer edge of the foot; doctors use it for nerve biopsies and grafts.', 'पैर के बाहरी किनारे को संवेदना देती है; डॉक्टर इसे नर्व बायोप्सी और ग्राफ़्ट के लिए इस्तेमाल करते हैं।', 'پاؤں کے بیرونی کنارے کو حس دیتا ہے؛ ڈاکٹر اسے عصبی بایوپسی اور گرافٹ کے لیے استعمال کرتے ہیں۔',
], { r: ['GRAY', 'MOORE'] });
x('pudendal', ['पुडेंडल तंत्रिका', 'پیوڈینڈل عصب'], [
  'Controls the voluntary sphincters (holding urine and stool) and feeling in the genital area.', 'मूत्र और मल रोकने वाली स्वैच्छिक मांसपेशियों (sphincters) और जननांग क्षेत्र की संवेदना को नियंत्रित करती है।', 'پیشاب اور پاخانہ روکنے والے ارادی پٹھوں (sphincters) اور تناسلی حصے کی حس کو کنٹرول کرتا ہے۔',
], { v: 'It may pierce the sacrotuberous ligament, a recognised site of entrapment.', r: ['GRAY', 'MOORE'] });

/* ============================================================ AUTONOMIC */
x('sympathetic-trunk', ['अनुकंपी ट्रंक (सिम्पैथेटिक चेन)', 'سمپیتھیٹک ٹرنک'], [
  'Two beaded chains beside the spine that carry "fight-or-flight" signals: faster heart, wide pupils, sweating.',
  'रीढ़ के दोनों ओर दो मनकों जैसी ज़ंजीरें जो "लड़ो या भागो" के संकेत ले जाती हैं: तेज़ धड़कन, फैली पुतलियाँ, पसीना।',
  'ریڑھ کے دونوں طرف موتیوں جیسی دو زنجیریں جو "لڑو یا بھاگو" کے اشارے لے جاتی ہیں: تیز دھڑکن، پھیلی پتلیاں، پسینہ۔',
], { v: 'The inferior cervical and first thoracic ganglia fuse into a stellate (cervicothoracic) ganglion in about 80% of people.', e: 'All sympathetic ganglia and the adrenal medulla come from neural crest cells.', r: ['GRAY', 'MOORE', 'GUYTON', 'LANGMAN'] });
x('greater-splanchnic', ['महा स्प्लैंकनिक तंत्रिका', 'گریٹر اسپلینکنک عصب'], [
  'Carries fight-or-flight signals to the stomach, liver and the adrenal gland, which releases adrenaline.', 'लड़ो-या-भागो संकेत पेट, जिगर और एड्रिनल ग्रंथि तक ले जाती है, जो एड्रेनालिन छोड़ती है।', 'لڑو یا بھاگو کے اشارے معدے، جگر اور ایڈرینل غدود تک لے جاتا ہے، جو ایڈرینالین خارج کرتا ہے۔',
], { r: ['GRAY', 'MOORE', 'GUYTON'] });
x('pelvic-splanchnic', ['श्रोणि स्प्लैंकनिक तंत्रिकाएँ', 'پیلوک اسپلینکنک اعصاب'], [
  'Rest-and-digest nerves (S2–S4) that empty the bladder and bowel and cause erection.', 'आराम-और-पाचन वाली तंत्रिकाएँ (S2–S4) जो मूत्राशय और आँत ख़ाली करती हैं और उत्थान (erection) कराती हैं।', 'آرام اور ہاضمے والے اعصاب (S2–S4) جو مثانہ اور آنت خالی کرتے ہیں اور انتصاب (erection) کراتے ہیں۔',
], { r: ['GRAY', 'MOORE', 'GUYTON'] });

/* =============================================================== ORGANS */
x('heart', ['हृदय', 'دل'], [
  'The heart beats on its own, but nerves change its speed: the vagus slows it, sympathetic nerves speed it up.', 'दिल अपने आप धड़कता है, पर तंत्रिकाएँ उसकी रफ़्तार बदलती हैं: वेगस धीमा करती है, सिम्पैथेटिक तेज़ करती हैं।', 'دل خود بخود دھڑکتا ہے، مگر اعصاب اس کی رفتار بدلتے ہیں: ویگس آہستہ کرتا ہے، سمپیتھیٹک تیز کرتے ہیں۔',
], { r: ['GUYTON', 'GRAY'] });
x('diaphragm', ['डायाफ्राम (मध्यपट)', 'ڈایافرام (حجاب حاجز)'], [
  'The dome-shaped breathing muscle under the lungs, worked only by the phrenic nerves.', 'फेफड़ों के नीचे गुंबद जैसी साँस की मांसपेशी, जिसे सिर्फ़ फ़्रेनिक तंत्रिकाएँ चलाती हैं।', 'پھیپھڑوں کے نیچے گنبد نما سانس کا پٹھا، جسے صرف فرینک اعصاب چلاتے ہیں۔',
], { r: ['GRAY', 'MOORE', 'LANGMAN'] });
x('eye', ['आँख', 'آنکھ'], [
  'Six nerve systems meet here: sight, three nerves for movement, feeling of the cornea, closing the lids and pupil size.', 'यहाँ छह तंत्रिका प्रणालियाँ मिलती हैं: देखना, हिलाने वाली तीन तंत्रिकाएँ, कॉर्निया की संवेदना, पलक बंद करना और पुतली का आकार।', 'یہاں چھ اعصابی نظام ملتے ہیں: دیکھنا، حرکت دینے والے تین اعصاب، قرنیہ کی حس، پلک بند کرنا اور پتلی کا سائز۔',
], { r: ['GRAY', 'WILSON'] });
x('inner-ear', ['भीतरी कान', 'اندرونی کان'], [
  'A tiny maze in the skull bone: the snail-shaped cochlea hears, the three loops sense head rotation.', 'खोपड़ी की हड्डी में एक नन्हा भूलभुलैया: घोंघे जैसा cochlea सुनता है, तीन छल्ले सिर का घूमना महसूस करते हैं।', 'کھوپڑی کی ہڈی میں ایک ننھی بھول بھلیاں: گھونگھے جیسا cochlea سنتا ہے، تین حلقے سر کا گھومنا محسوس کرتے ہیں۔',
], { e: 'The membranous labyrinth develops from the otic placode (otic vesicle).', r: ['GRAY', 'PURVES', 'LANGMAN'] });

/* ===================================================== generated entries */
export function spinalExtra(level) {
  return {
    name: { hi: `मेरु तंत्रिका ${level}`, ur: `نخاعی عصب ${level}` },
    simple: {
      en: `One of the 31 pairs of spinal nerves. ${level} carries both feeling from its skin band (dermatome) and commands to its muscles (myotome).`,
      hi: `31 जोड़ी मेरु तंत्रिकाओं में से एक। ${level} अपनी त्वचा-पट्टी (dermatome) की संवेदना और अपनी मांसपेशियों (myotome) के आदेश, दोनों ले जाती है।`,
      ur: `اسپائنل اعصاب کے 31 جوڑوں میں سے ایک۔ ${level} اپنی جلد کی پٹی (dermatome) کی حس اور اپنے پٹھوں (myotome) کے احکامات، دونوں لے جاتا ہے۔`,
    },
    variations: 'Dermatome maps differ between sources and between people; overlap between neighbouring roots means a single-root lesion often gives a smaller patch of numbness than the map suggests.',
    embryology: 'Each spinal nerve supplies the tissue derived from its own somite: dermatome (skin), myotome (muscle) and sclerotome (vertebra).',
    refs: ['GRAY', 'MOORE', 'ISNCSCI', 'LEE2008', 'AIDS'],
  };
}
export function intercostalExtra(n) {
  return {
    name: { hi: n === 12 ? 'अधःपर्शुक तंत्रिका (T12)' : `अंतरपर्शुक तंत्रिका T${n}`, ur: n === 12 ? 'سب کوسٹل عصب (T12)' : `انٹرکوسٹل عصب T${n}` },
    simple: {
      en: `Runs under rib ${n} and supplies one band of the chest${n >= 7 ? ' and belly' : ''} wall: its muscles and skin.`,
      hi: `पसली ${n} के नीचे चलती है और छाती${n >= 7 ? ' व पेट' : ''} की दीवार की एक पट्टी — उसकी मांसपेशियाँ और त्वचा — को सप्लाई करती है।`,
      ur: `پسلی ${n} کے نیچے چلتا ہے اور سینے${n >= 7 ? ' اور پیٹ' : ''} کی دیوار کی ایک پٹی — اس کے پٹھوں اور جلد — کو سپلائی کرتا ہے۔`,
    },
    refs: ['GRAY', 'MOORE', 'LEE2008'],
  };
}

/* ========================================================== MICRO LEVEL */
// Clickable parts of the nerve-fibre and neuron scenes.
export const MICRO_INFO = {
  epineurium: { name: 'Epineurium', latin: 'Epineurium', fn: 'micro', summary: 'The outer coat of a peripheral nerve: dense irregular connective tissue with fat and blood vessels that binds all fascicles together and cushions them.',
    facts: [['Made of', 'Collagen (types I and III), fibroblasts, adipocytes'], ['Contains', 'Vasa nervorum, lymphatics'], ['Share of nerve area', 'Often 30–75% of a cross-section']],
    clinical: 'Surgeons suture the epineurium in an epineurial nerve repair. Fat in the epineurium protects nerves over joints from compression.',
    simple: ['The tough outer sleeve of the nerve, padded with fat and carrying blood vessels.', 'तंत्रिका की मज़बूत बाहरी आस्तीन, जिसमें चर्बी की गद्दी और रक्त वाहिकाएँ होती हैं।', 'عصب کی مضبوط بیرونی آستین، جس میں چربی کی گدی اور خون کی نالیاں ہوتی ہیں۔'], hi: 'एपिन्यूरियम', ur: 'ایپی نیوریئم', refs: ['GRAY', 'SUNDERLAND'] },
  perineurium: { name: 'Perineurium', latin: 'Perineurium', fn: 'micro', summary: 'A sheath of flattened perineurial cells, in several concentric layers joined by tight junctions, around each fascicle. It forms the blood–nerve barrier and keeps fascicles under slight positive pressure.',
    facts: [['Cells', 'Perineurial (myoid-like) epithelioid cells with basal laminae'], ['Function', 'Blood–nerve barrier, tensile strength'], ['Layers', 'Up to about 15 lamellae in large fascicles']],
    clinical: 'Group-fascicular repair sutures the perineurium. In Sunderland grade 4 injuries the perineurium is disrupted, so recovery needs surgery.',
    simple: ['A sealed wrapper around each bundle of fibres that protects them like a barrier.', 'फ़ाइबरों के हर गुच्छे के चारों ओर एक बंद आवरण जो उन्हें दीवार की तरह बचाता है।', 'ریشوں کے ہر گچھے کے گرد ایک بند غلاف جو انہیں دیوار کی طرح بچاتا ہے۔'], hi: 'पेरिन्यूरियम', ur: 'پیری نیوریئم', refs: ['GRAY', 'SUNDERLAND'] },
  endoneurium: { name: 'Endoneurium', latin: 'Endoneurium', fn: 'micro', summary: 'Delicate loose connective tissue (fine collagen, endoneurial fluid, capillaries) surrounding each individual nerve fibre and its Schwann cells inside a fascicle.',
    facts: [['Contains', 'Fine collagen, fibroblasts, macrophages, capillaries'], ['Encloses', 'Single axon–Schwann cell units']],
    clinical: 'The endoneurial tube left after axonal injury guides the regrowing axon (Seddon axonotmesis; Sunderland grades 2–3). Regeneration is about 1 mm per day.',
    simple: ['The thin, soft packing around each single fibre.', 'हर एक फ़ाइबर के चारों ओर पतली, मुलायम परत।', 'ہر ایک ریشے کے گرد پتلی، نرم تہہ۔'], hi: 'एंडोन्यूरियम', ur: 'اینڈو نیوریئم', refs: ['GRAY', 'SEDDON', 'SUNDERLAND'] },
  fascicle: { name: 'Fascicle', latin: 'Fasciculus nervi', fn: 'micro', summary: 'A bundle of nerve fibres wrapped in perineurium. Large nerves contain anything from one to over a hundred fascicles, which branch and rejoin (plexiform pattern) along the nerve.',
    facts: [['Wrapper', 'Perineurium'], ['Pattern', 'Plexiform exchange of fibres between fascicles'], ['Example', 'The sciatic nerve has dozens of fascicles']],
    clinical: 'Fascicles destined for a particular branch become grouped near that branch, which surgeons use for nerve transfers.',
    simple: ['A cable bundle inside the nerve, like a wire bundle inside a big electric cable.', 'तंत्रिका के अंदर फ़ाइबरों का गुच्छा, जैसे बड़ी बिजली की केबल के अंदर तारों का गुच्छा।', 'عصب کے اندر ریشوں کا گچھا، جیسے بڑی بجلی کی تار کے اندر تاروں کا گچھا۔'], hi: 'फ़ैसिकल (गुच्छा)', ur: 'فیسیکل (گچھا)', refs: ['GRAY', 'SUNDERLAND'] },
  axon: { name: 'Myelinated axon', latin: 'Axon (neurofibra myelinata)', fn: 'micro', summary: 'The long cable of a neuron that carries action potentials away from the cell body. In peripheral nerves large axons (Aα, Aβ) are myelinated and conduct fast.',
    facts: [['Aα (motor, Ia)', '12–20 µm · 70–120 m/s'], ['Aβ (touch)', '6–12 µm · 35–75 m/s'], ['Aδ (sharp pain, cold)', '1–5 µm · 5–35 m/s'], ['C (dull pain, autonomic)', '0.2–1.5 µm · 0.5–2 m/s, unmyelinated']],
    clinical: 'Demyelination (Guillain–Barré syndrome, CIDP) slows conduction and causes conduction block on nerve conduction studies; axonal loss reduces amplitude instead.',
    simple: ['The long wire of a nerve cell that carries the electric signal.', 'तंत्रिका कोशिका का लंबा तार जो बिजली का संकेत ले जाता है।', 'عصبی خلیے کا لمبا تار جو برقی اشارہ لے جاتا ہے۔'], hi: 'एक्सॉन', ur: 'ایکسون', refs: ['KANDEL', 'GUYTON', 'PURVES'] },
  myelin: { name: 'Myelin sheath (Schwann cell)', latin: 'Stratum myelini', fn: 'micro', summary: 'Many tightly wrapped layers of Schwann cell membrane (in the CNS, oligodendrocyte membrane) that insulate the axon. One Schwann cell myelinates one internode of one axon.',
    facts: [['PNS', 'Schwann cell: 1 cell → 1 internode'], ['CNS', 'Oligodendrocyte: 1 cell → up to ~50 internodes'], ['Composition', '≈ 70–80% lipid, 20–30% protein'], ['Internode length', 'Roughly 0.2–2 mm, longer in thicker fibres']],
    clinical: 'Multiple sclerosis destroys CNS myelin; Guillain–Barré and Charcot–Marie–Tooth type 1 affect PNS myelin.',
    simple: ['A fatty insulating wrap around the axon that makes signals travel up to about 100 times faster.', 'एक्सॉन के चारों ओर चर्बी वाला इन्सुलेशन, जिससे संकेत लगभग 100 गुना तक तेज़ चलते हैं।', 'ایکسون کے گرد چربی والی حفاظتی تہہ، جس سے اشارے تقریباً 100 گنا تک تیز چلتے ہیں۔'], hi: 'माइलिन आवरण', ur: 'مائلین غلاف', refs: ['KANDEL', 'GRAY', 'PURVES'] },
  node: { name: 'Node of Ranvier', latin: 'Nodus fibrae nervosae', fn: 'micro', summary: 'A short (≈1 µm) gap between two myelin segments where the axon membrane is bare and packed with voltage-gated sodium channels. The action potential is regenerated only here and jumps node to node: saltatory conduction.',
    facts: [['Gap length', '≈ 1 µm'], ['Channels', 'Very dense Nav1.6 sodium channels'], ['Described by', 'Louis-Antoine Ranvier, 1871'], ['Proof of saltation', 'Huxley & Stämpfli, 1949']],
    clinical: 'In acute motor axonal neuropathy (a Guillain–Barré variant) antibodies against nodal gangliosides such as GM1 attack the nodes and block conduction.',
    simple: ['A tiny bare gap in the insulation where the signal "jumps" to the next gap.', 'इन्सुलेशन में छोटा खुला गैप जहाँ से संकेत अगले गैप तक "छलाँग" लगाता है।', 'حفاظتی تہہ میں چھوٹا کھلا فاصلہ جہاں سے اشارہ اگلے فاصلے تک "چھلانگ" لگاتا ہے۔'], hi: 'रैनवियर का नोड', ur: 'رین ویئر کا نوڈ', refs: ['HS1949', 'KANDEL', 'HH1952'] },
  remak: { name: 'Unmyelinated fibres (Remak bundle)', latin: 'Neurofibrae amyelinatae', fn: 'micro', summary: 'Several thin C-fibres embedded in troughs of a single Schwann cell without myelin. They carry slow burning pain, temperature, itch and postganglionic autonomic signals at 0.5–2 m/s.',
    facts: [['Fibre type', 'C fibres'], ['Speed', '0.5–2 m/s'], ['Number', 'Unmyelinated axons outnumber myelinated ones in most cutaneous nerves']],
    clinical: 'Small-fibre neuropathy (e.g. in diabetes) affects these fibres first: burning feet with normal routine nerve conduction studies.',
    simple: ['Thin fibres without insulation that carry slow, burning pain.', 'बिना इन्सुलेशन के पतले फ़ाइबर जो धीमा, जलन वाला दर्द ले जाते हैं।', 'بغیر حفاظتی تہہ کے پتلے ریشے جو آہستہ، جلن والا درد لے جاتے ہیں۔'], hi: 'बिना माइलिन फ़ाइबर', ur: 'بغیر مائلین ریشے', refs: ['KANDEL', 'GRAY'] },
  vasa: { name: 'Vasa nervorum', latin: 'Vasa nervorum', fn: 'micro', summary: 'The blood supply of the nerve: longitudinal arteries in the epineurium connect to segmental feeders and send capillaries through the perineurium into the endoneurium.',
    facts: [['Layout', 'Epineurial and perineurial plexuses, endoneurial capillaries'], ['Feeders', 'Segmental branches from nearby arteries']],
    clinical: 'Diabetic mononeuropathies (for example a pupil-sparing CN III palsy) and vasculitic neuropathy are caused by ischaemia of the vasa nervorum.',
    simple: ['The nerve\'s own tiny blood vessels that feed it oxygen.', 'तंत्रिका की अपनी नन्हीं रक्त वाहिकाएँ जो उसे ऑक्सीजन देती हैं।', 'عصب کی اپنی ننھی خون کی نالیاں جو اسے آکسیجن دیتی ہیں۔'], hi: 'तंत्रिका की रक्त वाहिकाएँ', ur: 'عصب کی خون کی نالیاں', refs: ['GRAY', 'BLUMENFELD'] },
  fat: { name: 'Epineurial adipose tissue', latin: 'Textus adiposus epineurii', fn: 'micro', summary: 'Fat cells between fascicles within the epineurium. They cushion fascicles from pressure and are more abundant in nerves that cross joints and in the buttock (sciatic nerve).',
    facts: [['Location', 'Interfascicular epineurium']],
    clinical: 'Loss of this padding in thin or cachectic patients increases the risk of pressure palsies.',
    simple: ['Soft fat padding that protects the bundles from pressure.', 'मुलायम चर्बी की गद्दी जो गुच्छों को दबाव से बचाती है।', 'نرم چربی کی گدی جو گچھوں کو دباؤ سے بچاتی ہے۔'], hi: 'चर्बी ऊतक', ur: 'چربی کا ٹشو', refs: ['GRAY'] },
  dendrite: { name: 'Dendrites', latin: 'Dendritum', fn: 'micro', summary: 'Branching input processes that receive synapses from other neurons. A spinal motor neuron receives on the order of 10,000 synapses, most of them on its dendrites.',
    facts: [['Function', 'Receive and integrate synaptic input'], ['Contain', 'Nissl substance, microtubules (mixed polarity)']],
    clinical: 'Loss of dendritic spines is an early change in neurodegenerative diseases.',
    simple: ['The branches that receive messages from other nerve cells.', 'वे शाखाएँ जो दूसरी तंत्रिका कोशिकाओं से संदेश लेती हैं।', 'وہ شاخیں جو دوسرے عصبی خلیوں سے پیغام وصول کرتی ہیں۔'], hi: 'डेंड्राइट', ur: 'ڈینڈرائٹس', refs: ['KANDEL', 'PURVES'] },
  soma: { name: 'Cell body (soma)', latin: 'Corpus neuroni (perikaryon)', fn: 'micro', summary: 'The metabolic centre of the neuron, with the nucleus and abundant rough endoplasmic reticulum (Nissl bodies). Alpha motor neuron somata in the ventral horn are among the largest in the CNS (up to about 70–100 µm).',
    facts: [['Contains', 'Nucleus, Nissl bodies, Golgi, mitochondria'], ['Location (motor)', 'Ventral horn, lamina IX'], ['Location (sensory)', 'Dorsal root ganglion (pseudounipolar)']],
    clinical: 'Motor neuron disease (ALS) and spinal muscular atrophy destroy these cell bodies. After axon injury the soma shows chromatolysis (dispersed Nissl substance).',
    simple: ['The "head office" of the nerve cell, containing the nucleus.', 'तंत्रिका कोशिका का "मुख्य दफ़्तर", जिसमें केंद्रक (nucleus) होता है।', 'عصبی خلیے کا "مرکزی دفتر"، جس میں مرکزہ (nucleus) ہوتا ہے۔'], hi: 'कोशिका काय (सोमा)', ur: 'خلیے کا جسم (سوما)', refs: ['KANDEL', 'SNELL'] },
  nucleus: { name: 'Nucleus & nucleolus', latin: 'Nucleus neuroni', fn: 'micro', summary: 'Large, pale (euchromatic) nucleus with a prominent nucleolus, a sign of very active protein synthesis to maintain an axon that can be over a metre long.',
    facts: [['Appearance', 'Euchromatic, prominent nucleolus ("owl\'s eye")']],
    simple: ['Holds the DNA instructions that keep the cell alive.', 'इसमें DNA के निर्देश होते हैं जो कोशिका को ज़िंदा रखते हैं।', 'اس میں DNA کی ہدایات ہوتی ہیں جو خلیے کو زندہ رکھتی ہیں۔'], hi: 'केंद्रक', ur: 'مرکزہ', refs: ['KANDEL'] },
  nissl: { name: 'Nissl bodies', latin: 'Substantia chromatophilica', fn: 'micro', summary: 'Stacks of rough endoplasmic reticulum and free ribosomes that stain with basic dyes. They are present in the soma and dendrites but absent from the axon hillock and axon.',
    facts: [['Made of', 'Rough ER + polyribosomes'], ['Absent from', 'Axon hillock and axon']],
    clinical: 'Chromatolysis (dispersal of Nissl bodies) is the soma\'s reaction to axonal injury.',
    simple: ['Protein factories of the nerve cell.', 'तंत्रिका कोशिका की प्रोटीन फ़ैक्ट्रियाँ।', 'عصبی خلیے کی پروٹین فیکٹریاں۔'], hi: 'निस्सल पिंड', ur: 'نسل اجسام', refs: ['SNELL', 'KANDEL'] },
  hillock: { name: 'Axon hillock & initial segment', latin: 'Colliculus axonis', fn: 'micro', summary: 'The cone where the axon leaves the soma, followed by the axon initial segment, which has the highest density of sodium channels. This is where the action potential is normally triggered once the summed input reaches threshold (about −55 mV).',
    facts: [['Resting potential', '≈ −70 mV'], ['Threshold', '≈ −55 mV'], ['Peak', '≈ +30 to +40 mV']],
    simple: ['The trigger zone where the cell decides to fire a signal.', 'वह ट्रिगर क्षेत्र जहाँ कोशिका तय करती है कि संकेत भेजना है।', 'وہ ٹرگر حصہ جہاں خلیہ فیصلہ کرتا ہے کہ اشارہ بھیجنا ہے۔'], hi: 'एक्सॉन हिलॉक', ur: 'ایکسون ہلاک', refs: ['KANDEL', 'HH1952'] },
  terminal: { name: 'Axon terminals (synaptic boutons)', latin: 'Terminatio axonis', fn: 'micro', summary: 'The axon divides into terminal branches whose swollen endings contain synaptic vesicles. At a motor terminal each vesicle holds roughly 5,000–10,000 acetylcholine molecules (one quantum).',
    facts: [['Trigger', 'Depolarisation opens voltage-gated Ca²⁺ channels'], ['Release', 'Ca²⁺-triggered vesicle fusion (SNARE proteins)'], ['Quantal release', 'Del Castillo & Katz, 1954']],
    clinical: 'Botulinum toxin cleaves SNARE proteins and blocks release; Lambert–Eaton syndrome targets presynaptic Ca²⁺ channels.',
    simple: ['The endings that release chemical messengers onto the next cell.', 'वे सिरे जो अगली कोशिका पर रासायनिक संदेशवाहक छोड़ते हैं।', 'وہ سرے جو اگلے خلیے پر کیمیائی پیغام رساں چھوڑتے ہیں۔'], hi: 'एक्सॉन टर्मिनल', ur: 'ایکسون ٹرمینل', refs: ['KANDEL', 'KATZ', 'GUYTON'] },
  nmj: { name: 'Neuromuscular junction', latin: 'Junctio neuromuscularis', fn: 'micro', summary: 'The synapse between a motor axon terminal and a skeletal muscle fibre. Acetylcholine crosses a ~50 nm cleft, binds nicotinic receptors on the folded motor end plate and triggers a muscle action potential. Acetylcholinesterase ends the signal within milliseconds.',
    facts: [['Transmitter', 'Acetylcholine'], ['Receptor', 'Nicotinic (ligand-gated cation channel)'], ['Cleft', '≈ 50 nm'], ['Safety factor', 'Far more ACh released than needed to reach threshold']],
    clinical: 'Myasthenia gravis: antibodies against acetylcholine receptors cause fatigable weakness (ptosis, diplopia). Treated with acetylcholinesterase inhibitors such as pyridostigmine.',
    simple: ['The meeting point where the nerve tells the muscle to contract.', 'वह मिलन बिंदु जहाँ तंत्रिका मांसपेशी को सिकुड़ने का आदेश देती है।', 'وہ ملاپ کا مقام جہاں عصب پٹھے کو سکڑنے کا حکم دیتا ہے۔'], hi: 'न्यूरोमस्कुलर जंक्शन', ur: 'نیورومسکیولر جنکشن', refs: ['KANDEL', 'KATZ', 'GUYTON'] },
  muscle: { name: 'Skeletal muscle fibre', latin: 'Myocytus striatus skeletalis', fn: 'micro', summary: 'A long multinucleated striated cell. One motor neuron plus all the fibres it supplies form a motor unit: a few fibres for eye muscles, up to around 2,000 in large limb muscles.',
    facts: [['Striations', 'Sarcomeres: actin + myosin'], ['Motor unit', 'One α-motor neuron + its fibres'], ['Coupling', 'T-tubules → Ca²⁺ release from sarcoplasmic reticulum']],
    simple: ['The muscle cell that shortens when the nerve signal arrives.', 'मांसपेशी कोशिका जो तंत्रिका संकेत आने पर छोटी (सिकुड़) होती है।', 'پٹھے کا خلیہ جو عصبی اشارہ آنے پر سکڑتا ہے۔'], hi: 'मांसपेशी फ़ाइबर', ur: 'پٹھے کا ریشہ', refs: ['GUYTON', 'KANDEL'] },
};
