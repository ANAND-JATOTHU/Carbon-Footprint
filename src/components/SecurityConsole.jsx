/**
 * SecurityConsole — Right panel: live threat monitoring terminal
 * Simulates streaming security log output with color-coded events.
 * "Simulate Spam" button triggers shake + hacker-pink alerts.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'motion/react'
import { Terminal, Shield, AlertTriangle, CheckCircle, Wifi, Lock } from 'lucide-react'
import GlassCard from './GlassCard'
import NeonButton from './NeonButton'

/* ── Log types & styling ──────────────────────────────── */
const LOG_STYLES = {
  AUTH:    { color: '#00F0FF', icon: Lock,          label: 'AUTH' },
  INFO:    { color: 'rgba(255,255,255,0.5)', icon: CheckCircle, label: 'INFO' },
  RATE:    { color: '#FF0055', icon: AlertTriangle,  label: 'RATE_LIMIT' },
  BLOCK:   { color: '#FF0055', icon: Shield,         label: 'BLOCKED' },
  ACTION:  { color: '#39FF14', icon: CheckCircle,    label: 'ACTION' },
  CONNECT: { color: '#a855f7', icon: Wifi,           label: 'SOCKET' },
}

/* ── Initial boot logs ────────────────────────────────── */
const BOOT_SEQUENCE = [
  { type: 'INFO',    msg: 'CarbonZero Security Middleware v1.0.0 initialized.' },
  { type: 'INFO',    msg: 'Rate-limiter: sliding-window 5req/min per IP active.' },
  { type: 'INFO',    msg: 'Anomaly filter: max 50kg CO₂ per transaction enforced.' },
  { type: 'AUTH',    msg: 'JWT validated. Session: SolarPanda_4021 · exp 24h.' },
  { type: 'CONNECT', msg: 'WebSocket relay established. Streaming telemetry...' },
]

/* ── Random live log generators ───────────────────────── */
const LIVE_TEMPLATES = [
  () => ({ type: 'AUTH',   msg: `JWT validated: ${randomAlias()} · req_id=${randomHex(6)}` }),
  () => ({ type: 'ACTION', msg: `Action logged: line-dry-laundry · −0.8kg · ${randomAlias()}` }),
  () => ({ type: 'ACTION', msg: `Action logged: plant-based-meal · −1.5kg · ${randomAlias()}` }),
  () => ({ type: 'INFO',   msg: `Leaderboard sync: 1,247 entries aggregated.` }),
  () => ({ type: 'AUTH',   msg: `Token refresh: ${randomAlias()} · new_exp=+24h` }),
  () => ({ type: 'INFO',   msg: `Payload OK: 3.14 MTCO₂e · within bounds.` }),
]

const SPAM_TEMPLATES = [
  () => ({ type: 'RATE',  msg: `RATE_LIMIT exceeded: IP 185.220.101.${rnd(1,254)} · 6req/min → 429` }),
  () => ({ type: 'BLOCK', msg: `BLOCKED: anomaly score 99.8kg > 50kg threshold. Payload rejected.` }),
  () => ({ type: 'RATE',  msg: `RATE_LIMIT: automated script detected. IP blacklisted 60s.` }),
  () => ({ type: 'BLOCK', msg: `BLOCKED: JWT signature mismatch · forged token discarded.` }),
  () => ({ type: 'RATE',  msg: `RATE_LIMIT: burst ${rnd(8,20)}req/min · sliding window exceeded.` }),
]

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randomHex(n) { return [...Array(n)].map(() => Math.floor(Math.random()*16).toString(16)).join('') }
const ALIASES = ['EcoWarrior_99', 'SolarPanda_4021', 'GreenNova_711', 'CarbonZero_X', 'LeafRider_303', 'TerraVoid_88']
function randomAlias() { return ALIASES[rnd(0, ALIASES.length - 1)] }

let _logId = 100
function makeLog(entry) {
  return { ...entry, id: ++_logId, ts: new Date().toISOString().slice(11, 23) }
}

