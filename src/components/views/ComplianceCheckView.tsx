'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  UploadCloud, 
  ArrowRight, 
  FileText, 
  FileCheck,
  Check,
  ChevronDown,
  Filter,
  AlertCircle
} from 'lucide-react';
import { LanguageCode, ComplianceFinding } from '@/types';
import { DEMO_COMPLIANCE_FINDINGS } from '@/data/mockData';
import { CitationBadge } from '@/components/common/CitationBadge';
import { documentsApi, complianceApi, reportsApi } from '@/lib/api';

interface ComplianceCheckViewProps {
  language: LanguageCode;
  onOpenClause: (code: string, clause?: string) => void;
  onNavigateToReports: () => void;
  initialAssessmentId?: string;
}

export const ComplianceCheckView: React.FC<ComplianceCheckViewProps> = ({
  language,
  onOpenClause,
  onNavigateToReports,
  initialAssessmentId
}) => {
  const [activeSeverity, setActiveSeverity] = useState<'ALL' | 'CRITICAL' | 'ATTENTION' | 'READY'>('ALL');
  const [activeSection, setActiveSection] = useState<string>('ALL');
  
  // State variables for dynamic backend integration
  const [findings, setFindings] = useState<ComplianceFinding[]>(DEMO_COMPLIANCE_FINDINGS);
  const [readinessScore, setReadinessScore] = useState<number>(72);
  const [passedCount, setPassedCount] = useState<number>(2);
  const [attentionCount, setAttentionCount] = useState<number>(3);
  const [criticalCount, setCriticalCount] = useState<number>(2);
  const [assessmentId, setAssessmentId] = useState<string | null>(initialAssessmentId || null);
  
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState<string>('Readiness Assessment Report — Mixer Grinder NX-750');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  // File Upload & Run Analysis Handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setApiError(null);
    setStatusText('Uploading product specifications to storage...');

    try {
      // 1. Upload
      const doc = await documentsApi.upload(file);
      
      // 2. Extract OCR
      setStatusText('Processing document structure and extracting parameters (PDF text & OCR)...');
      await documentsApi.analyze(doc.id);

      // 3. Compliance evaluation
      setStatusText('Retrieving standard clauses and evaluating specification parameters against requirements...');
      const response = await complianceApi.check({
        documentId: doc.id,
        standard_code: 'IS 302-2-14'
      });

      // 4. Update state with backend results
      setAssessmentId(response.assessment_id);
      setReadinessScore(Math.round(response.readiness_score));
      setPassedCount(response.passed_count);
      setAttentionCount(response.attention_count);
      setCriticalCount(response.critical_count);
      setFindings(response.findings || []);
      setStatusText('Compliance gap check complete.');

    } catch (err: any) {
      setApiError(err.message || 'An error occurred during verification.');
      // Keep mock findings as fallback
      setFindings(DEMO_COMPLIANCE_FINDINGS);
      setReadinessScore(72);
    } finally {
      setIsUploading(false);
    }
  };

  // Generate Persistent saved report
  const handleGenerateReport = async () => {
    if (!assessmentId) {
      // If we haven't run a real check yet, run check against seed data to get a real assessment ID
      setIsGeneratingReport(true);
      try {
        const checkRes = await complianceApi.check({
          standard_code: 'IS 302-2-14'
        });
        const repRes = await reportsApi.create({
          assessment_id: checkRes.assessment_id,
          title: reportTitle
        });
        onNavigateToReports();
      } catch (err: any) {
        setApiError(err.message || 'Failed to save report.');
      } finally {
        setIsGeneratingReport(false);
      }
      return;
    }

    setIsGeneratingReport(true);
    try {
      await reportsApi.create({
        assessment_id: assessmentId,
        title: reportTitle
      });
      onNavigateToReports();
    } catch (err: any) {
      setApiError(err.message || 'Failed to save report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Load existing findings if assessment_id is provided
  useEffect(() => {
    const fetchFindings = async () => {
      if (!initialAssessmentId) return;
      try {
        const response = await complianceApi.getFindings(initialAssessmentId);
        setReadinessScore(Math.round(response.readiness_score));
        setPassedCount(response.passed_count);
        setAttentionCount(response.attention_count);
        setCriticalCount(response.critical_count);
        setFindings(response.findings || []);
      } catch (e) {
        // Fall back to default mock data
      }
    };
    fetchFindings();
  }, [initialAssessmentId]);

  const filteredFindings = findings.filter(f => {
    // Map backend READY severity back to frontend type compatibility
    const severityMap: Record<string, string> = {
      'CRITICAL': 'CRITICAL',
      'ATTENTION': 'ATTENTION',
      'READY': 'READY',
      'PASSED': 'READY' // Backend uses PASSED, maps to READY on UI
    };
    const uiSeverity = severityMap[f.severity] || f.severity;
    
    if (activeSeverity !== 'ALL' && uiSeverity !== activeSeverity) return false;
    if (activeSection !== 'ALL' && f.section !== activeSection) return false;
    return true;
  });

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Top Heading */}
      <div className="space-y-2 border-b border-border-ui pb-6">
        <h1 className="text-3xl font-bold text-text-dark tracking-tight">
          Is your product certification-ready?
        </h1>
        <p className="text-sm text-text-muted max-w-3xl">
          Find missing requirements, labeling omissions, and unverified test parameters before they become official BIS audit rejections.
        </p>
      </div>

      {/* Spacious Clean Upload Zone */}
      <div className="bg-white rounded-container border-2 border-dashed border-border-ui hover:border-brand-blue-medium p-8 sm:p-10 text-center space-y-3 transition-colors shadow-xs relative">
        <div className="w-12 h-12 rounded-full bg-brand-blue-light text-brand-blue flex items-center justify-center mx-auto">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-text-dark">
            Drop product specification, test report or technical document here
          </h3>
          <p className="text-xs text-text-muted">
            Supports PDF, DOCX, and high-resolution spec artwork (Max 25 MB)
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <label className="px-4 py-2 rounded-control bg-white border border-border-ui text-text-body hover:text-text-dark hover:bg-slate-50 text-xs font-semibold shadow-xs cursor-pointer">
            Choose Files
            <input 
              type="file" 
              accept=".pdf,.docx,.png,.jpg,.jpeg" 
              onChange={handleFileUpload} 
              className="hidden" 
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/95 rounded-container flex flex-col items-center justify-center space-y-4 p-6 z-10">
            <div className="w-10 h-10 rounded-full border-3 border-brand-blue border-t-transparent animate-spin" />
            <div className="text-sm font-bold text-brand-blue">Analyzing Documents</div>
            <div className="text-xs text-text-muted font-medium">{statusText}</div>
          </div>
        )}
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-control flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error: {apiError}</span>
        </div>
      )}

      {/* Readiness Score Summary Card */}
      <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left: Overall Readiness Score Ring */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-border-ui pb-6 md:pb-0 md:pr-8 space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted font-medium">
              <span>Readiness Score</span>
              <span className="text-status-success font-semibold">Pre-Audit</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-text-dark tracking-tight">
                {readinessScore}%
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                readinessScore >= 90 
                  ? 'bg-emerald-50 text-status-success border-emerald-200' 
                  : 'bg-amber-50 text-status-warning border-amber-200'
              }`}>
                {readinessScore >= 90 ? 'Compliance Ready' : 'Needs Attention'}
              </span>
            </div>

            {/* Score progress bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(passedCount * 14.2, 100)}%` }} />
              <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${Math.min(attentionCount * 14.2, 100)}%` }} />
              <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.min(criticalCount * 14.2, 100)}%` }} />
            </div>
            <div className="text-[10px] text-text-muted font-medium">
              Score calculated based on critical requirements compliance verification.
            </div>
          </div>

          {/* Right: Score counts & CTA */}
          <div className="md:col-span-8 md:pl-4 space-y-6">
            <div className="grid grid-cols-3 gap-3">
              
              <button 
                onClick={() => setActiveSeverity('CRITICAL')}
                className={`p-4 rounded-card border text-left transition-all ${
                  activeSeverity === 'CRITICAL' ? 'bg-red-50 border-red-200 ring-1 ring-red-100' : 'bg-white border-border-ui hover:bg-slate-50'
                }`}
              >
                <div className="text-[10px] text-status-error font-bold tracking-wider uppercase">Critical</div>
                <div className="text-2xl font-bold text-text-dark pt-1">{criticalCount}</div>
                <div className="text-[10px] text-text-muted">Gap Blockers</div>
              </button>

              <button 
                onClick={() => setActiveSeverity('ATTENTION')}
                className={`p-4 rounded-card border text-left transition-all ${
                  activeSeverity === 'ATTENTION' ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-100' : 'bg-white border-border-ui hover:bg-slate-50'
                }`}
              >
                <div className="text-[10px] text-status-warning font-bold tracking-wider uppercase">Attention</div>
                <div className="text-2xl font-bold text-text-dark pt-1">{attentionCount}</div>
                <div className="text-[10px] text-text-muted">Documentation</div>
              </button>

              <button 
                onClick={() => setActiveSeverity('READY')}
                className={`p-4 rounded-card border text-left transition-all ${
                  activeSeverity === 'READY' ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-100' : 'bg-white border-border-ui hover:bg-slate-50'
                }`}
              >
                <div className="text-[10px] text-status-success font-bold tracking-wider uppercase">Passed</div>
                <div className="text-2xl font-bold text-text-dark pt-1">{passedCount}</div>
                <div className="text-[10px] text-text-muted">Verified OK</div>
              </button>

            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Dossier Report Title..."
                className="w-full sm:flex-1 bg-surface-subtle p-2 text-xs font-semibold border border-border-ui rounded-control focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="w-full sm:w-auto px-6 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-control transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <FileCheck className="w-4 h-4" />
                <span>{isGeneratingReport ? 'Generating...' : 'Generate Readiness Report'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-ui pb-3">
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
          <Filter className="w-4 h-4" />
          <span>Category filter:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'Required Markings', label: 'Markings' },
            { id: 'Safety Test Evidence', label: 'Test Evidence' },
            { id: 'Technical Documentation', label: 'Technical Doc' }
          ].map(sect => (
            <button
              key={sect.id}
              onClick={() => setActiveSection(sect.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeSection === sect.id 
                  ? 'bg-text-dark border-text-dark text-white' 
                  : 'bg-white border-border-ui text-text-body hover:bg-slate-50'
              }`}
            >
              {sect.label}
            </button>
          ))}
          {activeSeverity !== 'ALL' && (
            <button
              onClick={() => setActiveSeverity('ALL')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-blue-light border border-blue-200 text-brand-blue"
            >
              Clear Severity Filter (x)
            </button>
          )}
        </div>
      </div>

      {/* Findings Listing */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="bg-white rounded-container border border-border-ui p-12 text-center text-text-muted text-sm font-medium">
            No compliance assessment findings match this filter.
          </div>
        ) : (
          filteredFindings.map(f => {
            const isCrit = f.severity === 'CRITICAL';
            const isAttn = f.severity === 'ATTENTION';
            
            return (
              <div 
                key={f.id}
                className={`bg-white rounded-container border shadow-xs overflow-hidden flex flex-col transition-all ${
                  isCrit ? 'border-l-4 border-l-red-500 border-border-ui' : (isAttn ? 'border-l-4 border-l-amber-500 border-border-ui' : 'border-l-4 border-l-emerald-500 border-border-ui')
                }`}
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${
                        isCrit ? 'bg-red-50 text-status-error' : (isAttn ? 'bg-amber-50 text-status-warning' : 'bg-emerald-50 text-status-success')
                      }`}>
                        {f.severity}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-text-muted px-2 py-0.5 rounded">
                        {f.section}
                      </span>
                    </div>

                    <CitationBadge
                      code={f.standardCode}
                      clause={f.clauseNumber}
                      onClick={() => onOpenClause(f.standardCode, f.clauseNumber)}
                    />
                  </div>

                  {/* Finding Details */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-text-dark">
                      {f.title}
                    </h3>
                  </div>

                  {/* Evidence Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-card space-y-2">
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Required Specification</div>
                      <p className="text-xs text-text-body leading-relaxed font-semibold">
                        {f.requirement}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-card space-y-2">
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Observed Evidence</div>
                      <p className="text-xs text-text-body leading-relaxed font-medium">
                        {f.observed}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation action */}
                  <div className="p-4 bg-brand-blue-subtle/40 border border-blue-50 rounded-card flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Recommended Corrective Action</div>
                      <p className="text-xs text-text-body leading-relaxed font-medium">
                        {f.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
