/**
 * NeonButton — Animated action button with spring physics
 * Variants: 'cyan' | 'toxic' | 'hacker' | 'ghost'
 */

import { motion } from 'motion/react'

const VARIANTS = {
  cyan: {
    base: 'bg-transparent border border-[#00F0FF] text-[#00F0FF]',
    hover: {
      boxShadow: '0 0 20px rgba(0,240,255,0.5), 0 0 40px rgba(0,240,255,0.2)',
      backgroundColor: 'rgba(0,240,255,0.10)',
    },
  },
  toxic: {
    base: 'bg-transparent border border-[#39FF14] text-[#39FF14]',
    hover: {
      boxShadow: '0 0 20px rgba(57,255,20,0.5), 0 0 40px rgba(57,255,20,0.2)',
      backgroundColor: 'rgba(57,255,20,0.10)',
    },
  },
  hacker: {
    base: 'bg-transparent border border-[#FF0055] text-[#FF0055]',
    hover: {
      boxShadow: '0 0 20px rgba(255,0,85,0.5), 0 0 40px rgba(255,0,85,0.2)',
      backgroundColor: 'rgba(255,0,85,0.10)',
    },
  },
  ghost: {
    base: 'bg-transparent border border-white/10 text-white/60',
    hover: {
      boxShadow: '0 0 10px rgba(255,255,255,0.1)',
      backgroundColor: 'rgba(255,255,255,0.05)',
    },
  },
}

export default function NeonButton({
  children,
  variant = 'cyan',
  className = '',
  onClick,
  disabled = false,
  id,
  type = 'button',
}) {
  const v = VARIANTS[variant] ?? VARIANTS.cyan

  return (
    <motion.button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${v.base}
        font-display font-semibold tracking-wider text-sm
        px-5 py-2.5 rounded-xl
        transition-colors duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={disabled ? {} : { scale: 1.05, ...v.hover }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {children}
    </motion.button>
  )
}
