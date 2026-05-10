import { useState } from 'react'
import type { Task } from '../../types'
import { acknowledgeTask, completeTask } from '../../services/tasks'
import { useAuth } from '../../AuthContext'

interface Props { task: Task }

export default function TaskCard({ task }: Props) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState<'ack' | 'done' | null>(null)

  const workerId = user?.workerId ?? user?.uid ?? ''
  const workerName = user?.workerName ?? user?.email ?? ''

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed'

  const handleAck = async () => {
    setLoading('ack')
    await acknowledgeTask(task.id, workerId, workerName)
    setLoading(null)
  }

  const handleComplete = async () => {
    setLoading('done')
    await completeTask(task.id, workerId, workerName, task.title)
    setLoading(null)
  }

  const formatDue = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className="card"
      style={{
        ...cardStyle,
        borderColor: isOverdue ? 'rgba(248,113,113,0.5)' : task.status === 'completed' ? 'rgba(163,230,53,0.3)' : 'var(--border)',
      }}
    >
      <div style={headerStyle} onClick={() => setExpanded(e => !e)} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setExpanded(v => !v)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={titleStyle}>{task.title}</span>
            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            <span className={`badge badge-${task.status}`}>{task.status}</span>
            {isOverdue && <span className="badge badge-high">overdue</span>}
          </div>
          <div style={dueStyle}>
            Due: {formatDue(task.dueDate)}
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div style={expandedStyle}>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
            {task.description}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {task.status === 'pending' && (
              <button
                className="btn-ghost"
                style={{ flex: 1, minWidth: 120 }}
                onClick={handleAck}
                disabled={loading !== null}
              >
                {loading === 'ack' ? '…' : 'Acknowledge'}
              </button>
            )}
            {task.status !== 'completed' && (
              <button
                className="btn-accent"
                style={{ flex: 1, minWidth: 120 }}
                onClick={handleComplete}
                disabled={loading !== null}
              >
                {loading === 'done' ? '…' : 'Mark Complete'}
              </button>
            )}
            {task.status === 'completed' && (
              <div style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                ✓ Completed {task.completedAt ? formatDue(task.completedAt) : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  marginBottom: '0.75rem',
  transition: 'border-color 0.2s',
}
const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  cursor: 'pointer',
  userSelect: 'none',
}
const titleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '1rem',
}
const dueStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  marginTop: '0.25rem',
}
const expandedStyle: React.CSSProperties = {
  marginTop: '1rem',
  paddingTop: '1rem',
  borderTop: '1px solid var(--border)',
}
