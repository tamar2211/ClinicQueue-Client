const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5207'
const SESSION_KEY = 'session'

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export const session = {
  get() {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY))
      return s && new Date(s.expiresAtUtc) > new Date() ? s : null
    } catch {
      return null
    }
  },
  set: (s) => localStorage.setItem(SESSION_KEY, JSON.stringify(s)),
  clear: () => localStorage.removeItem(SESSION_KEY),
}

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn)

function toQuery(params) {
  const q = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) q.set(k, v)
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

async function request(method, path, { body, params } = {}) {
  const token = session.get()?.token
  let res
  try {
    res = await fetch(`${BASE}${path}${toQuery(params)}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'לא ניתן להתחבר לשרת. בדוק שהשרת פועל ונסה שוב.')
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (res.ok) return data

  if (res.status === 401 && token) onUnauthorized()
  throw new ApiError(res.status, data?.message ?? 'אירעה שגיאה. נסה שוב.', data?.errors)
}

export const api = {
  login: (body) => request('POST', '/api/auth/login', { body }),
  register: (body) => request('POST', '/api/auth/register', { body }),
  specializations: () => request('GET', '/api/specializations'),
  doctors: () => request('GET', '/api/doctors'),
  doctor: (id) => request('GET', `/api/doctors/${id}`),
  createDoctor: (body) => request('POST', '/api/doctors', { body }),
  updateDoctor: (id, body) => request('PUT', `/api/doctors/${id}`, { body }),
  deleteDoctor: (id) => request('DELETE', `/api/doctors/${id}`),
  slots: (params) => request('GET', '/api/slots', { params }),
  createSlot: (body) => request('POST', '/api/slots', { body }),
  deleteSlot: (id) => request('DELETE', `/api/slots/${id}`),
  book: (slotId) => request('POST', '/api/appointments', { body: { slotId } }),
  myAppointments: (params) => request('GET', '/api/appointments/mine', { params }),
  allAppointments: (params) => request('GET', '/api/appointments', { params }),
  cancelAppointment: (id) => request('DELETE', `/api/appointments/${id}`),
}

// הודעת שגיאה לתצוגה: ההודעה הכללית + שגיאות ולידציה לפי שדה (אם יש)
export function errorText(e) {
  const fields = e.errors ? Object.values(e.errors).flat() : []
  return fields.length ? fields.join(' · ') : e.message
}
