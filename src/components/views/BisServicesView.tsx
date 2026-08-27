'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  ArrowRight, 
  Award, 
  FlaskConical, 
  FileCheck2, 
  GraduationCap, 
  Users, 
  Sparkles,
  ShieldCheck,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { LanguageCode, LabCenter } from '@/types';
import { DEMO_LABORATORIES } from '@/data/mockData';
import { labsApi } from '@/lib/api';

interface BisServicesViewProps {
  language: LanguageCode;
  onOpenClause: (code: string, clause?: string) => void;
  onNavigateToReports: () => void;
}

const BIS_SERVICE_CARDS = [
  { id: '1', title: 'Product Certification', desc: 'Scheme I (ISI Mark) and Scheme II (CRS) conformity assessments for Indian and foreign manufacturers.', icon: ShieldCheck },
  { id: '2', title: 'Hallmarking', desc: 'Third-party assurance and laser HUID authentication for precious metal gold & silver articles.', icon: Award },
  { id: '3', title: 'Laboratory Services', desc: 'Chemical, mechanical, electrical, and microbiological product testing across recognized labs.', icon: FlaskConical },
  { id: '4', title: 'Management Systems', desc: 'ISO 9001 (QMS), ISO 14001 (EMS), and ISO 22000 (FSMS) industrial management certifications.', icon: FileCheck2 },
  { id: '5', title: 'Training & NITS', desc: 'Capacity-building programs and standards implementation workshops for industries and MSMEs.', icon: GraduationCap },
  { id: '6', title: 'Consumer Services', desc: 'Public complaint redressing, licence verification, and quality grievance monitoring under the BIS Act.', icon: Users },
];

