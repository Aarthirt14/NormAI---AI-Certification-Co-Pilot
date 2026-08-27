'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Check,
  FileText,
  Building,
  Award,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { LanguageCode, ComplianceFinding } from '@/types';
import { CitationBadge } from '@/components/common/CitationBadge';
import { DEMO_COMPLIANCE_FINDINGS } from '@/data/mockData';
import { reportsApi } from '@/lib/api';

interface SavedReportsViewProps {
  language: LanguageCode;
  onOpenClause: (code: string, clause?: string) => void;
}

export const SavedReportsView: React.FC<SavedReportsViewProps> = ({
  language,
  onOpenClause
}) => {
  const [activeFindingTab, setActiveFindingTab] = useState<'ALL' | 'CRITICAL' | 'ATTENTION' | 'READY'>('ALL');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  // Dynamic backend states
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const list = await reportsApi.list();
      setReports(list || []);
      if (list && list.length > 0) {
        setSelectedReportId(list[0].id);
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to retrieve saved reports.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportsApi.delete(id);
      fetchReports();
    } catch (err: any) {
      setApiError(err.message || 'Failed to delete report.');
    }
  };

  // Find active report details
  const activeReport = reports.find(r => r.id === selectedReportId);

  // Fallback structures if no backend reports are loaded yet
  const reportNum = activeReport?.report_number || 'NORMAI-2026-MG750-V2';
  const reportTitle = activeReport?.title || 'BIS Compliance Readiness Assessment';
  const reportDate = activeReport 
    ? new Date(activeReport.created_at).toLocaleDateString()
    : '27 Aug 2026';
  
  const rData = activeReport?.report_data || {
    readiness_score: 72,
    critical_count: 2,
    attention_count: 3,
    passed_count: 2,
    product_info: {
      name: '750W Mixer Grinder',
      model: 'NX-750',
      manufacturer: 'SIH MSME Appliances Ltd',
      rating: '230V AC, 50Hz, Class I'
    },
    standard_info: {
      code: 'IS 302-2-14',
      title: 'Particular requirements for kitchen machines',
      scheme: 'Scheme I (ISI Mark)',
      mandatory: 'MANDATORY (QCO)'
    },
    findings: DEMO_COMPLIANCE_FINDINGS,
    priority_actions: [
      "Correct product rating plate marking: Add rated voltage ('230 V AC ~ 50Hz, 750W') and manufacturer identification to engineering laser artwork.",
      "Conduct locked-rotor thermal overload trip test: Submit 3 production samples for 30-second abnormal trip longevity verification under Clause 19.11.",
      "Procure IS 694 verified power cord certificate: Obtain valid vendor CM/L licence test certificate for 3-core 0.75 mm² flexible power cable."
    ]
  };

  const findingsList = (rData.findings || []) as ComplianceFinding[];
  const filteredFindings = findingsList.filter(f => {
    // Map backend READY severity back to frontend type compatibility
    const severityMap: Record<string, string> = {
      'CRITICAL': 'CRITICAL',
      'ATTENTION': 'ATTENTION',
      'READY': 'READY',
      'PASSED': 'READY' // Backend uses PASSED, maps to READY on UI
    };
    const uiSeverity = severityMap[f.severity] || f.severity;
    
    if (activeFindingTab !== 'ALL' && uiSeverity !== activeFindingTab) return false;
    return true;
  });

  return (
    <div className="max-w-[1280px] mx-auto space-y-10 animate-fadeIn pb-24">
      
      {/* REPORTS SELECTION LIST (Dynamic Selector) */}
      {reports.length > 1 && (
        <div className="bg-white rounded-container border border-border-ui shadow-card p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
            <span>Select Report Dossier:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {reports.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedReportId(r.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedReportId === r.id 
                    ? 'bg-brand-blue border-brand-blue text-white shadow-xs' 
                    : 'bg-white border-border-ui text-text-body hover:bg-slate-50'
                }`}
              >
                {r.report_number}
              </button>
            ))}
          </div>
        </div>
      )}

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-control flex items-center gap-2 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error: {apiError}. (Using offline backup dataset)</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border-ui pb-8 print:hidden">
        <div className="space-y-1.5">
          <div className="text-xs text-text-muted font-medium">
            Saved Reports / Compliance Assessment
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-dark tracking-tight">
            {reportTitle}
          </h1>
          <p className="text-base text-text-body font-medium">
            {rData.product_info?.name}
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted pt-1">
            <span>Report ID: <strong className="font-mono text-text-dark">{reportNum}</strong></span>
            <span>·</span>
            <span>Generated {reportDate}</span>
          </div>
        </div>

        {/* Right Actions: Share & Primary Blue Download PDF */}
        <div className="flex items-center gap-3">
          {activeReport && (
            <button
              type="button"
              onClick={() => handleDeleteReport(activeReport.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-control bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-status-error transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-control bg-white hover:bg-surface-subtle border border-border-ui text-xs font-semibold text-text-body transition-colors shadow-xs"
          >
            <Share2 className="w-4 h-4 text-text-muted" />
            <span>{isCopied ? 'Link Copied' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-control bg-brand-blue hover:bg-brand-blue-hover text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* REPORT SUMMARY CARD */}
      <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: 72% Readiness Ring */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-border-ui pb-6 md:pb-0 md:pr-8 space-y-3">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Compliance Readiness
            </h3>

            <div className="flex items-center gap-4">
              {/* Circular Ring Indicator */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={rData.readiness_score >= 90 ? 'text-status-success' : 'text-status-warning'}
                    strokeDasharray={`${rData.readiness_score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-2xl text-text-dark">{Math.round(rData.readiness_score)}%</span>
              </div>

              <div className="space-y-0.5">
                <span className={`text-sm font-bold ${rData.readiness_score >= 90 ? 'text-status-success' : 'text-status-warning'}`}>
                  {rData.readiness_score >= 90 ? 'Compliance Ready' : 'Needs Attention'}
                </span>
                <p className="text-xs text-text-muted leading-snug">
                  {rData.critical_count > 0 
                    ? `${rData.critical_count} critical compliance gaps should be resolved before proceeding with certification.`
                    : 'Product specifications conform to mandatory safety guidelines.'}
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: Applicable Standard */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-border-ui pb-6 md:pb-0 md:pr-8 space-y-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Applicable Standard
            </h3>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-brand-blue">
                  {rData.standard_info?.code}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-blue-light text-brand-blue">
                  {rData.standard_info?.mandatory || 'MANDATORY (QCO)'}
                </span>
              </div>
              <p className="text-xs text-text-body font-medium">
                {rData.standard_info?.title}
              </p>
              <div className="text-xs text-status-success font-semibold flex items-center gap-1 pt-0.5">
                <span>{rData.standard_info?.scheme}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Assessment Counts */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Assessment
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-emerald-50 text-status-success font-semibold">
                <span>{rData.passed_count} Passed</span>
                <Check className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-amber-50 text-status-warning font-semibold">
                <span>{rData.attention_count} Need Attention</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-red-50 text-status-error font-semibold">
                <span>{rData.critical_count} Critical</span>
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 01. PRODUCT PROFILE CARD */}
      <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
          <span>01</span>
          <span>·</span>
          <span>Product Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-card bg-brand-blue-subtle/60 border border-blue-100 space-y-1">
            <span className="text-xs text-text-muted">Product</span>
            <div className="text-sm font-bold text-text-dark">{rData.product_info?.name}</div>
          </div>

          <div className="p-4 rounded-card bg-brand-blue-subtle/60 border border-blue-100 space-y-1">
            <span className="text-xs text-text-muted">Model/Manufacturer</span>
            <div className="text-sm font-bold text-text-dark truncate">{rData.product_info?.manufacturer || 'MSME Brand'}</div>
          </div>

          <div className="p-4 rounded-card bg-brand-blue-subtle/60 border border-blue-100 space-y-1">
            <span className="text-xs text-text-muted">Power Rating</span>
            <div className="text-sm font-bold text-text-dark font-mono">{rData.product_info?.rating}</div>
          </div>

          <div className="p-4 rounded-card bg-brand-blue-subtle/60 border border-blue-100 space-y-1">
            <span className="text-xs text-text-muted">Primary Standard</span>
            <div className="text-sm font-bold text-brand-blue font-mono">{rData.standard_info?.code}</div>
          </div>
        </div>
      </div>

      {/* 02. APPLICABLE STANDARDS (Structured Rows) */}
      <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
          <span>02</span>
          <span>·</span>
          <span>Applicable Standards</span>
        </div>

        <div className="space-y-3">
          {[
            {
              code: 'IS 302-2-14',
              title: 'Household and Similar Electrical Appliances — Kitchen Machines',
              role: 'Primary Product Standard',
              reason: 'Motor-driven domestic kitchen appliance (750W / 230V)',
              match: '94%',
              status: 'Active',
              clause: 'Clause 1.1'
            },
            {
              code: 'IS 302-1',
              title: 'General Requirements for Household Electrical Appliances',
              role: 'Parent General Safety Standard',
              reason: 'Foundational baseline for earthing, creepage, and flammability',
              match: '78%',
              status: 'Active',
              clause: 'Clause 7.1'
            },
            {
              code: 'IS 694',
              title: 'PVC Insulated Cables for Working Voltages up to 1100V',
              role: 'Cabling & Power Cord Reference',
              reason: 'Power cord material specification (min 0.75 mm² flexible cable)',
              match: '85%',
              status: 'Active',
              clause: 'Clause 25.7'
            }
          ].map((std) => (
            <div
              key={std.code}
              className="p-4 rounded-card bg-surface-subtle border border-border-ui flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-brand-blue">
                    {std.code}
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-status-success px-2 py-0.5 rounded">
                    {std.status}
                  </span>
                  <span className="text-text-muted font-medium">({std.role})</span>
                </div>
                <h4 className="font-bold text-text-dark text-[13px]">{std.title}</h4>
                <p className="text-text-muted">{std.reason}</p>
              </div>

              <div className="flex sm:flex-col items-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenClause(std.code, std.clause)}
                  className="px-3.5 py-1.5 rounded-control bg-white hover:bg-slate-50 border border-border-ui text-brand-blue font-semibold transition-colors"
                >
                  View Reference Clause
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 03. COMPLIANCE gap check analysis details */}
      <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border-ui pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
            <span>03</span>
            <span>·</span>
            <span>Pre-Audit Findings</span>
          </div>

          <div className="flex items-center gap-1.5">
            {['ALL', 'CRITICAL', 'ATTENTION', 'READY'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFindingTab(tab as any)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase transition-all ${
                  activeFindingTab === tab 
                    ? 'bg-text-dark border-text-dark text-white shadow-xs' 
                    : 'bg-white border-border-ui text-text-body hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredFindings.map(f => {
            const isCrit = f.severity === 'CRITICAL';
            const isAttn = f.severity === 'ATTENTION';

            return (
              <div 
                key={f.id}
                className={`p-5 rounded-card border shadow-xs flex flex-col gap-3 transition-all ${
                  isCrit ? 'border-l-4 border-l-red-500 bg-red-50/5' : (isAttn ? 'border-l-4 border-l-amber-500 bg-amber-50/5' : 'border-l-4 border-l-emerald-500 bg-emerald-50/5')
                }`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${
                      isCrit ? 'bg-red-100 text-status-error' : (isAttn ? 'bg-amber-100 text-status-warning' : 'bg-emerald-100 text-status-success')
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

                <h4 className="text-sm font-bold text-text-dark leading-snug">
                  {f.title}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-3 bg-white border border-border-ui-light rounded-control space-y-1">
                    <span className="font-bold text-text-muted uppercase text-[9px]">Required Standards Parameter:</span>
                    <p className="text-text-body font-medium">{f.requirement}</p>
                  </div>
                  <div className="p-3 bg-white border border-border-ui-light rounded-control space-y-1">
                    <span className="font-bold text-text-muted uppercase text-[9px]">Observed Specification:</span>
                    <p className="text-text-body font-medium">{f.observed}</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/40 rounded-control border border-blue-100/50 flex items-start gap-2.5 text-xs">
                  <Check className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <p className="text-text-body font-medium leading-relaxed">
                    <strong className="text-brand-blue font-bold">Action: </strong>{f.recommendedAction}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 07. RECOMMENDED ACTIONS: "What should you do next?" */}
      <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
            <span>07</span>
            <span>·</span>
            <span>Recommended Actions</span>
          </div>
          <h3 className="text-lg font-bold text-text-dark">
            What should you do next?
          </h3>
        </div>

        <div className="space-y-3">
          {rData.priority_actions.map((act: string, idx: number) => {
            const isFirst = idx === 0;
            const isSec = idx === 1;
            const cCode = isFirst ? 'Clause 7.1' : (isSec ? 'Clause 19.11' : 'IS 694');

            return (
              <div
                key={idx}
                className="p-5 rounded-card bg-surface-subtle border border-border-ui flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <span className="text-[11px] font-bold text-brand-blue bg-brand-blue-light px-2 py-0.5 rounded">
                    Priority {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-text-dark pt-1">
                    {act.split(':')[0]}
                  </h4>
                  <p className="text-text-muted">
                    {act.split(':').slice(1).join(':') || act}
                  </p>
                  <div className="text-text-muted text-[11px] pt-0.5">
                    Estimated stage: <strong className="text-text-dark">{isFirst ? 'Before lab testing' : (isSec ? 'Stage 4 Lab Testing' : 'Dossier submission')}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenClause('IS 302-2-14', cCode)}
                  className="shrink-0 px-4 py-2 rounded-control bg-white hover:bg-slate-50 border border-border-ui text-brand-blue font-semibold transition-colors shadow-xs"
                >
                  Inspect Requirements →
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
