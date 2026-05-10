import { collection, onSnapshot, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { Worker } from '../types'

function fromDoc(d: { id: string; data: () => Record<string, unknown> }): Worker {
  const data = d.data()
  return {
    id: d.id,
    name: data.name as string,
    phone: data.phone as string,
    fcmToken: data.fcmToken as string | undefined,
    taskIds: (data.taskIds as string[]) || [],
  }
}

export function subscribeWorkers(cb: (workers: Worker[]) => void) {
  const q = query(collection(db, 'workers'), orderBy('name', 'asc'))
  return onSnapshot(q, snap => cb(snap.docs.map(fromDoc)))
}

export async function getWorker(workerId: string): Promise<Worker | null> {
  const snap = await getDoc(doc(db, 'workers', workerId))
  if (!snap.exists()) return null
  return fromDoc(snap)
}

export async function upsertWorker(worker: Worker) {
  await setDoc(doc(db, 'workers', worker.id), {
    name: worker.name,
    phone: worker.phone,
    fcmToken: worker.fcmToken ?? null,
    taskIds: worker.taskIds,
  }, { merge: true })
}
