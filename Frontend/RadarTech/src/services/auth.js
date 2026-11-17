import { request } from './api'

const TOKEN_KEY = 'radartech_access_token'

export function registerUser({ nome, email, senha, telefone, cidade }) {
  return request('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha, telefone, cidade }),
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
