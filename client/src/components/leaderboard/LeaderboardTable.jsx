import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, Minus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAvatarUrl, formatNumber, getRankMedal, ordinal } from '../../utils/formatters'
import Badge from '../ui/Badge'

export default function LeaderboardTable({ users = [], isLoading = false, currentUserId, highlightUser = false }) {
  const [sortBy, setSortBy] = useState('rank')
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  const sorted = [...users].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortBy === 'rank') return (a.rank - b.rank) * dir
    if (sortBy === 'totalSolved') return ((b.totalSolved || 0) - (a.totalSolved || 0)) * dir
    if (sortBy === 'rating') return ((b.maxRating || 0) - (a.maxRating || 0)) * dir
    if (sortBy === 'streak') return ((b.streak || 0) - (a.streak || 0)) * dir
    return 0
  })

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={12} className="opacity-30" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-brand-400" />
      : <ChevronDown size={12} className="text-brand-400" />
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse shimmer-bg" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {[
              { col: 'rank', label: 'Rank' },
              { col: null, label: 'User' },
              { col: 'totalSolved', label: 'Solved' },
              { col: 'rating', label: 'Max Rating' },
              { col: 'streak', label: 'Streak' },
            ].map(({ col, label }) => (
              <th
                key={label}
                className={`text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col ? 'cursor-pointer hover:text-white' : ''}`}
                onClick={() => col && handleSort(col)}
              >
                <div className="flex items-center gap-1">
                  {label}
                  {col && <SortIcon col={col} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((user, idx) => {
            const { emoji, color } = getRankMedal(user.rank)
            const isMe = user._id === currentUserId

            return (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`border-b border-white/5 last:border-b-0 transition-all duration-200 ${
                  isMe && highlightUser
                    ? 'bg-brand-500/10 border-brand-500/20'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Rank */}
                <td className="py-3 px-4">
                  <div className={`text-sm font-bold ${color}`}>
                    {emoji ? (
                      <span className="text-lg">{emoji}</span>
                    ) : (
                      <span className="text-gray-400">#{user.rank}</span>
                    )}
                  </div>
                </td>

                {/* User */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Link to={`/u/${user.username}`}>
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/10"
                        onError={(e) => { e.target.src = getAvatarUrl(null) }}
                      />
                    </Link>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/u/${user.username}`} className="text-sm font-semibold text-white hover:text-brand-400 transition-colors">
                          {user.name}
                        </Link>
                        {user.isPremium && <span className="text-amber-400 text-xs">✦</span>}
                        {isMe && <Badge variant="purple" className="text-xs">You</Badge>}
                      </div>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                </td>

                {/* Solved */}
                <td className="py-3 px-4">
                  <span className="text-sm font-semibold text-white">{formatNumber(user.totalSolved) || '—'}</span>
                </td>

                {/* Max Rating */}
                <td className="py-3 px-4">
                  <span className="text-sm font-semibold text-white">{formatNumber(user.maxRating) || '—'}</span>
                </td>

                {/* Streak */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    {user.streak > 0 && <span>🔥</span>}
                    <span className="text-sm text-white font-semibold">{user.streak ? `${user.streak}d` : '—'}</span>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No users found
        </div>
      )}
    </div>
  )
}
