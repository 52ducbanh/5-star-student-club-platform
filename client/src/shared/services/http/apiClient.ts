function getApiBaseUrl(): string {
  const envUrl = import.meta.env['VITE_API_URL'] as string | undefined
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    return `${protocol}//${hostname}:3000/api`
  }
  return 'http://localhost:3000/api'
}

export function getMediaBaseUrl(): string {
  const envUrl = import.meta.env['VITE_MEDIA_URL'] as string | undefined
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '')
  }
  const apiBase = getApiBaseUrl()
  return apiBase.replace(/\/api$/, '')
}

export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('/assets/')) {
    return url
  }
  const mediaBase = getMediaBaseUrl()
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  return `${mediaBase}${cleanPath}`
}

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(
    statusCode: number,
    code: string,
    message: string,
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let code = 'UNKNOWN_ERROR'
    let message = res.statusText
    try {
      const body = (await res.json()) as { code?: string; message?: string }
      code = body.code ?? code
      message = body.message ?? message
    } catch {
      /* noop */
    }
    throw new ApiError(res.status, code, message)
  }
  return res.json() as Promise<T>
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<T>(res)
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return handleResponse<T>(res)
  },

  async postMultipart<T>(path: string, formData: FormData): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      body: formData,
    })
    return handleResponse<T>(res)
  },

  async delete<T = void>(path: string): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
    })
    if (res.status === 204) {
      return undefined as T
    }
    return handleResponse<T>(res)
  },
}
