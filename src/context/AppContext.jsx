/**
 * AppContext.jsx — Global app state: auth + carbon profile.
 * Persists token in localStorage. Fetches /me on reload.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)   // initial hydration

  // Hydrate from stored token on page load
  useEffect(() => {
    const token = localStorage.getItem('czToken')
    if (!token) { setLoading(false); return }
    api.auth.me()
      .then(u => setUser(u))
      .catch(() => localStorage.removeItem('czToken'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((token, userData) => {
    localStorage.setItem('czToken', token)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('czToken')
    setUser(null)
  }, [])

  // Called after successful /api/carbon/submit
  const updateUser = useCallback((userData) => {
    setUser(userData)
  }, [])

  return (
    <Ctx.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  )
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
