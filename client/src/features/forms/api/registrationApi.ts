import { apiClient } from '@/shared/services/http/apiClient';
import type { RegistrationRequest, RegistrationResponse } from '@5ss/contracts';

export function submitRegistration(
  eventId: string,
  payload: RegistrationRequest,
): Promise<RegistrationResponse> {
  return apiClient.post<RegistrationResponse>(
    `/events/${encodeURIComponent(eventId)}/registrations`,
    payload,
  );
}
