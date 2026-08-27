'use client';

import React from 'react';
import { FileText, ArrowUpRight } from 'lucide-react';

interface CitationBadgeProps {
  code: string;
  clause?: string;
  onClick?: () => void;
  className?: string;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({
  code,
  clause,
  onClick,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium bg-brand-blue-light hover:bg-blue-100 text-brand-blue border border-blue-200/60 transition-all cursor-pointer group shadow-xs ${className}`}
      title="Click to view authentic source clause & verified edition"
    >
      <FileText className="w-3.5 h-3.5 text-brand-blue" />
      <span className="font-mono text-[11px] font-semibold tracking-tight">
        {code}{clause ? ` · ${clause}` : ''}
      </span>
      <ArrowUpRight className="w-3 h-3 text-brand-blue/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};
