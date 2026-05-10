import { collection, addDoc, onSnapshot, query, orderBy, limit, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { ActivityLog } from '../types'

export async function logActivity(
  workerId: string,
  workerName: string,
  action: string,
  details: string,
) {
  await addDoc(collection(db, 'activityLogs'), {
    workerId,
    workerName,
    action,
    details,
    timestamp: new Date().toISOString(),
  })
}

export function subscribeActivityLogs(cb: (logs: ActivityLog[]) => void, maxEntries = 100) {
  const q = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(maxEntries))
  return onSnapshot(q, snap => {
    cb(
      snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          workerId: data.workerId as string,
          workerName: data.workerName as string,
          action: data.action as string,
          details: data.details as string,
          timestamp: data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toISOString()
            : (data.timestamp as string),
        }
      }),
    )
  })
}
