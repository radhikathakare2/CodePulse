import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Code, Flame, Trophy, Users, Star, BarChart2,
  TrendingUp, Activity, Calendar, RefreshCw
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import StatCard from '../components/ui/StatCard'
import GlassCard from '../components/ui/GlassCard'
import HeatmapCalendar from '../components/charts/HeatmapCalendar'
import PlatformDistribution from '../components/charts/PlatformDistribution'
import DifficultyBreakdown from '../components/charts/DifficultyBreakdown'
import PlatformCard from '../components/platform/PlatformCard'
import ContestCard from '../components/contest/ContestCard'
import { platformAPI, contestAPI } from '../lib/api'
import { formatNumber, formatRelativeTime } from '../utils/formatters'
import { usePlatformStats } from '../hooks/usePlatformStats'
import { useContests } from '../hooks/useContests'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Badge from '../components/ui/Badge'

const MOCK_CALENDAR = (() => {
  const data = {}
  const today = new Date()
  for (let i = 0; i < 200; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - Math.floor(Math.random() * 365))
    const key = d.toISOString().split('T')[0]
    data[key] = (data[key] || 0) + Math.floor(Math.random() * 8) + 1
  }
  return data
})()

export default function Dashboard() {
  const { user } = useAuth()
  const { stats, isLoading: statsLoading, syncLeetCode, syncCodeforces, syncGFG, isSyncingLC, isSyncingCF, isSyncingGFG } = usePlatformStats()
  const { contests: upcomingContests } = useContests('all', 'upcoming')

  const recentActivity = useQuery({
    queryKey: ['recent-submissions'],
    queryFn: () => platformAPI.getRecentSubmissions(8).then(r => r.data),
  })

  const statCards = [
    { icon: Code, label: 'Total Solved', value: formatNumber(stats?.totalSolved) || '0', change: stats?.solvedChange, gradient: 'from-brand-600 to-purple-500' },
    { icon: Flame, label: 'Current Streak', value: stats?.streak ? `${stats.streak}d` : '0d', change: null, gradient: 'from-orange-500 to-amber-500' },
    { icon: TrendingUp, label: 'Global Rank', value: stats?.globalRank ? `#${formatNumber(stats.globalRank)}` : '—', change: stats?.rankChange, gradient: 'from-cyan-500 to-blue-500' },
    { icon: Trophy, label: 'Contest Rating', value: formatNumber(stats?.maxRating) || '—', change: stats?.ratingChange, gradient: 'from-emerald-500 to-teal-500' },
    { icon: Users, label: 'Friends', value: String(stats?.friendCount || 0), change: null, gradient: 'from-pink-500 to-rose-500' },
    { icon: Star, label: 'Groups', value: String(stats?.groupCount || 0), change: null, gradient: 'from-amber-500 to-yellow-500' },
  ]

  const platformData = stats ? [
    { name: 'LeetCode', value: stats.leetcode?.solved || 0 },
    { name: 'Codeforces', value: stats.codeforces?.solved || 0 },
    { name: 'GFG', value: stats.gfg?.solved || 0 },
  ].filter(p => p.value > 0) : []

  const difficultyData = [
    { name: 'Easy', value: (stats?.leetcode?.easy || 0) + (stats?.gfg?.easy || 0) },
    { name: 'Medium', value: (stats?.leetcode?.medium || 0) + (stats?.gfg?.medium || 0) },
    { name: 'Hard', value: (stats?.leetcode?.hard || 0) + (stats?.gfg?.hard || 0) },
  ]

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.name?.split(' ')[0] || 'Coder'}</span>! 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {stats?.streak > 0 ? `🔥 ${stats.streak} day streak — keep it up!` : "Start your coding streak today!"}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 0.05} />
        ))}
      </div>

      {/* Platform Cards */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart2 size={16} className="text-brand-400" />
          Connected Platforms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlatformCard
            platform="leetcode"
            username={user?.platforms?.leetcode}
            stats={stats?.leetcode ? { Solved: stats.leetcode.solved, Easy: stats.leetcode.easy, Hard: stats.leetcode.hard } : null}
            lastSynced={stats?.leetcode?.lastSynced}
            onSync={syncLeetCode}
            isSyncing={isSyncingLC}
          />
          <PlatformCard
            platform="codeforces"
            username={user?.platforms?.codeforces}
            stats={stats?.codeforces ? { Rating: stats.codeforces.rating, Solved: stats.codeforces.solved, Rank: stats.codeforces.rank } : null}
            lastSynced={stats?.codeforces?.lastSynced}
            onSync={syncCodeforces}
            isSyncing={isSyncingCF}
          />
          <PlatformCard
            platform="gfg"
            username={user?.platforms?.gfg}
            stats={stats?.gfg ? { Solved: stats.gfg.solved, Score: stats.gfg.score, Easy: stats.gfg.easy } : null}
            lastSynced={stats?.gfg?.lastSynced}
            onSync={syncGFG}
            isSyncing={isSyncingGFG}
          />
        </div>
      </div>

      {/* Heatmap + Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Calendar size={16} className="text-brand-400" />
              Activity Calendar
            </h2>
            <span className="text-xs text-gray-500">{new Date().getFullYear()}</span>
          </div>
          <HeatmapCalendar data={MOCK_CALENDAR} />
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-brand-400" />
            Recent Submissions
          </h2>
          <div className="space-y-3">
            {recentActivity.data?.submissions?.length ? (
              recentActivity.data.submissions.map((sub, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${sub.status === 'AC' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate">{sub.problem || 'Unknown Problem'}</p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(sub.timestamp)}</p>
                  </div>
                  <Badge variant={sub.status === 'AC' ? 'success' : 'error'} className="text-xs shrink-0">
                    {sub.status || 'AC'}
                  </Badge>
                </div>
              ))
            ) : (
              // Placeholder when no data
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-white/10 rounded animate-pulse mb-1 w-3/4" />
                    <div className="h-2 bg-white/5 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Star size={16} className="text-brand-400" />
            Platform Distribution
          </h2>
          <PlatformDistribution data={platformData.length ? platformData : [
            { name: 'LeetCode', value: 245 },
            { name: 'Codeforces', value: 128 },
            { name: 'GFG', value: 89 },
          ]} />
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-brand-400" />
            Difficulty Breakdown
          </h2>
          <DifficultyBreakdown data={difficultyData[0]?.value ? difficultyData : [
            { name: 'Easy', value: 156 },
            { name: 'Medium', value: 198 },
            { name: 'Hard', value: 108 },
          ]} />
        </GlassCard>
      </div>

      {/* Upcoming Contests Preview */}
      {upcomingContests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Trophy size={16} className="text-brand-400" />
              Upcoming Contests
            </h2>
            <a href="/contests" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">View all →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingContests.slice(0, 3).map(contest => (
              <ContestCard key={contest._id} contest={contest} />
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <GlassCard className="p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-amber-400" />
          Achievements
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {[
            { emoji: '🎯', label: 'First Solve', unlocked: true },
            { emoji: '🔥', label: '7 Day Streak', unlocked: true },
            { emoji: '💯', label: 'Century', unlocked: stats?.totalSolved >= 100 },
            { emoji: '⚡', label: '30 Day Streak', unlocked: stats?.streak >= 30 },
            { emoji: '🏆', label: 'Champion', unlocked: stats?.totalSolved >= 500 },
            { emoji: '🎪', label: 'Contest Debut', unlocked: true },
            { emoji: '👑', label: 'Legend', unlocked: false },
            { emoji: '🌟', label: 'Group Leader', unlocked: false },
          ].map(({ emoji, label, unlocked }) => (
            <div
              key={label}
              title={label}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 ${
                unlocked
                  ? 'bg-white/10 border-white/20 cursor-pointer hover:scale-110'
                  : 'bg-white/3 border-white/5 opacity-30 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs text-gray-400 text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
