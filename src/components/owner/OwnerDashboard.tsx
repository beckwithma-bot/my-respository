import { useState } from 'react'
import { useAuth } from '../../AuthContext'
import ActiveTasksView from './ActiveTasksView'
import CompletedTasksView from './CompletedTasksView'
import PerformanceView from './PerformanceView'
import InventoryView from './InventoryView'
import CreateTaskModal from './CreateTaskModal'

type Tab = 'active' | 'completed' | 'performance' | 'inventory'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'active', label: 'Active', icon: '⚡' },
  { id: 'completed', label: 'Done', icon: '✅' },
  { id: 'performance', label: 'Team', icon: '📊' },
  { id: 'inventory', label: 'Stock', icon: '📦' },
]

export default function OwnerDashboard() {
  const { signOut } = useAuth()
  const [tab, setTab] = useState<Tab>('active')
  const [showCreate, setShowCreate] = useState(false)

  const titles: Record<Tab, string> = {
    active: 'Active Tasks',
    completed: 'Completed Tasks',
    performance: 'Team Performance',
    inventory: 'Inventory',
  }

  return (
    <div style={wrap}>
      <header style={header}>
        <div style={headerLeft}>
          <span style={logo}>⚡ TaskFlow</span>
          <span style={ownerBadge}>Owner</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-accent"
            style={{ minHeight: 38, padding: '0.3rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => setShowCreate(true)}
          >
            + New Task
          </button>
          <button
            className="btn-ghost"
            style={{ minHeight: 38, padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </header>

      <nav style={nav}>
        {TABS.map(t => (
          <button
            key={t.id}
            style={tabBtn(tab === t.id)}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <main style={main}>
        <h2 style={pageTitle}>{titles[tab]}</h2>
        {tab === 'active' && <ActiveTasksView />}
        {tab === 'completed' && <CompletedTasksView />}
        {tab === 'performance' && <PerformanceView />}
        {tab === 'inventory' && <InventoryView />}
      </main>

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

const wrap: React.CSSProperties = { minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }
const header: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '1rem 1.5rem',
  background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
  position: 'sticky', top: 0, zIndex: 10,
}
const headerLeft: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.75rem' }
const logo: React.CSSProperties = { fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }
const ownerBadge: React.CSSProperties = {
  background: 'rgba(163,230,53,0.15)', color: 'var(--accent)',
  borderRadius: 6, padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
}
const nav: React.CSSProperties = {
  display: 'flex', background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
  overflowX: 'auto', position: 'sticky', top: 61, zIndex: 9,
}
const tabBtn = (active: boolean): React.CSSProperties => ({
  flex: 1, minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: '0.2rem', padding: '0.7rem 0.5rem', fontSize: '0.75rem', fontWeight: 600,
  background: 'transparent', borderRadius: 0, minHeight: 0,
  color: active ? 'var(--accent)' : 'var(--text-muted)',
  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
  transition: 'color 0.15s, border-color 0.15s',
})
const main: React.CSSProperties = { flex: 1, padding: '1.25rem 1.5rem', maxWidth: 900, margin: '0 auto', width: '100%' }
const pageTitle: React.CSSProperties = { fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }
