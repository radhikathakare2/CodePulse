import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, LayoutDashboard, BarChart2, Brain, Trophy, Users, Star,
  UserCircle, Settings, Crown, UserPlus, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getAvatarUrl } from '../../utils/formatters'
import { clsx } from 'clsx'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { label: 'AI Insights', href: '/ai', icon: Brain, premium: true },
  { label: 'Contests', href: '/contests', icon: Trophy },
  { label: 'Groups', href: '/groups', icon: Users },
  { label: 'Friends', href: '/friends', icon: UserPlus },
  { label: 'Leaderboard', href: '/leaderboard', icon: Star },
]

const bottomItems = [
  { label: 'Profile', href: '/profile', icon: UserCircle },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ collapsed = false }) {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <aside
      className={clsx(
        'fixed left-0 top-16 bottom-0 z-30 flex flex-col',
        'bg-dark-100/60 backdrop-blur-xl border-r border-white/5',
        'transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {navItems.map(({ label, href, icon: Icon, premium }) => {
          const isActive = location.pathname === href || location.pathname.startsWith(href + '/')
          const isPremiumLocked = premium && !user?.isPremium

          return (
            <Link
              key={href}
              to={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon size={18} className={clsx(isActive ? 'text-brand-400' : 'group-hover:text-white')} />
              {!collapsed && (
                <>
                  <span className="text-sm flex-1">{label}</span>
                  {isPremiumLocked && (
                    <Crown size={12} className="text-amber-400" />
                  )}
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-brand-400 ml-auto" />
                  )}
                </>
              )}
              {collapsed && isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-brand-500 rounded-l" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/5">
        {bottomItems.map(({ label, href, icon: Icon }) => {
          const isActive = location.pathname === href
          return (
            <Link
              key={href}
              to={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 mb-1',
                isActive
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={18} />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          )
        })}

        {/* Subscription badge */}
        {!collapsed && (
          <Link
            to="/subscription"
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-xl border mt-2 transition-all duration-200',
              user?.isPremium
                ? 'bg-gradient-to-r from-brand-600/20 to-accent-600/20 border-brand-500/30 text-brand-400 hover:from-brand-600/30 hover:to-accent-600/30'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            )}
          >
            <Crown size={14} className={user?.isPremium ? 'text-amber-400' : 'text-gray-500'} />
            <span className="text-xs font-semibold">
              {user?.isPremium ? 'Premium' : 'Upgrade to Pro'}
            </span>
            {!user?.isPremium && <ChevronRight size={12} className="ml-auto" />}
          </Link>
        )}

        {/* User Avatar */}
        <Link
          to="/profile"
          className="flex items-center gap-3 px-2 py-2 mt-2 rounded-xl hover:bg-white/5 transition-all duration-200"
        >
          <img
            src={getAvatarUrl(user)}
            alt={user?.name}
            className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/30 shrink-0"
            onError={(e) => { e.target.src = getAvatarUrl(null) }}
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  )
}
