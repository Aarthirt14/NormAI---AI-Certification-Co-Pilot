export type ViewType = 
  | 'ask'
  | 'finder'
  | 'compliance'
  | 'document'
  | 'graph'
  | 'services'
  | 'consumer'
  | 'reports';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'bn' | 'te' | 'ml';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export interface ClauseCitationData {
  standardCode: string;
  clauseNumber: string;
  clauseTitle: string;
  text: string;
  highlightedText?: string;
  context?: string;
  editionYear?: string;
  status?: 'ACTIVE' | 'AMENDED' | 'SUPERSEDED' | 'UNDER_REVIEW';
  amendmentNote?: string;
}

export interface StandardItem {
  id: string;
  code: string;
  title: string;
  fullTitle: string;
  status: 'ACTIVE' | 'AMENDED' | 'SUPERSEDED' | 'UNDER_REVIEW';
  amendmentsCount: number;
  lastVerified: string;
  category: string;
  scheme: 'Scheme I (ISI Mark)' | 'Scheme II (CRS)' | 'Scheme IV' | 'Hallmark';
  mandatoryStatus: 'MANDATORY (QCO)' | 'VOLUNTARY';
  qcoDetails?: string;
  matchScore?: number;
  whyMatched?: string[];
  whyNotApplied?: string;
  clauses: ClauseCitationData[];
  relatedStandards: string[];
  timeline: { year: string; event: string; status: 'past' | 'current' | 'future' }[];
  applicableProducts: string[];
}

export interface ComplianceFinding {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'ATTENTION' | 'READY';
  clauseCitation: string;
  standardCode: string;
  clauseNumber: string;
  requirement: string;
  observed: string;
  recommendedAction: string;
  status: 'fail' | 'warning' | 'pass';
  section: 'Product Scope' | 'Required Markings' | 'Safety Test Evidence' | 'Technical Documentation' | 'Factory Information' | 'Application Information';
}

export interface ReadinessAssessment {
  productName: string;
  standardCode: string;
  score: number;
  criticalCount: number;
  attentionCount: number;
  readyCount: number;
  findings: ComplianceFinding[];
  generatedAt: string;
  reportId: string;
}

export interface ExtractedDocField {
  id: string;
  label: string;
  value: string;
  confidence: number;
  pageNumber: number;
  boundingSnippet: string;
  category: 'electrical' | 'mechanical' | 'safety' | 'marking' | 'general';
}

export interface LabCenter {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  recognizedFor: string[];
  relevantIsCodes: string[];
  recognitionStatus: 'ACTIVE' | 'RENEWAL_PENDING' | 'NABL_ACCREDITED';
  turnaroundDays: string;
  contact: string;
  sampleType: string;
}
