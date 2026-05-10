import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Task, Priority } from '../types'
import { logActivity } from './activity'

function fromDoc(d: { id: string; data: () => Record<string, unknown> }): Task {
  const data = d.data()
  return {
    id: d.id,
    title: data.title as string,
    description: data.description as string,
    assignedWorker: data.assignedWorker as string,
    priority: data.priority as Priority,
    dueDate: data.dueDate as string,
    status: data.status as Task['status'],
    completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate().toISOString() : undefined,
    acknowledgedAt: data.acknowledgedAt ? (data.acknowledgedAt as Timestamp).toDate().toISOString() : undefined,
    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
  }
}

export function subscribeWorkerTasks(workerId: string, cb: (tasks: Task[]) => void) {
  const q = query(
    collection(db, 'tasks'),
    where('assignedWorker', '==', workerId),
    orderBy('dueDate', 'asc'),
  )
  return onSnapshot(q, snap => cb(snap.docs.map(fromDoc)))
}

export function subscribeAllTasks(cb: (tasks: Task[]) => void) {
  const q = query(collection(db, 'tasks'), orderBy('dueDate', 'asc'))
  return onSnapshot(q, snap => cb(snap.docs.map(fromDoc)))
}

export async function createTask(
  data: Omit<Task, 'id' | 'createdAt' | 'status' | 'completedAt' | 'acknowledgedAt'>,
  ownerName: string,
) {
  const ref = await addDoc(collection(db, 'tasks'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  await logActivity('system', ownerName, 'task_created', `Created task: ${data.title}`)
  return ref.id
}

export async function acknowledgeTask(taskId: string, workerId: string, workerName: string) {
  await updateDoc(doc(db, 'tasks', taskId), {
    status: 'acknowledged',
    acknowledgedAt: serverTimestamp(),
  })
  await logActivity(workerId, workerName, 'task_acknowledged', `Acknowledged task ${taskId}`)
}

export async function completeTask(taskId: string, workerId: string, workerName: string, title: string) {
  await updateDoc(doc(db, 'tasks', taskId), {
    status: 'completed',
    completedAt: serverTimestamp(),
  })
  await logActivity(workerId, workerName, 'task_completed', `Completed task: ${title}`)
}
