import { request } from './apiClient';

export interface ReportCreate {
  assessment_id: string;
  title: string;
  product_id?: string;
}

export interface ReportOut {
  id: string;
  report_number: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  report_data: Record<string, any>;
}

export const reportsApi = {
  create: (data: ReportCreate) =>
    request<ReportOut>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () =>
    request<ReportOut[]>('/reports'),

  getDetails: (id: string) =>
    request<ReportOut>(`/reports/${id}`),

  delete: (id: string) =>
    request<{ status: string; message: string }>(`/reports/${id}`, {
      method: 'DELETE',
    }),
};