export const BisServicesView: React.FC<BisServicesViewProps> = ({
  language,
  onOpenClause,
  onNavigateToReports
}) => {
  const [subTab, setSubTab] = useState<'directory' | 'pathway' | 'labs'>('directory');
  const [labSearch, setLabSearch] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [labs, setLabs] = useState<LabCenter[]>(DEMO_LABORATORIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabs = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const response = await labsApi.list(selectedState, labSearch);
        setLabs(response || []);
      } catch (err: any) {
        setApiError(err.message || 'Failed to query laboratory directory.');
        // Fall back to static mock data
        setLabs(DEMO_LABORATORIES);
      } finally {
        setIsLoading(false);
      }
    };

    // Only query backend if on the labs tab
    if (subTab === 'labs') {
      fetchLabs();
    }
  }, [subTab, selectedState, labSearch]);

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="space-y-2 border-b border-border-ui pb-6">
        <h1 className="text-3xl font-bold text-text-dark tracking-tight">
          BIS Services & Laboratory Directory
        </h1>
        <p className="text-sm text-text-muted max-w-3xl">
          Explore institutional Bureau of Indian Standards services, personalized compliance roadmaps, and testing facilities.
        </p>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-border-ui text-sm">
        {[
          { id: 'directory', label: 'Services Directory' },
          { id: 'pathway', label: 'Certification Roadmap' },
          { id: 'labs', label: 'Recognized Testing Labs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`px-4 py-2.5 border-b-2 font-medium transition-all ${
              subTab === tab.id
                ? 'border-brand-blue text-brand-blue font-semibold bg-brand-blue-subtle/50'
                : 'border-transparent text-text-muted hover:text-text-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-control flex items-center gap-2 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error: {apiError}. (Using offline backup dataset)</span>
        </div>
      )}

      {/* SUBTAB 1: CLEAN SERVICE DIRECTORY CARDS */}
      {subTab === 'directory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {BIS_SERVICE_CARDS.map((srv) => {
            const Icon = srv.icon;

            return (
              <div
                key={srv.id}
                className="bg-white rounded-container border border-border-ui shadow-card p-6 flex flex-col justify-between hover:border-blue-200 transition-all group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-control bg-brand-blue-light text-brand-blue flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-text-dark group-hover:text-brand-blue transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-text-body leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="pt-5 border-t border-border-ui-light mt-6 flex justify-between items-center text-xs">
                  <span className="font-semibold text-brand-blue group-hover:underline">Explore BIS service</span>
                  <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-brand-blue transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: PERSONALIZED CERTIFICATION ROADMAP */}
      {subTab === 'pathway' && (
        <div className="bg-white rounded-container border border-border-ui shadow-card p-6 sm:p-8 space-y-8 animate-fadeIn">
          
          <div className="border-b border-border-ui pb-4">
            <h2 className="text-lg font-bold text-text-dark">Certification Roadmap Pathway</h2>
            <p className="text-xs text-text-muted">Personalized MSME ISI Mark enforcement track</p>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8 py-2">
            {[
              { title: 'Define scope bounds & Match standard', desc: 'Classify product parameters against active QCO schemas (Done - matched with IS 302-2-14).' },
              { title: 'Compile factory QA & In-house logs', desc: 'Ensure testing equipments (HV tester, earthing calibration) are properly documented and logged.' },
              { title: 'Submit test samples at recognized Lab', desc: 'Ship 3 representative production samples to central CPRI or TUV testing laboratories.' },
              { title: 'Submit Application Form-V', desc: 'File application dossier online on Manakonline portal with required BIS licensing fees.' },
              { title: 'BIS factory inspection & audit', desc: 'On-site auditor verification of in-house testing capability and seal verification.' },
              { title: 'Licence Grant & ISI Nameplate stamping', desc: 'Verify valid CM/L licence number grant and begin ISI mark serialization.' }
            ].map((step, idx) => (
              <div key={idx} className="relative space-y-1">
                {/* Stepper node circle */}
                <span className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-white border-2 border-brand-blue flex items-center justify-center font-bold text-xs text-brand-blue shadow-xs">
                  {idx + 1}
                </span>

                <h3 className="text-sm font-bold text-text-dark">{step.title}</h3>
                <p className="text-xs text-text-body leading-relaxed max-w-2xl">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border-ui-light flex justify-end">
            <button
              onClick={onNavigateToReports}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>View Saved Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 3: TESTING LABORATORY FINDER */}
      {subTab === 'labs' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Filters Bar */}
          <div className="bg-white rounded-container border border-border-ui p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
            <div className="relative flex-1 bg-surface-subtle rounded-control border border-border-ui focus-within:border-brand-blue-medium focus-within:bg-white flex items-center px-3 py-2 transition-all w-full">
              <Search className="w-4 h-4 text-text-muted shrink-0 mr-2.5" />
              <input
                type="text"
                value={labSearch}
                onChange={(e) => setLabSearch(e.target.value)}
                placeholder="Search labs by name, city or standard (e.g. CPRI, Chennai, IS 302)..."
                className="w-full bg-transparent text-xs text-text-dark placeholder:text-text-muted focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <span className="text-xs text-text-muted font-medium hidden sm:inline">State:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full sm:w-auto bg-surface-subtle border border-border-ui rounded-control p-2 text-xs font-semibold text-text-body focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">All States</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>
          </div>

          {/* Labs Cards List */}
          {isLoading ? (
            <div className="bg-white rounded-container border border-border-ui p-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin mx-auto" />
              <span className="text-xs text-text-muted font-medium">Querying central lab registries...</span>
            </div>
          ) : labs.length === 0 ? (
            <div className="bg-white rounded-container border border-border-ui p-12 text-center text-text-muted text-sm font-medium">
              No laboratories match your query filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab) => (
                <div 
                  key={lab.id} 
                  className="bg-white rounded-container border border-border-ui shadow-card p-6 flex flex-col justify-between hover:border-blue-200 transition-all"
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-text-muted">
                        <span className="font-semibold uppercase tracking-wider text-brand-blue">
                          {lab.sampleType}
                        </span>
                        <span className="font-semibold bg-emerald-100 text-status-success px-2 py-0.5 rounded">
                          {lab.recognitionStatus}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-text-dark leading-tight pt-1">
                        {lab.name}
                      </h3>
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-text-body">
                      <MapPin className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                      <span>{lab.location}</span>
                    </div>

                    {/* Recognition Tags */}
                    <div className="space-y-2 border-t border-border-ui-light pt-3">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Recognized testing capabilities:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {lab.recognizedFor.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-50 text-[10px] text-text-body border border-border-ui font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Supported Standards */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Supported Indian Standards:</div>
                      <div className="flex flex-wrap gap-1">
                        {lab.relevantIsCodes.map((code) => (
                          <span key={code} className="px-1.5 py-0.5 rounded bg-brand-blue-light text-[9px] font-bold text-brand-blue font-mono">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-ui-light mt-6 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Turnaround Time</div>
                      <div className="font-bold text-text-dark">{lab.turnaroundDays}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Contact Info</div>
                      <div className="font-semibold text-text-body text-[11px] truncate max-w-[150px]" title={lab.contact}>
                        {lab.contact.split('|')[0]}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
