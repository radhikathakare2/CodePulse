import { useState, useEffect } from 'react'
import { User, Mail, Award, MapPin, Globe, School, Github, Code, Calendar, Share2, Edit2, Check, RefreshCw } from 'lucide-react'
import { userAPI, platformAPI } from '../lib/api'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import HeatmapCalendar from '../components/charts/HeatmapCalendar'
import LeetCodeStats from '../components/platform/LeetCodeStats'
import CodeforcesStats from '../components/platform/CodeforcesStats'
import GFGStats from '../components/platform/GFGStats'
import { toast } from 'react-hot-toast'
import { getAvatarUrl } from '../utils/formatters'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [editing, setEditing] = useState(false)

  // Edit fields
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [college, setCollege] = useState('')
  const [country, setCountry] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [updating, setUpdating] = useState(false)

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const pRes = await userAPI.getProfile()
      const userData = pRes.data?.data
      setProfile(userData)

      // Initialize edit fields
      setName(userData.name || '')
      setBio(userData.bio || '')
      setCollege(userData.college || '')
      setCountry(userData.country || '')
      setGithubUrl(userData.githubUrl || '')

      const sRes = await platformAPI.getAllStats()
      setStats(sRes.data?.data || {})

      try {
        const calRes = await platformAPI.getCalendar('leetcode', new Date().getFullYear())
        setCalendarData(calRes.data?.data || {})
      } catch (err) {
        console.error('Failed to get calendar data', err)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load profile details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setUpdating(true)
      const res = await userAPI.updateProfile({ name, bio, college, country, githubUrl })
      setProfile(res.data?.data)
      toast.success('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const handleSyncPlatforms = async () => {
    try {
      setSyncing(true)
      if (profile.platformUsernames?.leetcode) {
        await platformAPI.syncLeetCode(profile.platformUsernames.leetcode)
      }
      if (profile.platformUsernames?.codeforces) {
        await platformAPI.syncCodeforces(profile.platformUsernames.codeforces)
      }
      if (profile.platformUsernames?.gfg) {
        await platformAPI.syncGFG(profile.platformUsernames.gfg)
      }
      toast.success('Coding stats sync successful!')
      const sRes = await platformAPI.getAllStats()
      setStats(sRes.data?.data || {})
    } catch (err) {
      console.error(err)
      toast.error('Stats synchronization partially failed')
    } finally {
      setSyncing(false)
    }
  }

  const copyShareLink = () => {
    if (!profile?.username) return
    const shareUrl = `${window.location.origin}/u/${profile.username}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Public portfolio link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-600/30 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Gathering coding achievements...</p>
      </div>
    )
  }

  if (!profile) return null

  // Collect all platform stats
  const leetCodeData = stats?.find(s => s.platform === 'leetcode')?.leetcode || {}
  const cfData = stats?.find(s => s.platform === 'codeforces')?.codeforces || {}
  const gfgData = stats?.find(s => s.platform === 'gfg')?.gfg || {}

  return (
    <div className="space-y-6">
      {/* Profile Card Header */}
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

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="secondary" size="sm" onClick={copyShareLink} className="flex-1 md:flex-initial" leftIcon={Share2}>
              Share Portfolio
            </Button>
            <Button
              variant={editing ? 'success' : 'secondary'}
              size="sm"
              onClick={() => setEditing(!editing)}
              className="flex-1 md:flex-initial"
              leftIcon={editing ? Check : Edit2}
            >
              {editing ? 'Stop Editing' : 'Edit Profile'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSyncPlatforms} loading={syncing} leftIcon={RefreshCw} className="flex-1 md:flex-initial">
              Sync stats
            </Button>
          </div>
        </div>

        {/* Bio Text */}
        {!editing && profile.bio && (
          <p className="text-sm text-gray-300 mt-4 border-t border-white/5 pt-4">{profile.bio}</p>
        )}
      </GlassCard>

      {/* Edit Form Module */}
      {editing && (
        <GlassCard className="p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-2">Update Credentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">College / Institution</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">GitHub Url</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-20 bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all resize-none"
                placeholder="A short snippet about you..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={updating}>Save Changes</Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Badges Accomplished */}
      {profile.achievementBadges?.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Award size={18} className="text-brand-400" /> Earned Badges</h2>
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

      {/* Contribution Calendar Heatmap */}
      {calendarData && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Calendar size={18} className="text-brand-400" /> Contribution Heatmap</h2>
          <GlassCard className="p-5 overflow-x-auto">
            <HeatmapCalendar data={calendarData} />
          </GlassCard>
        </div>
      )}

      {/* Detailed Platforms Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {profile.platformUsernames?.leetcode ? (
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Code className="text-orange-500" />
              <h3 className="font-bold text-white">LeetCode Stats</h3>
            </div>
            <LeetCodeStats stats={leetCodeData} />
          </GlassCard>
        ) : (
          <GlassCard className="p-5 text-center flex flex-col items-center justify-center space-y-2 text-gray-500 h-64 border-dashed border-2 border-white/10">
            <Code />
            <p className="text-xs">LeetCode profile not connected</p>
          </GlassCard>
        )}

        {profile.platformUsernames?.codeforces ? (
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Globe className="text-blue-500" />
              <h3 className="font-bold text-white">Codeforces Stats</h3>
            </div>
            <CodeforcesStats stats={cfData} />
          </GlassCard>
        ) : (
          <GlassCard className="p-5 text-center flex flex-col items-center justify-center space-y-2 text-gray-500 h-64 border-dashed border-2 border-white/10">
            <Globe />
            <p className="text-xs">Codeforces profile not connected</p>
          </GlassCard>
        )}

        {profile.platformUsernames?.gfg ? (
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <School className="text-green-500" />
              <h3 className="font-bold text-white">GeeksforGeeks Stats</h3>
            </div>
            <GFGStats stats={gfgData} />
          </GlassCard>
        ) : (
          <GlassCard className="p-5 text-center flex flex-col items-center justify-center space-y-2 text-gray-500 h-64 border-dashed border-2 border-white/10">
            <School />
            <p className="text-xs">GeeksforGeeks profile not connected</p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
