import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, orderBy, serverTimestamp, Timestamp, increment,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { InventoryItem } from '../types'
import { logActivity } from './activity'

function fromDoc(d: { id: string; data: () => Record<string, unknown> }): InventoryItem {
  const data = d.data()
  return {
    id: d.id,
    name: data.name as string,
    currentQuantity: data.currentQuantity as number,
    unit: data.unit as string,
    reorderThreshold: data.reorderThreshold as number,
    supplierLocation: data.supplierLocation as string,
    lastUpdated: data.lastUpdated ? (data.lastUpdated as Timestamp).toDate().toISOString() : new Date().toISOString(),
  }
}

export function subscribeInventory(cb: (items: InventoryItem[]) => void) {
  const q = query(collection(db, 'inventory'), orderBy('name', 'asc'))
  return onSnapshot(q, snap => cb(snap.docs.map(fromDoc)))
}

export async function logInventoryUsage(
  itemId: string,
  itemName: string,
  quantity: number,
  workerId: string,
  workerName: string,
) {
  await updateDoc(doc(db, 'inventory', itemId), {
    currentQuantity: increment(-quantity),
    lastUpdated: serverTimestamp(),
  })
  await logActivity(workerId, workerName, 'inventory_logged', `Used ${quantity} of ${itemName}`)
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>) {
  await addDoc(collection(db, 'inventory'), {
    ...item,
    lastUpdated: serverTimestamp(),
  })
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
  await updateDoc(doc(db, 'inventory', id), {
    ...updates,
    lastUpdated: serverTimestamp(),
  })
}
