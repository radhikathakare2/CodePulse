import { useState } from 'react'
import { User, Lock, Link as LinkIcon, AlertTriangle, Upload, ShieldAlert } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { userAPI, authAPI, platformAPI } from '../lib/api'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { toast } from 'react-hot-toast'
import { getAvatarUrl } from '../utils/formatters'

export default function Settings() {
  const { user, updateUser, logout } = useAuth()
  
  // General Info states
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [college, setCollege] = useState(user?.college || '')
  const [country, setCountry] = useState(user?.country || '')
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '')
  const [updatingProfile, setUpdatingProfile] = useState(false)

  // Avatar Upload state
  const [avatarFile, setAvatarFile] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Platform Handles states
  const [leetcode, setLeetcode] = useState(user?.platformUsernames?.leetcode || '')
  const [codeforces, setCodeforces] = useState(user?.platformUsernames?.codeforces || '')
  const [gfg, setGfg] = useState(user?.platformUsernames?.gfg || '')
  const [updatingHandles, setUpdatingHandles] = useState(false)

  // Security Password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setUpdatingProfile(true)
      const res = await userAPI.updateProfile({ name, bio, college, country, githubUrl })
      updateUser(res.data?.data)
      toast.success('General settings updated')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update general settings')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleAvatarChange = (e) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleUploadAvatar = async () => {
    if (!avatarFile) return toast.error('Please select an image file first')

    const formData = new FormData()
    formData.append('avatar', avatarFile)

    try {
      setUploadingAvatar(true)
      const res = await userAPI.uploadAvatar(formData)
      updateUser(res.data?.data)
      setAvatarFile(null)
      toast.success('Avatar uploaded successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUpdateHandles = async (e) => {
    e.preventDefault()
    try {
      setUpdatingHandles(true)
      const platformUsernames = { leetcode, codeforces, gfg }
      const res = await userAPI.updateProfile({ platformUsernames })
      updateUser(res.data?.data)
      toast.success('Platform usernames updated!')

      // Proactively trigger a sync in the background
      try {
        if (leetcode) platformAPI.syncLeetCode(leetcode)
        if (codeforces) platformAPI.syncCodeforces(codeforces)
        if (gfg) platformAPI.syncGFG(gfg)
      } catch (e) {
        console.error('Background sync on handle save failed', e)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update coding handles')
    } finally {
      setUpdatingHandles(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match')
    }

    try {
      setUpdatingPassword(true)
      await authAPI.changePassword({ currentPassword, newPassword })
      toast.success('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'WARNING: Are you absolutely sure you want to permanently delete your CodePulse account? This action is irreversible.'
    )
    if (!confirmation) return

    try {
      await userAPI.deleteAccount()
      toast.success('Account permanently deleted')
      logout()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings Panel</h1>
        <p className="text-sm text-gray-400">Configure profile settings, connected coding handles, and password credentials</p>
      </div>

      <div className="space-y-6">
        {/* General Details & Avatar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar Upload */}
          <GlassCard className="p-5 flex flex-col items-center justify-between text-center h-80">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Avatar Image</p>
              <img
                src={getAvatarUrl(user)}
                alt={user?.name}
                className="w-24 h-24 rounded-2xl object-cover mx-auto ring-4 ring-white/10"
                onError={(e) => { e.target.src = getAvatarUrl(null) }}
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload-input"
                />
                <label
                  htmlFor="avatar-upload-input"
                  className="px-4 py-2 border border-white/10 bg-white/5 text-xs text-white rounded-xl cursor-pointer hover:bg-white/10 transition flex items-center gap-1.5 justify-center"
                >
                  <Upload size={14} /> {avatarFile ? 'Change File' : 'Choose File'}
                </label>
                {avatarFile && <p className="text-[10px] text-brand-400 mt-1 truncate max-w-[150px]">{avatarFile.name}</p>}
              </div>
            </div>
            {avatarFile && (
              <Button size="xs" variant="primary" onClick={handleUploadAvatar} loading={uploadingAvatar} className="w-full">
                Upload Selected Image
              </Button>
            )}
          </GlassCard>

          {/* General settings form */}
          <GlassCard className="p-5 md:col-span-2">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <User size={16} className="text-brand-400" />
                <h3 className="font-bold text-white">General Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="College" value={college} onChange={(e) => setCollege(e.target.value)} />
                <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                <Input label="GitHub Link" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} type="url" placeholder="https://github.com/..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full h-16 bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" loading={updatingProfile}>
                  Save Details
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Platform handles connection */}
        <GlassCard className="p-5">
          <form onSubmit={handleUpdateHandles} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <LinkIcon size={16} className="text-brand-400" />
              <h3 className="font-bold text-white">Coding Platform connections</h3>
            </div>
            <p className="text-xs text-gray-400">Provide handles to fetch statistics and sync your activity map</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="LeetCode Username" value={leetcode} onChange={(e) => setLeetcode(e.target.value)} placeholder="LeetCode username" />
              <Input label="Codeforces Handle" value={codeforces} onChange={(e) => setCodeforces(e.target.value)} placeholder="CF handle" />
              <Input label="GeeksforGeeks Handle" value={gfg} onChange={(e) => setGfg(e.target.value)} placeholder="GFG handle" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" loading={updatingHandles}>
                Save handles & Sync
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Password change form */}
        <GlassCard className="p-5">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Lock size={16} className="text-brand-400" />
              <h3 className="font-bold text-white">Update Password Credentials</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              <Input type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <Input type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" loading={updatingPassword}>
                Change Password
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Account deletion warning */}
        <GlassCard className="p-5 border-rose-500/20 bg-rose-500/5">
          <div className="flex items-start gap-4">
            <ShieldAlert className="text-rose-500 w-8 h-8 shrink-0 mt-1" />
            <div className="space-y-3">
              <h4 className="font-bold text-white">Danger Zone: Remove Account</h4>
              <p className="text-xs text-gray-400">
                Removing your account will permanently delete all synced competitive programming cache, group records, peer chats, roadmap plans, and payment records. This is non-reversible.
              </p>
              <Button variant="danger" size="sm" type="button" onClick={handleDeleteAccount}>
                Permanently Delete Account
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
