import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import { Layout } from './components'
import Login from './pages/Login'
import Doctors from './pages/Doctors'
import DoctorPage from './pages/DoctorPage'
import MyAppointments from './pages/MyAppointments'
import Admin from './pages/Admin'

// מנהל נכנס לניהול, מטופל לקביעת תור. כל אחד רואה רק את המסכים שלו
function Guard({ admin, children }) {
  const { isAdmin } = useAuth()
  return admin === isAdmin ? children : <Navigate to={isAdmin ? '/admin' : '/'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Guard admin={false}><Doctors /></Guard>} />
        <Route path="/doctors/:id" element={<Guard admin={false}><DoctorPage /></Guard>} />
        <Route path="/my" element={<Guard admin={false}><MyAppointments /></Guard>} />
        <Route path="/admin" element={<Guard admin><Admin /></Guard>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
