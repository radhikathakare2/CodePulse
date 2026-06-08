import { motion } from 'framer-motion'
import { UserPlus, UserCheck, UserX, Users } from 'lucide-react'
import { getAvatarUrl, formatNumber } from '../../utils/formatters'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Link } from 'react-router-dom'

export default function FriendCard({ user, status = 'none', onSendRequest, onAccept, onReject, onRemove, isLoading, mutualCount = 0 }) {
  const { _id, name, username, isPremium, stats = {} } = user

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-start gap-3 mb-4">
        <Link to={`/u/${username}`}>
          <img
            src={getAvatarUrl(user)}
            alt={name}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/10 hover:ring-brand-500/50 transition-all"
            onError={(e) => { e.target.src = getAvatarUrl(null) }}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link to={`/u/${username}`} className="text-white font-semibold hover:text-brand-400 transition-colors text-sm truncate">
              {name}
            </Link>
            {isPremium && (
              <span className="text-amber-400 text-xs">✦</span>
            )}
          </div>
          <p className="text-gray-500 text-xs">@{username}</p>
          {mutualCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Users size={10} className="text-gray-600" />
              <span className="text-xs text-gray-600">{mutualCount} mutual</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Solved', value: stats.totalSolved },
          { label: 'Rating', value: stats.maxRating },
          { label: 'Streak', value: stats.streak ? `${stats.streak}d` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="text-center bg-white/5 rounded-xl p-2">
            <p className="text-sm font-bold text-white">{formatNumber(value) || '—'}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {status === 'none' && (
          <Button variant="primary" size="sm" onClick={() => onSendRequest?.(_id)} loading={isLoading} leftIcon={UserPlus} className="flex-1">
            Add Friend
          </Button>
        )}
        {status === 'pending' && (
          <>
            <Button variant="success" size="sm" onClick={() => onAccept?.(_id)} leftIcon={UserCheck} className="flex-1">
              Accept
            </Button>
            <Button variant="danger" size="sm" onClick={() => onReject?.(_id)} leftIcon={UserX}>
              Reject
            </Button>
          </>
        )}
        {status === 'friend' && (
          <Button variant="ghost" size="sm" onClick={() => onRemove?.(_id)} className="flex-1 text-gray-500 hover:text-rose-400">
            Remove
          </Button>
        )}
        {status === 'sent' && (
          <Button variant="ghost" size="sm" disabled className="flex-1">
            Request Sent
          </Button>
        )}
      </div>
    </motion.div>
  )
}
