/**
 * CarbonChart.jsx — Neon HUD donut chart with animated center counter.
 * Uses Recharts v3 PieChart with transparent fills + neon strokes.
 */
import { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform } from 'motion/react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { GLOBAL_AVG_CO2, DIET_OPTIONS, TRANSPORT_OPTIONS, HOME_OPTIONS } from '../utils/calculateCO2'

const SEGMENTS = [
  { key: 'diet',      label: 'Diet',      color: '#39FF14', icon: '🌿' },
  { key: 'transport', label: 'Transport', color: '#00F0FF', icon: '🚗' },
  { key: 'home',      label: 'Home',      color: '#a855f7', icon: '🏠' },
]

function getLabel(options, id) {
  return options?.find(o => o.id === id)?.label ?? id
}
function getFactor(options, id) {
  return options?.find(o => o.id === id)?.factor ?? 0
}

// Animated odometer counter
function AnimatedCounter({ value }) {
  const spring = useSpring(value, { stiffness: 60, damping: 14 })
  const display = useTransform(spring, v => v.toFixed(2))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return (
    <motion.span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {display}
    </motion.span>
  )
}

// Custom neon tooltip
function NeonTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs font-mono"
      style={{
        background: 'rgba(10,14,23,0.95)',
        border: `1px solid ${d.payload.color}50`,
        color: d.payload.color,
      }}
    >
      <div className="font-semibold">{d.name}</div>
      <div style={{ color: 'rgba(255,255,255,0.6)' }}>{d.value.toFixed(1)} MTCO₂e/yr</div>
    </div>
  )
}

export default function CarbonChart({ user }) {
  const dietFactor      = getFactor(DIET_OPTIONS, user.diet)
  const transportFactor = getFactor(TRANSPORT_OPTIONS, user.transport)
  const homeFactor      = getFactor(HOME_OPTIONS, user.home)
  const total           = user.total_co2
  const vsAvg           = ((total / GLOBAL_AVG_CO2) * 100 - 100).toFixed(0)
  const better          = total < GLOBAL_AVG_CO2

  const chartData = [
    { name: 'Diet',      value: dietFactor,      color: '#39FF14' },
    { name: 'Transport', value: transportFactor,  color: '#00F0FF' },
    { name: 'Home',      value: homeFactor,       color: '#a855f7' },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Donut + score */}
      <div className="relative flex items-center justify-center gap-8 flex-wrap">
        {/* Neon donut chart */}
        <div className="relative" style={{ width: 220, height: 220, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                strokeWidth={0}
                animationBegin={0}
                animationDuration={900}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={`${entry.color}22`}
                    stroke={entry.color}
                    strokeWidth={3}
                    style={{ filter: `drop-shadow(0 0 8px ${entry.color}80)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<NeonTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center metric overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <motion.div
              key={total}
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="text-4xl font-bold"
              style={{
                color: '#00F0FF',
                textShadow: '0 0 20px rgba(0,240,255,0.7)',
                lineHeight: 1,
              }}
            >
              <AnimatedCounter value={total} />
            </motion.div>
            <div className="text-xs font-mono mt-1" style={{ color: 'rgba(0,240,255,0.5)' }}>
              MTCO₂e/yr
            </div>
          </div>

          {/* Ambient glow ring */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,240,255,0.04) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Breakdown legend */}
        <div className="flex flex-col gap-3 flex-1 min-w-[160px]">
          {/* vs. Global avg */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: better ? 'rgba(57,255,20,0.08)' : 'rgba(255,0,85,0.08)',
              border: `1px solid ${better ? 'rgba(57,255,20,0.25)' : 'rgba(255,0,85,0.25)'}`,
            }}
          >
            {better
              ? <TrendingDown size={14} style={{ color: '#39FF14' }} />
              : <TrendingUp   size={14} style={{ color: '#FF0055' }} />
            }
            <span
              className="text-xs font-mono"
              style={{ color: better ? '#39FF14' : '#FF0055' }}
            >
              {better ? `${Math.abs(vsAvg)}% below` : `${vsAvg}% above`} global avg
            </span>
          </div>

          {SEGMENTS.map(seg => {
            const val = seg.key === 'diet' ? dietFactor : seg.key === 'transport' ? transportFactor : homeFactor
            const pct = total > 0 ? Math.round((val / total) * 100) : 0
            const label = seg.key === 'diet'
              ? getLabel(DIET_OPTIONS, user.diet)
              : seg.key === 'transport'
              ? getLabel(TRANSPORT_OPTIONS, user.transport)
              : getLabel(HOME_OPTIONS, user.home)
            return (
              <div key={seg.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{seg.icon}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {seg.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono" style={{ color: seg.color }}>{val.toFixed(1)}t</span>
                    <span className="text-xs font-mono ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>({pct}%)</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: seg.color, boxShadow: `0 0 8px ${seg.color}80` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Roboto Mono', monospace" }}>
                  {label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
