const TZ = 'Asia/Jerusalem'

// השרת שולח UTC. אם חסר Z בסוף, מוסיפים כדי שהדפדפן לא יפרש כשעון מקומי
const parse = (utc) => new Date(/[zZ]|[+-]\d\d:\d\d$/.test(utc) ? utc : `${utc}Z`)

export const fmtDay = (utc) =>
  parse(utc).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })

export const fmtTime = (utc) =>
  parse(utc).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })

export const dayKey = (utc) => parse(utc).toLocaleDateString('en-CA', { timeZone: TZ })

export const fmtDateTime = (utc) => `${fmtDay(utc)}, ${fmtTime(utc)}`

function offsetMs(ts) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(ts)).map((p) => [p.type, p.value]),
  )
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  return asUtc - Math.floor(ts / 1000) * 1000
}

// קלט datetime-local (שעון ישראל) -> ISO ב-UTC לשליחה לשרת
export function israelLocalToUtcIso(local) {
  const [d, t] = local.split('T')
  const [y, m, day] = d.split('-').map(Number)
  const [h, min] = t.split(':').map(Number)
  const naive = Date.UTC(y, m - 1, day, h, min)
  const ts = naive - offsetMs(naive - offsetMs(naive))
  return new Date(ts).toISOString()
}

export const STATUS_LABELS = {
  Active: 'פעיל',
  CancelledByPatient: 'בוטל על ידי המטופל',
  CancelledByClinic: 'בוטל על ידי המרפאה',
}

export const fmtWeekdayShort = (utc) =>
  parse(utc).toLocaleDateString('he-IL', { weekday: 'short', timeZone: TZ })

export const fmtDayNumber = (utc) =>
  parse(utc).toLocaleDateString('he-IL', { day: 'numeric', timeZone: TZ })

export const fmtMonthShort = (utc) =>
  parse(utc).toLocaleDateString('he-IL', { month: 'short', timeZone: TZ })
