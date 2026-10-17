import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './auth'

export function Layout() {
  const { user, isAdmin, signOut } = useAuth()
  const { pathname } = useLocation()
  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <header className="topbar">
        <div className="bar">
          <div className="logo">דוקתור<b>'ס</b></div>
          <nav>
            {!isAdmin && <NavLink to="/" className={() => (pathname === '/' || pathname.startsWith('/doctors') ? 'active' : '')}>קביעת תור</NavLink>}
            {!isAdmin && <NavLink to="/my">התורים שלי</NavLink>}
            {isAdmin && <NavLink to="/admin">ניהול</NavLink>}
          </nav>
          <div className="me">
            <span>{user.fullName}</span>
            {isAdmin && <span className="badge">מנהל</span>}
            <button className="btn-outline" onClick={signOut}>התנתקות</button>
          </div>
        </div>
      </header>
      <Outlet />
    </>
  )
}

export function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="pager">
      <button className="pg" disabled={page <= 1} onClick={() => onChange(page - 1)}>הקודם</button>
      <span>עמוד {page} מתוך {totalPages}</span>
      <button className="pg" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>הבא</button>
    </div>
  )
}

export const Loading = () => <div className="loading" role="status"><span className="spinner" />טוען...</div>

export const Empty = ({ children }) => <div className="empty">{children}</div>

export function Alert({ title, children, type = 'error' }) {
  if (!children) return null
  return (
    <div className={`alert ${type}`} role="alert">
      <div>
        {title && <b>{title}</b>}
        <span>{children}</span>
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

// סמל רופא מצויר בקוד (ראש, צוואר, כתפיים וסטטוסקופ) על עיגול תכלת
export function DoctorAvatar({ size = 76 }) {
  return (
    <div className="pic" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 200 220">
        <g fill="#1f2d4d">
          <ellipse cx="64" cy="86" rx="6.5" ry="11" />
          <ellipse cx="136" cy="86" rx="6.5" ry="11" />
          <path d="M63 82C58 40 78 24 101 24C126 24 142 42 137 82C136 98 128 118 100 122C72 118 64 98 63 82Z" />
          <path d="M85 112H115V140H85Z" />
          <path d="M18 220V178Q18 154 52 144L86 132H114L148 144Q182 154 182 178V220Z" />
        </g>
        <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M78 142V174" />
          <path d="M122 142V176Q122 200 142 200Q162 200 162 176V152" />
        </g>
        <circle cx="78" cy="184" r="9" fill="#fff" />
        <circle cx="78" cy="184" r="3.2" fill="#1f2d4d" />
        <circle cx="162" cy="148" r="4.5" fill="#fff" />
      </svg>
    </div>
  )
}
