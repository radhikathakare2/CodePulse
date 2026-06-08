import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users, Shield, Send, LogOut, CheckCircle, Info, RefreshCw, Trophy, MessageSquare, Clipboard } from 'lucide-react'
import { groupAPI } from '../lib/api'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import LeaderboardTable from '../components/leaderboard/LeaderboardTable'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  
  const [group, setGroup] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [leaderboard, setLeaderboard] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  
  const chatEndRef = useRef(null)
  const pollingInterval = useRef(null)

  const fetchGroupData = async () => {
    try {
      const gRes = await groupAPI.getGroupDetails(id)
      setGroup(gRes.data?.data)

      const lRes = await groupAPI.getGroupLeaderboard(id)
      setLeaderboard(lRes.data?.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load squad details')
      navigate('/groups')
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await groupAPI.getMessages(id)
      setMessages(res.data?.data || [])
    } catch (err) {
      console.error('Failed to poll chat messages', err)
    }
  }

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchGroupData()
      await fetchMessages()
      setLoading(false)
    }
    init()

    // Poll messages every 4 seconds
    pollingInterval.current = setInterval(fetchMessages, 4000)

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current)
    }
  }, [id])

  // Scroll to bottom of chat when new messages loaded
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeTab])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      setSendingMessage(true)
      const res = await groupAPI.sendMessage(id, newMessage)
      setMessages(prev => [...prev, res.data?.data])
      setNewMessage('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this squad?')) return
    try {
      await groupAPI.leaveGroup(id)
      toast.success('Left group')
      navigate('/groups')
    } catch (err) {
      console.error(err)
      toast.error('Failed to leave group')
    }
  }

  const copyInviteCode = () => {
    if (!group?.inviteCode) return
    navigator.clipboard.writeText(group.inviteCode)
    toast.success('Invite code copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-600/30 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Synchronizing squad headquarters...</p>
      </div>
    )
  }

  if (!group) return null

  const isCreator = group.creator === currentUser?._id
  const totalWeeklySolved = leaderboard.reduce((acc, user) => acc + (user.weeklySolved || 0), 0)

  return (
    <div className="space-y-6">
      {/* Squad Header Card */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{group.name}</h1>
              {isCreator && <Shield size={16} className="text-amber-400" title="Creator" />}
            </div>
            <p className="text-sm text-gray-400 max-w-xl">{group.description || 'No description provided.'}</p>
            
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {group.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
              ))}
              <Badge variant="purple" className="text-xs">Weekly Goal: {group.weeklyGoal} Problems</Badge>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white">
              <span className="text-gray-400 font-medium">Invite Code:</span>
              <code className="text-brand-400 font-mono font-bold select-all">{group.inviteCode}</code>
              <button onClick={copyInviteCode} className="text-gray-400 hover:text-white transition-colors ml-1">
                <Clipboard size={14} />
              </button>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLeaveGroup}
              leftIcon={LogOut}
            >
              Leave Squad
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: Info },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'chat', label: 'Squad Chat', icon: MessageSquare },
          { id: 'members', label: 'Members', icon: Users },
        ].map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all relative ${
              activeTab === tabId
                ? 'text-white border-b-2 border-brand-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Squad Stats */}
            <GlassCard className="p-5 flex flex-col justify-between h-48 md:col-span-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Members</p>
                <h2 className="text-4xl font-extrabold text-white mt-2">{group.members?.length}</h2>
              </div>
              <p className="text-xs text-gray-500">Max Capacity: {group.maxMembers || 50} users</p>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between h-48 md:col-span-2">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Weekly Goal Progress</p>
                  <span className="text-xs font-bold text-brand-400">{totalWeeklySolved} Solved</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3.5 mt-4 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-brand-600 to-accent-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalWeeklySolved / (group.weeklyGoal * (group.members?.length || 1))) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Weekly group goal is {group.weeklyGoal * (group.members?.length || 1)} solved tasks combined.
              </p>
            </GlassCard>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <GlassCard className="p-5">
            <LeaderboardTable
              users={leaderboard.map((u, idx) => ({ ...u, rank: idx + 1 }))}
              currentUserId={currentUser?._id}
              highlightUser
            />
          </GlassCard>
        )}

        {activeTab === 'chat' && (
          <GlassCard className="p-4 flex flex-col h-[500px] border border-white/10">
            {/* Message Board */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-gray-500">
                  <MessageSquare size={32} />
                  <p className="text-sm">Welcome to squad headquarters. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender?._id === currentUser?._id
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1 px-1">
                        <span className="font-semibold text-gray-400">
                          {isMe ? 'You' : msg.sender?.name || msg.sender?.username}
                        </span>
                        <span>•</span>
                        <span>{msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt)) + ' ago' : 'now'}</span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-lg text-sm ${
                        isMe
                          ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white rounded-tr-none'
                          : 'bg-white/10 text-white rounded-tl-none border border-white/10'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                disabled={sendingMessage}
              />
              <Button
                type="submit"
                variant="primary"
                loading={sendingMessage}
                disabled={!newMessage.trim()}
              >
                <Send size={16} />
              </Button>
            </form>
          </GlassCard>
        )}

        {activeTab === 'members' && (
          <GlassCard className="p-5">
            <div className="divide-y divide-white/10">
              {group.members?.map((member) => {
                const isAdmin = member.role === 'admin'
                return (
                  <div key={member.userId} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-brand-400 text-sm">
                        {member.name?.slice(0, 2).toUpperCase() || 'CP'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{member.name || 'Group Coder'}</p>
                          {isAdmin && <Shield size={12} className="text-brand-400" />}
                        </div>
                        <p className="text-xs text-gray-500">Joined {formatDistanceToNow(new Date(member.joinedAt))} ago</p>
                      </div>
                    </div>
                    <div>
                      {isAdmin ? (
                        <span className="text-xs text-brand-400 font-bold tracking-wider uppercase bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">Admin</span>
                      ) : (
                        <span className="text-xs text-gray-500 uppercase font-semibold">Member</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
