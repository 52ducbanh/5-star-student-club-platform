import { apiClient } from '@/shared/services/http/apiClient'
import type {
  CreateSessionRequest, SessionResponse,
  SubmitGameRequest, SubmitGameResponse,
  GenerateStarprintRequest, StarprintRenderData,
  PublishRequest,
  SkyStar,
} from '../types/api.types'

export const starprintApi = {
  createSession(payload: CreateSessionRequest): Promise<SessionResponse> {
    return apiClient.post<SessionResponse>('/sessions', payload)
  },

  getSession(id: string): Promise<SessionResponse> {
    return apiClient.get<SessionResponse>(`/sessions/${id}`)
  },

  uploadPhoto(sessionId: string, blob: Blob): Promise<{ photoUrl: string }> {
    const formData = new FormData()
    formData.append('file', blob, 'photo.jpg')
    return apiClient.postMultipart<{ photoUrl: string }>(`/sessions/${sessionId}/photo`, formData)
  },

  submitGame(sessionId: string, gameId: string, payload: SubmitGameRequest): Promise<SubmitGameResponse> {
    return apiClient.post<SubmitGameResponse>(`/sessions/${sessionId}/games/${gameId}`, payload)
  },

  generateStarprint(payload: GenerateStarprintRequest): Promise<StarprintRenderData> {
    return apiClient.post<StarprintRenderData>('/starprints/generate', payload)
  },

  getStarprint(id: string): Promise<StarprintRenderData> {
    return apiClient.get<StarprintRenderData>(`/starprints/${id}`)
  },

  publishStarprint(id: string, payload: PublishRequest): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/starprints/${id}/publish`, payload)
  },

  getSky(): Promise<SkyStar[]> {
    return apiClient.get<SkyStar[]>('/sky')
  },
}
