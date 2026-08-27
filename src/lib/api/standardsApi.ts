import { request } from './apiClient';
import { StandardItem, ClauseCitationData } from '@/types';

export interface MatchRequest {
  query: string;
  language?: string;
  product_id?: string;
  document_id?: string;
}

export interface MatchResponse {
  standards: StandardItem[];
  query: string;
  total: number;
}

export interface GraphNode {
  id: string;
  code: string;
  title: string;
  type: 'PRIMARY' | 'ACTIVE' | 'AMENDMENT' | 'REFERENCED' | 'SUPERSEDED';
  year: string;
  effectiveDate: string;
  desc: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  label: string;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const standardsApi = {
  list: (category?: string, status?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    return request<StandardItem[]>(`/standards?${params.toString()}`);
  },

  match: (data: MatchRequest) =>
    request<MatchResponse>('/standards/match', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDetails: (code: string) =>
    request<StandardItem>(`/standards/${encodeURIComponent(code)}`),

  getClauses: (code: string) =>
    request<ClauseCitationData[]>(`/standards/${encodeURIComponent(code)}/clauses`),

  getClauseDetails: (code: string, clauseNumber: string) =>
    request<ClauseCitationData>(
      `/standards/${encodeURIComponent(code)}/clauses/${encodeURIComponent(clauseNumber)}`
    ),

  getGraph: (code: string) =>
    request<GraphResponse>(`/standards/${encodeURIComponent(code)}/graph`),
};
