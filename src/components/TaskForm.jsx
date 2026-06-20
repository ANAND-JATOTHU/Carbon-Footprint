import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X } from 'lucide-react'
import GlassCard from './GlassCard'
import NeonButton from './NeonButton'

export default function TaskForm({ onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Home')
  const [co2, setCo2] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !co2 || isNaN(co2)) return
    onSubmit({ title, category, co2_saved: parseFloat(co2) })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-10 flex items-center justify-center p-4"
      style={{ background: 'rgba(10, 14, 23, 0.8)', backdropFilter: 'blur(8px)' }}
    >
      <GlassCard className="w-full max-w-sm p-6 relative border border-cyan-500/30">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold mb-4 font-display text-cyan glow-cyan">Log Custom Task</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Planted a tree"
              className="w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Home">Home</option>
                <option value="Transport">Transport</option>
                <option value="Diet">Diet</option>
                <option value="Energy">Energy</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">CO₂ Saved (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={co2}
                onChange={e => setCo2(e.target.value)}
                placeholder="0.0"
                className="w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          <NeonButton
            type="submit"
            variant="cyan"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Logging...' : 'Log Task'}
          </NeonButton>
        </form>
      </GlassCard>
    </motion.div>
  )
}
