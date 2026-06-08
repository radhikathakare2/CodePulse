import { useState, useEffect } from 'react'
import { UserPlus, Search, Check, X, RefreshCw, Trash2, Heart, ExternalLink, HelpCircle } from 'lucide-react'
import { friendAPI, userAPI } from '../lib/api'
import FriendCard from '../components/friends/FriendCard'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { getAvatarUrl } from '../utils/formatters'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchFriendData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const friendsRes = await friendAPI.getFriends()
      setFriends(friendsRes.data?.data || [])

      const reqRes = await friendAPI.getRequests()
      setRequests(reqRes.data?.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load friends directory')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFriendData()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setSearching(true)
      const res = await userAPI.searchUsers(searchQuery)
      setSearchResults(res.data?.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to query users')
    } finally {
      setSearching(false)
    }
  }

  const handleSendRequest = async (userId) => {
    try {
      await friendAPI.sendRequest(userId)
      toast.success('Friend request sent!')
      // Update local search results state to reflect sent status
      setSearchResults(prev => prev.map(u => u._id === userId ? { ...u, requestSent: true } : u))
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to send request')
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendAPI.acceptRequest(requestId)
      toast.success('Friend request accepted!')
      fetchFriendData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to accept request')
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await friendAPI.rejectRequest(requestId)
      toast.success('Friend request declined')
      fetchFriendData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to decline request')
    }
  }

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return
    try {
      await friendAPI.removeFriend(friendId)
      toast.success('Removed friend')
      fetchFriendData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove friend')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Heart className="text-rose-500 fill-rose-500" /> Friends Directory
          </h1>
          <p className="text-sm text-gray-400">Discover friends, manage connection requests, and build your coding network</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchFriendData(true)}
            loading={refreshing}
            leftIcon={RefreshCw}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Friends & Requests list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requests Section */}
          {requests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-amber-400">Incoming Requests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((req) => (
                  <GlassCard key={req._id} className="p-4 border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(req.sender)}
                        alt={req.sender?.name}
                        className="w-10 h-10 rounded-xl object-cover"
                        onError={(e) => { e.target.src = getAvatarUrl(null) }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{req.sender?.name}</p>
                        <p className="text-xs text-gray-400">@{req.sender?.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptRequest(req._id)}
                        className="p-2 bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-all"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req._id)}
                        className="p-2 bg-rose-500/20 border border-rose-500/50 hover:bg-rose-500/30 text-rose-400 rounded-xl transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Friends Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">All Connections</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <GlassCard key={i} className="p-4 h-28 animate-pulse shimmer-bg" />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <GlassCard className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <HelpCircle size={32} className="text-gray-500" />
                <p className="text-gray-400 text-sm">You haven't added any friends yet.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => (
                  <FriendCard
                    key={friend._id}
                    friend={friend}
                    onRemove={handleRemoveFriend}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Search Coder directory */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Search Coders</h2>
          <GlassCard className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Username or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                />
              </div>
              <Button type="submit" variant="primary" loading={searching}>
                Find
              </Button>
            </form>

            {/* Results list */}
            {searchResults.length > 0 && (
              <div className="mt-4 divide-y divide-white/10">
                {searchResults.map((user) => (
                  <div key={user._id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.name}
                        className="w-8 h-8 rounded-lg object-cover"
                        onError={(e) => { e.target.src = getAvatarUrl(null) }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">{user.name}</p>
                        <p className="text-[10px] text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                    {user.requestSent ? (
                      <span className="text-[10px] text-brand-400 font-bold uppercase">Sent</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user._id)}
                        className="p-1.5 bg-white/10 hover:bg-brand-500 hover:text-white rounded-lg text-gray-400 transition-all"
                      >
                        <UserPlus size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {searchResults.length === 0 && searchQuery && !searching && (
              <p className="text-xs text-gray-500 text-center mt-4">No programmers found.</p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
