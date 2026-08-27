import { LanguageCode, LanguageOption } from '@/types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
];

export interface TranslationStrings {
  appTagline: string;
  heroHeading: string;
  heroSubheading: string;
  searchPlaceholder: string;
  uploadPhoto: string;
  uploadSpec: string;
  voiceQuery: string;
  recentStandards: string;
  assessmentTitle: string;
  confidence: string;
  applicableStandard: string;
  whyStandard: string;
  certificationPath: string;
  sourceEvidence: string;
  statusActive: string;
  sampleQuestion1: string;
  sampleQuestion2: string;
  sampleQuestion3: string;
  sampleQuestion4: string;
  voicePrompt: string;
  listening: string;
  voiceTamilExample: string;
  voiceTamilAnswer: string;
  viewDetails: string;
  openClause: string;
  generateReport: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationStrings> = {
  en: {
    appTagline: 'INDIAN STANDARDS INTELLIGENCE',
    heroHeading: 'What are you trying to certify?',
    heroSubheading: 'Describe your product, upload its specification, or ask about an Indian Standard.',
    searchPlaceholder: 'Describe a product or ask a BIS question… (e.g., 750W mixer grinder, 230V, domestic)',
    uploadPhoto: 'Upload product photo',
    uploadSpec: 'Upload specification',
    voiceQuery: 'Voice query',
    recentStandards: 'Recent Standards',
    assessmentTitle: 'NormAI Assessment',
    confidence: 'Match confidence',
    applicableStandard: 'Applicable Standard',
    whyStandard: 'Why this standard?',
    certificationPath: 'Certification Path',
    sourceEvidence: 'SOURCE EVIDENCE',
    statusActive: 'ACTIVE',
    sampleQuestion1: 'Which BIS standard applies to this electric mixer?',
    sampleQuestion2: 'What tests are required for IS 302?',
    sampleQuestion3: 'Can I apply for certification with this specification?',
    sampleQuestion4: 'How do I verify a hallmark HUID number?',
    voicePrompt: 'Speak in your preferred language',
    listening: 'Listening to your voice query...',
    voiceTamilExample: 'இந்த productக்கு எந்த BIS standard தேவை?',
    voiceTamilAnswer: 'உங்கள் 750W Mixer Grinder தயாரிப்புக்கு IS 302-2-14 (Kitchen Machines) தரநிலை பொருந்தும். அத்துடன் பொதுவான மின் பாதுகாப்புக்கு IS 302-1 மற்றும் பவர் கார்டுக்கு IS 694 பொருந்தும்.',
    viewDetails: 'View Standard Details',
    openClause: 'Open Clause',
    generateReport: 'Generate Readiness Report'
  },
  hi: {
    appTagline: 'भारतीय मानक बुद्धिमत्ता प्रणाली',
    heroHeading: 'आप किस उत्पाद का प्रमाणन करना चाहते हैं?',
    heroSubheading: 'अपने उत्पाद का विवरण दें, विनिर्देश (Specification) अपलोड करें, या भारतीय मानक के बारे में पूछें।',
    searchPlaceholder: 'उत्पाद का विवरण दें या BIS प्रमाणन संबंधी प्रश्न पूछें…',
    uploadPhoto: 'उत्पाद फोटो अपलोड करें',
    uploadSpec: 'विनिर्देश दस्तावेज़ अपलोड करें',
    voiceQuery: 'आवाज़ से पूछें',
    recentStandards: 'हाल के मानक',
    assessmentTitle: 'NormAI मूल्यांकन',
    confidence: 'सटीकता मिलान',
    applicableStandard: 'लागू भारतीय मानक',
    whyStandard: 'यह मानक क्यों लागू होता है?',
    certificationPath: 'प्रमाणन प्रक्रिया पथ',
    sourceEvidence: 'मूल स्रोत साक्ष्य',
    statusActive: 'सक्रिय',
    sampleQuestion1: 'इस इलेक्ट्रिक मिक्सर पर कौन सा BIS मानक लागू होता है?',
    sampleQuestion2: 'IS 302 के लिए कौन से परीक्षण आवश्यक हैं?',
    sampleQuestion3: 'क्या मैं इस विनिर्देश के साथ प्रमाणन के लिए आवेदन कर सकता हूँ?',
    sampleQuestion4: 'हॉलमार्क HUID नंबर की जांच कैसे करें?',
    voicePrompt: 'अपनी पसंदीदा भाषा में बोलें',
    listening: 'आपकी आवाज़ सुनी जा रही है...',
    voiceTamilExample: 'इस मिक्सर ग्राइंडर के लिए कौन सा BIS मानक चाहिए?',
    voiceTamilAnswer: 'आपके 750W Mixer Grinder के लिए IS 302-2-14 (Kitchen Machines) लागू होता है। इसके साथ सामान्य सुरक्षा के लिए IS 302-1 और पावर कॉर्ड के लिए IS 694 का अनुपालन अनिवार्य है।',
    viewDetails: 'मानक विवरण देखें',
    openClause: 'खण्ड (Clause) देखें',
    generateReport: 'तैयारी रिपोर्ट जनरेट करें'
  },
  ta: {
    appTagline: 'இந்திய தரநிலைகள் நுண்ணறிவு',
    heroHeading: 'நீங்கள் எந்தப் பொருளுக்கு சான்றிதழ் பெற விரும்புகிறீர்கள்?',
    heroSubheading: 'உங்கள் தயாரிப்பை விவரிக்கவும், விவரக்குறிப்பை பதிவேற்றவும் அல்லது BIS தரநிலைகள் பற்றி கேட்கவும்.',
    searchPlaceholder: 'தயாரிப்பை விவரிக்கவும் அல்லது BIS கேள்வி கேட்கவும்…',
    uploadPhoto: 'தயாரிப்பு புகைப்படம் பதிவேற்றவும்',
    uploadSpec: 'விவரக்குறிப்பு ஆவணம் பதிவேற்றவும்',
    voiceQuery: 'குரல் வழி வினவல்',
    recentStandards: 'சமீபத்திய தரநிலைகள்',
    assessmentTitle: 'NormAI மதிப்பீடு',
    confidence: 'பொருந்தும் துல்லியம்',
    applicableStandard: 'பொருந்தும் இந்திய தரநிலை',
    whyStandard: 'இந்த தரநிலை ஏன் பொருந்துகிறது?',
    certificationPath: 'சான்றிதழ் பெறும் வழிமுறை',
    sourceEvidence: 'மூல ஆதார சான்றுகள்',
    statusActive: 'செயலில் உள்ளது',
    sampleQuestion1: 'இந்த எலக்ட்ரிக் மிக்சருக்கு எந்த BIS தரநிலை பொருந்தும்?',
    sampleQuestion2: 'IS 302 தரநிலைக்கு என்ன சோதனைகள் தேவை?',
    sampleQuestion3: 'இந்த விவரக்குறிப்புடன் நான் சான்றிதழுக்கு விண்ணப்பிக்கலாமா?',
    sampleQuestion4: 'ஹால்மார்க் எண்ணை எவ்வாறு சரிபார்ப்பது?',
    voicePrompt: 'உங்கள் விருப்பமான மொழியில் பேசுங்கள்',
    listening: 'உங்கள் குரல் கேட்கப்படுகிறது...',
    voiceTamilExample: 'இந்த productக்கு எந்த BIS standard தேவை?',
    voiceTamilAnswer: 'உங்கள் 750W Mixer Grinder தயாரிப்புக்கு IS 302-2-14 (Kitchen Machines) தரநிலை பொருந்தும். பொது பாதுகாப்புக்கு IS 302-1 மற்றும் பவர் கார்டுக்கு IS 694 தேவை.',
    viewDetails: 'முழு விவரங்கள் பார்க்க',
    openClause: 'விதியை பார்க்க',
    generateReport: 'தயார்நிலை அறிக்கை பெறுக'
  },
  bn: {
    appTagline: 'ভারতীয় মান বুদ্ধিমত্তা ব্যবস্থা',
    heroHeading: 'আপনি কোন পণ্যের শংসাপত্র পেতে চান?',
    heroSubheading: 'আপনার পণ্যের বিবরণ দিন, স্পেসিফিকেশন আপলোড করুন বা ভারতীয় মান সম্পর্কে জিজ্ঞাসা করুন।',
    searchPlaceholder: 'পণ্যের বিবরণ দিন বা BIS সম্পর্কিত প্রশ্ন জিজ্ঞাসা করুন…',
    uploadPhoto: 'পণ্যের ছবি আপলোড করুন',
    uploadSpec: 'স্পেসিফিকেশন নথি আপলোড করুন',
    voiceQuery: 'ভয়েস অনুসন্ধান',
    recentStandards: 'সাম্প্রতিক মানসমূহ',
    assessmentTitle: 'NormAI মূল্যায়ন',
    confidence: 'মিলের নির্ভুলতা',
    applicableStandard: 'প্রযোজ্য ভারতীয় মান',
    whyStandard: 'কেন এই মান প্রযোজ্য?',
    certificationPath: 'শংসাপত্র প্রক্রিয়া ধাপ',
    sourceEvidence: 'উৎস প্রমাণ',
    statusActive: 'সক্রিয়',
    sampleQuestion1: 'এই বৈদ্যুতিক মিক্সারের জন্য কোন BIS মান প্রযোজ্য?',
    sampleQuestion2: 'IS 302 এর জন্য কি কি পরীক্ষা প্রয়োজন?',
    sampleQuestion3: 'আমি কি এই স্পেসিফিকেশন দিয়ে আবেদন করতে পারি?',
    sampleQuestion4: 'হলমার্ক HUID নম্বর কীভাবে যাচাই করবেন?',
    voicePrompt: 'আপনার পছন্দের ভাষায় কথা বলুন',
    listening: 'আপনার কথা শোনা হচ্ছে...',
    voiceTamilExample: 'এই মিক্সার গ্রাইন্ডারের জন্য কোন BIS মান প্রয়োজন?',
    voiceTamilAnswer: 'আপনার 750W Mixer Grinder এর জন্য IS 302-2-14 প্রযোজ্য। পাশাপাশি IS 302-1 এবং IS 694 মান মেনে চলা আবশ্যক।',
    viewDetails: 'বিস্তারিত দেখুন',
    openClause: 'ধারা (Clause) খুলুন',
    generateReport: 'রিপোর্ট তৈরি করুন'
  },
  te: {
    appTagline: 'భారతీయ ప్రమాణాల మేధో వ్యవస్థ',
    heroHeading: 'మీరు ఏ ఉత్పత్తికి సర్టిఫికేషన్ పొందాలనుకుంటున్నారు?',
    heroSubheading: 'మీ ఉత్పత్తిని వివరించండి, స్పెసిఫికేషన్‌ను అప్‌లోడ్ చేయండి లేదా BIS ప్రమాణం గురించి అడగండి.',
    searchPlaceholder: 'ఉత్పత్తిని వివరించండి లేదా BIS ప్రశ్న అడగండి…',
    uploadPhoto: 'ఉత్పత్తి ఫోటోను అప్‌లోడ్ చేయండి',
    uploadSpec: 'స్పెసిఫికేషన్ పత్రాన్ని అప్‌లోడ్ చేయండి',
    voiceQuery: 'వాయిస్ ద్వారా అడగండి',
    recentStandards: 'ఇటీవలి ప్రమాణాలు',
    assessmentTitle: 'NormAI అంచనా',
    confidence: 'సరిపోలిక ఖచ్చితత్వం',
    applicableStandard: 'వర్తించే భారతీయ ప్రమాణం',
    whyStandard: 'ఈ ప్రమాణం ఎందుకు వర్తిస్తుంది?',
    certificationPath: 'సర్టిఫికేషన్ మార్గదర్శకం',
    sourceEvidence: 'మూల ఆధారాలు',
    statusActive: 'యాక్టివ్',
    sampleQuestion1: 'ఈ ఎలక్ట్రిక్ మిక్సర్‌కు ఏ BIS ప్రమాణం వర్తిస్తుంది?',
    sampleQuestion2: 'IS 302 కోసం ఏ పరీక్షలు అవసరం?',
    sampleQuestion3: 'నేను ఈ స్పెసిఫికేషన్‌తో దరఖాస్తు చేసుకోవచ్చా?',
    sampleQuestion4: 'హాల్‌మార్క్ సంఖ్యను ఎలా ధృవీకరించాలి?',
    voicePrompt: 'మీకు ఇష్టమైన భాషలో మాట్లాడండి',
    listening: 'మీ వాయిస్ వినబడుతోంది...',
    voiceTamilExample: 'ఈ మిక్సర్ గ్రైండర్‌కు ఏ BIS స్టాండర్డ్ అవసరం?',
    voiceTamilAnswer: 'మీ 750W Mixer Grinder కోసం IS 302-2-14 వర్తిస్తుంది. సాధారణ భద్రత కోసం IS 302-1 మరియు పవర్ కార్డ్ కోసం IS 694 ప్రమాణాలు అవసరం.',
    viewDetails: 'వివరాలు చూడండి',
    openClause: 'క్లాజ్ చూడండి',
    generateReport: 'నివేదికను రూపొందించండి'
  },
  ml: {
    appTagline: 'ഇന്ത്യൻ സ്റ്റാൻഡേർഡ്സ് ഇന്റലിജൻസ്',
    heroHeading: 'നിങ്ങൾ ഏത് ഉൽപ്പന്നത്തിനാണ് സർട്ടിഫിക്കേഷൻ നേടാൻ ആഗ്രഹിക്കുന്നത്?',
    heroSubheading: 'നിങ്ങളുടെ ഉൽപ്പന്നം വിവരിക്കുക, സ്പെസിഫിക്കേഷൻ അപ്‌ലോഡ് ചെയ്യുക, അല്ലെങ്കിൽ BIS സ്റ്റാൻഡേർഡിനെക്കുറിച്ച് ചോദിക്കുക.',
    searchPlaceholder: 'ഉൽപ്പന്നം വിവരിക്കുക അല്ലെങ്കിൽ BIS ചോദ്യം ചോദിക്കുക…',
    uploadPhoto: 'ഉൽപ്പന്ന ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക',
    uploadSpec: 'സ്പെസിഫിക്കേഷൻ ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക',
    voiceQuery: 'ശബ്ദ അന്വേഷണം',
    recentStandards: 'സമീപകാല മാനദണ്ഡങ്ങൾ',
    assessmentTitle: 'NormAI വിലയിരുത്തൽ',
    confidence: 'പൊരുത്തപ്പെടൽ കൃത്യത',
    applicableStandard: 'ബാധകമായ ഇന്ത്യൻ സ്റ്റാൻഡേർഡ്',
    whyStandard: 'എന്തുകൊണ്ട് ഈ സ്റ്റാൻഡേർഡ്?',
    certificationPath: 'സർട്ടിഫിക്കേഷൻ ഘട്ടങ്ങൾ',
    sourceEvidence: 'ആധികാരിക സ്രോതസ്സ് തെളിവുകൾ',
    statusActive: 'സജീവം',
    sampleQuestion1: 'ഈ ഇലക്ട്രിക് മിക്സറിന് ഏത് BIS സ്റ്റാൻഡേർഡ് ബാധകമാണ്?',
    sampleQuestion2: 'IS 302-നായി എന്ത് ടെസ്റ്റുകൾ ആവശ്യമാണ്?',
    sampleQuestion3: 'ഈ സ്പെസിഫിക്കേഷൻ ഉപയോഗിച്ച് എനിക്ക് അപേക്ഷിക്കാനാകുമോ?',
    sampleQuestion4: 'ഹാൾമാർക്ക് നമ്പർ എങ്ങനെ പരിശോധിക്കാം?',
    voicePrompt: 'നിങ്ങളുടെ ഇഷ്ടപ്പെട്ട ഭാഷയിൽ സംസാരിക്കുക',
    listening: 'ശബ്ദം ശ്രവിക്കുന്നു...',
    voiceTamilExample: 'ഈ മിക്സർ ഗ്രൈൻഡറിന് ഏത് BIS സ്റ്റാൻഡേർഡ് ആവശ്യമാണ്?',
    voiceTamilAnswer: 'നിങ്ങളുടെ 750W Mixer Grinder-ന് IS 302-2-14 ബാധകമാണ്. ഒപ്പം പൊതു സുരക്ഷയ്ക്കായി IS 302-1, പവർ കോഡിനായി IS 694 എന്നിവ പാലിക്കണം.',
    viewDetails: 'വിശദാംശങ്ങൾ കാണുക',
    openClause: 'ക്ലോസ് പരിശോധിക്കുക',
    generateReport: 'റിപ്പോർട്ട് തയ്യാറാക്കുക'
  }
};
