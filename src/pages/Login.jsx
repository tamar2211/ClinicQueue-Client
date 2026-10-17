import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api, errorText } from '../api'
import { useAuth } from '../auth'
import { Alert, Field, Logo } from '../components'

const DEMO = [
  { label: 'כניסה כמטופל (דמו)', email: 'patient@clinic.com' },
  { label: 'כניסה כמנהל (דמו)', email: 'admin@clinic.com' },
]
const DEMO_PASSWORD = 'Demo1234!'

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(credentials, isRegister) {
    setError('')
    setBusy(true)
    try {
      const res = isRegister ? await api.register(credentials) : await api.login(credentials)
      signIn(res)
      navigate('/', { replace: true })
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const isRegister = mode === 'register'
    submit(isRegister ? form : { email: form.email, password: form.password }, isRegister)
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <Logo big />
        <h1>הזמנת תור אונליין, בקליק.</h1>
        <ul className="perks">
          <li>אישור מיידי</li>
          <li>ביטול עד 24 שעות לפני התור</li>
          <li>רופאים מכל התחומים</li>
        </ul>
      </div>

      <div className="auth-card">
        <div className="tabs">
          <button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>התחברות</button>
          <button className={mode === 'register' ? 'on' : ''} onClick={() => setMode('register')}>הרשמה</button>
        </div>

        <form onSubmit={onSubmit} noValidate>
          {mode === 'register' && (
            <>
              <Field label="שם מלא"><input value={form.fullName} onChange={set('fullName')} autoComplete="name" /></Field>
              <Field label="טלפון"><input value={form.phone} onChange={set('phone')} placeholder="050-1234567" inputMode="tel" dir="ltr" /></Field>
            </>
          )}
          <Field label="אימייל"><input type="email" value={form.email} onChange={set('email')} autoComplete="email" dir="ltr" /></Field>
          <Field label="סיסמה"><input type="password" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} dir="ltr" /></Field>

          <Alert>{error}</Alert>
          <button className="btn primary wide" disabled={busy}>{mode === 'login' ? 'התחבר' : 'הרשם'}</button>
        </form>

        <div className="demo">
          <span>כניסה מהירה לבדיקת המערכת</span>
          {DEMO.map((d) => (
            <button key={d.email} className="btn-outline wide" disabled={busy}
              onClick={() => submit({ email: d.email, password: DEMO_PASSWORD }, false)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
