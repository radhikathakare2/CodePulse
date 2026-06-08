import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Brain, Crown, RefreshCw, Zap, TrendingUp, BarChart2, Target, AlertTriangle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import WeakTopicRadar from '../components/ai/WeakTopicRadar'
import RoadmapTimeline from '../components/ai/RoadmapTimeline'
import InsightCard from '../components/ai/InsightCard'
import { aiAPI } from '../lib/api'
import toast from 'react-hot-toast'

const MOCK_WEAK_TOPICS = [
  { topic: 'Dynamic Programming', score: 42 },
  { topic: 'Graph Algorithms', score: 35 },
  { topic: 'Trees', score: 68 },
  { topic: 'Binary Search', score: 81 },
  { topic: 'Greedy', score: 57 },
  { topic: 'Strings', score: 72 },
  { topic: 'Arrays', score: 88 },
  { topic: 'Math', score: 49 },
]

const MOCK_ROADMAP = [
  {
    weekId: 'w1', title: 'Dynamic Programming Fundamentals', description: 'Master the basics of DP: memoization, tabulation, and state transitions.',
    difficulty: 'Medium', completed: true,
    topics: ['1D DP', 'Memoization', 'Fibonacci variants'],
    problems: [
      { name: 'Climbing Stairs', difficulty: 'Easy', completed: true, url: 'https://leetcode.com/problems/climbing-stairs/' },
      { name: 'House Robber', difficulty: 'Medium', completed: true, url: 'https://leetcode.com/problems/house-robber/' },
      { name: 'Coin Change', difficulty: 'Medium', completed: false, url: 'https://leetcode.com/problems/coin-change/' },
    ],
  },
  {
    weekId: 'w2', title: 'Advanced DP Patterns', description: 'Tackle 2D DP, interval DP, and tree DP problems.',
    difficulty: 'Hard', completed: false,
    topics: ['2D DP', 'Knapsack', 'LCS/LIS'],
    problems: [
      { name: 'Longest Common Subsequence', difficulty: 'Medium', completed: false },
      { name: '0/1 Knapsack', difficulty: 'Medium', completed: false },
      { name: 'Edit Distance', difficulty: 'Hard', completed: false },
    ],
  },
  {
    weekId: 'w3', title: 'Graph Traversal & Shortest Paths', description: 'BFS, DFS, Dijkstra, and Bellman-Ford algorithms.',
    difficulty: 'Hard', completed: false,
    topics: ['BFS', 'DFS', 'Dijkstra', 'Bellman-Ford'],
    problems: [
      { name: 'Number of Islands', difficulty: 'Medium', completed: false },
      { name: 'Course Schedule', difficulty: 'Medium', completed: false },
      { name: 'Network Delay Time', difficulty: 'Medium', completed: false },
    ],
  },
]

const MOCK_INSIGHTS = [
  { text: 'Your Dynamic Programming solve rate is 42% — significantly below average. Focus on understanding state transitions before solving problems.', category: 'weakness', topic: 'Dynamic Programming', impact: 'high' },
  { text: 'You\'re excelling at Array problems with 88% proficiency. Consider moving to harder variants like sliding window and two-pointer optimizations.', category: 'strength', topic: 'Arrays' },
  { text: 'Practice at least 2 Graph problems daily for the next 2 weeks to improve your graph algorithms score from 35% to 60%+.', category: 'tip', topic: 'Graphs', impact: 'high' },
  { text: 'Your Binary Search score (81%) is solid. You\'re ready to tackle Binary Search on Answer problems.', category: 'improvement', topic: 'Binary Search' },
]

