import { useState, useEffect } from 'react'
import { Trophy, Search, RefreshCw, Award } from 'lucide-react'
import { leaderboardAPI } from '../lib/api'
import LeaderboardTable from '../components/leaderboard/LeaderboardTable'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'

export default function Leaderboard() {
  const { user: currentUser } = useAuth()
  const [tab, setTab] = useState('global')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [myRank, setMyRank] = useState(null)

  const fetchLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      let res
      if (tab === 'global') {
        res = await leaderboardAPI.getGlobal(1, 50)
      } else if (tab === 'friends') {
        res = await leaderboardAPI.getFriends()
      } else if (tab === 'weekly') {
        res = await leaderboardAPI.getWeekly(1)
      } else if (tab === 'monthly') {
        res = await leaderboardAPI.getMonthly(1)
      }

      setUsers(res.data?.data || [])

      // Fetch my rank if API exists
      try {
        const rankRes = await leaderboardAPI.getMyRank()
        setMyRank(rankRes.data?.data)
      } catch (e) {
        // Fallback or silently fail if not implemented
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load leaderboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [tab])

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Map ranks to the users based on position in list
  const usersWithRanks = filteredUsers.map((user, index) => ({
    ...user,
    rank: user.rank || index + 1
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="text-amber-400 animate-bounce" /> Hall of Fame
          </h1>
          <p className="text-sm text-gray-400">See how you measure up against the code community</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchLeaderboard(true)}
            loading={refreshing}
            leftIcon={RefreshCw}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 'global', label: 'Global' },
            { id: 'friends', label: 'Friends' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-300 ${
                tab === id
                  ? 'bg-gradient-to-r from-brand-600 to-accent-500 border-transparent text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search coder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-all"
          />
        </div>
      </GlassCard>

      {/* Stats highlight if user has rank */}
      {myRank && (
        <GlassCard className="p-4 border-brand-500/30 bg-brand-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="text-brand-400 w-8 h-8" />
            <div>
              <p className="text-sm font-semibold text-white">Your Rank: #{myRank.rank}</p>
              <p className="text-xs text-gray-400">Total Solved: {myRank.totalSolved} | Score: {myRank.score}</p>
            </div>
          </div>
          <div className="text-xs text-brand-400 uppercase tracking-widest font-bold">
            Keep pushing!
          </div>
        </GlassCard>
      )}

      {/* Table Card */}
      <GlassCard className="p-6">
        <LeaderboardTable
          users={usersWithRanks}
          isLoading={loading}
          currentUserId={currentUser?._id}
          highlightUser
        />
      </GlassCard>
    </div>
  )
}
