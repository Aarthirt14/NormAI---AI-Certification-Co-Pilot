import { request } from './apiClient';
import { StandardItem, ClauseCitationData } from '@/types';

export interface AskRequest {
  query: string;
  language: string;
  productId?: string;
  documentId?: string;
  conversationId?: string;
}

export interface CertificationStep {
  num: string;
  title: string;
  status: string;
  badge: string;
  desc: string;
}

export interface AskResponse {
  answer: string;
  summary: string;
  likely_standard?: StandardItem;
  match_score?: number;
  matched_attributes: string[];
  citations: ClauseCitationData[];
  certification_pathway: CertificationStep[];
  confidence: number;
  needs_clarification: boolean;
  clarification_question?: string;
  analysis_run_id?: string;
  language: string;
}

export interface AnalysisStatusResponse {
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  current_step?: string;
  completed_steps: string[];
  progress: number;
  error_message?: string;
}

export const askApi = {
  submitQuery: (data: AskRequest) =>
    request<AskResponse>('/ask', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStatus: (analysisRunId: string) =>
    request<AnalysisStatusResponse>(`/analysis/${analysisRunId}/status`),

  getResult: (analysisRunId: string) =>
    request<AskResponse>(`/analysis/${analysisRunId}/result`),
};
