import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, errorText } from '../api'
import { Alert, DoctorAvatar, Empty } from '../components'
import { dayKey, fmtDay, fmtDayNumber, fmtMonthShort, fmtTime, fmtWeekdayShort } from '../format'
import { useToast } from '../toast'

// השרת מגביל עמוד ל-50, לכן טוענים את כל העמודים של הרופא (עד 5)
async function loadAllSlots(doctorId) {
  const items = []
  for (let page = 1; page <= 5; page++) {
    const res = await api.slots({ doctorId, onlyAvailable: true, pageSize: 50, page })
    items.push(...res.items)
    if (page >= res.totalPages) break
  }
  return items
}

export default function DoctorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [doctor, setDoctor] = useState(null)
  const [slots, setSlots] = useState(null)
  const [error, setError] = useState('')
  const [conflict, setConflict] = useState('')
  const [dayChoice, setDayChoice] = useState(null)
  const [selected, setSelected] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([api.doctor(id), loadAllSlots(id)])
      setDoctor(d)
      setSlots(s)
      setError('')
    } catch (e) {
      setError(errorText(e))
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const days = useMemo(() => {
    const map = new Map()
    ;(slots ?? []).forEach((s) => {
      const k = dayKey(s.startTimeUtc)
      if (!map.has(k)) map.set(k, { key: k, first: s.startTimeUtc, slots: [] })
      map.get(k).slots.push(s)
    })
    return [...map.values()]
  }, [slots])

  const day = days.find((d) => d.key === dayChoice) ?? days[0]

  async function book() {
    setBusy(true)
    try {
      await api.book(selected.id)
      toast(`התור נקבע: ${fmtDay(selected.startTimeUtc)} ב-${fmtTime(selected.startTimeUtc)}`)
      navigate('/my')
    } catch (e) {
      // 409: מטופל אחר תפס את התור לפניך. מרעננים ומציגים מה עוד פנוי
      if (e.status === 409) setConflict(e.message)
      else toast(errorText(e), 'error')
      setSelected(null)
      setConfirming(false)
      load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container">
      <Link to="/" className="back">→ חזרה לרופאים</Link>
      <Alert>{error}</Alert>

      {doctor && (
        <div className="profile">
          <DoctorAvatar doctor={doctor} size={110} />
          <div>
            <h1>{doctor.fullName}</h1>
            <p>{doctor.specializations.map((s) => s.name).join(' · ')}</p>
          </div>
        </div>
      )}

      <Alert title="התור נתפס זה עתה">{conflict && `${conflict} הרשימה עודכנה, בחר שעה אחרת.`}</Alert>

      {slots && days.length === 0 && <Empty>אין כרגע תורים פנויים אצל הרופא הזה. נסה שוב מאוחר יותר.</Empty>}

      {day && (
        <>
          <h3 className="section-label">בחר יום</h3>
          <div className="days">
            {days.map((d) => (
              <button key={d.key} className={`day ${d.key === day.key ? 'on' : ''}`}
                onClick={() => { setDayChoice(d.key); setSelected(null) }}>
                <small>{fmtWeekdayShort(d.first)}</small>
                <b>{fmtDayNumber(d.first)}</b>
                <small>{fmtMonthShort(d.first)}</small>
              </button>
            ))}
          </div>

          <h3 className="section-label">בחר שעה</h3>
          <div className="times">
            {day.slots.map((s) => (
              <button key={s.id} className={`time ${selected?.id === s.id ? 'on' : ''}`} onClick={() => setSelected(s)}>
                {fmtTime(s.startTimeUtc)}
              </button>
            ))}
          </div>

          <div className="sticky-bar">
            <span>
              {selected ? `${fmtDay(selected.startTimeUtc)} · ${fmtTime(selected.startTimeUtc)}–${fmtTime(selected.endTimeUtc)}` : 'בחר שעה כדי להמשיך'}
            </span>
            <button className="cta" disabled={!selected} onClick={() => setConfirming(true)}>המשך לקביעת תור</button>
          </div>
        </>
      )}

      {confirming && selected && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => !busy && setConfirming(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>לקבוע את התור?</h3>
            <p>{doctor.fullName}<br />{fmtDay(selected.startTimeUtc)}, {fmtTime(selected.startTimeUtc)}–{fmtTime(selected.endTimeUtc)}</p>
            <div className="row">
              <button className="ghost" disabled={busy} onClick={() => setConfirming(false)}>חזרה</button>
              <button className="cta" disabled={busy} onClick={book}>{busy ? 'קובע...' : 'אישור וקביעת תור'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
