import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Bell, User, Settings, LogOut, Crown, Shield, ChevronDown,
  LayoutDashboard, BarChart2, Brain, Trophy, Users, Star, Menu, X
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNotificationContext } from '../../context/NotificationContext'
import NotificationDropdown from '../notifications/NotificationDropdown'
import { getAvatarUrl } from '../../utils/formatters'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { label: 'Contests', href: '/contests', icon: Trophy },
  { label: 'Groups', href: '/groups', icon: Users },
  { label: 'Leaderboard', href: '/leaderboard', icon: Star },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotificationContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotif, setShowNotif] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobile, setShowMobile] = useState(false)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setShowMobile(false)
  }, [location.pathname])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-100/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-accent-500 rounded-lg flex items-center justify-center shadow-glow-sm">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Code<span className="text-gradient">Pulse</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  to={href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === href
                      ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false) }}
                  className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-200"
                >
                  <Bell size={16} className="text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotif && <NotificationDropdown onClose={() => setShowNotif(false)} />}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false) }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                >
                  <img
                    src={getAvatarUrl(user)}
                    alt={user?.name}
                    className="w-7 h-7 rounded-lg object-cover"
                    onError={(e) => { e.target.src = getAvatarUrl(null) }}
                  />
                  <span className="hidden sm:block text-sm font-medium text-white max-w-24 truncate">
                    {user?.name?.split(' ')[0] || user?.username}
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-dark-100/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-white/10">
                        <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                        {user?.isPremium && (
                          <div className="mt-1 flex items-center gap-1">
                            <Crown size={10} className="text-amber-400" />
                            <span className="text-xs text-amber-400 font-medium">Premium</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        {[
                          { icon: User, label: 'Profile', href: '/profile' },
                          { icon: Settings, label: 'Settings', href: '/settings' },
                          { icon: Crown, label: 'Subscription', href: '/subscription' },
                          ...(user?.role === 'admin' ? [{ icon: Shield, label: 'Admin Panel', href: '/admin' }] : []),
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={href}
                            to={href}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150 text-sm"
                          >
                            <Icon size={15} />
                            {label}
                          </Link>
                        ))}
                        <div className="border-t border-white/10 mt-2 pt-2">
                          <button
                            onClick={() => { logout(); setShowUserMenu(false) }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all duration-150 text-sm font-medium"
                          >
                            <LogOut size={15} />
                            Logout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu */}
              <button
                className="md:hidden w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
                onClick={() => setShowMobile(!showMobile)}
              >
                {showMobile ? <X size={16} className="text-white" /> : <Menu size={16} className="text-gray-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {showMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-dark-100/95"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    to={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === href
                        ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
