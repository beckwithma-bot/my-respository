import { useState, useEffect } from 'react'
import type { Task, Worker } from '../../types'
import { subscribeAllTasks } from '../../services/tasks'
import { subscribeWorkers } from '../../services/workers'

export default function CompletedTasksView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])

  useEffect(() => {
    const u1 = subscribeAllTasks(setTasks)
    const u2 = subscribeWorkers(setWorkers)
    return () => { u1(); u2() }
  }, [])

  const workerName = (id: string) => workers.find(w => w.id === id)?.name ?? id
  const completed = tasks
    .filter(t => t.status === 'completed')
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))

  const fmt = (iso?: string) => iso
    ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <div>
      <div style={headerRow}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{completed.length} completed</span>
      </div>
      {completed.length === 0 ? (
        <div style={empty}>No completed tasks yet.</div>
      ) : (
        completed.map(task => (
          <div key={task.id} className="card" style={rowCard}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={rowTitle}>{task.title}</div>
              <div style={rowMeta}>
                {workerName(task.assignedWorker)}
                {task.completedAt && <> · Completed {fmt(task.completedAt)}</>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
              <span className="badge badge-completed">done</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

const headerRow: React.CSSProperties = { marginBottom: '1rem' }
const rowCard: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem', flexWrap: 'wrap', opacity: 0.8 }
const rowTitle: React.CSSProperties = { fontWeight: 600, fontSize: '0.95rem' }
const rowMeta: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }
const empty: React.CSSProperties = { textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }
