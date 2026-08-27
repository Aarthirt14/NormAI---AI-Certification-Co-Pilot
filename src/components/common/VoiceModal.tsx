'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Globe, Check } from 'lucide-react';
import { LanguageCode } from '@/types';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '@/data/translations';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onApplyQuery: (queryText: string) => void;
  onOpenClause?: (code: string, clause?: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  onApplyQuery,
  onOpenClause
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [hasResult, setHasResult] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (isOpen) {
      setIsRecording(true);
      setTranscript('');
      setHasResult(false);

      const timer1 = setTimeout(() => {
        setTranscript(t.voiceTamilExample);
      }, 1200);

      const timer2 = setTimeout(() => {
        setIsRecording(false);
        setHasResult(true);
      }, 2500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, language, t.voiceTamilExample]);

  const handleSpeakAnswer = () => {
    if ('speechSynthesis' in window) {
      setIsPlayingAudio(true);
      const utterance = new SpeechSynthesisUtterance(t.voiceTamilAnswer);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/25 backdrop-blur-[2px] p-4">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} aria-label="Close voice modal" />

      <div className="relative w-full max-w-lg bg-white rounded-container shadow-dropdown border border-border-ui overflow-hidden z-10 animate-scaleUp">
        
        {/* Header */}
        <div className="p-5 border-b border-border-ui flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-dark">
              Multilingual Voice Assistant
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
              className="text-xs bg-surface-subtle border border-border-ui px-2 py-1 rounded text-text-dark focus:outline-none focus:border-brand-blue"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel} ({l.label})
                </option>
              ))}
            </select>

            <button onClick={onClose} className="p-1 rounded text-text-muted hover:text-text-dark">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Waveform Card */}
          <div className="flex flex-col items-center justify-center p-6 bg-brand-blue-subtle rounded-card border border-blue-100">
            <div className="relative mb-4 flex items-center justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-brand-blue-light border-2 border-brand-blue scale-110 shadow-xs' 
                  : 'bg-white border border-border-ui'
              }`}>
                {isRecording ? (
                  <Mic className="w-7 h-7 text-brand-blue animate-pulse" />
                ) : (
                  <MicOff className="w-7 h-7 text-text-muted" />
                )}
              </div>
            </div>

            {/* Waveform Bars */}
            {isRecording ? (
              <div className="flex items-center gap-1.5 h-8">
                {[4, 14, 24, 18, 28, 16, 22, 12, 20, 8, 22, 10].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-brand-blue rounded-full wave-bar"
                    style={{ animationDelay: `${i * 0.08}s`, height: `${h}px` }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted">
                Speech recognition finished
              </p>
            )}

            <p className="mt-3 text-xs text-text-muted text-center">
              {isRecording ? t.listening : 'Recognized Regional Voice Input'}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="p-3.5 bg-surface-subtle rounded-card border border-border-ui space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                Transcription ({SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeLabel})
              </span>
              <p className="text-sm font-semibold text-text-dark">
                “{transcript}”
              </p>
            </div>
          )}

          {/* Response with preserved IS codes */}
          {hasResult && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-status-success">
                  ✓ NormAI Response
                </span>
                
                <button
                  type="button"
                  onClick={handleSpeakAnswer}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    isPlayingAudio
                      ? 'bg-brand-blue text-white'
                      : 'bg-white text-brand-blue border border-border-ui hover:bg-slate-50'
                  }`}
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                  <span>{isPlayingAudio ? 'Speaking...' : 'Listen to answer 🔊'}</span>
                </button>
              </div>

              <p className="text-xs text-text-dark leading-relaxed">
                {t.voiceTamilAnswer}
              </p>

              {/* Citations preserved */}
              <div className="pt-2 border-t border-emerald-100 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-text-muted">References:</span>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenClause) onOpenClause('IS 302-2-14', 'Clause 1.1');
                  }}
                  className="px-2 py-0.5 rounded bg-white text-brand-blue border border-blue-200 hover:bg-brand-blue-light font-mono font-semibold text-[11px]"
                >
                  [IS 302-2-14 · Clause 1.1]
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenClause) onOpenClause('IS 302-1', 'Clause 7.1');
                  }}
                  className="px-2 py-0.5 rounded bg-white text-text-dark border border-border-ui hover:bg-slate-50 font-mono font-semibold text-[11px]"
                >
                  [IS 302-1]
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-ui bg-surface-subtle flex items-center justify-between">
          <button
            onClick={() => {
              setIsRecording(true);
              setHasResult(false);
              setTimeout(() => {
                setIsRecording(false);
                setHasResult(true);
              }, 2200);
            }}
            className="text-xs text-text-muted hover:text-text-dark"
          >
            Record Again
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-control text-xs font-medium text-text-body bg-white border border-border-ui hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApplyQuery(transcript || '750W domestic mixer grinder 230V');
                onClose();
              }}
              className="px-4 py-1.5 rounded-control text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-xs"
            >
              Analyze in Workspace
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
