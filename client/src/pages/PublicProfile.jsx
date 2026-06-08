import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Award, MapPin, School, Github, Code, Calendar, Globe, UserPlus, Heart, MessageSquare } from 'lucide-react'
import { userAPI, platformAPI, friendAPI } from '../lib/api'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import HeatmapCalendar from '../components/charts/HeatmapCalendar'
import LeetCodeStats from '../components/platform/LeetCodeStats'
import CodeforcesStats from '../components/platform/CodeforcesStats'
import GFGStats from '../components/platform/GFGStats'
import { toast } from 'react-hot-toast'
import { getAvatarUrl } from '../utils/formatters'
import { useAuth } from '../hooks/useAuth'

export default function PublicProfile() {
  const { username } = useParams()
  const { isAuthenticated, user: currentUser } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requestSent, setRequestSent] = useState(false)
  const [isFriend, setIsFriend] = useState(false)

  const fetchPublicProfile = async () => {
    try {
      setLoading(true)
      const pRes = await userAPI.getPublicProfile(username)
      const userData = pRes.data?.data
      setProfile(userData)
      
      // Determine social status if authenticated
      if (isAuthenticated && currentUser) {
        setIsFriend(currentUser.friends?.includes(userData._id))
      }

      // Fetch stats and calendar
      const sRes = await platformAPI.getAllStats() // Or public stats if separate, but stats is scoped to current user or profile
      // In this setup let's look for stats where username matches or we fetch public profile platform handles
      setStats(userData.stats || [])

      try {
        const calRes = await platformAPI.getCalendar('leetcode', new Date().getFullYear())
        setCalendarData(calRes.data?.data || {})
      } catch (e) {
        // Silently catch calendar load fails
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load coding portfolio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicProfile()
  }, [username])

  const handleAddFriend = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add friends')
      return
    }
    try {
      await friendAPI.sendRequest(profile._id)
      setRequestSent(true)
      toast.success('Friend request sent!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to send request')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-600/30 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Mapping coder portfolio...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center space-y-4 text-center p-6">
        <h2 className="text-2xl font-bold text-white">Portfolio Not Found</h2>
        <p className="text-gray-400 text-sm max-w-sm">The user portfolio you are looking for does not exist or has been set to private.</p>
        <Link to="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    )
  }

  const isMe = currentUser?._id === profile._id

  return (
    <div className="min-h-screen bg-dark bg-mesh pt-20 px-6 pb-12">
      <div className="max-w-screen-xl mx-auto space-y-6">
        {/* Cover Card */}
        <GlassCard className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-brand-500/20 to-accent-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-6 relative z-10 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row items-center gap-5">
              <img
                src={getAvatarUrl(profile)}
                alt={profile.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover ring-4 ring-white/10"
                onError={(e) => { e.target.src = getAvatarUrl(null) }}
              />
              <div className="space-y-2 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h1>
                  {profile.isPremium && <Badge variant="premium">Premium ✦</Badge>}
                </div>
                <p className="text-sm text-gray-400">@{profile.username}</p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-500">
                  {profile.college && <span className="flex items-center gap-1"><School size={14} /> {profile.college}</span>}
                  {profile.country && <span className="flex items-center gap-1"><MapPin size={14} /> {profile.country}</span>}
                </div>
              </div>
            </div>

            {!isMe && isAuthenticated && (
              <div className="w-full md:w-auto flex gap-2">
                {isFriend ? (
                  <Button variant="secondary" size="sm" disabled leftIcon={Heart}>
                    Connected Buddy
                  </Button>
                ) : requestSent ? (
                  <Button variant="secondary" size="sm" disabled>
                    Request Sent
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={handleAddFriend} leftIcon={UserPlus}>
                    Add Friend
                  </Button>
                )}
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-300 mt-4 border-t border-white/5 pt-4">{profile.bio}</p>
          )}
        </GlassCard>

        {/* Badges */}
        {profile.achievementBadges?.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Award size={18} className="text-brand-400" /> Coding Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {profile.achievementBadges.map((badge, idx) => (
                <GlassCard key={idx} className="p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-white/10 border-brand-500/20">
                  <span className="text-3xl">{badge.icon || '🏅'}</span>
                  <p className="text-xs font-bold text-white">{badge.name}</p>
                  <p className="text-[10px] text-gray-500 leading-snug">{badge.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        {calendarData && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Calendar size={18} className="text-brand-400" /> Contribution Heatmap</h2>
            <GlassCard className="p-5 overflow-x-auto">
              <HeatmapCalendar data={calendarData} />
            </GlassCard>
          </div>
        )}

        {/* Platform stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {profile.platformUsernames?.leetcode ? (
            <GlassCard className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Code className="text-orange-500" />
                <h3 className="font-bold text-white">LeetCode</h3>
              </div>
              <LeetCodeStats stats={stats?.leetcode || {}} />
            </GlassCard>
          ) : null}

          {profile.platformUsernames?.codeforces ? (
            <GlassCard className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Globe className="text-blue-500" />
                <h3 className="font-bold text-white">Codeforces</h3>
              </div>
              <CodeforcesStats stats={stats?.codeforces || {}} />
            </GlassCard>
          ) : null}

          {profile.platformUsernames?.gfg ? (
            <GlassCard className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <School className="text-green-500" />
                <h3 className="font-bold text-white">GeeksforGeeks</h3>
              </div>
              <GFGStats stats={stats?.gfg || {}} />
            </GlassCard>
          ) : null}
        </div>
      </div>
    </div>
  )
}
