import { apiClient } from '@/shared/services/http/apiClient';
import type { ContactRequest, ContactResponse } from '@5ss/contracts';

export function submitContact(payload: ContactRequest): Promise<ContactResponse> {
  return apiClient.post<ContactResponse>('/contact', payload);
}
