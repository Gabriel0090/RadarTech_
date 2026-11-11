const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const TOKEN_KEY = 'radartech_access_token'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se o backend está iniciado e se a URL está correta.')
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const detail = data?.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join('; ')
      : detail || 'Não foi possível concluir a solicitação.'
    throw new Error(message)
  }
  return data
}

export function registerUser({ nome, email, senha }) {
  return request('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  })
}

export async function loginUser({ email, senha }) {
  const data = await request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
  localStorage.setItem(TOKEN_KEY, data.access_token)
  try {
    return await getCurrentUser()
  } catch (error) {
    localStorage.removeItem(TOKEN_KEY)
    throw error
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export async function getCurrentUser() {
  const token = getAccessToken()
  if (!token) throw new Error('Você precisa entrar na sua conta.')
  return request('/api/v1/auth/me', { token })
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY)
}
