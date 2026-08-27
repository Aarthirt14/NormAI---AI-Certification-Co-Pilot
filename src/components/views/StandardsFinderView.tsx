'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import { LanguageCode, StandardItem } from '@/types';
import { CitationBadge } from '@/components/common/CitationBadge';
import { STANDARDS_DATABASE } from '@/data/standardsData';
import { standardsApi } from '@/lib/api';

interface StandardsFinderViewProps {
  language: LanguageCode;
  onOpenClause: (code: string, clause?: string) => void;
  onNavigateToCompliance: () => void;
  onNavigateToGraph: (code: string) => void;
  initialQuery?: string;
}

const PRELOAD_PRODUCTS = [
  { title: '750W Domestic Mixer Grinder', query: '750W domestic mixer grinder, 230V AC single phase, stainless steel jars' },
  { title: 'Two-Wheeler Motorcycle Helmet', query: 'Protective two-wheeler motorcycle rider helmet with energy absorbing EPS liner' },
  { title: 'Packaged Drinking Water (20L Jar)', query: 'Packaged drinking water processed by reverse osmosis, 20L containers' },
  { title: 'Lithium-ion Power Bank (10,000mAh)', query: 'Rechargeable 10000mAh portable lithium-ion polymer power bank with USB-C' }
];

export const StandardsFinderView: React.FC<StandardsFinderViewProps> = ({
  language,
  onOpenClause,
  onNavigateToCompliance,
  onNavigateToGraph,
  initialQuery = '750W domestic mixer grinder, 230V, stainless steel jars'
}) => {
  const [productQuery, setProductQuery] = useState<string>(initialQuery);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MANDATORY' | 'SCHEME_I' | 'SCHEME_II'>('ALL');
  const [expandedStandardId, setExpandedStandardId] = useState<string | null>('is-302-2-14');
  const [standards, setStandards] = useState<StandardItem[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSearch = async (customQ?: string) => {
    const q = customQ || productQuery;
    if (!q.trim()) return;
    if (customQ) setProductQuery(customQ);
    
    setIsSearching(true);
    setApiError(null);
    try {
      const response = await standardsApi.match({
        query: q,
        language: language
      });
      setStandards(response.standards || []);
      if (response.standards && response.standards.length > 0) {
        setExpandedStandardId(response.standards[0].id);
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to match standards');
      // Fallback to static mock database in case of connection issues
      const mockList = Object.values(STANDARDS_DATABASE);
      setStandards(mockList);
    } finally {
      setIsSearching(false);
    }
  };

  // Run initial search on mount
  useEffect(() => {
    handleSearch();
  }, []);

  const filteredStandards = standards.filter(std => {
    if (activeFilter === 'MANDATORY') return std.mandatoryStatus.includes('MANDATORY');
    if (activeFilter === 'SCHEME_I') return std.scheme.includes('Scheme I');
    if (activeFilter === 'SCHEME_II') return std.scheme.includes('Scheme II');
    return true;
  });

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="space-y-2 border-b border-border-ui pb-6">
        <h1 className="text-3xl font-bold text-text-dark tracking-tight">
          Find the right Indian Standard
        </h1>
        <p className="text-sm text-text-muted max-w-3xl">
          Describe your product and NormAI will analyse its characteristics and identify potentially applicable standards.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-container border border-border-ui shadow-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1 bg-surface-subtle rounded-control border border-border-ui focus-within:border-brand-blue-medium focus-within:bg-white flex items-center px-3.5 transition-all">
            <Search className="w-4 h-4 text-text-muted shrink-0 mr-2.5" />
            <input
              type="text"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="e.g. 750W domestic mixer grinder, 230V, stainless steel jars..."
              className="w-full bg-transparent py-3 text-sm text-text-dark placeholder:text-text-muted focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold rounded-control transition-colors shadow-xs shrink-0 flex items-center justify-center gap-2"
          >
            {isSearching ? 'Classifying...' : 'Search Standards'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {apiError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-control flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Error: {apiError}. (Using offline backup dataset)</span>
          </div>
        )}

        {/* Preload Chips */}
        <div className="space-y-2 pt-2 border-t border-border-ui-light">
          <div className="text-xs font-semibold text-text-muted">
            Quick search templates:
          </div>
          <div className="flex flex-wrap gap-2">
            {PRELOAD_PRODUCTS.map((prod, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setProductQuery(prod.query);
                  handleSearch(prod.query);
                }}
                className="px-3 py-1.5 rounded-full bg-surface-subtle hover:bg-brand-blue-subtle text-xs font-medium text-text-body hover:text-brand-blue border border-border-ui hover:border-blue-200 transition-all"
              >
                {prod.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="space-y-6">
        
        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-ui pb-3">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: 'All Standards' },
              { id: 'MANDATORY', label: 'Mandatory (QCO)' },
              { id: 'SCHEME_I', label: 'Scheme I (ISI)' },
              { id: 'SCHEME_II', label: 'Scheme II (CRS)' }
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActiveFilter(btn.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeFilter === btn.id
                    ? 'bg-brand-blue border-brand-blue text-white shadow-xs'
                    : 'bg-white border-border-ui text-text-body hover:bg-surface-subtle'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isSearching ? (
          <div className="bg-white rounded-container border border-border-ui p-12 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin mx-auto" />
            <div className="text-sm font-semibold text-text-muted">Analysing product scope parameters...</div>
          </div>
        ) : filteredStandards.length === 0 ? (
          <div className="bg-white rounded-container border border-border-ui p-12 text-center text-text-muted text-sm font-medium">
            No standards found matching your criteria. Try adjusting the filter or search description.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStandards.map((std, index) => {
              const isExpanded = expandedStandardId === std.id;
              const isBestMatch = index === 0;

              return (
                <div 
                  key={std.id}
                  className={`bg-white rounded-container border transition-all duration-200 ${
                    isBestMatch ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-border-ui shadow-xs'
                  }`}
                >
                  {/* Collapsed Header Summary */}
                  <div 
                    onClick={() => setExpandedStandardId(isExpanded ? null : std.id)}
                    className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs sm:text-sm text-brand-blue bg-brand-blue-light px-2 py-0.5 rounded">
                          {std.code}
                        </span>
                        
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          std.status === 'ACTIVE' ? 'bg-emerald-100 text-status-success' : 'bg-amber-100 text-status-warning'
                        }`}>
                          {std.status}
                        </span>

                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-text-body border border-border-ui">
                          {std.scheme}
                        </span>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          std.mandatoryStatus.includes('MANDATORY') ? 'bg-red-50 text-status-error' : 'bg-slate-100 text-text-muted'
                        }`}>
                          {std.mandatoryStatus}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-text-dark truncate">
                        {std.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-lg font-bold text-brand-blue">{std.matchScore || 0}%</div>
                        <div className="text-[10px] text-text-muted">Match Score</div>
                      </div>

                      <div className="flex flex-col items-center">
                        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content View */}
                  {isExpanded && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-8 pt-1 border-t border-border-ui-light space-y-6 animate-slideDown">
                      
                      {/* Full title & Description */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-3">
                          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Full Title & Scope</h4>
                          <p className="text-sm font-semibold text-text-dark leading-relaxed">
                            {std.fullTitle || std.title}
                          </p>
                          {std.qcoDetails && (
                            <div className="p-3 bg-red-50/50 border border-red-100/50 rounded-control flex items-start gap-2.5 text-xs text-status-error">
                              <ShieldCheck className="w-4 h-4 shrink-0 text-status-error mt-0.5" />
                              <div>
                                <span className="font-bold">Mandatory Order Basis: </span>
                                <span>{std.qcoDetails}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Match Analysis Stats */}
                        <div className="p-4 bg-surface-subtle rounded-card border border-border-ui space-y-4">
                          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Match Rationale</h4>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-text-body">Match Rank:</span>
                              <span className="font-bold text-brand-blue">#{index + 1} Best Match</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-text-body">Amendments:</span>
                              <span className="font-semibold text-text-dark">{std.amendmentsCount} Active</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-text-body">Database Sync:</span>
                              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                100% Backed
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Why matched bullet points */}
                      {std.whyMatched && std.whyMatched.length > 0 && (
                        <div className="space-y-2.5 pt-2 border-t border-border-ui-light">
                          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Matched Attributes</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {std.whyMatched.map((attrib, aIdx) => (
                              <div key={aIdx} className="flex items-start gap-2 text-xs text-text-body">
                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{attrib}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Boundary exclusion limitations */}
                      {std.whyNotApplied && (
                        <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-control flex items-start gap-2 text-xs text-amber-800 leading-relaxed">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-status-warning mt-0.5" />
                          <div>
                            <span className="font-bold">Applicability Boundary: </span>
                            <span>{std.whyNotApplied}</span>
                          </div>
                        </div>
                      )}

                      {/* Action Triggers */}
                      <div className="pt-4 border-t border-border-ui-light flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onOpenClause(std.code, 'Clause 1.1')}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-control text-xs font-semibold text-text-dark transition-colors"
                          >
                            Inspect Clauses
                          </button>

                          <button
                            type="button"
                            onClick={() => onNavigateToGraph(std.code)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-control text-xs font-semibold text-text-dark transition-colors"
                          >
                            View Amendment Graph
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={onNavigateToCompliance}
                          className="px-5 py-2 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold rounded-control transition-colors shadow-xs"
                        >
                          Check Product Compliance
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
