import { useState, useEffect } from 'react'
import type { InventoryItem } from '../../types'
import { subscribeInventory, addInventoryItem, updateInventoryItem } from '../../services/inventory'

export default function InventoryView() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => subscribeInventory(setItems), [])

  const lowStock = items.filter(i => i.currentQuantity <= i.reorderThreshold)
  const okStock = items.filter(i => i.currentQuantity > i.reorderThreshold)

  return (
    <div>
      {lowStock.length > 0 && (
        <div style={alertBanner}>
          ⚠️ {lowStock.length} item{lowStock.length > 1 ? 's' : ''} below reorder threshold
        </div>
      )}

      <div style={sectionHeader}>
        <span style={{ fontWeight: 700 }}>All Inventory</span>
        <button className="btn-accent" style={addBtn} onClick={() => setShowAdd(true)}>+ Add Item</button>
      </div>

      {items.length === 0 ? (
        <div style={empty}>No inventory items yet.</div>
      ) : (
        [...lowStock, ...okStock].map(item => (
          <div key={item.id} className="card" style={itemCard}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={itemName}>{item.name}</div>
              <div style={itemMeta}>
                {item.supplierLocation && <span style={{ marginRight: '0.75rem' }}>📍 {item.supplierLocation}</span>}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Updated {new Date(item.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', flexShrink: 0 }}>
              <div style={quantityStyle(item)}>
                {item.currentQuantity} {item.unit}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Reorder at {item.reorderThreshold} {item.unit}
              </div>
              {item.currentQuantity <= item.reorderThreshold && (
                <span className="badge badge-high">reorder now</span>
              )}
            </div>
            <button
              className="btn-ghost"
              style={{ minHeight: 36, padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}
              onClick={() => setEditId(item.id)}
            >
              Edit
            </button>
          </div>
        ))
      )}

      {lowStock.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem', borderColor: 'rgba(251,191,36,0.3)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--yellow)' }}>🛒 Shopping List</h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {lowStock.map(item => (
              <li key={item.id} style={{ color: 'var(--text)', fontSize: '0.9rem' }}>
                <strong>{item.name}</strong> — need {item.reorderThreshold - item.currentQuantity + item.reorderThreshold} {item.unit}
                {item.supplierLocation && <span style={{ color: 'var(--text-muted)' }}> · {item.supplierLocation}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} />}
      {editId && <EditItemModal item={items.find(i => i.id === editId)!} onClose={() => setEditId(null)} />}
    </div>
  )
}

function AddItemModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', currentQuantity: '', unit: '', reorderThreshold: '', supplierLocation: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await addInventoryItem({
      name: form.name,
      currentQuantity: parseFloat(form.currentQuantity),
      unit: form.unit,
      reorderThreshold: parseFloat(form.reorderThreshold),
      supplierLocation: form.supplierLocation,
    })
    setLoading(false)
    onClose()
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={modalHeader}>
          <h3 style={{ fontWeight: 700 }}>Add Inventory Item</h3>
          <button className="btn-ghost" style={{ minHeight: 36, padding: '0.3rem 0.6rem' }} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div><label>Item Name</label><input value={form.name} onChange={set('name')} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label>Current Quantity</label><input type="number" value={form.currentQuantity} onChange={set('currentQuantity')} min="0" step="any" required /></div>
            <div><label>Unit</label><input value={form.unit} onChange={set('unit')} placeholder="lbs, oz, boxes…" required /></div>
          </div>
          <div><label>Reorder Threshold</label><input type="number" value={form.reorderThreshold} onChange={set('reorderThreshold')} min="0" step="any" required /></div>
          <div><label>Supplier / Store</label><input value={form.supplierLocation} onChange={set('supplierLocation')} placeholder="Optional" /></div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-accent" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving…' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditItemModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const [form, setForm] = useState({
    name: item.name,
    currentQuantity: String(item.currentQuantity),
    unit: item.unit,
    reorderThreshold: String(item.reorderThreshold),
    supplierLocation: item.supplierLocation,
  })
  const [loading, setLoading] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await updateInventoryItem(item.id, {
      name: form.name,
      currentQuantity: parseFloat(form.currentQuantity),
      unit: form.unit,
      reorderThreshold: parseFloat(form.reorderThreshold),
      supplierLocation: form.supplierLocation,
    })
    setLoading(false)
    onClose()
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={modalHeader}>
          <h3 style={{ fontWeight: 700 }}>Edit: {item.name}</h3>
          <button className="btn-ghost" style={{ minHeight: 36, padding: '0.3rem 0.6rem' }} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div><label>Item Name</label><input value={form.name} onChange={set('name')} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label>Current Quantity</label><input type="number" value={form.currentQuantity} onChange={set('currentQuantity')} min="0" step="any" required /></div>
            <div><label>Unit</label><input value={form.unit} onChange={set('unit')} required /></div>
          </div>
          <div><label>Reorder Threshold</label><input type="number" value={form.reorderThreshold} onChange={set('reorderThreshold')} min="0" step="any" required /></div>
          <div><label>Supplier / Store</label><input value={form.supplierLocation} onChange={set('supplierLocation')} /></div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-accent" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const quantityStyle = (item: InventoryItem): React.CSSProperties => ({
  fontWeight: 700, fontSize: '1rem',
  color: item.currentQuantity <= item.reorderThreshold ? 'var(--red)' : 'var(--accent)',
})
const alertBanner: React.CSSProperties = {
  background: 'rgba(248,113,113,0.1)',
  border: '1px solid rgba(248,113,113,0.3)',
  color: 'var(--red)',
  borderRadius: 8, padding: '0.7rem 1rem',
  marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600,
}
const sectionHeader: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem',
}
const addBtn: React.CSSProperties = { minHeight: 36, padding: '0.3rem 0.9rem', fontSize: '0.85rem' }
const itemCard: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem', flexWrap: 'wrap' }
const itemName: React.CSSProperties = { fontWeight: 600, fontSize: '0.95rem' }
const itemMeta: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }
const empty: React.CSSProperties = { textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }
const modal: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }
const modalHeader: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }
const formStyle: React.CSSProperties = { padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }
