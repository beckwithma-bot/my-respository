import { useState, useEffect } from 'react'
import type { InventoryItem } from '../../types'
import { subscribeInventory, logInventoryUsage } from '../../services/inventory'
import { useAuth } from '../../AuthContext'

export default function InventoryLogger() {
  const { user } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => subscribeInventory(setItems), [])

  const selectedItem = items.find(i => i.id === selectedId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) { setError('Enter a valid quantity'); return }
    setLoading(true)
    setError('')
    try {
      await logInventoryUsage(
        selectedItem.id,
        selectedItem.name,
        qty,
        user?.workerId ?? user?.uid ?? '',
        user?.workerName ?? user?.email ?? '',
      )
      setSuccess(`Logged ${qty} ${selectedItem.unit} of ${selectedItem.name}`)
      setSelectedId('')
      setQuantity('')
      setTimeout(() => setSuccess(''), 3500)
    } catch {
      setError('Failed to log inventory. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={sectionTitle}>Log Inventory Usage</h3>

      {success && <div style={successStyle}>{success}</div>}
      {error && <div style={errorStyle}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <label>Item</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} required>
            <option value="">Select an item…</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.currentQuantity} {item.unit} available)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Quantity Used {selectedItem ? `(${selectedItem.unit})` : ''}</label>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="0"
            min="0.01"
            step="any"
            required
          />
        </div>

        <button type="submit" className="btn-accent" disabled={loading || !selectedId}>
          {loading ? 'Logging…' : 'Log Usage'}
        </button>
      </form>
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  marginBottom: '1rem',
  color: 'var(--text)',
}
const successStyle: React.CSSProperties = {
  background: 'rgba(163,230,53,0.1)',
  border: '1px solid rgba(163,230,53,0.3)',
  color: 'var(--accent)',
  borderRadius: 8,
  padding: '0.6rem 0.9rem',
  fontSize: '0.875rem',
  marginBottom: '0.75rem',
}
const errorStyle: React.CSSProperties = {
  background: 'rgba(248,113,113,0.1)',
  border: '1px solid rgba(248,113,113,0.3)',
  color: 'var(--red)',
  borderRadius: 8,
  padding: '0.6rem 0.9rem',
  fontSize: '0.875rem',
  marginBottom: '0.75rem',
}
