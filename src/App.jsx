/**
 * App.jsx — Root layout for CarbonZero
 *
 * Layout:
 *   TopBar (fixed)
 *   ├── Left  (2/3): CarbonDashboard
 *   └── Right (1/3): SecurityConsole terminal
 *
 * State lifted here:
 *   - threatCount     → passed to TopBar for security badge
 *   - lastLoggedAction→ passed to SecurityConsole to stream action logs
 */

import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import TopBar from './components/TopBar'
import CarbonDashboard from './components/CarbonDashboard'
import SecurityConsole from './components/SecurityConsole'

export default function App() {
  const [threatCount, setThreatCount] = useState(0)
  const [lastLoggedAction, setLastLoggedAction] = useState(null)

  const handleActionLog = useCallback((action) => {
    // Pass action to SecurityConsole to generate an ACTION log
    setLastLoggedAction({ ...action, _ts: Date.now() })
  }, [])

  return (
    <div
      className="min-h-dvh"
      style={{ background: 'var(--color-void)' }}
    >
      {/* Fixed nav */}
      <TopBar threatCount={threatCount} />

      {/* Main content — offset for TopBar height */}
      <main
        className="pt-20 px-4 pb-6 md:px-6 lg:px-8"
        style={{ minHeight: '100dvh' }}
      >
        {/* Page heading */}
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
            Mission Control
          </h1>
          <p
            className="text-sm"
            style={{
              color: 'rgba(255,255,255,0.40)',
              fontFamily: "'Roboto Mono', monospace",
            }}
          >
            Zero-knowledge carbon tracking · Privacy-first · Anti-cheat hardened
          </p>
        </motion.div>

        {/* Two-column grid: Dashboard + Security Console */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* LEFT — Carbon Dashboard (2/3 width) */}
          <div className="lg:col-span-2">
            <CarbonDashboard onActionLog={handleActionLog} />
          </div>

          {/* RIGHT — Security Console (1/3 width) */}
          <div className="lg:col-span-1">
            <SecurityConsole
              externalLog={lastLoggedAction}
              onThreatCountChange={setThreatCount}
            />
          </div>
        </div>
      </main>

      {/* Subtle scan line overlay on the whole page */}
      <div className="scan-overlay fixed inset-0 pointer-events-none z-50" />
    </div>
  )
}
