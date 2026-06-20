/**
 * TopBar — Navigation bar
 * Floating header with logo, navigation links, and auth status
 */

import { motion } from 'motion/react'
import { ShieldCheck, Zap, Activity } from 'lucide-react'

export default function TopBar({ threatCount = 0 }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 14 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: 'rgba(10,14,23,0.80)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #00F0FF22, #39FF1422)' }}
          animate={{ boxShadow: ['0 0 8px rgba(0,240,255,0.3)', '0 0 20px rgba(0,240,255,0.6)', '0 0 8px rgba(0,240,255,0.3)'] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          <Zap size={16} className="text-cyan" style={{ color: '#00F0FF' }} />
        </motion.div>
        <span
          className="text-lg font-bold tracking-widest uppercase"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00F0FF' }}
        >
          Carbon<span style={{ color: '#39FF14' }}>Zero</span>
        </span>
        <span
          className="hidden sm:block text-xs px-2 py-0.5 rounded-full font-mono"
          style={{
            border: '1px solid rgba(0,240,255,0.25)',
            color: 'rgba(0,240,255,0.7)',
            background: 'rgba(0,240,255,0.06)',
          }}
        >
          v1.0.0-alpha
        </span>
      </div>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-6">
        {['Dashboard', 'Leaderboard', 'Eco-Actions', 'About'].map((link) => (
          <motion.a
            key={link}
            href="#"
            className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Space Grotesk', sans-serif" }}
            whileHover={{ color: '#00F0FF', y: -1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {link}
          </motion.a>
        ))}
      </nav>

      {/* Status / Auth */}
      <div className="flex items-center gap-3">
        {/* Security Status Badge */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono"
          style={{
            border: threatCount > 0
              ? '1px solid rgba(255,0,85,0.4)'
              : '1px solid rgba(0,240,255,0.25)',
            background: threatCount > 0
              ? 'rgba(255,0,85,0.08)'
              : 'rgba(0,240,255,0.06)',
            color: threatCount > 0 ? '#FF0055' : '#00F0FF',
          }}
          animate={threatCount > 0 ? {
            boxShadow: ['0 0 6px rgba(255,0,85,0.3)', '0 0 18px rgba(255,0,85,0.6)', '0 0 6px rgba(255,0,85,0.3)'],
          } : {}}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          {threatCount > 0 ? (
            <Activity size={12} style={{ color: '#FF0055' }} />
          ) : (
            <ShieldCheck size={12} style={{ color: '#00F0FF' }} />
          )}
          <span>
            {threatCount > 0 ? `${threatCount} THREAT${threatCount > 1 ? 'S' : ''}` : 'SECURE'}
          </span>
        </motion.div>

        {/* User Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.20), rgba(57,255,20,0.10))',
            border: '1px solid rgba(0,240,255,0.25)',
            color: '#00F0FF',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          SP
        </div>
      </div>
    </motion.header>
  )
}
