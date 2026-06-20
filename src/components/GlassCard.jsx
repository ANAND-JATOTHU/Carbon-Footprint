/**
 * GlassCard — Reusable floating glassmorphism container
 * Uses Motion (formerly Framer Motion) with spring physics.
 * Drifts upward into place on mount, glows cyan on hover.
 *
 * Props:
 *   children   – React node content
 *   className  – extra Tailwind/CSS classes
 *   glowColor  – 'cyan' | 'toxic' | 'hacker' (default: 'cyan')
 *   delay      – animation entrance delay in seconds (default: 0)
 *   style      – additional inline styles
 *   onClick    – click handler
 */

import { motion } from 'motion/react'

const GLOW_SHADOWS = {
  cyan:   '0 0 40px 4px rgba(0,240,255,0.28), 0 0 80px 8px rgba(0,240,255,0.12), 0 8px 32px rgba(0,0,0,0.45)',
  toxic:  '0 0 40px 4px rgba(57,255,20,0.28),  0 0 80px 8px rgba(57,255,20,0.12),  0 8px 32px rgba(0,0,0,0.45)',
  hacker: '0 0 40px 4px rgba(255,0,85,0.32),   0 0 80px 8px rgba(255,0,85,0.16),   0 8px 32px rgba(0,0,0,0.45)',
}

const IDLE_SHADOW = '0 8px 32px rgba(0,0,0,0.45)'

export default function GlassCard({
  children,
  className = '',
  glowColor = 'cyan',
  delay = 0,
  style = {},
  onClick,
  id,
}) {
  return (
    <motion.div
      id={id}
      onClick={onClick}
      className={`glass-card ${className}`}
      style={style}
      /* ── Entrance: drift up from 28px below, fade in ── */
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 90,
        damping: 16,
        delay,
      }}
      /* ── Hover: lift & neon glow ─────────────────── */
      whileHover={{
        y: -6,
        boxShadow: GLOW_SHADOWS[glowColor] ?? GLOW_SHADOWS.cyan,
        transition: { type: 'spring', stiffness: 200, damping: 18 },
      }}
      /* ── Default (idle) shadow ───────────────────── */
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}
