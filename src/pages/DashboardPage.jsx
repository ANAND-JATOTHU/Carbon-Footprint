/**
 * DashboardPage.jsx — Main mission control.
 * Shows OnboardingWizard if user hasn't submitted profile yet,
 * otherwise shows live CarbonChart + Eco-Actions + SecurityConsole.
 */
import { motion } from 'motion/react'
import { useApp } from '../context/AppContext'
import GlassCard from '../components/GlassCard'
import OnboardingWizard from '../components/OnboardingWizard'
import CarbonChart from '../components/CarbonChart'
import NeonButton from '../components/NeonButton'
import { api } from '../api/client'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { CheckCircle, Plus, Leaf } from 'lucide-react'
import { useApp as useAppCtx } from '../context/AppContext'

function EcoActionsPanel() {
  const { user, updateUser } = useApp()
  const [actions, setActions]   = useState([])
  const [logged, setLogged]     = useState([])
  const [loading, setLoading]   = useState(null)

  useEffect(() => {
    api.carbon.actions().then(setActions).catch(() => {})
  }, [])

  async function logAction(action) {
    if (logged.includes(action.id) || loading === action.id) return
    setLoading(action.id)
    try {
      await api.carbon.logAction(action.id)
      setLogged(p => [...p, action.id])
    } catch (e) {
      // already logged or error
    } finally {
      setLoading(null)
    }
  }

  const preview = actions.slice(0, 5)

  return (
    <GlassCard delay={0.35} glowColor="toxic" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(57,255,20,0.7)' }}>
          Today's Eco-Actions
        </p>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ border: '1px solid rgba(57,255,20,0.25)', background: 'rgba(57,255,20,0.06)', color: '#39FF14' }}>
          {logged.length}/{preview.length} done
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {preview.map((action, i) => {
          const done = logged.includes(action.id)
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 130, damping: 14 }}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{
                background: done ? 'rgba(57,255,20,0.06)' : 'rgba(255,255,255,0.02)',
                border: done ? '1px solid rgba(57,255,20,0.2)' : '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: done ? 'rgba(57,255,20,0.15)' : 'rgba(255,255,255,0.04)', border: done ? '1px solid rgba(57,255,20,0.35)' : '1px solid rgba(255,255,255,0.08)' }}>
                  {done ? <CheckCircle size={11} style={{ color: '#39FF14' }} /> : <Plus size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />}
                </div>
                <div>
                  <p className="text-sm" style={{ color: done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)', fontFamily: "'Space Grotesk', sans-serif", textDecoration: done ? 'line-through' : 'none' }}>
                    {action.title}
                  </p>
                  <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {action.category} · −{action.co2_reduction}kg CO₂
                  </p>
                </div>
              </div>
              {!done && (
                <NeonButton
                  variant="toxic"
                  className="text-xs px-3 py-1.5"
                  onClick={() => logAction(action)}
                  disabled={loading === action.id}
                >
                  {loading === action.id ? '...' : 'Log'}
                </NeonButton>
              )}
            </motion.div>
          )
        })}
      </div>
    </GlassCard>
  )
}

export default function DashboardPage() {
  const { user } = useApp()
  const hasData = user?.has_submitted

  return (
    <div className="min-h-dvh pt-20 px-4 pb-8 md:px-6 lg:px-8" style={{ background: '#0A0E17' }}>
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.05 }}
        className="mb-6"
      >
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight mb-1"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: 'linear-gradient(135deg, #00F0FF 0%, rgba(0,240,255,0.5) 50%, #39FF14 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {hasData ? 'Mission Control' : 'Get Your Carbon Score'}
        </h1>
        <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {hasData
            ? `Welcome, ${user.display_name} · Zero-knowledge tracking active`
            : '3 questions · 60 seconds · Your data stays on your device'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!hasData ? (
          /* ── Onboarding ──────────────────────────── */
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            className="max-w-2xl mx-auto"
          >
            <OnboardingWizard />
          </motion.div>
        ) : (
          /* ── Full dashboard ──────────────────────── */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            className="max-w-4xl mx-auto flex flex-col gap-5"
          >
            {/* Charts + Actions */}
            <div className="flex flex-col gap-5">
              {/* Carbon chart */}
              <GlassCard delay={0.1} glowColor="cyan" className="p-6">
                <p className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: 'rgba(0,240,255,0.6)' }}>
                  Annual Carbon Footprint
                </p>
                <CarbonChart user={user} />
              </GlassCard>

              {/* Eco-actions */}
              <EcoActionsPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
