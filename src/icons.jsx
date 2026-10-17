// סמלי קו בנייבי עם מילוי תכלת. הכול SVG בתוך הקוד, בלי משאבים חיצוניים (נטפרי)
const ICONS = {
  family: (
    <>
      <circle className="f" cx="17" cy="14" r="5" />
      <circle className="f" cx="33" cy="16" r="4" />
      <path d="M9 40V30a8 8 0 0 1 16 0v10M26 40v-8a7 7 0 0 1 14 0v8" />
    </>
  ),
  kids: (
    <>
      <circle className="f" cx="24" cy="26" r="13" />
      <circle className="f" cx="12" cy="12" r="5" />
      <circle className="f" cx="36" cy="12" r="5" />
      <path d="M19 25v1M29 25v1M21 32q3 2 6 0" />
    </>
  ),
  skin: (
    <>
      <path className="f" d="M12 22c0-9 5-14 12-14s12 5 12 14c0 9-5 18-12 18s-12-9-12-18z" />
      <path d="M19 24v1M29 24v1M21 32q3 2 6 0M14 17q6-2 20 0" />
    </>
  ),
  ortho: (
    <path className="f" d="M12 14l3 4-3 2a5 5 0 1 0 6 6l2-3 17 17a4 4 0 0 0 6-6L26 17l3-2a5 5 0 1 0-6-6l-3 3z" />
  ),
  heart: (
    <>
      <path className="f" d="M24 41C10 31 6 24 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 7-4 14-18 24z" />
      <path d="M9 25h9l3-6 5 11 3-5h9" />
    </>
  ),
  eye: (
    <>
      <path className="f" d="M4 24c6-9 13-13 20-13s14 4 20 13c-6 9-13 13-20 13S10 33 4 24z" />
      <circle cx="24" cy="24" r="7" />
      <circle className="f" cx="24" cy="24" r="2.5" />
    </>
  ),
  ent: (
    <>
      <path className="f" d="M16 20c0-8 5-13 11-13s10 5 10 12c0 6-4 8-6 12-2 5-3 9-8 9s-6-5-6-8" />
      <path d="M22 20c0-3 3-5 5-5s4 2 4 5-3 4-4 7" />
    </>
  ),
  tooth: (
    <path className="f" d="M12 12c4-4 8-2 12-2s8-2 12 2c4 5 0 12-2 18-1 5-2 10-5 10s-3-8-5-8-2 8-5 8-4-5-5-10c-2-6-6-13-2-18z" />
  ),
  general: (
    <>
      <circle className="f" cx="24" cy="24" r="16" />
      <path d="M24 16v16M16 24h16" />
    </>
  ),
}

// בחירת סמל לפי שם ההתמחות (השרת מחזיר שם בעברית)
function iconKey(name = '') {
  if (name.includes('משפחה')) return 'family'
  if (name.includes('ילדים')) return 'kids'
  if (name.includes('עור')) return 'skin'
  if (name.includes('אורתופד')) return 'ortho'
  if (name.includes('לב') || name.includes('קרדיו')) return 'heart'
  if (name.includes('עיני')) return 'eye'
  if (name.includes('אוזן')) return 'ent'
  if (name.includes('שיני')) return 'tooth'
  return 'general'
}

export function SpecIcon({ name }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      {ICONS[iconKey(name)]}
    </svg>
  )
}
