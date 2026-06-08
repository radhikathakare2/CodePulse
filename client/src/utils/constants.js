// ─── PLATFORM COLORS ────────────────────────────────────────────────────
export const PLATFORM_COLORS = {
  leetcode: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    gradient: 'from-orange-500 to-yellow-500',
    hex: '#f97316',
  },
  codeforces: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    gradient: 'from-blue-500 to-indigo-500',
    hex: '#3b82f6',
  },
  codechef: {
    bg: 'bg-amber-700/20',
    border: 'border-amber-700/30',
    text: 'text-amber-600',
    gradient: 'from-amber-700 to-amber-500',
    hex: '#92400e',
  },
  gfg: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
    hex: '#22c55e',
  },
}

// ─── CODEFORCES RANK COLORS ──────────────────────────────────────────────
export const CF_RANK_COLORS = {
  newbie: { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Newbie', min: 0, max: 1199 },
  pupil: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Pupil', min: 1200, max: 1399 },
  specialist: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'Specialist', min: 1400, max: 1599 },
  expert: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Expert', min: 1600, max: 1899 },
  candidate_master: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Candidate Master', min: 1900, max: 2099 },
  master: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Master', min: 2100, max: 2299 },
  international_master: { color: 'text-orange-300', bg: 'bg-orange-400/20', label: 'International Master', min: 2300, max: 2399 },
  grandmaster: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Grandmaster', min: 2400, max: 2599 },
  international_grandmaster: { color: 'text-red-300', bg: 'bg-red-400/20', label: 'Int. Grandmaster', min: 2600, max: 2999 },
  legendary_grandmaster: { color: 'text-red-500', bg: 'bg-red-600/20', label: 'Legendary Grandmaster', min: 3000, max: Infinity },
}

// ─── SUBSCRIPTION PLANS ──────────────────────────────────────────────────
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    period: null,
    features: [
      'Connect up to 2 platforms',
      'Basic analytics dashboard',
      'Public profile page',
      'Join 1 group',
      'View global leaderboard',
      'Basic contest calendar',
    ],
    limitations: [
      'No AI Insights',
      'No contest predictions',
      'No personalized roadmap',
      'No weekly reports',
    ],
    color: 'gray',
    badge: 'badge-free',
  },
  monthly: {
    id: 'monthly',
    name: 'Premium Monthly',
    price: 99,
    period: 'month',
    priceId: 'price_monthly',
    features: [
      'All 3 platforms connected',
      'Full analytics suite',
      'AI-powered weak topic radar',
      'Personalized study roadmap',
      'Weekly AI performance reports',
      'Contest rating predictions',
      'Unlimited groups',
      'Friends leaderboard',
      'Priority support',
      'Export to PDF',
    ],
    color: 'brand',
    badge: 'badge-premium',
    popular: true,
  },
  yearly: {
    id: 'yearly',
    name: 'Premium Yearly',
    price: 799,
    period: 'year',
    priceId: 'price_yearly',
    monthlyEquivalent: 67,
    savings: '33%',
    features: [
      'Everything in Monthly',
      '33% savings vs monthly',
      'Early access to new features',
      'Exclusive yearly badge',
      'Dedicated support channel',
    ],
    color: 'accent',
    badge: 'badge-premium',
  },
}

// ─── ACHIEVEMENT BADGES ──────────────────────────────────────────────────
export const BADGES = {
  first_solve: { icon: '🎯', label: 'First Solve', description: 'Solved your first problem' },
  streak_7: { icon: '🔥', label: '7 Day Streak', description: '7 day coding streak' },
  streak_30: { icon: '⚡', label: '30 Day Streak', description: '30 day coding streak' },
  streak_100: { icon: '💎', label: '100 Day Streak', description: '100 day coding streak' },
  solved_100: { icon: '💯', label: 'Century', description: 'Solved 100 problems' },
  solved_500: { icon: '🏆', label: 'Champion', description: 'Solved 500 problems' },
  solved_1000: { icon: '👑', label: 'Legend', description: 'Solved 1000 problems' },
  contest_debut: { icon: '🎪', label: 'Contest Debut', description: 'First contest participation' },
  group_leader: { icon: '🌟', label: 'Group Leader', description: 'Led a group to weekly goal' },
  top_10: { icon: '🎖️', label: 'Top 10', description: 'Reached top 10 on leaderboard' },
}

// ─── ROUTES ─────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ANALYTICS: '/analytics',
  AI: '/ai',
  CONTESTS: '/contests',
  GROUPS: '/groups',
  LEADERBOARD: '/leaderboard',
  FRIENDS: '/friends',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SUBSCRIPTION: '/subscription',
  ADMIN: '/admin',
}

// ─── TOPICS ─────────────────────────────────────────────────────────────
export const TOPICS = [
  'Arrays', 'Strings', 'Dynamic Programming', 'Graphs', 'Trees',
  'Binary Search', 'Greedy', 'Math', 'Sorting', 'Backtracking',
  'Stack', 'Queue', 'Heap', 'Hashing', 'Recursion',
  'Two Pointers', 'Sliding Window', 'Bit Manipulation',
]

// ─── DIFFICULTY COLORS ───────────────────────────────────────────────────
export const DIFFICULTY_COLORS = {
  easy: { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', hex: '#10b981' },
  medium: { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', hex: '#f59e0b' },
  hard: { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30', hex: '#f43f5e' },
}

// ─── NOTIFICATION TYPES ──────────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  friend_request: { icon: '👋', color: 'text-blue-400' },
  friend_accepted: { icon: '🤝', color: 'text-green-400' },
  contest_reminder: { icon: '⏰', color: 'text-amber-400' },
  group_invite: { icon: '👥', color: 'text-purple-400' },
  achievement: { icon: '🏆', color: 'text-yellow-400' },
  system: { icon: '🔔', color: 'text-gray-400' },
  leaderboard: { icon: '📊', color: 'text-cyan-400' },
}
