import { useState, useEffect } from 'react'
import type { Task, Worker } from '../../types'
import { subscribeAllTasks } from '../../services/tasks'
import { subscribeWorkers } from '../../services/workers'

interface WorkerStats {
  worker: Worker
  total: number
  completed: number
  pending: number
  acknowledged: number
  overdue: number
}

export default function PerformanceView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])

  useEffect(() => {
    const u1 = subscribeAllTasks(setTasks)
    const u2 = subscribeWorkers(setWorkers)
    return () => { u1(); u2() }
  }, [])

  const stats: WorkerStats[] = workers.map(w => {
    const wTasks = tasks.filter(t => t.assignedWorker === w.id)
    const now = new Date()
    return {
      worker: w,
      total: wTasks.length,
      completed: wTasks.filter(t => t.status === 'completed').length,
      pending: wTasks.filter(t => t.status === 'pending').length,
      acknowledged: wTasks.filter(t => t.status === 'acknowledged').length,
      overdue: wTasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < now).length,
    }
  }).sort((a, b) => b.completed - a.completed)

  return (
    <div>
      {stats.length === 0 ? (
        <div style={empty}>No workers found.</div>
      ) : (
        stats.map(s => {
          const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
          return (
            <div key={s.worker.id} className="card" style={{ marginBottom: '0.75rem' }}>
              <div style={workerHeader}>
                <div>
                  <div style={workerName}>{s.worker.name}</div>
                  <div style={workerMeta}>{s.completed}/{s.total} tasks completed</div>
                </div>
                <div style={pctLabel(pct)}>{pct}%</div>
              </div>

              <div style={barBg}>
                <div style={barFill(pct)} />
              </div>

              <div style={statsRow}>
                <Stat label="Completed" value={s.completed} color="var(--accent)" />
                <Stat label="Acknowledged" value={s.acknowledged} color="var(--yellow)" />
                <Stat label="Pending" value={s.pending} color="var(--text-muted)" />
                {s.overdue > 0 && <Stat label="Overdue" value={s.overdue} color="var(--red)" />}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 700, fontSize: '1.3rem', color }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  )
}

const empty: React.CSSProperties = { textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }
const workerHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }
const workerName: React.CSSProperties = { fontWeight: 700, fontSize: '1rem' }
const workerMeta: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }
const pctLabel = (pct: number): React.CSSProperties => ({
  fontSize: '1.5rem', fontWeight: 800,
  color: pct >= 80 ? 'var(--accent)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)',
})
const barBg: React.CSSProperties = {
  height: 8, background: 'var(--bg3)', borderRadius: 999, overflow: 'hidden', marginBottom: '0.75rem',
}
const barFill = (pct: number): React.CSSProperties => ({
  height: '100%', width: `${pct}%`,
  background: pct >= 80 ? 'var(--accent)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)',
  borderRadius: 999, transition: 'width 0.5s ease',
})
const statsRow: React.CSSProperties = {
  display: 'flex', gap: '1rem', justifyContent: 'space-around', marginTop: '0.25rem',
}
