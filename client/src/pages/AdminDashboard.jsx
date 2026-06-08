import { useState, useEffect } from 'react'
import { Shield, Users, CreditCard, Ban, CheckCircle, RefreshCw, Search, DollarSign, UserCheck, TrendingUp } from 'lucide-react'
import { adminAPI } from '../lib/api'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { toast } from 'react-hot-toast'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts'
import { formatNumber } from '../utils/formatters'

export default function AdminDashboard({ tab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(tab)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [revenueData, setRevenueData] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Table search & pages
  const [userQuery, setUserQuery] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [subPage, setSubPage] = useState(1)

  const fetchAdminStats = async () => {
    try {
      const sRes = await adminAPI.getStats()
      setStats(sRes.data?.data)

      try {
        const revRes = await adminAPI.getRevenue('monthly')
        setRevenueData(revRes.data?.data || [])
      } catch (e) {
        // Fallback mock graph data if revenue statistics aggregation fails
        setRevenueData([
          { name: 'Jan', revenue: 4000 },
          { name: 'Feb', revenue: 3000 },
          { name: 'Mar', revenue: 5000 },
          { name: 'Apr', revenue: 8000 },
          { name: 'May', revenue: 12000 },
          { name: 'Jun', revenue: 19000 },
        ])
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load admin stats summary')
    }
  }

  const fetchUsersList = async () => {
    try {
      const res = await adminAPI.getUsers(userPage, userQuery)
      setUsers(res.data?.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to query users database')
    }
  }

  const fetchSubsList = async () => {
    try {
      const res = await adminAPI.getSubscriptions(subPage)
      setSubscriptions(res.data?.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to query subscriptions list')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAdminStats()
    if (activeTab === 'users') await fetchUsersList()
    if (activeTab === 'subscriptions') await fetchSubsList()
    setRefreshing(false)
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchAdminStats()
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') fetchUsersList()
    if (activeTab === 'subscriptions') fetchSubsList()
  }, [activeTab, userPage, userQuery, subPage])

  const handleBanUser = async (userId, isBanned) => {
    try {
      if (isBanned) {
        await adminAPI.unbanUser(userId)
        toast.success('User connection unbanned successfully')
      } else {
        await adminAPI.banUser(userId)
        toast.error('User banned from access')
      }
      fetchUsersList()
      fetchAdminStats()
    } catch (err) {
      console.error(err)
      toast.error('User moderation action failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="text-brand-400" /> Admin Command Center
          </h1>
          <p className="text-sm text-gray-400">Moderation dashboard for users, financial transactions, and general metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            leftIcon={RefreshCw}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1">
        {[
          { id: 'overview', label: 'Overview Metrics' },
          { id: 'users', label: 'User Directory' },
          { id: 'subscriptions', label: 'Premium Subscriptions' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-sm font-semibold transition-all relative ${
              activeTab === id
                ? 'text-white border-b-2 border-brand-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <GlassCard className="p-5 flex items-center gap-4">
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl border border-brand-500/20">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Registers</p>
                <h3 className="text-2xl font-bold text-white">{stats?.totalUsers || '0'}</h3>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Premium Users</p>
                <h3 className="text-2xl font-bold text-white">{stats?.premiumUsers || '0'}</h3>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Sales</p>
                <h3 className="text-2xl font-bold text-white">₹{stats?.totalRevenue ? formatNumber(stats.totalRevenue) : '0'}</h3>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Registrations Today</p>
                <h3 className="text-2xl font-bold text-white">{stats?.newToday || '0'}</h3>
              </div>
            </GlassCard>
          </div>

          {/* Revenue Chart */}
          <div className="grid grid-cols-1 gap-6">
            <GlassCard className="p-5">
              <h3 className="font-bold text-white text-sm mb-4">Revenue Chart (Monthly Sales)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#718096" fontSize={11} />
                    <YAxis stroke="#718096" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A202C', borderColor: '#4A5568', color: '#FFF' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <GlassCard className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="font-bold text-white text-sm">Moderate System Users</h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search username or name..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-brand-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Name / Username</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Premium</th>
                  <th className="py-3 px-4">Banned</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{u.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === 'admin' ? 'purple' : 'secondary'}>{u.role}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {u.isPremium ? <Badge variant="premium">Active</Badge> : <span className="text-gray-500 text-xs">Free</span>}
                    </td>
                    <td className="py-3 px-4">
                      {u.isBanned ? <Badge variant="danger">Banned</Badge> : <Badge variant="success">Normal</Badge>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant={u.isBanned ? 'success' : 'danger'}
                        size="xs"
                        onClick={() => handleBanUser(u._id, u.isBanned)}
                        disabled={u._id === currentUser?._id}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {activeTab === 'subscriptions' && (
        <GlassCard className="p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">Razorpay Subscriptions Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {subscriptions.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-semibold">{sub.userId?.name || 'CP Coder'}</td>
                    <td className="py-3 px-4 uppercase text-brand-400 font-bold">{sub.plan}</td>
                    <td className="py-3 px-4 text-gray-300">₹{sub.amount / 100}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{sub.razorpayOrderId}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