function PremiumGate() {
  return (
    <div className="relative flex items-center justify-center min-h-96 overflow-hidden rounded-3xl">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 to-dark rounded-3xl" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Decorative blurred cards */}
      <div className="absolute inset-0 p-8 opacity-30 pointer-events-none">
        <div className="grid grid-cols-2 gap-4 h-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-sm mx-auto p-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-brand-600 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-purple">
          <Brain size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-3">AI Insights</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Unlock personalized weak topic analysis, custom study roadmaps, weekly AI reports, and contest predictions.
        </p>
        <div className="space-y-3 mb-8 text-left">
          {[
            'Weak topic radar with AI analysis',
            'Personalized 12-week study roadmap',
            'Weekly performance reports',
            'Contest rating predictions',
          ].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
              <Sparkles size={14} className="text-brand-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>
        <Link to="/subscription">
          <Button variant="premium" size="lg" className="w-full" leftIcon={Crown}>
            Upgrade to Premium — ₹99/mo
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

function ContestPredictionCard({ data }) {
  const probability = data?.probability || 72

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target size={16} className="text-brand-400" />
        <h3 className="font-semibold text-white text-sm">Contest Rating Prediction</h3>
      </div>
      <div className="flex items-center gap-6 mb-4">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="url(#probGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2.51 * probability} 251`}
            />
            <defs>
              <linearGradient id="probGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{probability}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Probability of rating increase in next contest</p>
          <p className={`text-2xl font-bold ${data?.expectedChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {data?.expectedChange > 0 ? '+' : ''}{data?.expectedChange || '+34'}
          </p>
          <p className="text-xs text-gray-500">Expected rating change</p>
        </div>
      </div>
      <div className="text-xs text-gray-500 bg-white/5 rounded-xl p-3">
        💡 Based on your last 10 contests and current rating trajectory. Practice more Graph and DP problems to improve odds.
      </div>
    </GlassCard>
  )
}

function WeeklyReport({ data }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-brand-400" />
          <h3 className="font-semibold text-white text-sm">Weekly Performance Report</h3>
        </div>
        <span className="text-xs text-gray-500">This Week</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Problems Solved', value: data?.solved || 18, color: 'text-brand-400' },
          { label: 'Contests', value: data?.contests || 2, color: 'text-amber-400' },
          { label: 'Study Hours', value: `${data?.hours || 12}h`, color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center bg-white/5 rounded-xl p-3">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Highlights</p>
        <p className="text-sm text-gray-300 leading-relaxed">
          📈 Your performance improved 23% this week. You're consistently solving medium-difficulty problems.
          Focus on: <span className="text-brand-400 font-medium">Dynamic Programming</span> and{' '}
          <span className="text-brand-400 font-medium">Graph Algorithms</span>.
        </p>
      </div>
    </GlassCard>
  )
}

export default function AIInsights() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isPremium = user?.isPremium

  const weakTopics = useQuery({
    queryKey: ['weak-topics'],
    queryFn: () => aiAPI.getWeakTopics().then(r => r.data).catch(() => ({ topics: MOCK_WEAK_TOPICS })),
    enabled: isPremium,
  })

  const roadmap = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => aiAPI.getSavedRoadmap().then(r => r.data).catch(() => ({ weeks: MOCK_ROADMAP })),
    enabled: isPremium,
  })

  const weeklyReport = useQuery({
    queryKey: ['weekly-report'],
    queryFn: () => aiAPI.getWeeklyReport().then(r => r.data).catch(() => null),
    enabled: isPremium,
  })

  const regenerate = useMutation({
    mutationFn: aiAPI.regenerateRoadmap,
    onSuccess: () => {
      toast.success('Roadmap regenerated!')
      queryClient.invalidateQueries(['roadmap'])
    },
    onError: () => toast.error('Failed to regenerate'),
  })

  if (!isPremium) {
    return (
      <div className="pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Brain size={24} className="text-brand-400" />
            AI Insights
          </h1>
          <p className="text-gray-400 text-sm mt-1">Powered by machine learning for your coding journey</p>
        </div>
        <PremiumGate />
      </div>
    )
  }

  const topicData = weakTopics.data?.topics || MOCK_WEAK_TOPICS
  const roadmapWeeks = roadmap.data?.weeks || MOCK_ROADMAP

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Brain size={24} className="text-brand-400" />
            AI Insights
          </h1>
          <p className="text-gray-400 text-sm mt-1">Personalized analysis powered by AI</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={RefreshCw}
          onClick={() => regenerate.mutate()}
          loading={regenerate.isPending}
        >
          Regenerate
        </Button>
      </div>

      {/* Top Row: Radar + Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-400" />
              Topic Proficiency Radar
            </h2>
            <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-1 rounded-full">
              {topicData.filter(t => t.score < 60).length} weak areas
            </span>
          </div>
          <WeakTopicRadar data={topicData} />
        </GlassCard>

        <div className="space-y-4">
          <WeeklyReport data={weeklyReport.data} />
          <ContestPredictionCard />
        </div>
      </div>

      {/* AI Insights Cards */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-brand-400" />
          <h2 className="text-base font-semibold text-white">AI-Generated Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOCK_INSIGHTS.map((insight, i) => (
            <InsightCard key={i} insight={insight} delay={i * 0.08} />
          ))}
        </div>
      </GlassCard>

      {/* Roadmap */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-brand-400" />
            <h2 className="text-base font-semibold text-white">Personalized Study Roadmap</h2>
          </div>
          <div className="text-xs text-gray-500">
            {roadmapWeeks.filter(w => w.completed).length}/{roadmapWeeks.length} weeks completed
          </div>
        </div>
        <RoadmapTimeline weeks={roadmapWeeks} />
      </GlassCard>
    </div>
  )
}
