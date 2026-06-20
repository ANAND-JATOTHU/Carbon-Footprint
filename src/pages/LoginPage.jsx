/**
 * LoginPage.jsx — Register / Login toggle page.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import { api } from '../api/client'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const { login } = useApp()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from?.pathname ?? '/'

  const [mode, setMode]     = useState('login')   // 'login' | 'register'
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [show, setShow]     = useState(false)
  const [loading, setLoad]  = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoad(true)
    setError('')
    try {
      const res = mode === 'login'
        ? await api.auth.login(email, pass)
        : await api.auth.register(email, pass)
      login(res.access_token, res.user)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoad(false)
    }
  }

  function toggleMode() {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4 pt-20"
      style={{ background: '#0A0E17' }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,240,255,0.07) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 16 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(57,255,20,0.08))',
              border: '1px solid rgba(0,240,255,0.25)',
            }}
            animate={{ boxShadow: ['0 0 12px rgba(0,240,255,0.2)', '0 0 30px rgba(0,240,255,0.5)', '0 0 12px rgba(0,240,255,0.2)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Zap size={24} style={{ color: '#00F0FF' }} />
          </motion.div>
          <h1
            className="text-3xl font-bold tracking-widest uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span style={{ color: '#00F0FF' }}>Carbon</span>
            <span style={{ color: '#39FF14' }}>Zero</span>
          </h1>
          <p className="text-sm mt-2 font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Track your impact. Own your data.
          </p>
        </div>

        <GlassCard className="p-8" delay={0.1}>
          {/* Mode toggle */}
          <div
            className="flex rounded-xl p-1 mb-7"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: mode === m ? 'rgba(0,240,255,0.12)' : 'transparent',
                  color: mode === m ? '#00F0FF' : 'rgba(255,255,255,0.4)',
                  border: mode === m ? '1px solid rgba(0,240,255,0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
              <p
                className="text-lg font-bold mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}
              >
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email */}
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(0,240,255,0.5)' }} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-mono outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(0,240,255,0.4)' }}
                    onBlur={e =>  { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(0,240,255,0.5)' }} />
                  <input
                    type={show ? 'text' : 'password'}
                    placeholder={mode === 'register' ? 'Min 6 characters' : 'Password'}
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-3 rounded-xl text-sm font-mono outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(0,240,255,0.4)' }}
                    onBlur={e =>  { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                  >
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-mono px-3 py-2 rounded-lg"
                      style={{
                        color: '#FF0055',
                        background: 'rgba(255,0,85,0.08)',
                        border: '1px solid rgba(255,0,85,0.2)',
                      }}
                    >
                      ⚠ {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <NeonButton
                  type="submit"
                  variant="cyan"
                  className="w-full py-3 mt-1"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : mode === 'login' ? '→ Sign In' : '→ Create Account'}
                </NeonButton>

                {mode === 'register' && (
                  <p className="text-xs text-center font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    🔒 Your habits stay on your device. Only your score is stored.
                  </p>
                )}
              </form>
            </motion.div>
          </AnimatePresence>
        </GlassCard>

        <p className="text-center mt-6 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Zero personal data shared · Privacy-first architecture
        </p>
      </motion.div>
    </div>
  )
}
