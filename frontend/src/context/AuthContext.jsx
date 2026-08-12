import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ag_token'))
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('ag_user')) } catch { return null }
  })
  const navigate = useNavigate()

  const login = useCallback((tokenVal, userData) => {
    setToken(tokenVal)
    setUser(userData)
    localStorage.setItem('ag_token', tokenVal)
    localStorage.setItem('ag_user', JSON.stringify(userData))
    if (userData.role === 'Admin') navigate('/admin')
    else navigate('/employee')
  }, [navigate])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('ag_token')
    localStorage.removeItem('ag_user')
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
