'use client';

import React, { useState } from 'react';
import { 
  Database, 
  FileCheck, 
  Layers, 
  Globe, 
  Bell, 
  ChevronDown, 
  Sparkles,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { ViewType, LanguageCode } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/data/translations';

interface HeaderStatusStripProps {
  currentView: ViewType;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenVoice: () => void;
}

const VIEW_TITLES: Record<ViewType, { section: string; title: string }> = {
  ask: { section: 'Workspace', title: 'Ask NormAI' },
  finder: { section: 'Intelligence', title: 'Standards Finder' },
  compliance: { section: 'Audit', title: 'Compliance Gap Check' },
  document: { section: 'Intelligence', title: 'Document Analysis' },
  graph: { section: 'Standards', title: 'Relationship Graph' },
  services: { section: 'Directory', title: 'BIS Services & Labs' },
  consumer: { section: 'Protection', title: 'Consumer Assist' },
  reports: { section: 'Saved Reports', title: 'Compliance Assessment' },
};

export const HeaderStatusStrip: React.FC<HeaderStatusStripProps> = ({
  currentView,
  language,
  onSelectLanguage,
  onOpenVoice
}) => {
  const [showStatusPopover, setShowStatusPopover] = useState<boolean>(false);
  const breadcrumb = VIEW_TITLES[currentView] || VIEW_TITLES['ask'];

  return (
    <header className="w-full bg-white border-b border-border-ui h-14 px-6 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left: Clean Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span className="hover:text-text-dark transition-colors cursor-pointer">Workspace</span>
        <span>/</span>
        <span className="hover:text-text-dark transition-colors cursor-pointer">{breadcrumb.section}</span>
        <span>/</span>
        <span className="font-semibold text-text-dark">{breadcrumb.title}</span>
      </div>

      {/* Right: Clean Status, Language, Notifications & Popover */}
      <div className="flex items-center gap-3">
        
        {/* Knowledge Base Status Tag with Popover trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusPopover(!showStatusPopover)}
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-control bg-surface-subtle hover:bg-brand-blue-subtle border border-border-ui text-xs text-text-body transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-status-success inline-block" />
            <span className="font-medium">Knowledge Base: <strong className="text-text-dark font-semibold">Updated</strong></span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {/* System Status Popover */}
          {showStatusPopover && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-card shadow-dropdown border border-border-ui p-4 space-y-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-border-ui-light pb-2">
                <span className="text-xs font-semibold text-text-dark flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand-blue" />
                  System Status
                </span>
                <button onClick={() => setShowStatusPopover(false)} className="text-text-muted hover:text-text-dark">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Knowledge Base</span>
                  <span className="font-medium text-status-success flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Updated (BIS Gazette)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Standards Indexed</span>
                  <span className="font-semibold text-text-dark">24,000+ (Demo dataset)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Amendments</span>
                  <span className="font-semibold text-text-dark">Tracking enabled (2024–26)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Citation Coverage</span>
                  <span className="font-semibold text-brand-blue">100% Source-Backed</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button
          type="button"
          className="p-2 rounded-control text-text-muted hover:text-text-dark hover:bg-surface-subtle border border-border-ui transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-brand-blue absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* User Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-blue text-white font-semibold text-xs flex items-center justify-center shadow-xs cursor-pointer">
          SA
        </div>

      </div>

    </header>
  );
};
