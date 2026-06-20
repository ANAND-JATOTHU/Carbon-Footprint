/**
 * OnboardingWizard.jsx — 3-step habit collection form.
 * Slides questions in/out with spring physics via AnimatePresence.
 * Calculates CO₂ client-side for instant preview, then submits to backend.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight, Leaf, Car, Home, Zap } from 'lucide-react'
import GlassCard from './GlassCard'
import NeonButton from './NeonButton'
import {
  DIET_OPTIONS, TRANSPORT_OPTIONS, HOME_OPTIONS,
  calculateCO2, GLOBAL_AVG_CO2
} from '../utils/calculateCO2'
import { api } from '../api/client'
import { useApp } from '../context/AppContext'

const STEPS = [
  {
    key: 'diet',
    title: 'Your Diet',
    subtitle: 'Food production is the #2 source of personal emissions',
    icon: Leaf,
    color: '#39FF14',
    options: DIET_OPTIONS,
  },
  {
    key: 'transport',
    title: 'How You Move',
    subtitle: 'Transport is typically the largest individual carbon source',
    icon: Car,
    color: '#00F0FF',
    options: TRANSPORT_OPTIONS,
  },
  {
    key: 'home',
    title: 'Your Home',
    subtitle: 'Home size and heating affects your footprint significantly',
    icon: Home,
    color: '#a855f7',
    options: HOME_OPTIONS,
  },
]

const SLIDE_VARIANTS = {
  enter: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
  center:       ({ x: 0, opacity: 1 }),
  exit:  (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
}
const SPRING = { type: 'spring', stiffness: 180, damping: 22 }

export default function OnboardingWizard() {
  const { updateUser } = useApp()
  const [step, setStep]       = useState(0)
  const [direction, setDir]   = useState(1)
  const [selections, setSel]  = useState({ diet: null, transport: null, home: null })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const current = STEPS[step]
  const Icon = current.icon

  function select(key, id) {
    setSel(s => ({ ...s, [key]: id }))
  }

  function next() {
    if (!selections[current.key]) return
    if (step < STEPS.length - 1) {
      setDir(1)
      setStep(s => s + 1)
    }
  }

  function back() {
    if (step > 0) {
      setDir(-1)
      setStep(s => s - 1)
    }
  }

  async function submit() {
    const { diet, transport, home } = selections
    if (!diet || !transport || !home) return
    setLoading(true)
    setError('')
    try {
      const user = await api.carbon.submit(diet, transport, home)
      updateUser(user)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Live preview score
  const preview = selections.diet && selections.transport && selections.home
    ? calculateCO2(selections.diet, selections.transport, selections.home)
    : null

  const isLast = step === STEPS.length - 1

  return (
    <GlassCard className="p-0 overflow-hidden" delay={0.1}>
      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full"
          style={{ background: `linear-gradient(90deg, #00F0FF, #39FF14)` }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={SPRING}
        />
      </div>

      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p
              className="text-xs font-mono uppercase tracking-widest mb-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Step {step + 1} of {STEPS.length} · 60-Second Setup
            </p>
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}
            >
              {current.title}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {current.subtitle}
            </p>
          </div>

          {/* Live preview score */}
          {preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-right"
            >
              <p className="text-xs font-mono" style={{ color: 'rgba(0,240,255,0.6)' }}>Preview</p>
              <motion.p
                key={preview}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold font-mono"
                style={{ color: '#00F0FF', textShadow: '0 0 18px rgba(0,240,255,0.6)' }}
              >
                {preview}t
              </motion.p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>MTCO₂e/yr</p>
            </motion.div>
          )}
        </div>

        {/* Question slide */}
        <div className="relative overflow-hidden" style={{ minHeight: '240px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SPRING}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {current.options.map(opt => {
                const selected = selections[current.key] === opt.id
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => select(current.key, opt.id)}
                    className="relative p-4 rounded-xl text-left transition-all"
                    style={{
                      background: selected
                        ? `${current.color}15`
                        : 'rgba(255,255,255,0.03)',
                      border: selected
                        ? `1px solid ${current.color}60`
                        : '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0 0 24px ${current.color}30`,
                      borderColor: `${current.color}80`,
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  >
                    {selected && (
                      <motion.div
                        layoutId="sel-indicator"
                        className="absolute inset-0 rounded-xl"
                        style={{ border: `2px solid ${current.color}`, opacity: 0.6 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: `${current.color}18`,
                          border: `1px solid ${current.color}30`,
                        }}
                      >
                        <Icon size={14} style={{ color: current.color }} />
                      </div>
                      <div>
                        <p
                          className="font-semibold text-sm"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: selected ? current.color : 'rgba(255,255,255,0.85)',
                          }}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {opt.desc}
                        </p>
                        <p
                          className="text-xs mt-1 font-mono"
                          style={{ color: `${current.color}80` }}
                        >
                          +{opt.factor}t CO₂/yr
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-mono mt-4 text-center"
            style={{ color: '#FF0055' }}
          >
            ⚠ {error}
          </motion.p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <div>
            {step > 0 && (
              <NeonButton variant="ghost" onClick={back}>
                ← Back
              </NeonButton>
            )}
          </div>

          {isLast ? (
            <NeonButton
              variant="cyan"
              onClick={submit}
              disabled={!selections[current.key] || loading}
            >
              {loading ? 'Calculating...' : '⚡ Calculate My Score →'}
            </NeonButton>
          ) : (
            <NeonButton
              variant="cyan"
              onClick={next}
              disabled={!selections[current.key]}
            >
              Next <ChevronRight size={14} style={{ display: 'inline' }} />
            </NeonButton>
          )}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? '20px' : '6px',
                height: '6px',
                background: i <= step ? '#00F0FF' : 'rgba(255,255,255,0.15)',
                boxShadow: i === step ? '0 0 8px rgba(0,240,255,0.8)' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  )
}
