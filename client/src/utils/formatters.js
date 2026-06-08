import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { CF_RANK_COLORS } from './constants'

// ─── DATE FORMATTERS ─────────────────────────────────────────────────────
export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return isValid(d) ? format(d, fmt) : '—'
  } catch {
    return '—'
  }
}

export function formatRelativeTime(date) {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
  } catch {
    return '—'
  }
}

export function formatDateTime(date) {
  return formatDate(date, 'MMM d, yyyy HH:mm')
}

export function formatContestTime(date) {
  return formatDate(date, 'EEE, MMM d • h:mm a')
}

// ─── NUMBER FORMATTERS ───────────────────────────────────────────────────
export function formatNumber(n) {
  if (n === null || n === undefined) return '—'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export function formatRating(rating) {
  if (!rating && rating !== 0) return '—'
  return rating.toLocaleString()
}

export function formatPercentage(value, total) {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export function formatDuration(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// ─── RATING TO CF RANK ──────────────────────────────────────────────────
export function getCFRank(rating) {
  if (!rating && rating !== 0) return CF_RANK_COLORS.newbie
  const entries = Object.values(CF_RANK_COLORS)
  for (const rank of entries.reverse()) {
    if (rating >= rank.min) return rank
  }
  return CF_RANK_COLORS.newbie
}

export function getCFRankLabel(rating) {
  return getCFRank(rating).label
}

export function getCFRankColor(rating) {
  return getCFRank(rating).color
}

// ─── ORDINAL SUFFIX ──────────────────────────────────────────────────────
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// ─── RANK MEDAL ──────────────────────────────────────────────────────────
export function getRankMedal(rank) {
  if (rank === 1) return { emoji: '🥇', color: 'text-yellow-400' }
  if (rank === 2) return { emoji: '🥈', color: 'text-gray-300' }
  if (rank === 3) return { emoji: '🥉', color: 'text-amber-600' }
  return { emoji: null, color: 'text-gray-400' }
}

// ─── AVATAR FALLBACK ────────────────────────────────────────────────────
export function getAvatarUrl(user) {
  if (user?.avatar) return user.avatar
  const name = user?.name || user?.username || 'U'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=7c3aed&color=fff&bold=true&size=128`
}

// ─── STREAK LABEL ────────────────────────────────────────────────────────
export function getStreakLabel(days) {
  if (!days) return 'No streak'
  if (days === 1) return '1 day streak'
  return `${days} day streak`
}

// ─── CHANGE DIRECTION ────────────────────────────────────────────────────
export function getChangeColor(change) {
  if (!change) return 'text-gray-400'
  return change > 0 ? 'text-emerald-400' : 'text-rose-400'
}

export function getChangePrefix(change) {
  if (!change) return ''
  return change > 0 ? '+' : ''
}

// ─── TRUNCATE TEXT ────────────────────────────────────────────────────────
export function truncate(str, maxLen = 50) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

// ─── CLAMP ───────────────────────────────────────────────────────────────
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
