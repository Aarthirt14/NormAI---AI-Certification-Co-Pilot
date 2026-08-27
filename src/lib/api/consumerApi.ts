import { request } from './apiClient';

export interface LicenceVerifyResponse {
  found: boolean;
  cml_number: string;
  status: string;
  manufacturer?: string;
  product?: string;
  standard_code?: string;
  factory?: string;
  scope?: string;
  valid_from?: string;
  valid_until?: string;
  is_demo: boolean;
  provenance: string;
  error?: string;
}

export interface ComplaintCreate {
  product_name: string;
  licence_number?: string;
  complaint_detail: string;
  contact_email?: string;
}

export const consumerApi = {
  verifyLicence: (licenceNumber: string) =>
    request<LicenceVerifyResponse>('/consumer/verify-licence', {
      method: 'POST',
      body: JSON.stringify({ licence_number: licenceNumber }),
    }),

  verifyHuid: (huidNumber: string) =>
    request<any>('/consumer/verify-huid', {
      method: 'POST',
      body: JSON.stringify({ huid_number: huidNumber }),
    }),

  submitComplaint: (data: ComplaintCreate) =>
    request<{ status: string; complaint_id: string; message: string }>('/consumer/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
