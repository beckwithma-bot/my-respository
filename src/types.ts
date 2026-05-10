export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'acknowledged' | 'completed'

export interface Task {
  id: string
  title: string
  description: string
  assignedWorker: string
  priority: Priority
  dueDate: string
  status: TaskStatus
  completedAt?: string
  createdAt: string
  acknowledgedAt?: string
}

export interface Worker {
  id: string
  name: string
  phone: string
  fcmToken?: string
  taskIds: string[]
}

export interface InventoryItem {
  id: string
  name: string
  currentQuantity: number
  unit: string
  reorderThreshold: number
  supplierLocation: string
  lastUpdated: string
}

export interface ActivityLog {
  id: string
  workerId: string
  workerName: string
  action: string
  details: string
  timestamp: string
}

export interface User {
  uid: string
  email: string
  role: 'owner' | 'worker'
  workerId?: string
  workerName?: string
}
