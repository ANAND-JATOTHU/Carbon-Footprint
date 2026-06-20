/**
 * TopBar.jsx — Navigation with React Router links and auth state.
 */
import { motion } from 'motion/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ShieldCheck, Zap, Activity, LogOut, User } from 'lucide-react'
import { useApp } from '../context/AppContext'

const NAV = [
  { to: '/',            label: 'Dashboard'  },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/eco-actions', label: 'Eco-Actions' },
  { to: '/about',       label: 'About'      },
]

export default function TopBar() {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 14 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: 'rgba(10,14,23,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.18), rgba(57,255,20,0.12))' }}
          animate={{ boxShadow: ['0 0 8px rgba(0,240,255,0.25)', '0 0 20px rgba(0,240,255,0.55)', '0 0 8px rgba(0,240,255,0.25)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Zap size={15} style={{ color: '#00F0FF' }} />
        </motion.div>
        <NavLink to="/" style={{ textDecoration: 'none' }}>
          <span
            className="text-lg font-bold tracking-widest uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00F0FF' }}
          >
            Carbon<span style={{ color: '#39FF14' }}>Zero</span>
          </span>
        </NavLink>
        <span
          className="hidden sm:block text-xs px-2 py-0.5 rounded-full font-mono"
          style={{
            border: '1px solid rgba(0,240,255,0.2)',
            color: 'rgba(0,240,255,0.6)',
            background: 'rgba(0,240,255,0.05)',
          }}
        >
          v2.0.0
        </span>
      </div>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              color: isActive ? '#00F0FF' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(0,240,255,0.08)' : 'transparent',
              border: isActive ? '1px solid rgba(0,240,255,0.2)' : '1px solid transparent',
              transition: 'all 0.2s',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right side: user */}
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono"
              style={{
                border: '1px solid rgba(57,255,20,0.2)',
                background: 'rgba(57,255,20,0.06)',
                color: '#39FF14',
              }}
            >
              <User size={11} />
              {user.display_name}
            </div>
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono"
              style={{
                border: '1px solid rgba(255,0,85,0.2)',
                color: 'rgba(255,0,85,0.7)',
                background: 'transparent',
                cursor: 'pointer',
              }}
              whileHover={{ borderColor: '#FF005580', color: '#FF0055' }}
              whileTap={{ scale: 0.96 }}
            >
              <LogOut size={11} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </>
        ) : (
          <NavLink
            to="/login"
            style={{ textDecoration: 'none' }}
          >
            <motion.span
              className="px-4 py-1.5 rounded-xl text-xs font-mono font-semibold"
              style={{
                border: '1px solid rgba(0,240,255,0.35)',
                color: '#00F0FF',
                background: 'rgba(0,240,255,0.07)',
              }}
              whileHover={{ boxShadow: '0 0 18px rgba(0,240,255,0.3)' }}
            >
              Sign In
            </motion.span>
          </NavLink>
        )}
      </div>
    </motion.header>
  )
}
