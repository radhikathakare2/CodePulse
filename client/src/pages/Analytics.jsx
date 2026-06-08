import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BarChart2, Download, Filter, Calendar, RefreshCw } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import HeatmapCalendar from '../components/charts/HeatmapCalendar'
import RatingGraph from '../components/charts/RatingGraph'
import ActivityGraph from '../components/charts/ActivityGraph'
import DifficultyBreakdown from '../components/charts/DifficultyBreakdown'
import ContestPerformance from '../components/charts/ContestPerformance'
import WeakTopicRadar from '../components/ai/WeakTopicRadar'
import { platformAPI } from '../lib/api'
import { exportToPDF } from '../utils/exportPDF'

const PLATFORMS = ['All', 'LeetCode', 'Codeforces', 'GFG']
const YEAR_OPTIONS = [2024, 2025, 2026]

// Mock data for preview
const MOCK_RATING_DATA = [
  { date: '2025-01-01', rating: 1450 }, { date: '2025-02-01', rating: 1520 },
  { date: '2025-03-01', rating: 1480 }, { date: '2025-04-01', rating: 1610 },
  { date: '2025-05-01', rating: 1580 }, { date: '2025-06-01', rating: 1720 },
  { date: '2025-07-01', rating: 1690 }, { date: '2025-08-01', rating: 1810 },
  { date: '2025-09-01', rating: 1847 },
]

const MOCK_ACTIVITY = [
  { date: '2025-01', count: 45 }, { date: '2025-02', count: 52 },
  { date: '2025-03', count: 38 }, { date: '2025-04', count: 61 },
  { date: '2025-05', count: 73 }, { date: '2025-06', count: 58 },
  { date: '2025-07', count: 82 }, { date: '2025-08', count: 91 },
  { date: '2025-09', count: 67 },
]

const MOCK_CONTESTS = [
  { date: '2025-01-15', rank: 1234, ratingChange: 45 },
  { date: '2025-02-10', rank: 987, ratingChange: 72 },
  { date: '2025-03-05', rank: 2100, ratingChange: -28 },
  { date: '2025-04-20', rank: 756, ratingChange: 91 },
  { date: '2025-05-15', rank: 445, ratingChange: 128 },
  { date: '2025-06-01', rank: 1567, ratingChange: -15 },
]

const MOCK_CALENDAR = (() => {
  const data = {}
  const today = new Date()
  for (let i = 0; i < 250; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - Math.floor(Math.random() * 365))
    const key = d.toISOString().split('T')[0]
    data[key] = (data[key] || 0) + Math.floor(Math.random() * 8) + 1
  }
  return data
})()

export default function Analytics() {
  const [platform, setPlatform] = useState('All')
  const [year, setYear] = useState(2026)

  const stats = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => platformAPI.getAllStats().then(r => r.data).catch(() => null),
  })

  const ratingHistory = useQuery({
    queryKey: ['rating-history', platform.toLowerCase()],
    queryFn: () => platformAPI.getRatingHistory(platform.toLowerCase()).then(r => r.data).catch(() => MOCK_RATING_DATA),
  })

  const handleExport = () => {
    exportToPDF('analytics-content', 'codepulse-analytics')
  }

  const difficultyData = [
    { name: 'Easy', value: stats.data?.leetcode?.easy || 156 },
    { name: 'Medium', value: stats.data?.leetcode?.medium || 198 },
    { name: 'Hard', value: stats.data?.leetcode?.hard || 108 },
  ]

  const topicData = [
    { topic: 'Arrays', score: 82 },
    { topic: 'Graphs', score: 48 },
    { topic: 'DP', score: 61 },
    { topic: 'Trees', score: 75 },
    { topic: 'Binary Search', score: 88 },
    { topic: 'Greedy', score: 64 },
    { topic: 'Strings', score: 70 },
    { topic: 'Math', score: 55 },
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <BarChart2 size={24} className="text-brand-400" />
            Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">Deep-dive into your coding performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={Download} onClick={handleExport}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {PLATFORMS.map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                platform === p
                  ? 'bg-brand-600/30 text-brand-400 border-r border-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
        >
          {YEAR_OPTIONS.map(y => <option key={y} value={y} className="bg-dark-100">{y}</option>)}
        </select>
      </div>

      <div id="analytics-content" className="space-y-6">
        {/* Heatmap Calendar */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Calendar size={16} className="text-brand-400" />
              Submission Calendar {year}
            </h2>
          </div>
          <HeatmapCalendar data={MOCK_CALENDAR} year={year} />
        </GlassCard>

        {/* Rating Progression */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Rating Progression</h2>
            <Badge variant={platform.toLowerCase() === 'all' ? 'purple' : platform.toLowerCase()}>
              {platform === 'All' ? 'Codeforces' : platform}
            </Badge>
          </div>
          <RatingGraph
            data={ratingHistory.data?.history || MOCK_RATING_DATA}
            platform={platform === 'All' ? 'codeforces' : platform.toLowerCase()}
          />
        </GlassCard>

        {/* Monthly Activity */}
        <GlassCard className="p-6">
          <h2 className="text-base font-semibold text-white mb-4">Monthly Activity</h2>
          <ActivityGraph data={MOCK_ACTIVITY} period="monthly" />
        </GlassCard>

        {/* 2-col row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h2 className="text-base font-semibold text-white mb-4">Difficulty Breakdown</h2>
            <DifficultyBreakdown data={difficultyData} />
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-base font-semibold text-white mb-4">Topic Proficiency</h2>
            <WeakTopicRadar data={topicData} />
          </GlassCard>
        </div>

        {/* Contest Performance */}
        <GlassCard className="p-6">
          <h2 className="text-base font-semibold text-white mb-4">Contest Performance</h2>
          <ContestPerformance data={MOCK_CONTESTS} />
        </GlassCard>

        {/* Submission Timeline */}
        <GlassCard className="p-6">
          <h2 className="text-base font-semibold text-white mb-4">Recent Submission History</h2>
          <div className="space-y-2">
            {[
              { problem: 'Two Sum', platform: 'LeetCode', difficulty: 'Easy', status: 'AC', time: '2h ago' },
              { problem: 'Longest Palindromic Substring', platform: 'LeetCode', difficulty: 'Medium', status: 'AC', time: '5h ago' },
              { problem: 'K-th Largest in BST', platform: 'GFG', difficulty: 'Medium', status: 'WA', time: '1d ago' },
              { problem: 'Dijkstra Shortest Path', platform: 'Codeforces', difficulty: 'Hard', status: 'AC', time: '1d ago' },
              { problem: 'Coin Change II', platform: 'LeetCode', difficulty: 'Medium', status: 'AC', time: '2d ago' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${s.status === 'AC' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className="text-sm text-white font-medium flex-1">{s.problem}</span>
                <Badge variant={s.platform.toLowerCase() === 'geeksforgeeks' ? 'gfg' : s.platform.toLowerCase()}>{s.platform}</Badge>
                <Badge variant={s.difficulty.toLowerCase()}>{s.difficulty}</Badge>
                <Badge variant={s.status === 'AC' ? 'success' : 'error'}>{s.status}</Badge>
                <span className="text-xs text-gray-500 w-12 text-right">{s.time}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
