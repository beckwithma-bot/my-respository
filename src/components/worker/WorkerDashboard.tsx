import { useState, useEffect } from 'react'
import type { Task } from '../../types'
import { subscribeWorkerTasks } from '../../services/tasks'
import { useAuth } from '../../AuthContext'
import TaskCard from './TaskCard'
import InventoryLogger from './InventoryLogger'

export default function WorkerDashboard() {
  const { user, signOut } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const workerId = user?.workerId ?? user?.uid ?? ''
    const unsub = subscribeWorkerTasks(workerId, data => {
      setTasks(data)
      setLoading(false)
    })
    return unsub
  }, [user])

  const active = tasks.filter(t => t.status !== 'completed')
  const done = tasks.filter(t => t.status === 'completed')

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={wrap}>
      <header style={header}>
        <div>
          <div style={greeting}>Hey, {user?.workerName ?? 'Worker'} 👋</div>
          <div style={date}>{today}</div>
        </div>
        <button className="btn-ghost" style={{ minHeight: 40, fontSize: '0.85rem' }} onClick={signOut}>
          Sign out
        </button>
      </header>

      <main style={main}>
        <section>
          <h2 style={sectionTitle}>
            Today's Tasks
            <span style={countBadge}>{active.length}</span>
          </h2>

          {loading ? (
            <div className="center" style={{ padding: '2rem' }}>
              <div className="spinner" />
            </div>
          ) : active.length === 0 ? (
            <div style={emptyState}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
              <div>All caught up! No active tasks.</div>
            </div>
          ) : (
            active.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </section>

        {done.length > 0 && (
          <section style={{ marginTop: '2rem' }}>
            <h2 style={{ ...sectionTitle, color: 'var(--text-muted)' }}>
              Completed Today
              <span style={{ ...countBadge, background: 'rgba(163,230,53,0.15)', color: 'var(--accent)' }}>
                {done.length}
              </span>
            </h2>
            {done.map(task => <TaskCard key={task.id} task={task} />)}
          </section>
        )}

        <InventoryLogger />
      </main>
    </div>
  )
}

const wrap: React.CSSProperties = {
  minHeight: '100%',
  background: 'var(--bg)',
  display: 'flex',
  flexDirection: 'column',
}
const header: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1.25rem 1.5rem',
  background: 'var(--bg2)',
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
}
const greeting: React.CSSProperties = { fontWeight: 700, fontSize: '1.1rem' }
const date: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-muted)' }
const main: React.CSSProperties = { padding: '1.25rem 1.5rem', maxWidth: 640, margin: '0 auto', width: '100%' }
const sectionTitle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  marginBottom: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
}
const countBadge: React.CSSProperties = {
  background: 'var(--bg3)',
  color: 'var(--text-muted)',
  borderRadius: 999,
  padding: '0.1rem 0.6rem',
  fontSize: '0.8rem',
  fontWeight: 600,
}
const emptyState: React.CSSProperties = {
  textAlign: 'center',
  color: 'var(--text-muted)',
  padding: '3rem 1rem',
  fontSize: '0.95rem',
}
