import { useState, useEffect } from 'react'
import type { Task, Worker } from '../../types'
import { subscribeAllTasks } from '../../services/tasks'
import { subscribeWorkers } from '../../services/workers'

export default function ActiveTasksView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'acknowledged'>('all')

  useEffect(() => {
    const u1 = subscribeAllTasks(setTasks)
    const u2 = subscribeWorkers(setWorkers)
    return () => { u1(); u2() }
  }, [])

  const workerName = (id: string) => workers.find(w => w.id === id)?.name ?? id

  const active = tasks.filter(t => t.status !== 'completed')
  const filtered = filter === 'all' ? active : active.filter(t => t.status === filter)

  const isOverdue = (t: Task) => new Date(t.dueDate) < new Date()

  return (
    <div>
      <div style={filterRow}>
        {(['all', 'pending', 'acknowledged'] as const).map(f => (
          <button
            key={f}
            className={filter === f ? 'btn-accent' : 'btn-ghost'}
            style={{ minHeight: 36, padding: '0.3rem 0.9rem', fontSize: '0.85rem', textTransform: 'capitalize' }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={empty}>No active tasks.</div>
      ) : (
        filtered.map(task => (
          <div key={task.id} className="card" style={{
            ...rowCard,
            borderColor: isOverdue(task) ? 'rgba(248,113,113,0.5)' : 'var(--border)',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={rowTitle}>
                {task.title}
                {isOverdue(task) && <span className="badge badge-high" style={{ marginLeft: 6 }}>overdue</span>}
              </div>
              <div style={rowMeta}>
                {workerName(task.assignedWorker)} · Due {new Date(task.dueDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
              <span className={`badge badge-${task.status}`}>{task.status}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

const filterRow: React.CSSProperties = { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }
const rowCard: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem', flexWrap: 'wrap' }
const rowTitle: React.CSSProperties = { fontWeight: 600, fontSize: '0.95rem' }
const rowMeta: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }
const empty: React.CSSProperties = { textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }
