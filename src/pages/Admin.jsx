import { useCallback, useEffect, useState } from 'react'
import { api, errorText } from '../api'
import { Alert, Empty, Field, Loading, Pager } from '../components'
import { STATUS_LABELS, fmtDay, fmtTime, israelLocalToUtcIso } from '../format'
import { useToast } from '../toast'

const TABS = [
  ['appointments', 'כל התורים'],
  ['slots', 'תורים פנויים'],
  ['doctors', 'רופאים'],
]

export default function Admin() {
  const [tab, setTab] = useState('appointments')
  return (
    <main className="container page-top">
      <h1 className="page-title">ניהול המרפאה</h1>
      <div className="tabs wide-tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {tab === 'appointments' && <AllAppointments />}
      {tab === 'slots' && <SlotsAdmin />}
      {tab === 'doctors' && <DoctorsAdmin />}
    </main>
  )
}

// טוען עמוד מהשרת ומחזיר מצב אחיד לכל הטבלאות
function usePaged(fetcher) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    try { setData(await fetcher({ page })); setError('') } catch (e) { setError(errorText(e)) }
  }, [fetcher, page])
  useEffect(() => { load() }, [load])
  return { page, setPage, data, error, reload: load }
}

function AllAppointments() {
  const toast = useToast()
  const { setPage, data, error, reload } = usePaged(api.allAppointments)

  async function cancel(a) {
    if (!window.confirm(`לבטל את התור של ${a.patientName}?`)) return
    try { await api.cancelAppointment(a.id); toast('התור בוטל'); reload() } catch (e) { toast(errorText(e), 'error') }
  }

  return (
    <>
      <Alert>{error}</Alert>
      {!data && !error && <Loading />}
      {data?.items.length === 0 && <Empty>אין תורים במערכת.</Empty>}
      <div className="list">
        {data?.items.map((a) => (
          <article key={a.id} className="row-card">
            <div className="row-main">
              <div className="name">{a.patientName} <span className="muted">אצל {a.doctorName}</span></div>
              <div className="muted">{fmtDay(a.startTimeUtc)}, {fmtTime(a.startTimeUtc)}–{fmtTime(a.endTimeUtc)}</div>
            </div>
            <span className={`status ${a.status}`}>{STATUS_LABELS[a.status] ?? a.status}</span>
            {a.status === 'Active' && <button className="btn-outline danger" onClick={() => cancel(a)}>ביטול</button>}
          </article>
        ))}
      </div>
      <Pager page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onChange={setPage} />
    </>
  )
}

function SlotsAdmin() {
  const toast = useToast()
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState({ doctorId: '', start: '', end: '' })
  const [formError, setFormError] = useState('')
  const fetcher = useCallback((p) => api.slots({ ...p, onlyAvailable: false }), [])
  const { setPage, data, error, reload } = usePaged(fetcher)

  useEffect(() => { api.doctors().then((d) => setDoctors(d.filter((x) => x.isActive))) }, [])

  async function create(e) {
    e.preventDefault()
    setFormError('')
    try {
      await api.createSlot({
        doctorId: Number(form.doctorId),
        startTimeUtc: form.start && israelLocalToUtcIso(form.start),
        endTimeUtc: form.end && israelLocalToUtcIso(form.end),
      })
      toast('התור הפנוי נוצר')
      setForm({ ...form, start: '', end: '' })
      reload()
    } catch (err) { setFormError(errorText(err)) }
  }

  async function remove(s) {
    if (!window.confirm('למחוק את התור הפנוי?')) return
    try { await api.deleteSlot(s.id); toast('התור הפנוי נמחק'); reload() } catch (e) { toast(errorText(e), 'error') }
  }

  return (
    <>
      <form className="panel inline-form" onSubmit={create} noValidate>
        <Field label="רופא">
          <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
            <option value="">בחר רופא</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
          </select>
        </Field>
        <Field label="התחלה (שעון ישראל)"><input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
        <Field label="סיום (שעון ישראל)"><input type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
        <button className="btn primary">הוסף תור פנוי</button>
      </form>
      <Alert>{formError}</Alert>
      <Alert>{error}</Alert>

      {!data && !error && <Loading />}
      {data?.items.length === 0 && <Empty>אין תורים פנויים.</Empty>}
      <div className="list">
        {data?.items.map((s) => (
          <article key={s.id} className="row-card">
            <div className="row-main">
              <div className="name">{s.doctorName}</div>
              <div className="muted">{fmtDay(s.startTimeUtc)}, {fmtTime(s.startTimeUtc)}–{fmtTime(s.endTimeUtc)}</div>
            </div>
            <span className={`status ${s.isBooked ? 'Active' : 'Free'}`}>{s.isBooked ? 'תפוסה' : 'פנויה'}</span>
            <button className="btn-outline danger" onClick={() => remove(s)}>מחיקה</button>
          </article>
        ))}
      </div>
      <Pager page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onChange={setPage} />
    </>
  )
}

