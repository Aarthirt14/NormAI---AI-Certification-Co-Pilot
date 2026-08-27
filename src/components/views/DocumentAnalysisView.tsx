'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { LanguageCode, ExtractedDocField } from '@/types';
import { DEMO_EXTRACTED_FIELDS } from '@/data/mockData';
import { CitationBadge } from '@/components/common/CitationBadge';
import { documentsApi } from '@/lib/api';

interface DocumentAnalysisViewProps {
  language: LanguageCode;
  onOpenClause: (code: string, clause?: string) => void;
  onNavigateToCompliance: () => void;
  documentId?: string;
}

export const DocumentAnalysisView: React.FC<DocumentAnalysisViewProps> = ({
  language,
  onOpenClause,
  onNavigateToCompliance,
  documentId
}) => {
  const [activePage, setActivePage] = useState<number>(1);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('f-2');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fields, setFields] = useState<ExtractedDocField[]>(DEMO_EXTRACTED_FIELDS);
  const [avgConfidence, setAvgConfidence] = useState<number>(96);
  const [docDetails, setDocDetails] = useState<{ filename: string; size: string; pages: number }>({
    filename: 'SPEC_NX750_TURBO_MIXER.PDF',
    size: '1.4 MB',
    pages: 3
  });
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchExtractedFields = async (id: string) => {
    try {
      const details = await documentsApi.getDetails(id);
      setDocDetails({
        filename: details.original_filename,
        size: `${(details.file_size / (1024 * 1024)).toFixed(1)} MB`,
        pages: details.page_count || 3
      });

      const response = await documentsApi.getFields(id);
      setFields(response.fields || []);
      setAvgConfidence(Math.round(response.avg_confidence * 100));
      if (response.fields && response.fields.length > 0) {
        setSelectedFieldId(response.fields[0].id);
        setActivePage(response.fields[0].pageNumber);
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch extracted fields');
      // Keep static demo fields
      setFields(DEMO_EXTRACTED_FIELDS);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchExtractedFields(documentId);
    }
  }, [documentId]);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const handleSelectField = (field: ExtractedDocField) => {
    setSelectedFieldId(field.id);
    setActivePage(field.pageNumber);
  };

  const handleTriggerScan = async () => {
    setIsScanning(true);
    setApiError(null);
    try {
      if (documentId) {
        await documentsApi.analyze(documentId);
        await fetchExtractedFields(documentId);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to re-scan document.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-ui pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-status-success bg-emerald-50 px-2.5 py-0.5 rounded flex items-center gap-1 border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              Document analysed successfully ✓
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-dark tracking-tight">
            Specification Document Intelligence
          </h1>
          <p className="text-xs text-text-muted">
            Uploaded file: <strong className="font-mono text-text-dark">{docDetails.filename}</strong> ({docDetails.pages} Pages · {docDetails.size})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleTriggerScan}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control bg-white hover:bg-surface-subtle border border-border-ui text-xs font-medium text-text-body transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
            <span>Re-Scan Document</span>
          </button>
          
          <button
            type="button"
            onClick={onNavigateToCompliance}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Run Pre-Audit Gap Check</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-control flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error: {apiError}</span>
        </div>
      )}

      {/* Split Workspace: Left 55% PDF Viewer + Right 45% Extracted Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: PDF Viewer (7 Cols ~ 55%) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Toolbar */}
          <div className="p-3 bg-white rounded-t-card border border-border-ui flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage(p => Math.max(1, p - 1))}
                disabled={activePage <= 1}
                className="p-1 rounded hover:bg-surface-subtle disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-text-dark">
                Page {activePage} of {docDetails.pages}
              </span>
              <button
                onClick={() => setActivePage(p => Math.min(docDetails.pages, p + 1))}
                disabled={activePage >= docDetails.pages}
                className="p-1 rounded hover:bg-surface-subtle disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setZoomLevel(z => Math.max(80, z - 10))} className="p-1 hover:bg-surface-subtle rounded">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-medium text-text-dark">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(z => Math.min(130, z + 10))} className="p-1 hover:bg-surface-subtle rounded">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rendered Document Sheet */}
          <div className="bg-white rounded-b-card p-8 relative min-h-[580px] shadow-card border border-t-0 border-border-ui overflow-hidden select-none">
            {isScanning && <div className="animate-scan-blue" />}

            {/* Document Header */}
            <div className="border-b border-border-ui pb-4 mb-6 flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-brand-blue uppercase tracking-wider">
                  Manufacturer Technical Datasheet
                </span>
                <h2 className="text-xl font-bold text-text-dark mt-0.5">
                  NX-750 Turbo Kitchen Mixer Grinder
                </h2>
                <p className="text-xs text-text-muted font-mono">
                  DOC ID: TS-2026-NX750 · REV 3.2 · ENGINEERING SPECIFICATION
                </p>
              </div>

              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-blue-light text-brand-blue">
                Domestic Appliance
              </span>
            </div>

            {/* Page 1 */}
            {activePage === 1 && (
              <div className="space-y-6 text-xs text-text-body leading-relaxed">
                {/* Field 1 */}
                <div className={`p-3 rounded-control transition-all ${
                  selectedField?.label === 'Product Name' || selectedField?.label === 'Intended Use'
                    ? 'bg-brand-blue-light border-l-3 border-l-brand-blue shadow-xs' 
                    : 'hover:bg-surface-subtle'
                }`}>
                  <p className="text-sm font-bold text-text-dark">
                    1. Product Identification & Scope
                  </p>
                  <p className="mt-1">
                    PRODUCT SPECIFICATION: DOMESTIC ELECTRIC MIXER GRINDER (MODEL: NX-750 TURBO). Intended for domestic food grinding, mixing, chutney blending, and dry pulse milling in home kitchens.
                  </p>
                </div>

                {/* Field 2 & 3 */}
                <div className={`p-3 rounded-control transition-all ${
                  selectedField?.label === 'Rated Power' || selectedField?.label === 'Rated Voltage' || selectedField?.label === 'Frequency'
                    ? 'bg-brand-blue-light border-l-3 border-l-brand-blue shadow-xs' 
                    : 'hover:bg-surface-subtle'
                }`}>
                  <p className="text-sm font-bold text-text-dark">
                    2. Electrical Rating & Power Characteristics
                  </p>
                  <table className="w-full mt-2 text-xs border border-border-ui">
                    <tbody>
                      <tr className="border-b border-border-ui bg-surface-subtle">
                        <td className="p-2.5 font-medium text-text-muted">Rated Power Input:</td>
                        <td className="p-2.5 font-bold text-text-dark font-mono">750 Watts at 230V nominal supply (Heavy Duty Copper Motor)</td>
                      </tr>
                      <tr className="border-b border-border-ui">
                        <td className="p-2.5 font-medium text-text-muted">Electrical Input:</td>
                        <td className="p-2.5 font-bold text-text-dark font-mono">230 V AC ~ 50 Hz, Single Phase A.C.</td>
                      </tr>
                      <tr className="bg-surface-subtle">
                        <td className="p-2.5 font-medium text-text-muted">Duty Cycle Rating:</td>
                        <td className="p-2.5 text-text-body font-mono">30 Minutes (5 min ON / 2 min OFF - 6 Cycles)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Page 2 */}
            {activePage === 2 && (
              <div className="space-y-6 text-xs text-text-body leading-relaxed">
                {/* Field 4 */}
                <div className={`p-3 rounded-control transition-all ${
                  selectedField?.label === 'Insulation Class'
                    ? 'bg-brand-blue-light border-l-3 border-l-brand-blue shadow-xs' 
                    : 'hover:bg-surface-subtle'
                }`}>
                  <p className="text-sm font-bold text-text-dark">
                    3. Motor Winding & Insulation
                  </p>
                  <p className="mt-1">
                    Motor Winding: Class F Copper wire with thermal overload switch rating 130°C. Stator laminations high-permeability silicon steel. Insulation Class: Class I earth continuity guaranteed.
                  </p>
                </div>

                {/* Field 5 & 6 */}
                <div className={`p-3 rounded-control transition-all hover:bg-surface-subtle`}>
                  <p className="text-sm font-bold text-text-dark">
                    4. Speed & Stainless Steel Vessel Construction
                  </p>
                  <p className="mt-1">
                    Speed Control: 3 Speeds with Incher pulse, No-load RPM: 20,000 ± 5%.
                  </p>
                  <p className="mt-1">
                    Jar Construction: 1.5L Wet Jar (SS 304), 1.0L Dry Jar (SS 304), 0.4L Chutney Jar (SS 304) with food-grade polypropylene lids.
                  </p>
                </div>
              </div>
            )}

            {/* Page 3 */}
            {activePage === 3 && (
              <div className="space-y-6 text-xs text-text-body leading-relaxed">
                {/* Field 7, 8, 9 */}
                <div className={`p-3 rounded-control transition-all ${
                  selectedField?.label === 'Thermal Overload' || selectedField?.label === 'Cord Specification' || selectedField?.label === 'Plug Specification'
                    ? 'bg-brand-blue-light border-l-3 border-l-brand-blue shadow-xs' 
                    : 'hover:bg-surface-subtle'
                }`}>
                  <p className="text-sm font-bold text-text-dark">
                    5. Safety Protection Devices & Power Cord
                  </p>
                  <p className="mt-1 font-mono">
                    Circuit Protection: Automatic reset Thermal Overload Protector (Rating: 3.2A / 250V).
                  </p>
                  <p className="mt-1 font-mono">
                    Supply Lead: 1.8 meter, 3-core 0.75 sq.mm with molded 6A 3-pin plug.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Extracted Product Information (5 Cols ~ 45%) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-container border border-border-ui shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-ui pb-3">
              <div>
                <h3 className="text-base font-bold text-text-dark">
                  Extracted Product Information
                </h3>
                <span className="text-xs text-text-muted">
                  Click any parameter to locate in document
                </span>
              </div>

              <span className="text-xs font-semibold text-status-success bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Avg. {avgConfidence}%
              </span>
            </div>

            {/* Extracted Fields List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {fields.map((field) => {
                const isSelected = selectedFieldId === field.id;

                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => handleSelectField(field)}
                    className={`w-full text-left p-3 rounded-card border transition-all ${
                      isSelected
                        ? 'bg-brand-blue-light border-brand-blue-medium shadow-xs ring-1 ring-blue-200'
                        : 'bg-surface-subtle border-border-ui hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-muted font-medium">
                        {field.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-text-muted">Page {field.pageNumber}</span>
                        <span className="text-[11px] font-semibold text-status-success">
                          {Math.round(field.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-sm font-bold text-text-dark">
                      {field.value}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
