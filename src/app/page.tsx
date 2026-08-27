'use client';

import React, { useState, useEffect } from 'react';
import { ViewType, LanguageCode } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { HeaderStatusStrip } from '@/components/layout/HeaderStatusStrip';
import { SourceViewerDrawer } from '@/components/common/SourceViewerDrawer';
import { VoiceModal } from '@/components/common/VoiceModal';
import { HelpGuideModal } from '@/components/common/HelpGuideModal';

import { AskNormAiView } from '@/components/views/AskNormAiView';
import { StandardsFinderView } from '@/components/views/StandardsFinderView';
import { ComplianceCheckView } from '@/components/views/ComplianceCheckView';
import { DocumentAnalysisView } from '@/components/views/DocumentAnalysisView';
import { StandardsGraphView } from '@/components/views/StandardsGraphView';
import { BisServicesView } from '@/components/views/BisServicesView';
import { ConsumerAssistView } from '@/components/views/ConsumerAssistView';
import { SavedReportsView } from '@/components/views/SavedReportsView';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('ask');
  const [language, setLanguage] = useState<LanguageCode>('en');
  
  // Persist language
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('normai_lang') as LanguageCode;
      if (savedLang) {
        setLanguage(savedLang);
      }
    } catch (e) {}
  }, []);

  const handleSetLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    try {
      localStorage.setItem('normai_lang', lang);
    } catch (e) {}
  };

  // Query state in Ask NormAI
  const [queryInput, setQueryInput] = useState<string>(
    'I manufacture a 750W mixer grinder for domestic use in India. Which BIS standard applies and am I ready for certification?'
  );
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(true);

  // Shared full-stack document & assessment links
  const [activeDocumentId, setActiveDocumentId] = useState<string | undefined>();
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | undefined>();

  // Source Viewer Drawer state
  const [isSourceOpen, setIsSourceOpen] = useState<boolean>(false);
  const [activeStandardCode, setActiveStandardCode] = useState<string>('IS 302-2-14');
  const [activeTargetClause, setActiveTargetClause] = useState<string | undefined>('Clause 1.1');

  // Modals state
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Function to open source viewer from any citation or card
  const handleOpenClause = (code: string, clause?: string) => {
    setActiveStandardCode(code);
    setActiveTargetClause(clause);
    setIsSourceOpen(true);
  };

  // End-to-End Demo Trigger
  const handleTriggerDemo = () => {
    setQueryInput('I manufacture a 750W mixer grinder for domestic use in India. Which BIS standard applies and am I ready for certification?');
    setCurrentView('ask');
    setHasAnalyzed(true);
    handleOpenClause('IS 302-2-14', 'Clause 1.1');
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-dark flex flex-col antialiased">
      
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Persistent Modern Sidebar (250px) */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          language={language}
          onSelectLanguage={handleSetLanguage}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Top Bar with Breadcrumb, Status Popover, Language & Profile */}
          <HeaderStatusStrip
            currentView={currentView}
            language={language}
            onSelectLanguage={handleSetLanguage}
            onOpenVoice={() => setIsVoiceOpen(true)}
          />

          {/* Scrollable Main Workspace */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
            
            {currentView === 'ask' && (
              <AskNormAiView
                language={language}
                onOpenClause={handleOpenClause}
                onOpenVoice={() => setIsVoiceOpen(true)}
                onNavigateToFinder={() => setCurrentView('finder')}
                onNavigateToCompliance={() => setCurrentView('compliance')}
                onNavigateToDocument={() => setCurrentView('document')}
                queryInput={queryInput}
                setQueryInput={setQueryInput}
                hasAnalyzed={hasAnalyzed}
                setHasAnalyzed={setHasAnalyzed}
              />
            )}

            {currentView === 'finder' && (
              <StandardsFinderView
                language={language}
                onOpenClause={handleOpenClause}
                onNavigateToCompliance={() => setCurrentView('compliance')}
                onNavigateToGraph={(code) => {
                  setActiveStandardCode(code);
                  setCurrentView('graph');
                }}
              />
            )}

            {currentView === 'compliance' && (
              <ComplianceCheckView
                language={language}
                onOpenClause={handleOpenClause}
                onNavigateToReports={() => setCurrentView('reports')}
                initialAssessmentId={activeAssessmentId}
              />
            )}

            {currentView === 'document' && (
              <DocumentAnalysisView
                language={language}
                onOpenClause={handleOpenClause}
                onNavigateToCompliance={() => setCurrentView('compliance')}
                documentId={activeDocumentId}
              />
            )}

            {currentView === 'graph' && (
              <StandardsGraphView
                language={language}
                onOpenClause={handleOpenClause}
                selectedRootCode={activeStandardCode}
              />
            )}

            {currentView === 'services' && (
              <BisServicesView
                language={language}
                onOpenClause={handleOpenClause}
                onNavigateToReports={() => setCurrentView('reports')}
              />
            )}

            {currentView === 'consumer' && (
              <ConsumerAssistView
                language={language}
                onOpenClause={handleOpenClause}
              />
            )}

            {currentView === 'reports' && (
              <SavedReportsView
                language={language}
                onOpenClause={handleOpenClause}
              />
            )}

          </main>
        </div>

      </div>

      {/* Global Source & Clause Viewer Drawer (440px) */}
      <SourceViewerDrawer
        isOpen={isSourceOpen}
        onClose={() => setIsSourceOpen(false)}
        standardCode={activeStandardCode}
        targetClause={activeTargetClause}
        onSelectStandard={(code) => {
          setActiveStandardCode(code);
          setActiveTargetClause(undefined);
        }}
      />

      {/* Multilingual Voice Query Modal */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        language={language}
        onSelectLanguage={handleSetLanguage}
        onApplyQuery={(q) => {
          setQueryInput(q);
          setCurrentView('ask');
          setHasAnalyzed(true);
        }}
        onOpenClause={handleOpenClause}
      />

      {/* Help & Evaluation Guide Modal */}
      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onTriggerDemo={handleTriggerDemo}
      />

    </div>
  );
}
