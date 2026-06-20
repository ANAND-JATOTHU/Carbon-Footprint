/**
 * AboutPage.jsx — Project explainer page.
 */
import { motion } from 'motion/react'
import { Shield, Zap, Globe, Lock, BarChart2, Users } from 'lucide-react'
import GlassCard from '../components/GlassCard'

const FEATURES = [
  {
    icon: Lock,
    color: '#00F0FF',
    title: 'Zero-Knowledge Privacy',
    desc: 'Your diet, commute, and home data never leaves your browser. Only your calculated CO₂ score is sent to the server — making this genuinely private.',
  },
  {
    icon: Shield,
    color: '#FF0055',
    title: 'Real-Time Anti-Cheat',
    desc: 'A live security terminal streams actual backend events: JWT validations, rate limit triggers, and anomaly detections — all happening in real time.',
  },
  {
    icon: BarChart2,
    color: '#39FF14',
    title: 'IPCC-Based Calculations',
    desc: 'Every CO₂ estimate uses emission factors derived from IPCC and EPA greenhouse gas equivalency tables, not guesswork.',
  },
  {
    icon: Users,
    color: '#a855f7',
    title: 'Anonymous Leaderboard',
    desc: 'Compete globally with auto-generated pseudonyms (like "SolarHawk_4021"). No real names, no emails, no personal data — ever visible publicly.',
  },
  {
    icon: Zap,
    color: '#f59e0b',
    title: '60-Second Onboarding',
    desc: 'Three questions. That\'s all. No account required to see your score. No utility bills, no exact mileage, no friction.',
  },
  {
    icon: Globe,
    color: '#00F0FF',
    title: 'Scales to 100k+ Users',
    desc: 'Deployed on Google Cloud Run: serverless, scales to zero when idle (~$0/month), auto-scales to 20+ instances under load.',
  },
]

const STACK = [
  { label: 'Frontend', value: 'React 19 + Vite 8' },
  { label: 'Styling', value: 'Tailwind CSS v4' },
  { label: 'Animation', value: 'Motion v12 (spring physics)' },
  { label: 'Charts', value: 'Recharts v3' },
  { label: 'Backend', value: 'Python FastAPI + uvicorn' },
  { label: 'Auth', value: 'JWT (python-jose + bcrypt)' },
  { label: 'Database', value: 'SQLite (aiosqlite)' },
  { label: 'Real-time', value: 'Server-Sent Events (SSE)' },
  { label: 'Deployment', value: 'Google Cloud Run' },
  { label: 'Rate Limiting', value: 'slowapi sliding-window' },
]

export default function AboutPage() {
  return (
    <div className="min-h-dvh pt-20 px-4 pb-12 md:px-6 lg:px-8" style={{ background: '#0A0E17' }}>
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.12), rgba(57,255,20,0.08))',
              border: '1px solid rgba(0,240,255,0.2)',
            }}
          >
            <Zap size={28} style={{ color: '#00F0FF' }} />
          </div>
          <h1
            className="text-4xl font-bold mb-3"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #00F0FF 30%, #39FF14 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            What is CarbonZero?
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            A privacy-first platform for tracking your personal carbon footprint — with real security monitoring, 
            a gamified global leaderboard, and zero data surveillance.
          </p>
        </motion.div>

        {/* How it works */}
        <GlassCard delay={0.1} glowColor="cyan" className="p-6 mb-6">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'rgba(0,240,255,0.6)' }}>
            How It Works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Answer 3 Questions', desc: 'Diet, transport, and home type — processed entirely in your browser.' },
              { step: '02', title: 'Get Your CO₂ Score', desc: 'IPCC-based emission factors calculate your annual footprint in real time.' },
              { step: '03', title: 'Compete & Improve', desc: 'Your anonymous rank appears on the global leaderboard. Log daily eco-actions to climb.' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="text-xs font-mono font-bold mb-2"
                  style={{ color: '#00F0FF', letterSpacing: '2px' }}
                >
                  {s.step}
                </div>
                <p className="font-semibold text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>
                  {s.title}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <GlassCard key={f.title} delay={0.15 + i * 0.06} glowColor="cyan" className="p-5">
                <div className="flex gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                  >
                    <Icon size={16} style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>
                      {f.title}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Tech stack */}
        <GlassCard delay={0.3} glowColor="toxic" className="p-6">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'rgba(57,255,20,0.6)' }}>
            Technology Stack
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {STACK.map(s => (
              <div key={s.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: '#39FF14', fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Security note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-xl text-center"
          style={{
            background: 'rgba(255,0,85,0.04)',
            border: '1px solid rgba(255,0,85,0.15)',
          }}
        >
          <p className="text-xs font-mono" style={{ color: 'rgba(255,0,85,0.6)' }}>
            🛡 Security: Rate-limited (5 req/min), JWT-authenticated, anomaly-filtered (&gt;50kg CO₂/tx rejected), bcrypt passwords.
            The terminal on the Dashboard shows real backend events, not simulations.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
