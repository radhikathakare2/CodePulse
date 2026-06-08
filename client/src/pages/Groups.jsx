import { useState, useEffect } from 'react'
import { Users, Plus, Key, Search, ArrowRight, UserPlus, Info } from 'lucide-react'
import { groupAPI } from '../lib/api'
import GroupCard from '../components/groups/GroupCard'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Groups() {
  const navigate = useNavigate()
  const [myGroups, setMyGroups] = useState([])
  const [discoverGroups, setDiscoverGroups] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  
  // Form state
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [weeklyGoal, setWeeklyGoal] = useState(10)
  const [tags, setTags] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const myRes = await groupAPI.getMyGroups()
      setMyGroups(myRes.data?.data || [])

      const allRes = await groupAPI.getGroups()
      // Filter out groups I'm already in
      const myGroupIds = (myRes.data?.data || []).map(g => g._id)
      const discoverable = (allRes.data?.data || []).filter(g => !myGroupIds.includes(g._id))
      setDiscoverGroups(discoverable)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!groupName) return toast.error('Group name is required')
    
    try {
      setSubmitting(true)
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean)
      const res = await groupAPI.createGroup({
        name: groupName,
        description: groupDesc,
        weeklyGoal: Number(weeklyGoal),
        tags: tagsArray
      })
      
      toast.success('Group created successfully!')
      setShowCreateModal(false)
      // Clear form
      setGroupName('')
      setGroupDesc('')
      setWeeklyGoal(10)
      setTags('')
      
      // Navigate to detail
      navigate(`/groups/${res.data?.data?._id}`)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to create group')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoinByCode = async (e) => {
    e.preventDefault()
    if (!inviteCode) return toast.error('Invite code is required')

    try {
      setSubmitting(true)
      const res = await groupAPI.joinByCode(inviteCode)
      toast.success('Joined group successfully!')
      setShowJoinModal(false)
      setInviteCode('')
      navigate(`/groups/${res.data?.data?._id}`)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Invalid invite code or group full')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoinDiscoverGroup = async (groupId) => {
    try {
      await groupAPI.joinGroup(groupId)
      toast.success('Joined group!')
      fetchGroups()
    } catch (err) {
      console.error(err)
      toast.error('Failed to join group')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="text-brand-400" /> Peer Groups
          </h1>
          <p className="text-sm text-gray-400">Assemble your prep squad, compete, and track coding progress together</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowJoinModal(true)}
            leftIcon={Key}
          >
            Join by Code
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            leftIcon={Plus}
          >
            Create Squad
          </Button>
        </div>
      </div>

      {/* Grid of groups */}
      <div className="space-y-6">
        {/* My Groups Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">My Squads</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <GlassCard key={i} className="p-5 h-44 animate-pulse shimmer-bg" />
              ))}
            </div>
          ) : myGroups.length === 0 ? (
            <GlassCard className="p-8 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-2 border-white/10">
              <Users className="text-gray-500 w-12 h-12" />
              <div>
                <p className="text-white font-semibold">Not part of any squads yet</p>
                <p className="text-gray-400 text-xs mt-1">Create one with friends or search public squads below</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreateModal(true)}>Create Squad</Button>
                <Button variant="secondary" size="sm" onClick={() => setShowJoinModal(true)}>Enter Code</Button>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myGroups.map((group) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  onClick={() => navigate(`/groups/${group._id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Discover Groups Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Discover Prep squads</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <GlassCard key={i} className="p-5 h-44 animate-pulse shimmer-bg" />
              ))}
            </div>
          ) : discoverGroups.length === 0 ? (
            <GlassCard className="p-6 text-center text-gray-500 flex items-center justify-center gap-2">
              <Info size={16} /> No new squads available to join.
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {discoverGroups.map((group) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  actionLabel="Join Squad"
                  onAction={() => handleJoinDiscoverGroup(group._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Join Modal */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join Squad by Code">
        <form onSubmit={handleJoinByCode} className="space-y-4">
          <Input
            label="Squad Invite Code"
            placeholder="e.g. SQUAD-12345"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowJoinModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Join Group</Button>
          </div>
        </form>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Prep Squad">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="Squad Name"
            placeholder="e.g. DSA Warriors"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">Description</label>
            <textarea
              placeholder="Describe your group's focus, goals, or targets..."
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              className="w-full h-24 bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all resize-none"
            />
          </div>
          <Input
            type="number"
            label="Weekly Problem Goal (Solved counts per member)"
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(e.target.value)}
            required
            min="1"
          />
          <Input
            label="Tags (Comma separated)"
            placeholder="e.g. interview, dsa, leetcode, graph"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Create Squad</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
