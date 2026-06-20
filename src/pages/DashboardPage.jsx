/**
 * DashboardPage.jsx — Main mission control.
 * Shows OnboardingWizard if user hasn't submitted profile yet,
 * otherwise shows live CarbonChart + Eco-Actions + SecurityConsole.
 */
import { motion } from 'motion/react'
import { useApp } from '../context/AppContext'
import GlassCard from '../components/GlassCard'
import OnboardingWizard from '../components/OnboardingWizard'
import CarbonChart from '../components/CarbonChart'
import NeonButton from '../components/NeonButton'
import { api } from '../api/client'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { CheckCircle, Plus, Leaf, Trash2 } from 'lucide-react'
import TaskForm from '../components/TaskForm'

function UserTasksPanel() {
  const { user } = useApp()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchTasks = () => {
    api.tasks.get().then(setTasks).catch(console.error)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  async function handleCreateTask(taskData) {
    setLoading(true)
    try {
      await api.tasks.create(taskData.title, taskData.category, taskData.co2_saved)
      setShowForm(false)
      fetchTasks()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      await api.tasks.delete(taskId)
      fetchTasks()
    } catch (e) {
      console.error(e)
    }
  }

  // Calculate Today's Impact
  const today = new Date().toISOString().split('T')[0]
  const todayImpact = tasks
    .filter(t => t.logged_at.startsWith(today))
    .reduce((sum, t) => sum + t.co2_saved, 0)

  return (
    <GlassCard delay={0.35} glowColor="toxic" className="p-5 relative min-h-[300px]">
      <AnimatePresence>
        {showForm && (
          <TaskForm 
            onSubmit={handleCreateTask} 
            onCancel={() => setShowForm(false)}
            loading={loading}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(57,255,20,0.7)' }}>
            My Eco-Tasks
          </p>
          <p className="text-[10px] font-mono text-gray-400 mt-1">
            Today's Impact: <span className="text-toxic">−{todayImpact.toFixed(1)}kg CO₂</span>
          </p>
        </div>
        <NeonButton
          variant="toxic"
          className="text-xs px-3 py-1.5 flex items-center gap-1"
          onClick={() => setShowForm(true)}
        >
          <Plus size={12} /> Add Task
        </NeonButton>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-xs font-mono text-gray-500 py-4 text-center">
              No tasks logged yet. Start making an impact!
            </motion.p>
          ) : (
            tasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 130, damping: 14 }}
                className="group flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: 'rgba(57,255,20,0.06)',
                  border: '1px solid rgba(57,255,20,0.2)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(57,255,20,0.15)', border: '1px solid rgba(57,255,20,0.35)' }}>
                    <CheckCircle size={11} style={{ color: '#39FF14' }} />
                  </div>
                  <div>
                    <p className="text-sm text-white/90" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {task.title}
                    </p>
                    <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {task.category} · −{task.co2_saved}kg CO₂
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  aria-label={`Delete task ${task.title}`}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}

export default function DashboardPage() {
  const { user } = useApp()
  const hasData = user?.has_submitted

  return (
    <div className="min-h-dvh pt-20 px-4 pb-8 md:px-6 lg:px-8" style={{ background: '#0A0E17' }}>
      {/* Page title */}
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
          {hasData ? 'Mission Control' : 'Get Your Carbon Score'}
        </h1>
        <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {hasData
            ? `Welcome, ${user.display_name} · Zero-knowledge tracking active`
            : '3 questions · 60 seconds · Your data stays on your device'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!hasData ? (
          /* ── Onboarding ──────────────────────────── */
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            className="max-w-2xl mx-auto"
          >
            <OnboardingWizard />
          </motion.div>
        ) : (
          /* ── Full dashboard ──────────────────────── */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            className="max-w-4xl mx-auto flex flex-col gap-5"
          >
            {/* Charts + Actions */}
            <div className="flex flex-col gap-5">
              {/* Carbon chart */}
              <GlassCard delay={0.1} glowColor="cyan" className="p-6">
                <p className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: 'rgba(0,240,255,0.6)' }}>
                  Annual Carbon Footprint
                </p>
                <CarbonChart user={user} />
              </GlassCard>

              {/* Eco-actions */}
              <UserTasksPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
