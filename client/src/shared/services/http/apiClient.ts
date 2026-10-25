export function getApiBaseUrl(): string {
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

export function getSocketBaseUrl(): string {
  const envSocketUrl = import.meta.env['VITE_SOCKET_URL'] as string | undefined
  if (envSocketUrl && envSocketUrl.trim() !== '') {
    return envSocketUrl.replace(/\/+$/, '')
  }
  const apiBase = getApiBaseUrl()
  return apiBase.replace(/\/api\/?$/, '')
}

function tunnelHeaders(url: string): Record<string, string> {
  return /\.ngrok(-free)?\.(app|dev|io)(\/|$)/i.test(url)
    ? { 'ngrok-skip-browser-warning': 'true' } : {}
}

// Wake a sleeping host before sending a non-idempotent create-session request.
export async function ensureServerReady(): Promise<void> {
  const deadline = Date.now() + 90000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/health/ready`, {
        cache: 'no-store', signal: createTimeoutSignal(5000),
        headers: tunnelHeaders(getApiBaseUrl()),
      })
      if (response.ok && (await response.json()).status === 'ok') return
    } catch { /* bounded polling handles cold starts and transient failures */ }
    await wait(1500)
  }
  throw new Error('Máy chủ chưa sẵn sàng. Vui lòng thử lại sau ít phút.')
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

const DEFAULT_TIMEOUT_MS = 15000

function createTimeoutSignal(timeoutMs: number = DEFAULT_TIMEOUT_MS): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller.signal
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 2,
): Promise<Response> {
  let attempt = 0
  while (attempt <= maxRetries) {
    try {
      const signal = options.signal ?? createTimeoutSignal(DEFAULT_TIMEOUT_MS)
      const res = await fetch(url, { ...options, signal })

      const isGet = !options.method || options.method.toUpperCase() === 'GET'
      if (isGet && [502, 503, 504].includes(res.status) && attempt < maxRetries) {
        attempt++
        const backoff = 300 * Math.pow(2, attempt) + Math.random() * 200
        await wait(backoff)
        continue
      }
      return res
    } catch (err: unknown) {
      const isGet = !options.method || options.method.toUpperCase() === 'GET'
      if (isGet && attempt < maxRetries) {
        attempt++
        const backoff = 300 * Math.pow(2, attempt) + Math.random() * 200
        await wait(backoff)
        continue
      }
      throw err
    }
  }
  throw new Error('Request failed after retries')
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const res = await fetchWithRetry(`${baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...tunnelHeaders(baseUrl),
      },
    })
    return handleResponse<T>(res)
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const signal = createTimeoutSignal(DEFAULT_TIMEOUT_MS)
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...tunnelHeaders(baseUrl),
      },
      body: JSON.stringify(body),
      signal,
    })
    return handleResponse<T>(res)
  },

  async postMultipart<T>(path: string, formData: FormData): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const signal = createTimeoutSignal(30000)
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        ...tunnelHeaders(baseUrl),
      },
      body: formData,
      signal,
    })
    return handleResponse<T>(res)
  },

  async delete<T = void>(path: string): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const signal = createTimeoutSignal(DEFAULT_TIMEOUT_MS)
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
      headers: {
        ...tunnelHeaders(baseUrl),
      },
      signal,
    })
    if (res.status === 204) {
      return undefined as T
    }
    return handleResponse<T>(res)
  },
}
