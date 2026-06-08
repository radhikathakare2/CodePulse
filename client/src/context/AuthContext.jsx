import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(null)

  // On mount, try to restore session via refresh token
  useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.post('/api/v1/auth/refresh')
        const { accessToken, user: userData } = res.data
        setToken(accessToken)
        setUser(userData)
        setIsAuthenticated(true)
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      } catch {
        // No valid session
        setToken(null)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await axios.post('/api/v1/auth/login', credentials)
    const { accessToken, user: userData } = res.data
    setToken(accessToken)
    setUser(userData)
    setIsAuthenticated(true)
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const res = await axios.post('/api/v1/auth/register', data)
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/v1/auth/logout')
    } catch {
      // ignore errors
    } finally {
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      delete axios.defaults.headers.common['Authorization']
      toast.success('Logged out successfully')
    }
  }, [])

  const refreshToken = useCallback(async () => {
    try {
      const res = await axios.post('/api/v1/auth/refresh')
      const { accessToken, user: userData } = res.data
      setToken(accessToken)
      setUser(userData)
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      return accessToken
    } catch {
      logout()
      throw new Error('Session expired')
    }
  }, [logout])

  const updateUser = useCallback((data) => {
    setUser(prev => ({ ...prev, ...data }))
  }, [])

  const forgotPassword = useCallback(async (email) => {
    const res = await axios.post('/api/v1/auth/forgot-password', { email })
    return res.data
  }, [])

  const resetPassword = useCallback(async (token, password) => {
    const res = await axios.post(`/api/v1/auth/reset-password/${token}`, { password })
    return res.data
  }, [])

  const changePassword = useCallback(async (data) => {
    const res = await axios.post('/api/v1/auth/change-password', data)
    return res.data
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      token,
      login,
      logout,
      register,
      refreshToken,
      updateUser,
      forgotPassword,
      resetPassword,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

export default AuthContext