/* ── Component ────────────────────────────────────────── */
export default function SecurityConsole({ externalLog }) {
  const [logs, setLogs] = useState(() => BOOT_SEQUENCE.map(makeLog))
  const [isSpamming, setIsSpamming] = useState(false)
  const [threatCount, setThreatCount] = useState(0)
  const scrollRef = useRef(null)
  const controls = useAnimation()
  const spamRef = useRef(null)
  const liveRef = useRef(null)

  /* Auto-scroll to bottom when new logs arrive */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  /* Inject external log (from eco-action) */
  useEffect(() => {
    if (!externalLog) return
    setLogs(prev => [...prev.slice(-80), makeLog({
      type: 'ACTION',
      msg: `Action logged: "${externalLog.title}" · −${externalLog.reduction}kg CO₂ · SolarPanda_4021`,
    })])
  }, [externalLog])

  /* Live ambient log stream */
  useEffect(() => {
    liveRef.current = setInterval(() => {
      if (!isSpamming) {
        const template = LIVE_TEMPLATES[rnd(0, LIVE_TEMPLATES.length - 1)]
        setLogs(prev => [...prev.slice(-80), makeLog(template())])
      }
    }, 3500)
    return () => clearInterval(liveRef.current)
  }, [isSpamming])

  /* Spam simulation */
  const triggerSpam = useCallback(async () => {
    if (isSpamming) return
    setIsSpamming(true)
    let count = 0

    // Shake animation
    await controls.start({
      x: [0, -6, 6, -5, 5, -3, 3, 0],
      transition: { duration: 0.5 },
    })

    spamRef.current = setInterval(() => {
      const template = SPAM_TEMPLATES[rnd(0, SPAM_TEMPLATES.length - 1)]
      setLogs(prev => [...prev.slice(-80), makeLog(template())])
      setThreatCount(t => t + 1)
      count++
      if (count >= 8) {
        clearInterval(spamRef.current)
        setIsSpamming(false)
      }
    }, 380)
  }, [isSpamming, controls])

  /* Cleanup */
  useEffect(() => () => {
    clearInterval(spamRef.current)
    clearInterval(liveRef.current)
  }, [])

  return (
    <motion.div animate={controls} className="flex flex-col gap-5 h-full">
      {/* ── Stats Row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Requests Blocked', value: threatCount, color: '#FF0055', icon: Shield },
          { label: 'JWT Validations',  value: logs.filter(l => l.type === 'AUTH').length, color: '#00F0FF', icon: Lock },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <GlassCard key={s.label} delay={0.15 + i * 0.08} glowColor={i === 0 ? 'hacker' : 'cyan'} className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} style={{ color: s.color }} />
                <span className="text-xs font-mono uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {s.label}
                </span>
              </div>
              <motion.p
                key={s.value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold font-mono"
                style={{ color: s.color, textShadow: `0 0 18px ${s.color}80` }}
              >
                {s.value}
              </motion.p>
            </GlassCard>
          )
        })}
      </div>

      {/* ── Terminal ──────────────────────────────────── */}
      <GlassCard
        delay={0.25}
        glowColor={isSpamming ? 'hacker' : 'cyan'}
        className="flex flex-col flex-1 overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* Terminal header bar */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: '#FF0055' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#39FF14' }} />
            </div>
            <Terminal size={13} style={{ color: 'rgba(0,240,255,0.6)' }} />
            <span
              className="text-xs font-mono uppercase tracking-widest"
              style={{ color: 'rgba(0,240,255,0.6)' }}
            >
              security.console — live feed
            </span>
          </div>
          <motion.div
            className="flex items-center gap-1.5"
            animate={isSpamming ? {
              opacity: [1, 0.4, 1],
            } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isSpamming ? '#FF0055' : '#39FF14',
                boxShadow: isSpamming
                  ? '0 0 8px rgba(255,0,85,0.9)'
                  : '0 0 8px rgba(57,255,20,0.9)',
              }}
            />
            <span
              className="text-xs font-mono"
              style={{ color: isSpamming ? '#FF0055' : '#39FF14' }}
            >
              {isSpamming ? 'THREAT DETECTED' : 'ONLINE'}
            </span>
          </motion.div>
        </div>

        {/* Log viewport */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-xs"
          style={{ scrollBehavior: 'smooth' }}
        >
          <AnimatePresence initial={false}>
            {logs.map((log) => {
              const style = LOG_STYLES[log.type] ?? LOG_STYLES.INFO
              const Icon = style.icon
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 8, x: -4 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  className="flex items-start gap-2 mb-1.5 leading-relaxed"
                >
                  <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                    {log.ts}
                  </span>
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      background: `${style.color}15`,
                      border: `1px solid ${style.color}30`,
                      color: style.color,
                      fontSize: '10px',
                      lineHeight: 1,
                    }}
                  >
                    <Icon size={9} />
                    {style.label}
                  </span>
                  <span
                    style={{
                      color: (log.type === 'RATE' || log.type === 'BLOCK')
                        ? 'rgba(255,0,85,0.85)'
                        : log.type === 'ACTION'
                        ? 'rgba(57,255,20,0.85)'
                        : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {log.msg}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Blinking cursor */}
          <span
            className="inline-block w-2 h-4 ml-1 animate-blink"
            style={{ background: '#00F0FF', opacity: 0.7, verticalAlign: 'middle' }}
          />
        </div>

        {/* Control bar */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span
            className="text-xs font-mono"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            {logs.length} events · sliding-window active
          </span>
          <NeonButton
            id="simulate-spam-btn"
            variant={isSpamming ? 'hacker' : 'ghost'}
            className="text-xs"
            onClick={triggerSpam}
            disabled={isSpamming}
          >
            {isSpamming ? '⚡ Simulating...' : '⚡ Simulate Spam'}
          </NeonButton>
        </div>
      </GlassCard>

      {/* ── Leaderboard Sneak Peek ────────────────────── */}
      <GlassCard delay={0.35} glowColor="toxic" className="p-4">
        <p
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: 'rgba(57,255,20,0.7)' }}
        >
          Global Leaderboard — Top 5
        </p>
        {[
          { name: 'SolarPanda_4021', score: 2.1, rank: 1 },
          { name: 'EcoWarrior_99',   score: 3.4, rank: 2 },
          { name: 'GreenNova_711',   score: 4.2, rank: 3 },
          { name: 'CarbonZero_X',    score: 5.1, rank: 4 },
          { name: 'LeafRider_303',   score: 6.0, rank: 5 },
        ].map((user, i) => (
          <motion.div
            key={user.name}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.06, type: 'spring', stiffness: 120, damping: 14 }}
            className="flex items-center gap-3 py-1.5"
            style={{
              borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            <span
              className="text-xs font-bold font-mono w-5 text-center"
              style={{ color: i === 0 ? '#39FF14' : 'rgba(255,255,255,0.3)' }}
            >
              #{user.rank}
            </span>
            <span
              className="flex-1 text-xs"
              style={{
                color: i === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                fontFamily: "'Roboto Mono', monospace",
              }}
            >
              {user.name}
            </span>
            <span
              className="text-xs font-mono"
              style={{ color: i === 0 ? '#39FF14' : 'rgba(255,255,255,0.35)' }}
            >
              {user.score.toFixed(1)}t
            </span>
          </motion.div>
        ))}
      </GlassCard>
    </motion.div>
  )
}
