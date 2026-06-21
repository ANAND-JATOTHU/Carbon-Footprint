/**
 * EcoActionsPage.jsx — Full eco-actions catalogue.
 * Users can log daily actions; requires login.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle, Leaf, Car, Home, Zap, Plus } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import { api } from '../api/client'
import { useApp } from '../context/AppContext'

const CATEGORY_ICONS = { Diet: Leaf, Transport: Car, Home: Home, Energy: Zap }
const CATEGORY_COLORS = { Diet: '#39FF14', Transport: '#00F0FF', Home: '#a855f7', Energy: '#f59e0b' }

export default function EcoActionsPage() {
  const { user, updateUser } = useApp()
  const [actions, setAct]  = useState([])
  const [logged, setLog]   = useState([])
  const [loading, setLoad] = useState(null)
  const [toast, setToast]  = useState(null)
  const [filter, setFilter]= useState('All')

  useEffect(() => {
    api.carbon.actions().then(setAct).catch(() => {})
  }, [])

  async function logAction(action) {
    if (!user) return
    if (logged.includes(action.id) || loading === action.id) return
    setLoad(action.id)
    try {
      const res = await api.carbon.logAction(action.id)
      setLog(p => [...p, action.id])
      setToast(`✅ Logged! −${res.co2_saved}kg CO₂ saved`)
      const updatedUser = await api.auth.me()
      updateUser(updatedUser)
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      setToast(`⚠ ${e.message}`)
      setTimeout(() => setToast(null), 3000)
    } finally {
      setLoad(null)
    }
  }

  const categories = ['All', ...new Set(actions.map(a => a.category))]
  const filtered   = filter === 'All' ? actions : actions.filter(a => a.category === filter)
  const totalSaved = logged.reduce((s, id) => {
    const a = actions.find(x => x.id === id)
    return s + (a?.co2_reduction ?? 0)
  }, 0)

  return (
    <div className="min-h-dvh pt-20 px-4 pb-8 md:px-6 lg:px-8" style={{ background: '#0A0E17' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
          className="mb-8"
        >
          <h1
            className="text-3xl font-bold mb-1"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #39FF14, rgba(0,240,255,0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Eco-Actions Catalogue
          </h1>
          <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Log today's actions · Reductions verified against IPCC emission factors
          </p>
        </motion.div>

        {/* Stats bar */}
        {user && logged.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 px-5 py-3 rounded-xl flex items-center gap-6"
            style={{
              background: 'rgba(57,255,20,0.06)',
              border: '1px solid rgba(57,255,20,0.2)',
            }}
          >
            <div>
              <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>Today's savings</p>
              <p className="text-2xl font-bold font-mono" style={{ color: '#39FF14' }}>
                −{totalSaved.toFixed(1)}kg
              </p>
            </div>
            <div>
              <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>Actions logged</p>
              <p className="text-2xl font-bold font-mono" style={{ color: '#00F0FF' }}>
                {logged.length}/{actions.length}
              </p>
            </div>
          </motion.div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-5">
          {categories.map(cat => {
            const color = cat === 'All' ? '#00F0FF' : CATEGORY_COLORS[cat]
            return (
              <motion.button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-4 py-1.5 rounded-full text-xs font-mono font-semibold"
                style={{
                  background: filter === cat ? `${color}18` : 'rgba(255,255,255,0.03)',
                  border: filter === cat ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.07)',
                  color: filter === cat ? color : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {cat}
              </motion.button>
            )
          })}
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((action, i) => {
              const done  = logged.includes(action.id)
              const color = CATEGORY_COLORS[action.category] ?? '#00F0FF'
              const Icon  = CATEGORY_ICONS[action.category] ?? Leaf

              return (
                <motion.div
                  key={action.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 130, damping: 16 }}
                >
                  <GlassCard
                    glowColor={done ? 'toxic' : 'cyan'}
                    className="p-4"
                    style={{ opacity: done ? 0.75 : 1 }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                      >
                        {done
                          ? <CheckCircle size={16} style={{ color: '#39FF14' }} />
                          : <Icon size={16} style={{ color }} />
                        }
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-sm font-semibold"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: done ? 'rgba(255,255,255,0.45)' : '#fff',
                            textDecoration: done ? 'line-through' : 'none',
                          }}
                        >
                          {action.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-mono"
                            style={{ background: `${color}12`, color, border: `1px solid ${color}25`, fontSize: '10px' }}
                          >
                            {action.category}
                          </span>
                          <span className="text-xs font-mono" style={{ color: '#39FF14' }}>
                            −{action.co2_reduction}kg CO₂
                          </span>
                        </div>
                      </div>

                      {user && !done && (
                        <NeonButton
                          variant={user.has_submitted ? 'toxic' : 'ghost'}
                          className="text-xs px-3 py-1.5 flex-shrink-0"
                          onClick={() => logAction(action)}
                          disabled={!user.has_submitted || loading === action.id}
                        >
                          {loading === action.id ? '...' : 'Log'}
                        </NeonButton>
                      )}

                      {!user && (
                        <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                          Login to log
                        </span>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {!user && (
          <p className="text-center mt-6 text-sm font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <a href="/login" style={{ color: '#00F0FF', textDecoration: 'none' }}>Sign in</a> to log actions and appear on the leaderboard
          </p>
        )}
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 px-5 py-3 rounded-xl text-sm font-mono"
            style={{
              background: 'rgba(10,14,23,0.95)',
              border: '1px solid rgba(57,255,20,0.3)',
              color: '#39FF14',
              backdropFilter: 'blur(12px)',
              zIndex: 100,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
