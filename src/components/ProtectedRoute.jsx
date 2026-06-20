/**
 * ProtectedRoute.jsx — Redirects to /login if not authenticated.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { motion } from 'motion/react'
import { Zap } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useApp()
  const location = useLocation()

  if (loading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ background: '#0A0E17' }}
      >
        <motion.div
          animate={{
            rotate: [0, 360],
            boxShadow: ['0 0 10px rgba(0,240,255,0.3)', '0 0 30px rgba(0,240,255,0.7)', '0 0 10px rgba(0,240,255,0.3)'],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ border: '2px solid rgba(0,240,255,0.3)' }}
        >
          <Zap size={18} style={{ color: '#00F0FF' }} />
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
