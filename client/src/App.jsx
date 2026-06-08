import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import DashboardLayout from './components/layout/DashboardLayout'

// Public Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PublicProfile from './pages/PublicProfile'
import EmailVerification from './pages/EmailVerification'
import NotFound from './pages/NotFound'

// Protected Pages
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import AIInsights from './pages/AIInsights'
import ContestHub from './pages/ContestHub'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Leaderboard from './pages/Leaderboard'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Subscription from './pages/Subscription'

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-600/30 border-t-brand-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-600/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Subscription />} />
      <Route path="/u/:username" element={<PublicProfile />} />
      <Route path="/verify-email" element={<EmailVerification />} />

      {/* Auth Routes - redirect if already logged in */}
      <Route path="/login" element={
        <PublicOnlyRoute><Login /></PublicOnlyRoute>
      } />
      <Route path="/register" element={
        <PublicOnlyRoute><Register /></PublicOnlyRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>
      } />
      <Route path="/reset-password/:token" element={
        <PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>
      } />

      {/* Protected Routes with Dashboard Layout */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai" element={<AIInsights />} />
        <Route path="/contests" element={<ContestHub />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/subscription" element={<Subscription />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminDashboard tab="users" />} />
        <Route path="subscriptions" element={<AdminDashboard tab="subscriptions" />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
