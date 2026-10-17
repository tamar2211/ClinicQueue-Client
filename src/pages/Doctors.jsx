import { useEffect, useMemo, useState } from 'react'
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

  return (
    <>
      <section className="hero">
        <h1>מצא את הרופא שמתאים לך</h1>
        <div className="search two">
          <input aria-label="חיפוש לפי שם רופא" placeholder="חיפוש לפי שם רופא" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select aria-label="התמחות" value={specId ?? ''} onChange={(e) => setSpecId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">כל ההתמחויות</option>
            {specs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </section>

      <main className="container">
        {specs.length > 0 && (
          <>
            <h2>התמחויות ראשיות</h2>
            <div className="specs">
              {specs.map((s) => (
                <button key={s.id} className={`spec ${s.id === specId ? 'on' : ''}`} onClick={() => setSpecId(s.id === specId ? null : s.id)}>
                  <span className="ic"><SpecIcon name={s.name} /></span>
                  <span className="spec-name">{s.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <h2>הרופאים שלנו</h2>
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
