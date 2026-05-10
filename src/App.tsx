import { useAuth } from './AuthContext'
import LoginScreen from './components/LoginScreen'
import WorkerDashboard from './components/worker/WorkerDashboard'
import OwnerDashboard from './components/owner/OwnerDashboard'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="center full-height">
        <div className="spinner" />
      </div>
    )
  }

  if (!user) return <LoginScreen />

  return user.role === 'owner' ? <OwnerDashboard /> : <WorkerDashboard />
}
