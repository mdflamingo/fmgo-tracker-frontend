const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = { ...(init?.headers ?? {}) } as Record<string, string>
  if (init?.body) {
    headers['Content-Type'] = 'application/json'
  }

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch (err) {
    throw new ApiError(0, `Network error: ${(err as Error).message}`)
  }

  if (!res.ok) {
    let message = res.statusText || 'Request failed'
    try {
      const text = await res.text()
      if (text) message = text
    } catch {
      // ignore empty body
    }
    throw new ApiError(res.status, message)
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (res.status === 204 || !contentType.includes('application/json')) {
    return undefined as T
  }

  return (await res.json()) as T
}