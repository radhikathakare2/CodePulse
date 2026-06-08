import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from '../lib/axios'
import { useAuthContext } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuthContext()

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      setIsLoading(true)
      const res = await axios.get('/api/v1/notifications')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const markRead = useCallback(async (id) => {
    try {
      await axios.patch(`/api/v1/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      // silently fail
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await axios.patch('/api/v1/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
      // Poll every 60 seconds
      const interval = setInterval(fetchNotifications, 60000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchNotifications])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markRead,
      markAllRead,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider')
  return ctx
}

export default NotificationContext
