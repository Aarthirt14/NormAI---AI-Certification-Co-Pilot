'use client';

import React from 'react';
import { ViewType, LanguageCode } from '@/types';
import { 
  Sparkles,
  Search,
  CheckCircle2,
  FileText,
  GitBranch,
  Building2,
  ShieldCheck,
  FolderCheck,
  HelpCircle,
  Globe,
  ChevronRight,
  User,
  Compass
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '@/data/translations';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenHelp: () => void;
}

export const NAV_LABELS: Record<LanguageCode, Record<ViewType, string>> = {
  en: {
    ask: 'Ask NormAI',
    finder: 'Standards Finder',
    compliance: 'Compliance Check',
    document: 'Document Analysis',
    graph: 'Standards Graph',
    services: 'BIS Services',
    consumer: 'Consumer Assist',
    reports: 'Saved Reports',
  },
  hi: {
    ask: 'NormAI से पूछें',
    finder: 'मानक खोजक',
    compliance: 'अनुपालन जांच',
    document: 'दस्तावेज़ विश्लेषण',
    graph: 'मानक ग्राफ',
    services: 'BIS सेवाएं',
    consumer: 'उपभोक्ता सहायता',
    reports: 'सहेजी गई रिपोर्ट',
  },
  ta: {
    ask: 'NormAI கேளுங்கள்',
    finder: 'தரநிலைகள் தேடல்',
    compliance: 'இணக்கத்தன்மை சரிபார்ப்பு',
    document: 'ஆவண பகுப்பாய்வு',
    graph: 'தரநிலைகள் வரைபடம்',
    services: 'BIS சேவைகள்',
    consumer: 'நுகர்வோர் உதவி',
    reports: 'சேமிக்கப்பட்ட அறிக்கைகள்',
  },
  bn: {
    ask: 'NormAI কে জিজ্ঞাসা করুন',
    finder: 'মান সন্ধানকারী',
    compliance: 'সম্মতি পরীক্ষা',
    document: 'নথি বিশ্লেষণ',
    graph: 'মান গ্রাফ',
    services: 'BIS পরিষেবা',
    consumer: 'ভোক্তা সহায়তা',
    reports: 'সংরক্ষিত রিপোর্ট',
  },
  te: {
    ask: 'NormAI ని అడగండి',
    finder: 'ప్రమాణాల శోధన',
    compliance: 'సమ్మతి తనిఖీ',
    document: 'పత్ర విశ్లేషణ',
    graph: 'ప్రమాణాల గ్రాఫ్',
    services: 'BIS సేవలు',
    consumer: 'వినియోగదారుల సహాయం',
    reports: 'సేవ్ చేసిన నివేదికలు',
  },
  ml: {
    ask: 'NormAI-യോട് ചോദിക്കുക',
    finder: 'സ്റ്റാൻഡേർഡ്സ് കണ്ടെത്തൽ',
    compliance: 'കംപ്ലയൻസ് പരിശോധന',
    document: 'ഡോക്യുമെന്റ് വിശകലനം',
    graph: 'സ്റ്റാൻഡേർഡ്സ് ഗ്രാഫ്',
    services: 'BIS സേവനങ്ങൾ',
    consumer: 'ഉപഭോക്തൃ സഹായം',
    reports: 'സേവ് ചെയ്ത റിപ്പോർട്ടുകൾ',
  }
};

const NAV_ICONS: Record<ViewType, React.ComponentType<{ className?: string }>> = {
  ask: Sparkles,
  finder: Compass,
  compliance: ShieldCheck,
  document: FileText,
  graph: GitBranch,
  services: Building2,
  consumer: CheckCircle2,
  reports: FolderCheck,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  language,
  onSelectLanguage,
  onOpenHelp
}) => {
  const labels = NAV_LABELS[language] || NAV_LABELS.en;

  return (
    <aside className="w-64 bg-white border-r border-border-ui h-screen flex flex-col justify-between shrink-0 sticky top-0 select-none z-20">
      
      {/* Top Brand / Logo */}
      <div className="p-5 border-b border-border-ui-light">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-control bg-brand-blue flex items-center justify-center text-white shadow-sm shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-bold text-base tracking-tight text-text-dark">
                NormAI
              </span>
              <span className="text-[10px] font-medium text-brand-blue bg-brand-blue-light px-1.5 py-0.5 rounded">
                Co-Pilot
              </span>
            </div>
            <p className="text-xs text-text-muted truncate">
              AI Standards Assistant
            </p>
          </div>
        </div>

        {/* SIH 2026 Tag */}
        <div className="mt-3 px-2.5 py-1 rounded-[6px] bg-brand-blue-subtle border border-blue-100 flex items-center justify-between text-[11px] text-text-muted">
          <span className="font-medium text-brand-blue">Smart India Hackathon</span>
          <span className="font-semibold text-text-dark">PS 26107</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
          Navigation
        </div>

        {(Object.keys(NAV_ICONS) as ViewType[]).map((viewId) => {
          const Icon = NAV_ICONS[viewId];
          const isActive = currentView === viewId;
          const label = labels[viewId];

          return (
            <button
              key={viewId}
              onClick={() => onNavigate(viewId)}
              className={`w-full text-left px-3 h-11 rounded-control transition-all flex items-center justify-between group ${
                isActive
                  ? 'bg-brand-blue-light text-brand-blue font-semibold shadow-xs'
                  : 'text-text-body hover:text-text-dark hover:bg-brand-blue-subtle'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-brand-blue' : 'text-text-muted group-hover:text-text-dark'
                  }`}
                />
                <span className="text-sm tracking-tight truncate">
                  {label}
                </span>
              </div>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="p-3.5 border-t border-border-ui-light bg-surface-subtle space-y-2">
        
        {/* Language selector */}
        <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-text-muted" />
            <span>Language</span>
          </div>
          <select
            value={language}
            onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
            className="bg-white border border-border-ui px-2 py-0.5 rounded text-text-dark text-xs focus:outline-none focus:border-brand-blue font-medium cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeLabel}
              </option>
            ))}
          </select>
        </div>

        {/* Help & Support Button */}
        <button
          onClick={onOpenHelp}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-control bg-white border border-border-ui hover:bg-brand-blue-subtle text-xs text-text-body hover:text-text-dark font-medium transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-brand-blue" />
            <span>Help & Evaluation Guide</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
        </button>

        {/* User Profile Mini Card */}
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs">
          <div className="w-6 h-6 rounded-full bg-brand-blue-light text-brand-blue font-bold flex items-center justify-center text-[10px]">
            SA
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-text-dark truncate">SIH Auditor</div>
            <div className="text-[10px] text-text-muted truncate">DPIIT Compliance</div>
          </div>
        </div>
      </div>

    </aside>
  );
};
