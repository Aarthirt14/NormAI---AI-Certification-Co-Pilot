import { request } from './apiClient';
import { ComplianceFinding } from '@/types';

export interface ComplianceCheckRequest {
  productId?: string;
  documentId?: string;
  standard_code: string;
  language?: string;
}

export interface ComplianceCheckResponse {
  assessment_id: string;
  readiness_score: number;
  status_label: string;
  passed_count: number;
  attention_count: number;
  critical_count: number;
  findings: ComplianceFinding[];
  standard_code: string;
  summary: string;
}

export const complianceApi = {
  check: (data: ComplianceCheckRequest) =>
    request<ComplianceCheckResponse>('/compliance/check', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getFindings: (assessmentId: string) =>
    request<ComplianceCheckResponse>(`/compliance/${assessmentId}/findings`),
};
