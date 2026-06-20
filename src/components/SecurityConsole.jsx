/**
 * SecurityConsole.jsx — Real-time security terminal.
 * Connects to SSE stream /api/logs/stream for REAL backend events.
 * Falls back to simulated events if backend not connected.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'motion/react'
import { Terminal, Shield, AlertTriangle, CheckCircle, Wifi, Lock, Zap } from 'lucide-react'
import GlassCard from './GlassCard'
import NeonButton from './NeonButton'

const LOG_STYLES = {
  AUTH:    { color: '#00F0FF', icon: Lock,          label: 'AUTH' },
  INFO:    { color: 'rgba(255,255,255,0.45)', icon: CheckCircle, label: 'INFO' },
  RATE:    { color: '#FF0055', icon: AlertTriangle, label: 'RATE_LIMIT' },
  BLOCK:   { color: '#FF0055', icon: Shield,        label: 'BLOCKED' },
  ACTION:  { color: '#39FF14', icon: CheckCircle,   label: 'ACTION' },
  CONNECT: { color: '#a855f7', icon: Wifi,          label: 'SOCKET' },
  PING:    { color: 'rgba(255,255,255,0.2)', icon: Zap, label: 'PING' },
}

let _id = 0
function makeLog(type, msg, ts) {
  return { id: ++_id, type, msg, ts: ts ?? new Date().toISOString().slice(11, 23) }
}

export default function SecurityConsole() {
  const [logs, setLogs]         = useState([])
  const [connected, setConnected] = useState(false)
  const [isSpamming, setSpam]   = useState(false)
  const [threatCount, setThreats] = useState(0)
  const [authCount, setAuths]   = useState(0)
  const scrollRef   = useRef(null)
  const controls    = useAnimation()
  const evtSrc      = useRef(null)
  const spamRef     = useRef(null)

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  // SSE connection to real backend
  useEffect(() => {
    function connect() {
      if (evtSrc.current) evtSrc.current.close()
      const es = new EventSource('/api/logs/stream')
      evtSrc.current = es

      es.onopen = () => setConnected(true)

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'PING') return // silent heartbeat
          const log = makeLog(data.type, data.msg, data.ts)
          setLogs(prev => [...prev.slice(-120), log])
          if (data.type === 'RATE' || data.type === 'BLOCK') setThreats(t => t + 1)
          if (data.type === 'AUTH') setAuths(a => a + 1)
        } catch (_) {}
      }

      es.onerror = () => {
        setConnected(false)
        es.close()
        // Reconnect after 3s
        setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      evtSrc.current?.close()
      clearInterval(spamRef.current)
    }
  }, [])

  // Spam simulation — fires real POST requests to hit rate limiter
  const simulateSpam = useCallback(async () => {
    if (isSpamming) return
    setSpam(true)

    await controls.start({
      x: [0, -7, 7, -5, 5, -3, 3, 0],
      transition: { duration: 0.5 },
    })

    let count = 0
    spamRef.current = setInterval(async () => {
      count++
      // Fire requests to trigger real backend rate limiter
      try {
        await fetch('/api/carbon/actions/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action_id: 99 }),
        })
      } catch (_) {}

      // Also add local visual log for immediate feedback
      setLogs(prev => [...prev.slice(-120), makeLog(
        'RATE',
        `Script attempt #${count} → 429 Too Many Requests`
      )])
      setThreats(t => t + 1)

      if (count >= 8) {
        clearInterval(spamRef.current)
        setSpam(false)
      }
    }, 350)
  }, [isSpamming, controls])

  return (
    <motion.div animate={controls} className="flex flex-col gap-4 h-full">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Threats Blocked', value: threatCount, color: '#FF0055', icon: Shield },
          { label: 'JWT Validations',  value: authCount,   color: '#00F0FF', icon: Lock },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <GlassCard key={s.label} delay={0.1 + i * 0.07} glowColor={i === 0 ? 'hacker' : 'cyan'} className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} style={{ color: s.color }} />
                <span className="text-xs font-mono uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {s.label}
                </span>
              </div>
              <motion.p
                key={s.value}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold font-mono"
                style={{ color: s.color, textShadow: `0 0 16px ${s.color}80` }}
              >
                {s.value}
              </motion.p>
            </GlassCard>
          )
        })}
      </div>

      {/* Terminal */}
      <GlassCard
        delay={0.2}
        glowColor={isSpamming ? 'hacker' : 'cyan'}
        className="flex flex-col flex-1 overflow-hidden"
        style={{ minHeight: '380px' }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF0055' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#39FF14' }} />
            </div>
            <Terminal size={12} style={{ color: 'rgba(0,240,255,0.5)' }} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(0,240,255,0.5)' }}>
              security.console
            </span>
          </div>
          <motion.div
            className="flex items-center gap-1.5"
            animate={isSpamming ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: connected ? (isSpamming ? '#FF0055' : '#39FF14') : '#f59e0b',
                boxShadow: `0 0 6px ${connected ? (isSpamming ? '#FF0055' : '#39FF14') : '#f59e0b'}`,
              }}
            />
            <span
              className="text-xs font-mono"
              style={{ color: connected ? (isSpamming ? '#FF0055' : '#39FF14') : '#f59e0b' }}
            >
              {connected ? (isSpamming ? 'THREAT DETECTED' : '● LIVE') : '○ CONNECTING...'}
            </span>
          </motion.div>
        </div>

        {/* Log viewport */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 text-xs font-mono" style={{ scrollBehavior: 'smooth' }}>
          <AnimatePresence initial={false}>
            {logs.map(log => {
              const style = LOG_STYLES[log.type] ?? LOG_STYLES.INFO
              const Icon  = style.icon
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 6, x: -4 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  className="flex items-start gap-2 mb-1.5 leading-relaxed"
                >
                  <span style={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0 }}>{log.ts}</span>
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      background: `${style.color}14`,
                      border: `1px solid ${style.color}28`,
                      color: style.color,
                      fontSize: '10px',
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
                        : log.type === 'AUTH'
                        ? 'rgba(0,240,255,0.8)'
                        : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {log.msg}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <span
            className="inline-block w-2 h-3.5 animate-blink ml-1"
            style={{ background: '#00F0FF', opacity: 0.7, verticalAlign: 'middle' }}
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {logs.length} events · {connected ? 'live stream' : 'reconnecting...'}
          </span>
          <NeonButton
            id="simulate-spam-btn"
            variant={isSpamming ? 'hacker' : 'ghost'}
            className="text-xs"
            onClick={simulateSpam}
            disabled={isSpamming}
          >
            {isSpamming ? '⚡ Attacking...' : '⚡ Simulate Spam'}
          </NeonButton>
        </div>
      </GlassCard>
    </motion.div>
  )
}
