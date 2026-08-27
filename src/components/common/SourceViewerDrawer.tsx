'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileText, 
  Calendar, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Search,
  BookOpen,
  Info,
  AlertCircle
} from 'lucide-react';
import { STANDARDS_DATABASE } from '@/data/standardsData';
import { standardsApi } from '@/lib/api';

interface SourceViewerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  standardCode: string;
  targetClause?: string;
  onSelectStandard?: (code: string) => void;
}

export const SourceViewerDrawer: React.FC<SourceViewerDrawerProps> = ({
  isOpen,
  onClose,
  standardCode,
  targetClause,
  onSelectStandard
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [clauseSearch, setClauseSearch] = useState<string>(targetClause || '');
  
  // Dynamic backend states
  const [standardDetails, setStandardDetails] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isOpen || !standardCode) return;
      setApiError(null);
      try {
        const details = await standardsApi.getDetails(standardCode);
        setStandardDetails(details);
      } catch (err: any) {
        setApiError(err.message || 'Failed to retrieve standard details.');
        // Fall back to static mock data
        setStandardDetails(STANDARDS_DATABASE[standardCode] || STANDARDS_DATABASE['IS 302-2-14']);
      }
    };
    fetchDetails();
  }, [isOpen, standardCode]);

  const handleCopyCitation = () => {
    const textToCopy = `[Source: Bureau of Indian Standards — ${displayStandard.code}: ${displayStandard.title} (Clause: ${targetClause || 'General'})]`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  // Fallback to static mock standard if no API details loaded yet
  const displayStandard = standardDetails || STANDARDS_DATABASE[standardCode] || STANDARDS_DATABASE['IS 302-2-14'];

  const filteredClauses = (displayStandard.clauses || []).filter((c: any) => 
    !clauseSearch || 
    c.clauseNumber.toLowerCase().includes(clauseSearch.toLowerCase()) ||
    c.clauseTitle.toLowerCase().includes(clauseSearch.toLowerCase()) ||
    c.text.toLowerCase().includes(clauseSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/20 backdrop-blur-[2px] transition-opacity">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose} 
        aria-label="Close drawer"
      />

      {/* Drawer content (440px) */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-drawer flex flex-col border-l border-border-ui z-10 animate-slideLeft">
        
        {/* Header */}
        <div className="p-6 border-b border-border-ui flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-blue bg-brand-blue-light px-2.5 py-0.5 rounded">
                Source Evidence
              </span>
              <span className="text-xs font-medium text-status-success flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-success" />
                Active Standard
              </span>
            </div>

            <h2 className="text-xl font-bold text-text-dark tracking-tight pt-1">
              {displayStandard.code}
            </h2>
            <p className="text-xs text-text-muted line-clamp-2">
              {displayStandard.fullTitle || displayStandard.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-control text-text-muted hover:text-text-dark hover:bg-surface-subtle transition-colors"
            title="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {apiError && (
          <div className="px-6 py-2 bg-red-50 border-b border-red-150 text-[10px] text-red-700 flex items-center gap-2 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Error connecting: Using offline standards reference.</span>
          </div>
        )}

        {/* Search within clauses */}
        <div className="px-6 py-3 border-b border-border-ui-light bg-surface-subtle flex items-center gap-2">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            value={clauseSearch}
            onChange={(e) => setClauseSearch(e.target.value)}
            placeholder="Search within clauses (e.g. markings, trip)..."
            className="w-full bg-transparent text-xs text-text-dark placeholder:text-text-muted focus:outline-none"
          />
          {clauseSearch && (
            <button 
              onClick={() => setClauseSearch('')}
              className="text-[10px] font-semibold text-brand-blue hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Scrollable Clauses list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {filteredClauses.length === 0 ? (
            <div className="text-center py-10 text-xs text-text-muted font-medium">
              No matching clauses found. Try another search.
            </div>
          ) : (
            filteredClauses.map((clause: any) => {
              const isTarget = targetClause && clause.clauseNumber.toLowerCase() === targetClause.toLowerCase();

              return (
                <div 
                  key={clause.clauseNumber}
                  className={`p-4 rounded-card border transition-all ${
                    isTarget 
                      ? 'bg-brand-blue-subtle border-brand-blue-medium ring-1 ring-blue-100 shadow-xs' 
                      : 'bg-white border-border-ui hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-border-ui-light pb-2 mb-3">
                    <span className="font-mono font-bold text-xs text-brand-blue">
                      {clause.clauseNumber}
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-status-success px-2 py-0.5 rounded uppercase tracking-wider">
                      {clause.status || 'Active'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-text-dark mb-2">
                    {clause.clauseTitle}
                  </h3>

                  <p className="text-xs text-text-body leading-relaxed whitespace-pre-line font-medium">
                    {clause.text}
                  </p>

                  {clause.highlightedText && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-control text-xs text-text-body font-semibold">
                      {clause.highlightedText}
                    </div>
                  )}

                  {clause.amendmentNote && (
                    <div className="mt-3 p-3 bg-amber-50/50 border border-amber-100 rounded-control text-[11px] text-amber-800 leading-relaxed">
                      <span className="font-bold">Amendment Note: </span>
                      <span>{clause.amendmentNote}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Action Bottom Bar */}
        <div className="p-6 border-t border-border-ui bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={handleCopyCitation}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-white hover:bg-surface-subtle border border-border-ui font-semibold text-text-body transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-status-success" />
                <span className="text-status-success">Copied Citation</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-text-muted" />
                <span>Copy Citation</span>
              </>
            )}
          </button>

          {displayStandard.source_url && (
            <a
              href={displayStandard.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-brand-blue hover:underline"
            >
              <span>Download Full PDF</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};
