import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Search, Filter, Info, Star, ExternalLink, RefreshCw } from 'lucide-react'
import { contestAPI } from '../lib/api'
import ContestCard from '../components/contest/ContestCard'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { toast } from 'react-hot-toast'

export default function ContestHub() {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [interestedList, setInterestedList] = useState([])

  const fetchContests = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      
      const response = await contestAPI.getContests(filter === 'all' ? null : filter)
      setContests(response.data?.data || [])
      
      const interestRes = await contestAPI.getMyInterests()
      const interests = (interestRes.data?.data || []).map(c => c._id)
      setInterestedList(interests)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load contests')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchContests()
  }, [filter])

  const handleToggleInterest = async (contestId) => {
    const isInterested = interestedList.includes(contestId)
    try {
      if (isInterested) {
        await contestAPI.removeInterest(contestId)
        setInterestedList(prev => prev.filter(id => id !== contestId))
        toast.success('Removed from interests')
      } else {
        await contestAPI.registerInterest(contestId)
        setInterestedList(prev => [...prev, contestId])
        toast.success('Added to interested contests!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Action failed')
    }
  }

  const handleSetReminder = async (contestId) => {
    try {
      await contestAPI.setReminder(contestId, 30) // 30 minutes before
      toast.success('Reminder set for 30 minutes before the contest!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to set reminder')
    }
  }

  const filteredContests = contests.filter(contest =>
    contest.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const upcomingContests = filteredContests.filter(c => new Date(c.startTime) > new Date())
  const ongoingContests = filteredContests.filter(c => {
    const now = new Date()
    const start = new Date(c.startTime)
    const end = new Date(start.getTime() + c.duration * 60 * 1000)
    return now >= start && now <= end
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="text-brand-400" /> Contest Hub
          </h1>
          <p className="text-sm text-gray-400">Discover upcoming coding contests from all major platforms</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchContests(true)}
            loading={refreshing}
            leftIcon={RefreshCw}
          >
            Refresh List
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['all', 'leetcode', 'codeforces', 'codechef'].map((platform) => (
            <button
              key={platform}
              onClick={() => setFilter(platform)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-300 ${
                filter === platform
                  ? 'bg-gradient-to-r from-brand-600 to-accent-500 border-transparent text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-all"
          />
        </div>
      </GlassCard>

      {/* Ongoing Contests */}
      {ongoingContests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" /> Ongoing Contests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ongoingContests.map((contest) => (
              <ContestCard
                key={contest._id}
                contest={contest}
                isInterested={interestedList.includes(contest._id)}
                onToggleInterest={handleToggleInterest}
                onSetReminder={handleSetReminder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Contests */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Upcoming Matches</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <GlassCard key={i} className="p-5 h-48 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-24 h-5 bg-white/10 rounded-lg" />
                  <div className="w-full h-6 bg-white/10 rounded-lg" />
                  <div className="w-1/2 h-4 bg-white/10 rounded-lg" />
                </div>
                <div className="w-full h-8 bg-white/10 rounded-lg" />
              </GlassCard>
            ))}
          </div>
        ) : upcomingContests.length === 0 ? (
          <GlassCard className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <Info size={32} className="text-gray-500" />
            <p className="text-gray-400 text-sm">No upcoming contests found.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingContests.map((contest) => (
              <ContestCard
                key={contest._id}
                contest={contest}
                isInterested={interestedList.includes(contest._id)}
                onToggleInterest={handleToggleInterest}
                onSetReminder={handleSetReminder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
