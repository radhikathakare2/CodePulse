import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Bell, Star, ExternalLink } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatContestTime, formatDuration } from '../../utils/formatters'
import { PLATFORM_COLORS } from '../../utils/constants'
import ContestCountdown from './ContestCountdown'

export default function ContestCard({ contest, isInterested, onToggleInterest, onSetReminder, isLoading }) {
  const { _id, name, platform, startTime, duration, url, difficulty, status } = contest
  const colors = PLATFORM_COLORS[platform?.toLowerCase()] || PLATFORM_COLORS.leetcode
  const platformName = {
    leetcode: 'LeetCode',
    codeforces: 'Codeforces',
    codechef: 'CodeChef',
  }[platform?.toLowerCase()] || platform

  const isLive = status === 'ongoing'
  const isPast = status === 'ended'
  const now = new Date()
  const start = new Date(startTime)
  const isUpcoming = start > now

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      className={`relative overflow-hidden bg-white/5 backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 hover:bg-white/10 ${
        isLive ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">LIVE</span>
        </div>
      )}

      {/* Gradient accent */}
      <div className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${colors.gradient}`} />

      <div className="relative z-10">
        {/* Platform badge + difficulty */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={platform?.toLowerCase()}>{platformName}</Badge>
          {difficulty && (
            <Badge variant={difficulty?.toLowerCase()}>{difficulty}</Badge>
          )}
        </div>

        {/* Contest Name */}
        <h3 className="text-sm font-semibold text-white mb-3 line-clamp-2 leading-snug">{name}</h3>

        {/* Countdown */}
        {isUpcoming && (
          <div className="mb-3">
            <ContestCountdown startTime={startTime} />
          </div>
        )}

        {/* Details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={12} className={colors.text} />
            <span>{formatContestTime(startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} className={colors.text} />
            <span>Duration: {formatDuration(duration)}</span>
          </div>
        </div>

        {/* Actions */}
        {!isPast && (
          <div className="flex items-center gap-2">
            <Button
              variant={isInterested ? 'success' : 'secondary'}
              size="sm"
              onClick={() => onToggleInterest?.(_id)}
              loading={isLoading}
              leftIcon={Star}
              className={isInterested ? 'flex-1' : 'flex-1'}
            >
              {isInterested ? 'Interested' : 'Add Interest'}
            </Button>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0"
              >
                <ExternalLink size={14} className="text-gray-400" />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
