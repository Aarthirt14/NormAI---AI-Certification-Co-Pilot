'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface AgentProgressBannerProps {
  isProcessing: boolean;
  onComplete?: () => void;
}

const STEPS = [
  'Understanding product',
  'Finding standards',
  'Checking version',
  'Retrieving clauses',
  'Verifying sources',
  'Building guidance'
];

export const AgentProgressBanner: React.FC<AgentProgressBannerProps> = ({
  isProcessing,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isProcessing) {
      setIsFinished(false);
      setCurrentStepIndex(0);
      return;
    }

    setIsFinished(false);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsFinished(true);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 420);

    return () => clearInterval(interval);
  }, [isProcessing, onComplete]);

  if (!isProcessing && !isFinished) return null;

  return (
    <div className="w-full my-4 transition-all duration-300">
      {!isFinished ? (
        <div className="bg-white border border-blue-100 p-4 rounded-card shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center gap-2 font-semibold text-text-dark">
              <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
              NormAI Analysis Engine
            </span>
            <span className="font-medium">
              Step {currentStepIndex + 1} of {STEPS.length}
            </span>
          </div>

          {/* Stepper pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-control transition-all ${
                    isPast
                      ? 'bg-emerald-50 text-status-success font-medium border border-emerald-100'
                      : isCurrent
                      ? 'bg-brand-blue-light text-brand-blue font-semibold border border-blue-200'
                      : 'bg-surface-subtle text-text-muted border border-border-ui-light'
                  }`}
                >
                  {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />}
                  {isCurrent && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-blue" />}
                  <span>{step}</span>
                  {idx < STEPS.length - 1 && (
                    <span className="text-slate-300 mx-0.5">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-200/80 px-4 py-2.5 rounded-card flex items-center justify-between text-xs text-status-success animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-status-success" />
            <span className="font-semibold text-emerald-900">
              Verified against active Indian Standards & Gazette Amendments
            </span>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-100">
            100% Source-Backed
          </span>
        </div>
      )}
    </div>
  );
};
