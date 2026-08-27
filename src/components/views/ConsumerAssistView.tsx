'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Award, 
  HelpCircle, 
  FileWarning, 
  Send,
  AlertTriangle,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { LanguageCode } from '@/types';
import { CitationBadge } from '@/components/common/CitationBadge';
import { consumerApi } from '@/lib/api';

interface ConsumerAssistViewProps {
  language: LanguageCode;
  onOpenClause: (code: string, clause?: string) => void;
}

export const ConsumerAssistView: React.FC<ConsumerAssistViewProps> = ({
  language,
  onOpenClause
}) => {
  const [activeTab, setActiveTab] = useState<'verify' | 'hallmark' | 'explain' | 'complaint'>('verify');
  
  // Verify Licence states
  const [verifyInput, setVerifyInput] = useState<string>('CM/L-8472910');
  const [verifyResult, setVerifyResult] = useState<any>({
    found: true,
    cml_number: 'CM/L-8472910',
    status: 'ACTIVE',
    manufacturer: 'SIH MSME Appliances Ltd',
    product: 'Domestic Electric Food Mixers, Grinders & Juicers',
    standard_code: 'IS 302-2-14',
    factory: 'Plot 24, MSME Hub, Coimbatore, Tamil Nadu, 641001',
    scope: 'Electrical kitchen machines up to 1000W rated power input',
    valid_from: '2024-01-01',
    valid_until: '2028-12-31',
    is_demo: true
  });
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Hallmark HUID verification states
  const [huidInput, setHuidInput] = useState<string>('H75G8D');
  const [huidResult, setHuidResult] = useState<any>(null);
  const [isVerifyingHuid, setIsVerifyingHuid] = useState<boolean>(false);

  // Complaints states
  const [complaintProduct, setComplaintProduct] = useState<string>('Unbranded 750W Kitchen Mixer');
  const [complaintCml, setComplaintCml] = useState<string>('');
  const [complaintDetail, setComplaintDetail] = useState<string>('Substandard motor winding causing early thermal overload cutout trip failures during normal domestic usage.');
  const [complaintEmail, setComplaintEmail] = useState<string>('auditor@sih.manak.gov.in');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);
  const [registeredComplaintId, setRegisteredComplaintId] = useState<string>('');

  const handleRunVerify = async (codeToTest?: string) => {
    const query = (codeToTest || verifyInput || '').trim();
    if (!query) return;

    setIsVerifying(true);
    setApiError(null);
    try {
      const response = await consumerApi.verifyLicence(query);
      setVerifyResult(response);
    } catch (err: any) {
      setApiError(err.message || 'Failed to verify licence.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRunVerifyHuid = async (huidToTest?: string) => {
    const query = (huidToTest || huidInput || '').trim();
    if (!query) return;

    setIsVerifyingHuid(true);
    setApiError(null);
    try {
      const response = await consumerApi.verifyHuid(query);
      setHuidResult(response);
    } catch (err: any) {
      setApiError(err.message || 'Failed to verify hallmark.');
    } finally {
      setIsVerifyingHuid(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!complaintProduct || !complaintDetail) return;
    setApiError(null);
    try {
      const response = await consumerApi.submitComplaint({
        product_name: complaintProduct,
        licence_number: complaintCml || undefined,
        complaint_detail: complaintDetail,
        contact_email: complaintEmail || undefined
      });
      setRegisteredComplaintId(response.complaint_id);
      setReportSubmitted(true);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit complaint.');
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="space-y-2 border-b border-border-ui pb-6">
        <h1 className="text-3xl font-bold text-text-dark tracking-tight">
          Check before you trust a mark.
        </h1>
        <p className="text-sm text-text-muted max-w-3xl">
          Verify ISI mark licences, authenticate 6-digit Hallmark HUIDs, report substandard counterfeit goods, and safeguard your consumer rights.
        </p>
      </div>

      {/* 4 Clean Options Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'verify', title: 'Verify BIS Licence', desc: 'Check 7-digit CM/L or CRS number', icon: ShieldCheck },
          { id: 'hallmark', title: 'Verify Hallmark', desc: 'Authenticate 6-digit Gold HUID', icon: Award },
          { id: 'explain', title: 'Understand ISI Mark', desc: 'Identify fake vs genuine stamps', icon: HelpCircle },
          { id: 'complaint', title: 'Report an Issue', desc: 'File violation report with BIS', icon: FileWarning },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setApiError(null);
              }}
              className={`p-5 rounded-container border text-left transition-all shadow-card ${
                isActive
                  ? 'bg-brand-blue-subtle border-brand-blue-medium ring-1 ring-blue-200'
                  : 'bg-white border-border-ui hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-control flex items-center justify-center ${
                  isActive ? 'bg-brand-blue text-white' : 'bg-brand-blue-light text-brand-blue'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-brand-blue" />}
              </div>

              <h3 className="font-bold text-sm text-text-dark">
                {item.title}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-control flex items-center gap-2 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error: {apiError}</span>
        </div>
      )}

      {/* VERIFY TAB */}
      {activeTab === 'verify' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-container border border-border-ui shadow-card p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-dark">
                Enter licence or registration number
              </h3>
              <p className="text-xs text-text-muted">
                Located underneath the ISI mark on product labels (e.g. CM/L-8472910 or R-41029837)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 bg-surface-subtle rounded-control border border-border-ui flex items-center px-3.5">
                <Search className="w-4 h-4 text-text-muted mr-2.5" />
                <input
                  type="text"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder="e.g. CM/L-8472910 or R-41029837..."
                  className="w-full bg-transparent py-3 text-sm text-text-dark font-mono uppercase focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleRunVerify()}
                />
              </div>

              <button
                type="button"
                onClick={() => handleRunVerify()}
                disabled={isVerifying}
                className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold rounded-control transition-colors shadow-xs"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>

            {/* Quick Test Numbers */}
            <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-text-muted">Quick test:</span>
              <button
                onClick={() => { setVerifyInput('CM/L-8472910'); handleRunVerify('CM/L-8472910'); }}
                className="px-2.5 py-1 rounded bg-surface-subtle border border-border-ui font-mono text-[11px] hover:bg-brand-blue-light"
              >
                CM/L-8472910 (Mixer Grinder)
              </button>
              <button
                onClick={() => { setVerifyInput('CM/L-1234567'); handleRunVerify('CM/L-1234567'); }}
                className="px-2.5 py-1 rounded bg-surface-subtle border border-border-ui font-mono text-[11px] hover:bg-brand-blue-light"
              >
                CM/L-1234567 (CRS Imitation)
              </button>
              <button
                onClick={() => { setVerifyInput('FAKE-MARK-ISI'); handleRunVerify('FAKE-MARK-ISI'); }}
                className="px-2.5 py-1 rounded bg-red-50 text-status-error border border-red-200 font-mono text-[11px] hover:bg-red-100"
              >
                Test Fake Number
              </button>
            </div>
          </div>

          {/* Result Card */}
          {verifyResult && (
            <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-4 animate-fadeIn">
              {verifyResult.found ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-ui pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-50 text-status-success border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                          Genuine & Operative BIS Licence
                        </span>
                        <span className="text-xs text-text-muted">{verifyResult.is_demo ? 'Demo Registry Record' : 'Verified Database Record'}</span>
                      </div>

                      <h3 className="text-xl font-bold text-text-dark">
                        {verifyResult.manufacturer || verifyResult.licenseeName}
                      </h3>
                      <p className="text-xs text-text-muted">
                        Brand: <strong className="text-text-dark">{verifyResult.product || verifyResult.brandName}</strong> · Factory: {verifyResult.factory || verifyResult.factoryLocation}
                      </p>
                    </div>

                    <div className="p-3 bg-brand-blue-subtle rounded-card border border-blue-100 text-right font-mono text-xs">
                      <span className="text-text-muted block text-[10px]">Licence Number</span>
                      <span className="font-bold text-brand-blue text-sm">{verifyResult.cml_number || verifyResult.cmlNumber}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-surface-subtle rounded-card border border-border-ui space-y-1">
                      <span className="font-semibold text-text-muted uppercase text-[10px]">Certified Product Category:</span>
                      <p className="text-sm font-bold text-text-dark">{verifyResult.product || verifyResult.productName}</p>
                    </div>

                    <div className="p-4 bg-surface-subtle rounded-card border border-border-ui space-y-1">
                      <span className="font-semibold text-text-muted uppercase text-[10px]">Conforming Standard:</span>
                      <p className="font-mono font-bold text-text-dark">{verifyResult.standard_code || verifyResult.standardCode}</p>
                      <p className="text-xs text-text-muted truncate">{verifyResult.scope || verifyResult.standardTitle}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-control border border-emerald-200 flex items-center justify-between text-xs font-medium text-emerald-900">
                    <span>Valid From: {verifyResult.valid_from || verifyResult.validFrom}</span>
                    <span className="font-bold">Valid Upto: {verifyResult.valid_until || verifyResult.validUpto}</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-red-50 border border-red-200 rounded-card space-y-3">
                  <div className="flex items-center gap-2 text-status-error font-bold text-sm">
                    <ShieldAlert className="w-5 h-5" />
                    <span>Caution: Invalid or Suspicious Licence Number</span>
                  </div>
                  <p className="text-xs text-text-body leading-relaxed font-semibold">
                    {verifyResult.error}
                  </p>
                  <button
                    onClick={() => setActiveTab('complaint')}
                    className="px-4 py-2 bg-status-error text-white text-xs font-semibold rounded-control hover:bg-red-700 transition-colors shadow-xs"
                  >
                    Report Fake Licence to BIS →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* HALLMARK TAB */}
      {activeTab === 'hallmark' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text-dark">
                Gold Jewellery Hallmark HUID Verification
              </h3>
              <p className="text-xs text-text-muted">
                Every hallmarked gold article bears a 6-digit alphanumeric code laser-engraved by a BIS-recognized Assaying Centre.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 bg-surface-subtle rounded-control border border-border-ui flex items-center px-3.5">
                <Search className="w-4 h-4 text-text-muted mr-2.5" />
                <input
                  type="text"
                  value={huidInput}
                  onChange={(e) => setHuidInput(e.target.value)}
                  placeholder="Enter 6-digit alphanumeric HUID (e.g. H75G8D)..."
                  className="w-full bg-transparent py-3 text-sm text-text-dark font-mono uppercase focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleRunVerifyHuid()}
                />
              </div>

              <button
                type="button"
                onClick={() => handleRunVerifyHuid()}
                disabled={isVerifyingHuid}
                className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold rounded-control transition-colors shadow-xs"
              >
                {isVerifyingHuid ? 'Checking HUID...' : 'Authenticate HUID'}
              </button>
            </div>
          </div>

          {huidResult && (
            <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-4 animate-fadeIn">
              {huidResult.found ? (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-ui pb-4 gap-4">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-50 text-status-success border border-emerald-200 flex items-center gap-1.5 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                        Valid HUID Identification
                      </span>
                      <h3 className="text-xl font-bold text-text-dark mt-2">
                        Purity: {huidResult.purity}
                      </h3>
                      <p className="text-xs text-text-muted">
                        Jeweller: <strong className="text-text-dark">{huidResult.jeweller}</strong>
                      </p>
                    </div>

                    <div className="p-3 bg-brand-blue-subtle rounded-card border border-blue-100 text-right font-mono text-xs">
                      <span className="text-text-muted block text-[10px]">6-Digit HUID Code</span>
                      <span className="font-bold text-brand-blue text-sm">{huidResult.huid}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-surface-subtle rounded-card border border-border-ui space-y-1">
                      <span className="font-semibold text-text-muted uppercase text-[10px]">Assaying & Hallmarking Centre:</span>
                      <p className="text-xs font-bold text-text-dark">{huidResult.assay_center}</p>
                    </div>

                    <div className="p-4 bg-surface-subtle rounded-card border border-border-ui space-y-1">
                      <span className="font-semibold text-text-muted uppercase text-[10px]">Date of Hallmarking:</span>
                      <p className="text-xs font-bold text-text-dark font-mono">{huidResult.date}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-red-50 border border-red-200 rounded-card space-y-2">
                  <div className="flex items-center gap-2 text-status-error font-bold text-sm">
                    <ShieldAlert className="w-5 h-5" />
                    <span>HUID Authentication Failed</span>
                  </div>
                  <p className="text-xs text-text-body">
                    {huidResult.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* EXPLAIN TAB */}
      {activeTab === 'explain' && (
        <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <h3 className="text-lg font-bold text-text-dark">
            How to verify a genuine ISI Mark on product labels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 bg-emerald-50/50 rounded-card border border-emerald-200 space-y-2">
              <span className="font-bold text-status-success uppercase">✓ Genuine Marking Checklist</span>
              <ul className="space-y-1.5 text-text-body list-disc list-inside">
                <li>IS Number printed above the monogram (e.g. <strong>IS 302-2-14</strong>)</li>
                <li>7-digit CM/L Licence Number underneath the monogram (e.g. <strong>CM/L-8472910</strong>)</li>
                <li>Manufacturer name and factory address clearly embossed</li>
              </ul>
            </div>

            <div className="p-5 bg-red-50/50 rounded-card border border-red-200 space-y-2">
              <span className="font-bold text-status-error uppercase">✕ Red Flags (Fake Stamp)</span>
              <ul className="space-y-1.5 text-text-body list-disc list-inside">
                <li>ISI mark printed without any CM/L number below it</li>
                <li>"As per IS standards" text without the official mark</li>
                <li>Incomplete or blurred licence numbers</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* COMPLAINT TAB */}
      {activeTab === 'complaint' && (
        <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-4 animate-fadeIn">
          <h3 className="text-lg font-bold text-text-dark">
            Report Substandard or Misleading Product
          </h3>

          {!reportSubmitted ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-muted font-medium">Product / Brand Name</label>
                  <input
                    type="text"
                    value={complaintProduct}
                    onChange={(e) => setComplaintProduct(e.target.value)}
                    className="w-full p-2.5 bg-surface-subtle border border-border-ui rounded-control text-text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-text-muted font-medium">CM/L Licence Number (Optional)</label>
                  <input
                    type="text"
                    value={complaintCml}
                    onChange={(e) => setComplaintCml(e.target.value)}
                    placeholder="e.g. CM/L-1234567"
                    className="w-full p-2.5 bg-surface-subtle border border-border-ui rounded-control text-text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Detailed Complaint Information</label>
                <textarea
                  value={complaintDetail}
                  onChange={(e) => setComplaintDetail(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 bg-surface-subtle border border-border-ui rounded-control text-text-dark focus:outline-none focus:border-brand-blue resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitComplaint}
                className="py-2.5 px-5 bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold text-xs rounded-control transition-colors shadow-xs flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Grievance to BIS Enforcement Wing</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-card border border-emerald-200 text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center gap-2 text-status-success font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Grievance Registered: REF #{registeredComplaintId}</span>
              </div>
              <p className="text-text-muted">
                Your report has been forwarded to the Central Enforcement Cell, Bureau of Indian Standards, Manak Bhavan.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
