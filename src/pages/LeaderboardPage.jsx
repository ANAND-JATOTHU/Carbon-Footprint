/**
 * LeaderboardPage.jsx — Real public leaderboard sorted by lowest CO₂.
 * Privacy: only display_name and total_co2 shown. No personal data.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Trophy, RefreshCw, Crown } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import { api } from '../api/client'
import { useApp } from '../context/AppContext'

const RANK_COLORS = ['#f59e0b', '#9ca3af', '#cd7c3f', '#00F0FF', '#39FF14']
const MEDAL = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const { user }           = useApp()
  const [board, setBoard]  = useState([])
  const [loading, setLoad] = useState(true)
  const [lastUpdate, setLU] = useState(null)

  async function fetchBoard() {
    setLoad(true)
    try {
      const data = await api.leaderboard.get()
      setBoard(data)
      setLU(new Date())
    } catch (_) {}
    finally { setLoad(false) }
  }

  useEffect(() => {
    fetchBoard()
    const interval = setInterval(fetchBoard, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const userRank = user ? board.findIndex(e => e.display_name === user.display_name) + 1 : 0

  return (
    <div className="min-h-dvh pt-20 px-4 pb-8 md:px-6 lg:px-8" style={{ background: '#0A0E17' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1
              className="text-3xl font-bold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'linear-gradient(135deg, #39FF14, rgba(57,255,20,0.5))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Global Leaderboard
            </h1>
            <p className="text-sm font-mono mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Ranked by lowest annual CO₂ · Updated live
              {lastUpdate && ` · ${lastUpdate.toLocaleTimeString()}`}
            </p>
          </div>
          <NeonButton variant="ghost" onClick={fetchBoard} disabled={loading} className="text-xs">
            <RefreshCw size={12} style={{ display: 'inline', marginRight: 4 }} />
            Refresh
          </NeonButton>
        </motion.div>

        {/* Your rank banner (if logged in and on leaderboard) */}
        {user && user.has_submitted && userRank > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 px-5 py-3 rounded-xl flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.08), rgba(57,255,20,0.05))',
              border: '1px solid rgba(0,240,255,0.2)',
            }}
          >
            <Trophy size={18} style={{ color: '#00F0FF' }} />
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00F0FF' }}>
                Your rank: #{userRank}
              </p>
              <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {user.display_name} · {user.total_co2} MTCO₂e/yr
              </p>
            </div>
          </motion.div>
        )}

        {/* Privacy notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5 px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          🔒 Only anonymous usernames and total scores are shown. Diet, transport, and home data are never shared.
        </motion.div>

        {/* Leaderboard table */}
        <GlassCard delay={0.15} glowColor="toxic" className="p-0 overflow-hidden">
          {/* Header row */}
          <div
            className="grid grid-cols-12 px-5 py-3 text-xs font-mono uppercase tracking-wider"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            <span className="col-span-1">#</span>
            <span className="col-span-8">Identifier</span>
            <span className="col-span-3 text-right">MTCO₂e/yr</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 rounded-full"
                style={{ border: '2px solid rgba(57,255,20,0.3)', borderTopColor: '#39FF14' }}
              />
            </div>
          ) : (
            <AnimatePresence>
              {board.map((entry, i) => {
                const isMe = user?.display_name === entry.display_name
                const topColor = i < 3 ? RANK_COLORS[i] : (isMe ? '#00F0FF' : 'rgba(255,255,255,0.5)')

                return (
                  <motion.div
                    key={entry.display_name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 130, damping: 16 }}
                    className="grid grid-cols-12 px-5 py-3.5 items-center"
                    style={{
                      borderBottom: i < board.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: isMe
                        ? 'rgba(0,240,255,0.04)'
                        : i < 3
                        ? `${RANK_COLORS[i]}08`
                        : 'transparent',
                    }}
                  >
                    {/* Rank */}
                    <span className="col-span-1 text-sm font-bold" style={{ color: topColor }}>
                      {MEDAL[i] ?? `#${entry.rank}`}
                    </span>

                    {/* Name */}
                    <div className="col-span-8 flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: `${topColor}15`,
                          border: `1px solid ${topColor}30`,
                          color: topColor,
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {entry.display_name[0]}
                      </div>
                      <div>
                        <p
                          className="text-sm font-mono"
                          style={{
                            color: isMe ? '#00F0FF' : 'rgba(255,255,255,0.8)',
                            fontWeight: isMe ? 700 : 400,
                          }}
                        >
                          {entry.display_name}
                          {isMe && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(0,240,255,0.12)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.2)', fontSize: '10px' }}>
                              YOU
                            </span>
                          )}
                        </p>
                        {i === 0 && (
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Roboto Mono', monospace" }}>
                            <Crown size={9} style={{ display: 'inline', marginRight: 3 }} />
                            Lowest impact
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-3 text-right">
                      <span
                        className="text-sm font-bold font-mono"
                        style={{
                          color: topColor,
                          textShadow: i < 3 ? `0 0 12px ${topColor}60` : 'none',
                        }}
                      >
                        {entry.total_co2.toFixed(1)}
                      </span>
                      <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.25)' }}>t</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}

          {!loading && board.length === 0 && (
            <p className="text-center py-10 text-sm font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
              No entries yet. Be the first!
            </p>
          )}
        </GlassCard>

        <p className="text-center mt-5 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.18)' }}>
          {board.length} participants · Refreshes every 30s · Sorted by lowest annual emissions
        </p>
      </div>
    </div>
  )
}
