import { useState, useEffect } from 'react'
import type { Worker, Priority } from '../../types'
import { subscribeWorkers } from '../../services/workers'
import { createTask } from '../../services/tasks'
import { useAuth } from '../../AuthContext'

interface Props { onClose: () => void }

export default function CreateTaskModal({ onClose }: Props) {
  const { user } = useAuth()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedWorker: '',
    priority: 'medium' as Priority,
    dueDate: '',
  })

  useEffect(() => subscribeWorkers(setWorkers), [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createTask(form, user?.email ?? 'Owner')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={modalHeader}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Create Task</h3>
          <button className="btn-ghost" style={{ minHeight: 36, padding: '0.3rem 0.75rem' }} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label>Title</label>
            <input value={form.title} onChange={set('title')} required placeholder="Task title" />
          </div>
          <div>
            <label>Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="What needs to be done…" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label>Assign To</label>
              <select value={form.assignedWorker} onChange={set('assignedWorker')} required>
                <option value="">Select worker…</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label>Priority</label>
              <select value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label>Due Date & Time</label>
            <input type="datetime-local" value={form.dueDate} onChange={set('dueDate')} required />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-accent" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100, padding: '1rem',
}
const modal: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  width: '100%', maxWidth: 520,
  maxHeight: '90vh',
  overflowY: 'auto',
}
const modalHeader: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid var(--border)',
}
const formStyle: React.CSSProperties = {
  padding: '1.25rem 1.5rem',
  display: 'flex', flexDirection: 'column', gap: '0.9rem',
}
