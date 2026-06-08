import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, X, User, Trophy, Users, Star, AlertCircle } from 'lucide-react'
import { useNotificationContext } from '../../context/NotificationContext'
import { formatRelativeTime } from '../../utils/formatters'
import { NOTIFICATION_TYPES } from '../../utils/constants'

function NotifIcon({ type }) {
  const icons = {
    friend_request: <User size={14} className="text-blue-400" />,
    friend_accepted: <Users size={14} className="text-green-400" />,
    contest_reminder: <Trophy size={14} className="text-amber-400" />,
    group_invite: <Users size={14} className="text-purple-400" />,
    achievement: <Star size={14} className="text-yellow-400" />,
    system: <Bell size={14} className="text-gray-400" />,
    leaderboard: <Star size={14} className="text-cyan-400" />,
  }
  return (
    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
      NOTIFICATION_TYPES[type]?.color ? 'bg-white/10' : 'bg-white/10'
    }`}>
      {icons[type] || <Bell size={14} className="text-gray-400" />}
    </div>
  )
}

export default function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markRead, markAllRead, isLoading } = useNotificationContext()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 bg-dark-100/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-brand-400" />
          <h3 className="font-semibold text-white text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              <CheckCheck size={12} />
              All read
            </button>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif._id}
              onClick={() => markRead(notif._id)}
              className={`w-full flex items-start gap-3 p-4 hover:bg-white/5 transition-all duration-150 border-b border-white/5 last:border-b-0 text-left ${
                !notif.read ? 'bg-brand-500/5' : ''
              }`}
            >
              <NotifIcon type={notif.type} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-600 mt-1">{formatRelativeTime(notif.createdAt)}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1 shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </motion.div>
  )
}
