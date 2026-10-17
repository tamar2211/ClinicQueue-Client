import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorText } from '../api'
import { Alert, DoctorAvatar, Empty } from '../components'
import { SpecIcon } from '../icons'

export default function Doctors() {
  const [specs, setSpecs] = useState([])
  const [doctors, setDoctors] = useState(null)
  const [error, setError] = useState('')
  const [specId, setSpecId] = useState(null)
  const [query, setQuery] = useState('')
  const resultsRef = useRef(null)

  useEffect(() => {
    Promise.all([api.specializations(), api.doctors()])
      .then(([s, d]) => { setSpecs(s); setDoctors(d.filter((x) => x.isActive)) })
      .catch((e) => setError(errorText(e)))
  }, [])

  const visible = useMemo(
    () => (doctors ?? []).filter((d) =>
      (!specId || d.specializations.some((s) => s.id === specId)) &&
      d.fullName.includes(query.trim())),
    [doctors, specId, query],
  )

  const filtered = specId !== null || query.trim() !== ''
  const title = !filtered || !doctors ? 'הרופאים שלנו'
    : visible.length === 1 ? 'נמצא רופא אחד'
    : visible.length === 0 ? 'לא נמצאו רופאים'
    : `נמצאו ${visible.length} רופאים`

  // התוצאות מתחת לאריחי ההתמחויות, לכן גוללים אליהן אחרי חיפוש או בחירה
  const scrollToResults = () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const chooseSpec = (id) => { setSpecId(id); if (id !== null) scrollToResults() }

  // הקלדת שם: גוללים כשהמשתמש מפסיק להקליד
  useEffect(() => {
    if (!query.trim()) return
    const t = setTimeout(scrollToResults, 700)
    return () => clearTimeout(t)
  }, [query])

  return (
    <>
      <section className="hero">
        <h1>מצא רופא וקבע תור בקליק</h1>
        <div className="search two">
          <input aria-label="חיפוש לפי שם רופא" placeholder="חיפוש לפי שם רופא" value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && scrollToResults()} />
          <select aria-label="התמחות" value={specId ?? ''} onChange={(e) => chooseSpec(e.target.value ? Number(e.target.value) : null)}>
            <option value="">כל ההתמחויות</option>
            {specs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn" onClick={scrollToResults}>חיפוש</button>
        </div>
      </section>

      <main className="container">
        {specs.length > 0 && (
          <>
            <h2>התמחויות ראשיות</h2>
            <div className="specs">
              {specs.map((s) => (
                <button key={s.id} className={`spec ${s.id === specId ? 'on' : ''}`} onClick={() => chooseSpec(s.id === specId ? null : s.id)}>
                  <span className="ic"><SpecIcon name={s.name} /></span>
                  <span className="spec-name">{s.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <h2 ref={resultsRef} className="results-title">{title}</h2>
        <Alert>{error}</Alert>
        {!doctors && !error && <div className="docs">{[0, 1, 2, 3].map((i) => <div key={i} className="dcard skeleton" />)}</div>}
        {doctors && visible.length === 0 && <Empty>לא נמצאו רופאים לפי הסינון שבחרת.</Empty>}
        <div className="docs">
          {visible.map((d) => (
            <Link key={d.id} to={`/doctors/${d.id}`} className="dcard">
              <DoctorAvatar doctor={d} size={84} />
              <div className="dname">{d.fullName}</div>
              <div className="dspec">{d.specializations.map((s) => s.name).join(' · ')}</div>
              <div className="dfoot">
                <span className={`status-dot ${d.availableSlotsCount === 0 ? 'none' : ''}`}>
                  {d.availableSlotsCount === 0 ? 'אין תורים פנויים' : 'יש תורים פנויים'}
                </span>
                <span className="go-arrow" aria-hidden="true">←</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
