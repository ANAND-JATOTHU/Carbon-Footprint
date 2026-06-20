/**
 * CarbonDashboard — Left panel: carbon score + chart + eco-actions
 * Uses Recharts for neon donut chart.
 * Mock data for Phase 1.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Leaf, Car, Zap, Home, TrendingDown, Plus, CheckCircle } from 'lucide-react'
import GlassCard from './GlassCard'
import NeonButton from './NeonButton'

/* ── Mock Data ─────────────────────────────────────────── */
const INITIAL_CO2 = 8.4  // metric tons / year

const BREAKDOWN = [
  { name: 'Transport',  value: 3.2, color: '#00F0FF', icon: Car },
  { name: 'Diet',       value: 2.6, color: '#39FF14', icon: Leaf },
  { name: 'Home',       value: 1.8, color: '#a855f7', icon: Home },
  { name: 'Energy',     value: 0.8, color: '#f59e0b', icon: Zap },
]

const ECO_ACTIONS = [
  { id: 1, title: 'Line-dry laundry',            reduction: 0.8,  category: 'Home' },
  { id: 2, title: 'Switch to public transit',     reduction: 2.1,  category: 'Transport' },
  { id: 3, title: 'Plant-based meal today',       reduction: 1.5,  category: 'Diet' },
  { id: 4, title: 'Unplug standby devices',       reduction: 0.3,  category: 'Energy' },
  { id: 5, title: 'Carpool to work',              reduction: 1.2,  category: 'Transport' },
]

/* ── Custom Tooltip ────────────────────────────────────── */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div
      className="px-3 py-2 rounded-lg text-sm font-mono"
      style={{
        background: 'rgba(10,14,23,0.95)',
        border: `1px solid ${d.payload.color}44`,
        color: d.payload.color,
      }}
    >
      <div className="font-semibold">{d.name}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)' }}>{d.value.toFixed(1)} MT CO₂e</div>
    </div>
  )
}

/* ── Score Counter (odometer effect) ────────────────────── */
function ScoreCounter({ value }) {
  return (
    <motion.span
      key={value.toFixed(2)}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      className="font-display glow-cyan"
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '4.5rem',
        fontWeight: 700,
        color: '#00F0FF',
        lineHeight: 1,
      }}
    >
      {value.toFixed(2)}
    </motion.span>
  )
}

/* ── Main Component ─────────────────────────────────────── */
export default function CarbonDashboard({ onActionLog }) {
  const [co2, setCo2] = useState(INITIAL_CO2)
  const [loggedActions, setLoggedActions] = useState([])

  function handleLogAction(action) {
    if (loggedActions.includes(action.id)) return
    const next = Math.max(0, parseFloat((co2 - action.reduction * 0.1).toFixed(2)))
    setCo2(next)
    setLoggedActions(prev => [...prev, action.id])
    if (onActionLog) onActionLog(action)
  }

  const total = BREAKDOWN.reduce((s, d) => s + d.value, 0)
  const percentage = Math.round(((INITIAL_CO2 - co2) / INITIAL_CO2) * 100)

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* ── Score Hero Card ─────────────────────────────── */}
      <GlassCard delay={0.1} glowColor="cyan" className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="text-xs font-mono uppercase tracking-widest mb-1"
              style={{ color: 'rgba(0,240,255,0.6)' }}
            >
              Annual Carbon Footprint
            </p>
            <div className="flex items-end gap-3">
              <ScoreCounter value={co2} />
              <div className="mb-2">
                <span
                  className="text-sm font-mono block"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  MTCO₂e/yr
                </span>
              </div>
            </div>
            {percentage > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 mt-1"
              >
                <TrendingDown size={14} style={{ color: '#39FF14' }} />
                <span
                  className="text-sm font-mono glow-toxic"
                  style={{ color: '#39FF14' }}
                >
                  −{percentage}% from baseline
                </span>
              </motion.div>
            )}
          </div>

          {/* Mini ring progress */}
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="32"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - (co2 / 16))}`}
                style={{ filter: 'drop-shadow(0 0 6px #00F0FF)' }}
              />
            </svg>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center font-mono"
              style={{ color: '#00F0FF', fontSize: '10px', lineHeight: 1.2 }}
            >
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{Math.round((co2 / 16) * 100)}%</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px' }}>of avg</span>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mt-2">
          {BREAKDOWN.map(d => (
            <span
              key={d.name}
              className="text-xs px-2.5 py-1 rounded-full font-mono"
              style={{
                border: `1px solid ${d.color}40`,
                background: `${d.color}0D`,
                color: d.color,
              }}
            >
              {d.name}: {d.value.toFixed(1)}t
            </span>
          ))}
        </div>
      </GlassCard>

      {/* ── Donut Chart ─────────────────────────────────── */}
      <GlassCard delay={0.2} glowColor="cyan" className="p-5">
        <p
          className="text-xs font-mono uppercase tracking-widest mb-4"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Emissions Breakdown
        </p>
        <div className="flex items-center gap-4">
          <div style={{ width: 140, height: 140, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={64}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {BREAKDOWN.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      style={{ filter: `drop-shadow(0 0 8px ${entry.color}80)` }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {BREAKDOWN.map(d => {
              const Icon = d.icon
              return (
                <div key={d.name} className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${d.color}18`, border: `1px solid ${d.color}40` }}
                  >
                    <Icon size={13} style={{ color: d.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {d.name}
                      </span>
                      <span className="text-xs font-mono" style={{ color: d.color }}>
                        {((d.value / total) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: d.color, boxShadow: `0 0 8px ${d.color}80` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(d.value / total) * 100}%` }}
                        transition={{ delay: 0.4 + BREAKDOWN.indexOf(d) * 0.08, duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </GlassCard>

      {/* ── Eco-Actions Ledger ───────────────────────────── */}
      <GlassCard delay={0.3} glowColor="toxic" className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: 'rgba(57,255,20,0.7)' }}
          >
            Today's Eco-Actions
          </p>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{
              border: '1px solid rgba(57,255,20,0.3)',
              background: 'rgba(57,255,20,0.08)',
              color: '#39FF14',
            }}
          >
            {loggedActions.length}/{ECO_ACTIONS.length} logged
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {ECO_ACTIONS.map((action, i) => {
              const logged = loggedActions.includes(action.id)
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07, type: 'spring', stiffness: 120, damping: 14 }}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: logged ? 'rgba(57,255,20,0.08)' : 'rgba(255,255,255,0.03)',
                    border: logged ? '1px solid rgba(57,255,20,0.25)' : '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: logged ? 'rgba(57,255,20,0.15)' : 'rgba(255,255,255,0.05)',
                        border: logged ? '1px solid rgba(57,255,20,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {logged
                        ? <CheckCircle size={12} style={{ color: '#39FF14' }} />
                        : <Plus size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      }
                    </div>
                    <div>
                      <p
                        className="text-sm"
                        style={{
                          color: logged ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.85)',
                          textDecoration: logged ? 'line-through' : 'none',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {action.title}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {action.category} · −{action.reduction}kg CO₂
                      </p>
                    </div>
                  </div>

                  {!logged && (
                    <NeonButton
                      id={`action-btn-${action.id}`}
                      variant="toxic"
                      className="text-xs px-3 py-1.5"
                      onClick={() => handleLogAction(action)}
                    >
                      Log
                    </NeonButton>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  )
}
