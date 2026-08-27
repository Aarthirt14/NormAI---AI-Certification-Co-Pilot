import { request } from './apiClient';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  link: string;
}

export const servicesApi = {
  list: () => request<ServiceItem[]>('/bis-services'),
};
