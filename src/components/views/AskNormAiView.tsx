'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  Mic,
  ArrowRight,
  CheckCircle2,
  Check,
  FileText,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Layers,
  AlertCircle
} from 'lucide-react';
import { LanguageCode } from '@/types';
import { TRANSLATIONS } from '@/data/translations';
import { AgentProgressBanner } from '@/components/common/AgentProgressBanner';
import { CitationBadge } from '@/components/common/CitationBadge';
import { STANDARDS_DATABASE } from '@/data/standardsData';
import { askApi, AskResponse } from '@/lib/api';

interface AskNormAiViewProps {
  language: LanguageCode;
  onOpenClause: (code: string, clause?: string) => void;
  onOpenVoice: () => void;
  onNavigateToFinder: (query: string) => void;
  onNavigateToCompliance: () => void;
  onNavigateToDocument: () => void;
  queryInput: string;
  setQueryInput: (q: string) => void;
  hasAnalyzed: boolean;
  setHasAnalyzed: (val: boolean) => void;
}

export const AskNormAiView: React.FC<AskNormAiViewProps> = ({
  language,
  onOpenClause,
  onOpenVoice,
  onNavigateToFinder,
  onNavigateToCompliance,
  onNavigateToDocument,
  queryInput,
  setQueryInput,
  hasAnalyzed,
  setHasAnalyzed
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AskResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  const handleRunQuery = async (customQuery?: string) => {
    const q = customQuery || queryInput;
    if (!q.trim()) return;
    if (customQuery) setQueryInput(customQuery);

    setIsProcessing(true);
    setHasAnalyzed(false);
    setApiError(null);
    setAnalysisResult(null);

    try {
      const response = await askApi.submitQuery({
        query: q,
        language: language
      });
      if (response.analysis_run_id) {
        setActiveRunId(response.analysis_run_id);
      } else {
        setAnalysisResult(response);
        setIsProcessing(false);
        setHasAnalyzed(true);
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit query');
      setIsProcessing(false);
    }
  };

  const handleAgentComplete = async () => {
    if (activeRunId) {
      try {
        const result = await askApi.getResult(activeRunId);
        setAnalysisResult(result);
      } catch (err: any) {
        setApiError(err.message || 'Failed to retrieve analysis result');
      }
    }
    setIsProcessing(false);
    setHasAnalyzed(true);
  };

  const handleLoadDemo = () => {
    const demoQuery = 'I manufacture a 750W mixer grinder for domestic use in India. Which BIS standard applies and am I ready for certification?';
    setQueryInput(demoQuery);
    handleRunQuery(demoQuery);
  };

  // Fallback to static mock standard if no API results loaded yet
  const displayStandard = analysisResult?.likely_standard || STANDARDS_DATABASE['IS 302-2-14'];
  const displayScore = analysisResult?.match_score || 94;
  const displayWhyMatched = (analysisResult?.matched_attributes && analysisResult.matched_attributes.length > 0)
    ? analysisResult.matched_attributes 
    : [
        'Domestic food preparation appliance',
        'Electrically operated (230V AC Single Phase)',
        'Electric motor-driven grinding & blending mechanism',
        'Rated power input 750W within 1000W domestic scope',
        'Class I insulation with protective earthing conductor'
      ];
  const displayCitations = (analysisResult?.citations && analysisResult.citations.length > 0)
    ? analysisResult.citations
    : [
        { standardCode: 'IS 302-2-14', clauseNumber: 'Clause 1.1' },
        { standardCode: 'IS 302-1', clauseNumber: 'Clause 7.1' },
        { standardCode: 'IS 694', clauseNumber: 'Clause 6.1' }
      ];
  const displayPathway = (analysisResult?.certification_pathway && analysisResult.certification_pathway.length > 0)
    ? analysisResult.certification_pathway
    : [
        { num: '1', title: 'Standard Identified', status: 'Complete', badge: 'bg-emerald-100 text-status-success', desc: 'IS 302-2-14 & IS 302-1' },
        { num: '2', title: 'Documentation', status: 'Needs Attention', badge: 'bg-amber-100 text-status-warning', desc: 'BOM & laser rating artwork' },
        { num: '3', title: 'Laboratory Testing', status: 'Not Started', badge: 'bg-slate-100 text-text-muted', desc: 'Type testing at BIS lab' },
        { num: '4', title: 'Application', status: 'Not Started', badge: 'bg-slate-100 text-text-muted', desc: 'Form-V on Manakonline' },
        { num: '5', title: 'Factory Assessment', status: 'Not Started', badge: 'bg-slate-100 text-text-muted', desc: 'Auditor on-site inspection' },
        { num: '6', title: 'Licence Decision', status: 'Pending', badge: 'bg-slate-100 text-text-muted', desc: 'Grant of CM/L licence' },
      ];

  return (
    <div className="max-w-[1280px] mx-auto space-y-10 animate-fadeIn pb-16">
      
      {/* Top Welcome Header */}
      <div className="text-center space-y-3 pt-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue-light text-brand-blue text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Standards & BIS Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-text-dark tracking-tight leading-tight">
          How can NormAI help with your product?
        </h1>

        <p className="text-base text-text-muted leading-relaxed">
          Find applicable standards, understand certification requirements, or check your product's compliance readiness.
        </p>
      </div>

      {/* Main Centered Query Composer */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-white rounded-container border border-border-ui shadow-card p-3 sm:p-4 space-y-3 focus-within:border-brand-blue-medium focus-within:ring-3 focus-within:ring-blue-100 transition-all">
          <textarea
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Describe your product or ask a BIS question… (e.g., 750W mixer grinder, 230V, domestic)"
            rows={3}
            className="w-full bg-transparent p-2 text-sm sm:text-base text-text-dark placeholder:text-text-muted focus:outline-none resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunQuery();
              }
            }}
          />

          {/* Action Bar */}
          <div className="pt-2 border-t border-border-ui-light flex flex-wrap items-center justify-between gap-3">
            {/* Multimodal buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onNavigateToDocument}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium text-text-body hover:text-text-dark hover:bg-surface-subtle border border-border-ui transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5 text-text-muted" />
                <span>Upload specification</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQueryInput('Domestic 750W 3-jar stainless steel mixer grinder with overload protector');
                  handleRunQuery('Domestic 750W 3-jar stainless steel mixer grinder with overload protector');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium text-text-body hover:text-text-dark hover:bg-surface-subtle border border-border-ui transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-text-muted" />
                <span>Product image</span>
              </button>

              <button
                type="button"
                onClick={onOpenVoice}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium text-brand-blue bg-brand-blue-light hover:bg-blue-100 border border-blue-200/60 transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice query</span>
              </button>
            </div>

            {/* Right: Submit Button & Demo trigger */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="px-3 py-1.5 rounded-control text-xs font-medium text-text-muted hover:text-brand-blue hover:bg-brand-blue-subtle transition-colors"
                title="Load 750W Mixer Grinder sample inquiry"
              >
                Try Demo Product
              </button>

              <button
                type="button"
                onClick={() => handleRunQuery()}
                disabled={isProcessing || !queryInput.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-control bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                <span>Ask NormAI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Api Error Display */}
        {apiError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-control flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Error: {apiError}</span>
          </div>
        )}

        {/* Try an Example Row */}
        {!hasAnalyzed && !isProcessing && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-text-muted">
              Try an example:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { label: '“Which standard applies to a 750W mixer grinder?”', query: 'Which BIS standard applies to a 750W mixer grinder for home use?' },
                { label: '“What documents are required for BIS certification?”', query: 'What documents and test reports are required for BIS Scheme I certification?' },
                { label: '“Check whether my product specification is certification-ready.”', query: 'Check whether my product specification for electric appliances is certification-ready.' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQueryInput(item.query);
                    handleRunQuery(item.query);
                  }}
                  className="p-3 rounded-card bg-white hover:bg-brand-blue-subtle border border-border-ui hover:border-blue-200 text-left text-xs text-text-body hover:text-brand-blue transition-all shadow-xs flex items-center justify-between group"
                >
                  <span className="font-medium line-clamp-2">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-blue shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Agent Progress Execution Stepper */}
      <div className="max-w-3xl mx-auto">
        <AgentProgressBanner isProcessing={isProcessing} onComplete={handleAgentComplete} />
      </div>

      {/* STRUCTURED RESEARCH-STYLE RESULT */}
      {hasAnalyzed && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Main Assessment Header Card */}
          <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2.5 py-1 rounded">
                  NormAI Assessment
                </span>
                <span className="text-xs text-text-muted">
                  Reference: DPIIT Quality Control Order Mandate
                </span>
              </div>

              <p className="text-base text-text-body leading-relaxed pt-1">
                Based on the supplied product information, the most likely applicable standard is:
              </p>
            </div>

            {/* Applicable Standard Highlight Card */}
            <div className="p-6 rounded-card bg-brand-blue-subtle border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-bold text-base text-brand-blue bg-white px-2.5 py-0.5 rounded border border-blue-200">
                    {displayStandard.code}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-status-success">
                    Active Standard
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-white text-text-body border border-border-ui">
                    {displayStandard.scheme || 'Scheme I (ISI Mark)'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-text-dark">
                  {displayStandard.title}
                </h3>
                <p className="text-xs text-text-muted">
                  {displayStandard.fullTitle || displayStandard.title}
                </p>
              </div>

              <div className="flex md:flex-col items-end justify-between gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-blue">{displayScore}%</div>
                  <div className="text-xs text-text-muted">Match Confidence</div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenClause(displayStandard.code, 'Clause 1.1')}
                  className="px-4 py-2 rounded-control bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  View Standard Details
                </button>
              </div>
            </div>

            {/* Clarification Box if needed */}
            {analysisResult?.needs_clarification && analysisResult.clarification_question && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-card space-y-2">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Clarification Required from Manufacturer</span>
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {analysisResult.clarification_question}
                </p>
                <div className="flex items-center gap-2 pt-1.5">
                  <button
                    onClick={() => {
                      setQueryInput(queryInput + " - Yes, it is for household food preparation.");
                      handleRunQuery(queryInput + " - Yes, it is for household food preparation.");
                    }}
                    className="px-3 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-control text-xs font-medium text-amber-800 transition-colors"
                  >
                    Household Use
                  </button>
                  <button
                    onClick={() => {
                      setQueryInput(queryInput + " - No, this is a commercial continuous catering blender.");
                      handleRunQuery(queryInput + " - No, this is a commercial continuous catering blender.");
                    }}
                    className="px-3 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-control text-xs font-medium text-amber-800 transition-colors"
                  >
                    Commercial Use
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic response answer text */}
            {analysisResult?.answer && (
              <div className="p-4 rounded-card bg-slate-50 border border-slate-100 text-xs sm:text-sm text-text-body space-y-2 whitespace-pre-line leading-relaxed font-medium">
                {analysisResult.answer}
              </div>
            )}

            {/* Why Selected & Evidence Tags */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-text-dark">
                Why NormAI selected this standard:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {displayWhyMatched.map((reason, rIdx) => (
                  <div key={rIdx} className="p-3 bg-surface-subtle rounded-control border border-border-ui-light flex items-center gap-2.5 text-xs text-text-body">
                    <Check className="w-4 h-4 text-status-success shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supporting Citations */}
            <div className="p-4 bg-surface-subtle rounded-card border border-border-ui flex items-center justify-between flex-wrap gap-3 text-xs">
              <span className="font-semibold text-text-dark">
                Supporting Source Citations:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {displayCitations.map((cit, idx) => (
                  <CitationBadge
                    key={idx}
                    code={cit.standardCode}
                    clause={cit.clauseNumber}
                    onClick={() => onOpenClause(cit.standardCode, cit.clauseNumber)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Certification Path Sequence */}
          <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border-ui pb-4">
              <div>
                <h3 className="text-lg font-bold text-text-dark">
                  Certification Pathway
                </h3>
                <p className="text-xs text-text-muted">
                  Official BIS Scheme I (ISI Mark) 6-Stage Compliance Roadmap
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateToCompliance}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-brand-blue-light text-brand-blue hover:bg-blue-100 text-xs font-semibold transition-colors"
              >
                <span>Run Pre-Audit Gap Check (72%)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Timeline sequence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {displayPathway.map((step, idx) => (
                <div key={idx} className="p-4 rounded-card bg-surface-subtle border border-border-ui space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-white border border-border-ui flex items-center justify-center font-bold text-xs text-text-dark">
                      {step.num}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      step.status === 'Complete' || step.status === 'pass' 
                        ? 'bg-emerald-100 text-status-success' 
                        : (step.status === 'Needs Attention' || step.status === 'warning' ? 'bg-amber-100 text-status-warning' : 'bg-slate-100 text-text-muted')
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-text-dark">
                    {step.title}
                  </div>
                  <p className="text-[11px] text-text-muted">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
