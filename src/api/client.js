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
    sync: () =>
      request('/auth/sync', { method: 'POST' }),
    me: () => request('/auth/me'),
  },
  carbon: {
    submit: (diet, transport, home) =>
      request('/carbon/submit', { method: 'POST', body: JSON.stringify({ diet, transport, home }) }),
  },
  tasks: {
    get: () => request('/carbon/tasks'),
    create: (title, category, co2_saved) =>
      request('/carbon/tasks', { method: 'POST', body: JSON.stringify({ title, category, co2_saved }) }),
    delete: (task_id) =>
      request(`/carbon/tasks/${task_id}`, { method: 'DELETE' }),
  },
  leaderboard: {
    get: () => request('/leaderboard'),
  },
}
