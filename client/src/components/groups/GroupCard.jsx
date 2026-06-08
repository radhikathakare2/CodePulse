import { motion } from 'framer-motion'
import { Users, Target, LogIn, Lock } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { formatNumber } from '../../utils/formatters'

export default function GroupCard({ group, isMember = false, onJoin, onLeave, isLoading }) {
  const { _id, name, description, memberCount, weeklyGoal, weeklyProgress, tags = [], isPrivate, admin } = group

  const progressPercent = weeklyGoal ? Math.min(100, Math.round((weeklyProgress / weeklyGoal) * 100)) : 0

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
            {isPrivate && <Lock size={12} className="text-gray-500 shrink-0" />}
          </div>
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
          )}
        </div>
        {isMember && (
          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0 ml-2" />
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="purple" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Users size={11} />
          <span>{formatNumber(memberCount)} members</span>
        </div>
        {admin?.name && (
          <span className="text-gray-600">· by {admin.name}</span>
        )}
      </div>

      {/* Weekly Goal Progress */}
      {weeklyGoal && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 text-gray-500">
              <Target size={11} />
              <span>Weekly Goal</span>
            </div>
            <span className="font-semibold text-white">{weeklyProgress}/{weeklyGoal} solved</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 text-right">{progressPercent}%</p>
        </div>
      )}

      {/* Action */}
      {isMember ? (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => window.location.href = `/groups/${_id}`}>
            View Group
          </Button>
          <Button variant="danger" size="sm" onClick={() => onLeave?.(_id)} loading={isLoading}>
            Leave
          </Button>
        </div>
      ) : (
        <Button
          variant={isPrivate ? 'secondary' : 'primary'}
          size="sm"
          className="w-full"
          onClick={() => onJoin?.(_id)}
          loading={isLoading}
          leftIcon={isPrivate ? Lock : LogIn}
        >
          {isPrivate ? 'Request to Join' : 'Join Group'}
        </Button>
      )}
    </motion.div>
  )
}
