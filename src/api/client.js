/**
 * client.js — Typed fetch wrapper for the FastAPI backend.
 * Token is stored in localStorage under key "czToken".
 */

const BASE = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('czToken')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let detail = 'Request failed'
    try { detail = (await res.json()).detail ?? detail } catch (_) {}
    const err = new Error(detail)
    err.status = res.status
    throw err
  }

  // 204 No Content
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  auth: {
    register: (email, password) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request('/auth/me'),
  },
  carbon: {
    submit: (diet, transport, home) =>
      request('/carbon/submit', { method: 'POST', body: JSON.stringify({ diet, transport, home }) }),
    actions: () => request('/carbon/actions'),
    logAction: (action_id) =>
      request('/carbon/actions/log', { method: 'POST', body: JSON.stringify({ action_id }) }),
  },
  leaderboard: {
    get: () => request('/leaderboard'),
  },
}
