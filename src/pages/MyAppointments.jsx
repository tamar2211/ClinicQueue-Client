import { useCallback, useEffect, useState } from 'react'
import { api, errorText } from '../api'
import { Alert, Empty, Loading, Pager } from '../components'
import { STATUS_LABELS, fmtDay, fmtTime } from '../format'
import { useToast } from '../toast'

export default function MyAppointments() {
  const toast = useToast()
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      setData(await api.myAppointments({ page }))
      setError('')
    } catch (e) {
      setError(errorText(e))
    }
  }, [page])

  useEffect(() => { load() }, [load])

  async function cancel(a) {
    if (!window.confirm(`לבטל את התור אצל ${a.doctorName}?`)) return
    setBusyId(a.id)
    try {
      await api.cancelAppointment(a.id)
      toast('התור בוטל')
      await load()
    } catch (e) {
      // למשל 409 כשנשאר פחות מ-24 שעות לתור
      toast(errorText(e), 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="container page-top">
      <h1 className="page-title">התורים שלי</h1>
      <Alert>{error}</Alert>
      {!data && !error && <Loading />}
      {data?.items.length === 0 && <Empty>עוד לא קבעת תורים. עבור ל"קביעת תור" כדי להתחיל.</Empty>}

      <div className="list">
        {data?.items.map((a) => (
          <article key={a.id} className="row-card">
            <div className="row-main">
              <div className="name">{a.doctorName}</div>
              <div className="muted">{fmtDay(a.startTimeUtc)}, {fmtTime(a.startTimeUtc)}–{fmtTime(a.endTimeUtc)}</div>
            </div>
            <span className={`status ${a.status}`}>{STATUS_LABELS[a.status] ?? a.status}</span>
            {a.status === 'Active' && (
              <button className="btn-outline danger" disabled={busyId === a.id} onClick={() => cancel(a)}>ביטול תור</button>
            )}
          </article>
        ))}
      </div>
      <Pager page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onChange={setPage} />
    </main>
  )
}
