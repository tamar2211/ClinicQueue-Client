import { createContext, useContext, useEffect, useState } from 'react'
import { session, setUnauthorizedHandler } from './api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => session.get())

  const signIn = (loginResponse) => {
    session.set(loginResponse)
    setUser(loginResponse)
  }
  const signOut = () => {
    session.clear()
    setUser(null)
  }

  // טוקן שפג תוקף או נדחה בשרת -> חזרה למסך ההתחברות
  useEffect(() => setUnauthorizedHandler(signOut), [])

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.role === 'Admin', signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
