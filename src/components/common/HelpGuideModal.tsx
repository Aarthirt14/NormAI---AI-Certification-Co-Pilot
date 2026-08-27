'use client';

import React from 'react';
import { X, Sparkles, BookOpen, Layers, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerDemo: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  onTriggerDemo
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/25 backdrop-blur-[2px] p-4">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} aria-label="Close guide modal" />

      <div className="relative w-full max-w-2xl bg-white rounded-container shadow-dropdown border border-border-ui overflow-hidden z-10 animate-scaleUp max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-border-ui flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-brand-blue bg-brand-blue-light px-2.5 py-0.5 rounded">
                Smart India Hackathon 2026 · PS 26107
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-dark">
              NormAI — AI Certification Co-Pilot
            </h2>
          </div>

          <button onClick={onClose} className="p-1 rounded text-text-muted hover:text-text-dark">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-text-body leading-relaxed">
          
          <div className="p-4 bg-brand-blue-subtle rounded-card border border-blue-100 space-y-1.5">
            <h3 className="font-bold text-xs text-brand-blue flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> 30-Second Evaluation Path for Judges
            </h3>
            <p className="text-text-dark">
              Click <strong className="text-brand-blue">“Try Demo Product”</strong> on the Ask NormAI page or launch the demo below to run the complete 10-step intelligence cycle for a 750W Domestic Mixer Grinder.
            </p>
          </div>

          {/* Module Capabilities */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-text-dark uppercase tracking-wider">
              Core Platform Modules:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-surface-subtle rounded-card border border-border-ui space-y-1">
                <span className="font-bold text-text-dark block">Ask NormAI</span>
                <span className="text-text-muted">Multimodal query workspace with 94% match confidence, 6-stage roadmap, and clause citations.</span>
              </div>
              <div className="p-3.5 bg-surface-subtle rounded-card border border-border-ui space-y-1">
                <span className="font-bold text-text-dark block">Standards Finder</span>
                <span className="text-text-muted">Ranked scope discovery engine with boundary conditions and QCO gazette mandates.</span>
              </div>
              <div className="p-3.5 bg-surface-subtle rounded-card border border-border-ui space-y-1">
                <span className="font-bold text-text-dark block">Compliance Gap Check</span>
                <span className="text-text-muted">Pre-audit gap assessment tool with 72% readiness score, critical findings, and corrective actions.</span>
              </div>
              <div className="p-3.5 bg-surface-subtle rounded-card border border-border-ui space-y-1">
                <span className="font-bold text-text-dark block">Document Analysis</span>
                <span className="text-text-muted">Interactive PDF workspace with 9+ OCR extracted parameters synced to document highlights.</span>
              </div>
              <div className="p-3.5 bg-surface-subtle rounded-card border border-border-ui space-y-1">
                <span className="font-bold text-text-dark block">Standards Graph</span>
                <span className="text-text-muted">Relationship topology tracking active editions, amendments, and version evolution.</span>
              </div>
              <div className="p-3.5 bg-surface-subtle rounded-card border border-border-ui space-y-1">
                <span className="font-bold text-text-dark block">Saved Reports</span>
                <span className="text-text-muted">Comprehensive compliance dossier with circular progress ring and prioritized next actions.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-ui bg-surface-subtle flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onTriggerDemo();
            }}
            className="px-4 py-2 rounded-control bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold text-xs shadow-xs"
          >
            Launch End-to-End Demo ✨
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-control bg-white border border-border-ui text-text-body hover:bg-slate-50 text-xs"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
