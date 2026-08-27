import { request } from './apiClient';
import { LabCenter } from '@/types';

export const labsApi = {
  list: (state?: string, city?: string, standard?: string) => {
    const params = new URLSearchParams();
    if (state && state !== 'All States') params.append('state', state);
    if (city) params.append('city', city);
    if (standard) params.append('standard', standard);
    return request<LabCenter[]>(`/labs?${params.toString()}`);
  },

  getDetails: (id: string) =>
    request<LabCenter>(`/labs/${id}`),
};