function DoctorsAdmin() {
  const toast = useToast()
  const [doctors, setDoctors] = useState(null)
  const [specs, setSpecs] = useState([])
  const [name, setName] = useState('')
  const [picked, setPicked] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(() => api.doctors().then(setDoctors).catch((e) => setError(errorText(e))), [])
  useEffect(() => { load(); api.specializations().then(setSpecs) }, [load])

  const togglePick = (id) => setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id])

  async function create(e) {
    e.preventDefault()
    setError('')
    try {
      await api.createDoctor({ fullName: name, specializationIds: picked })
      toast('הרופא נוסף')
      setName(''); setPicked([])
      load()
    } catch (err) { setError(errorText(err)) }
  }

  async function toggleActive(d) {
    try {
      await api.updateDoctor(d.id, { fullName: d.fullName, isActive: !d.isActive, specializationIds: d.specializations.map((s) => s.id) })
      toast(d.isActive ? 'הרופא הושבת' : 'הרופא הופעל')
      load()
    } catch (e) { toast(errorText(e), 'error') }
  }

  async function remove(d) {
    if (!window.confirm(`למחוק את ${d.fullName}?`)) return
    try { await api.deleteDoctor(d.id); toast('הרופא נמחק'); load() } catch (e) { toast(errorText(e), 'error') }
  }

  return (
    <>
      <form className="panel" onSubmit={create} noValidate>
        <Field label="שם הרופא"><input value={name} onChange={(e) => setName(e.target.value)} placeholder='ד"ר ישראל ישראלי' /></Field>
        <div className="form-field">
          <span>התמחויות</span>
          <div className="chips">
            {specs.map((s) => (
              <button type="button" key={s.id} className={`chip ${picked.includes(s.id) ? 'on' : ''}`} onClick={() => togglePick(s.id)}>{s.name}</button>
            ))}
          </div>
        </div>
        <button className="btn primary">הוסף רופא</button>
      </form>
      <Alert>{error}</Alert>

      {!doctors && !error && <Loading />}
      <div className="list">
        {doctors?.map((d) => (
          <article key={d.id} className="row-card">
            <div className="row-main">
              <div className="name">{d.fullName}</div>
              <div className="muted">{d.specializations.map((s) => s.name).join(' · ')} · {d.availableSlotsCount} תורים פנויים</div>
            </div>
            <span className={`status ${d.isActive ? 'Active' : 'CancelledByClinic'}`}>{d.isActive ? 'פעיל' : 'מושבת'}</span>
            <button className="btn-outline" onClick={() => toggleActive(d)}>{d.isActive ? 'השבתה' : 'הפעלה'}</button>
            <button className="btn-outline danger" onClick={() => remove(d)}>מחיקה</button>
          </article>
        ))}
      </div>
    </>
  )
}
