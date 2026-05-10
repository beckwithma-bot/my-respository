import { useState } from 'react'
import { useAuth } from '../AuthContext'

export default function LoginScreen() {
  const { signIn, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (resetMode) {
        await resetPassword(email)
        setResetSent(true)
      } else {
        await signIn(email, password)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.box}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⚡</span>
          <span style={styles.logoText}>TaskFlow</span>
        </div>

        {resetSent ? (
          <div style={styles.successMsg}>
            Password reset email sent. Check your inbox.
            <button className="btn-ghost" style={{ marginTop: '1rem', width: '100%' }}
              onClick={() => { setResetSent(false); setResetMode(false) }}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h2 style={styles.title}>{resetMode ? 'Reset Password' : 'Sign In'}</h2>
            {error && <div style={styles.error}>{error}</div>}
            <div style={styles.field}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            {!resetMode && (
              <div style={styles.field}>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            )}
            <button
              type="submit"
              className="btn-accent"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Please wait…' : resetMode ? 'Send Reset Email' : 'Sign In'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.875rem', minHeight: 40 }}
              onClick={() => { setResetMode(!resetMode); setError('') }}
            >
              {resetMode ? 'Back to login' : 'Forgot password?'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    background: 'var(--bg)',
  },
  box: {
    width: '100%',
    maxWidth: 400,
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '2rem',
    boxShadow: 'var(--shadow)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.75rem',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: '2rem' },
  logoText: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--accent)',
    letterSpacing: '-0.03em',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '1.25rem',
    textAlign: 'center',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' },
  error: {
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)',
    color: 'var(--red)',
    borderRadius: 8,
    padding: '0.6rem 0.9rem',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  successMsg: {
    color: 'var(--accent)',
    textAlign: 'center',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
}
