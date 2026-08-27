import { request } from './apiClient';
import { ExtractedDocField } from '@/types';

export interface DocumentOut {
  id: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  page_count?: number;
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploaded_at: string;
  processed_at?: string;
}

export interface DocumentFieldsResponse {
  document_id: string;
  fields: ExtractedDocField[];
  total: number;
  avg_confidence: number;
}

export const documentsApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<DocumentOut>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  analyze: (id: string) =>
    request<{ status: string; message: string; fields_extracted: number }>(
      `/documents/${id}/analyze`,
      { method: 'POST' }
    ),

  getFields: (id: string) =>
    request<DocumentFieldsResponse>(`/documents/${id}/fields`),

  getDetails: (id: string) =>
    request<DocumentOut>(`/documents/${id}`),
};
