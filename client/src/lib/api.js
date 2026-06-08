import api from './axios'

// ─── AUTH ──────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/api/v1/auth/login', data),
  register: (data) => api.post('/api/v1/auth/register', data),
  logout: () => api.post('/api/v1/auth/logout'),
  forgotPassword: (email) => api.post('/api/v1/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/api/v1/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.post('/api/v1/auth/change-password', data),
  verifyEmail: (token) => api.get(`/api/v1/auth/verify-email/${token}`),
  refresh: () => api.post('/api/v1/auth/refresh'),
  me: () => api.get('/api/v1/auth/me'),
}

// ─── USER ───────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/api/v1/users/me'),
  updateProfile: (data) => api.patch('/api/v1/users/me', data),
  uploadAvatar: (formData) => api.post('/api/v1/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  searchUsers: (query) => api.get(`/api/v1/users/search?q=${query}`),
  getPublicProfile: (username) => api.get(`/api/v1/users/${username}`),
  deleteAccount: () => api.delete('/api/v1/users/me'),
}

// ─── PLATFORM ───────────────────────────────────────────────────────────
export const platformAPI = {
  syncLeetCode: (username) => api.post('/api/v1/platform/leetcode/sync', { username }),
  syncCodeforces: (username) => api.post('/api/v1/platform/codeforces/sync', { username }),
  syncGFG: (username) => api.post('/api/v1/platform/gfg/sync', { username }),
  getAllStats: () => api.get('/api/v1/platform/stats'),
  getCalendar: (platform, year) => api.get(`/api/v1/platform/calendar?platform=${platform}&year=${year}`),
  getLeetCodeStats: () => api.get('/api/v1/platform/leetcode/stats'),
  getCodeforcesStats: () => api.get('/api/v1/platform/codeforces/stats'),
  getGFGStats: () => api.get('/api/v1/platform/gfg/stats'),
  getRatingHistory: (platform) => api.get(`/api/v1/platform/rating-history?platform=${platform}`),
  getRecentSubmissions: (limit = 10) => api.get(`/api/v1/platform/submissions?limit=${limit}`),
}

// ─── CONTEST ────────────────────────────────────────────────────────────
export const contestAPI = {
  getContests: (platform, status) => {
    const params = new URLSearchParams()
    if (platform && platform !== 'all') params.append('platform', platform)
    if (status) params.append('status', status)
    return api.get(`/api/v1/contests?${params}`)
  },
  registerInterest: (contestId) => api.post(`/api/v1/contests/${contestId}/interest`),
  removeInterest: (contestId) => api.delete(`/api/v1/contests/${contestId}/interest`),
  setReminder: (contestId, minutesBefore) => api.post(`/api/v1/contests/${contestId}/reminder`, { minutesBefore }),
  getMyInterests: () => api.get('/api/v1/contests/interests'),
}

// ─── FRIEND ─────────────────────────────────────────────────────────────
export const friendAPI = {
  getFriends: () => api.get('/api/v1/friends'),
  getRequests: () => api.get('/api/v1/friends/requests'),
  sendRequest: (userId) => api.post('/api/v1/friends/request', { userId }),
  acceptRequest: (requestId) => api.patch(`/api/v1/friends/request/${requestId}/accept`),
  rejectRequest: (requestId) => api.patch(`/api/v1/friends/request/${requestId}/reject`),
  removeFriend: (friendId) => api.delete(`/api/v1/friends/${friendId}`),
  compareWith: (friendId) => api.get(`/api/v1/friends/${friendId}/compare`),
}

// ─── GROUP ──────────────────────────────────────────────────────────────
export const groupAPI = {
  getGroups: () => api.get('/api/v1/groups'),
  getMyGroups: () => api.get('/api/v1/groups/my'),
  createGroup: (data) => api.post('/api/v1/groups', data),
  joinGroup: (groupId) => api.post(`/api/v1/groups/${groupId}/join`),
  joinByCode: (code) => api.post('/api/v1/groups/join-by-code', { code }),
  leaveGroup: (groupId) => api.post(`/api/v1/groups/${groupId}/leave`),
  getGroupDetails: (groupId) => api.get(`/api/v1/groups/${groupId}`),
  getGroupLeaderboard: (groupId) => api.get(`/api/v1/groups/${groupId}/leaderboard`),
  getGroupMembers: (groupId) => api.get(`/api/v1/groups/${groupId}/members`),
  sendMessage: (groupId, content) => api.post(`/api/v1/groups/${groupId}/messages`, { content }),
  getMessages: (groupId, page = 1) => api.get(`/api/v1/groups/${groupId}/messages?page=${page}`),
  updateGroup: (groupId, data) => api.patch(`/api/v1/groups/${groupId}`, data),
  deleteGroup: (groupId) => api.delete(`/api/v1/groups/${groupId}`),
}

// ─── LEADERBOARD ────────────────────────────────────────────────────────
export const leaderboardAPI = {
  getGlobal: (page = 1, limit = 50) => api.get(`/api/v1/leaderboard/global?page=${page}&limit=${limit}`),
  getFriends: () => api.get('/api/v1/leaderboard/friends'),
  getWeekly: (page = 1) => api.get(`/api/v1/leaderboard/weekly?page=${page}`),
  getMonthly: (page = 1) => api.get(`/api/v1/leaderboard/monthly?page=${page}`),
  getMyRank: () => api.get('/api/v1/leaderboard/my-rank'),
}

// ─── AI ─────────────────────────────────────────────────────────────────
export const aiAPI = {
  getWeakTopics: () => api.get('/api/v1/ai/weak-topics'),
  getRoadmap: () => api.get('/api/v1/ai/roadmap'),
  getWeeklyReport: () => api.get('/api/v1/ai/weekly-report'),
  getContestPrediction: () => api.get('/api/v1/ai/contest-prediction'),
  getSavedRoadmap: () => api.get('/api/v1/ai/saved-roadmap'),
  regenerateRoadmap: () => api.post('/api/v1/ai/roadmap/regenerate'),
  regenerateReport: () => api.post('/api/v1/ai/weekly-report/regenerate'),
  saveRoadmapProgress: (weekId, completed) => api.patch(`/api/v1/ai/roadmap/week/${weekId}`, { completed }),
}

// ─── SUBSCRIPTION ────────────────────────────────────────────────────────
export const subscriptionAPI = {
  getStatus: () => api.get('/api/v1/subscription/status'),
  createOrder: (plan) => api.post('/api/v1/subscription/create-order', { plan }),
  verifyPayment: (data) => api.post('/api/v1/subscription/verify', data),
  cancelSubscription: () => api.post('/api/v1/subscription/cancel'),
  getHistory: () => api.get('/api/v1/subscription/history'),
}

// ─── NOTIFICATION ────────────────────────────────────────────────────────
export const notificationAPI = {
  getNotifications: () => api.get('/api/v1/notifications'),
  markRead: (id) => api.patch(`/api/v1/notifications/${id}/read`),
  markAllRead: () => api.patch('/api/v1/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/api/v1/notifications/${id}`),
}

// ─── ADMIN ──────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/api/v1/admin/stats'),
  getUsers: (page = 1, query = '') => api.get(`/api/v1/admin/users?page=${page}&q=${query}`),
  banUser: (userId) => api.patch(`/api/v1/admin/users/${userId}/ban`),
  unbanUser: (userId) => api.patch(`/api/v1/admin/users/${userId}/unban`),
  deleteUser: (userId) => api.delete(`/api/v1/admin/users/${userId}`),
  getSubscriptions: (page = 1) => api.get(`/api/v1/admin/subscriptions?page=${page}`),
  getRevenue: (period) => api.get(`/api/v1/admin/revenue?period=${period}`),
  getUserGrowth: () => api.get('/api/v1/admin/user-growth'),
}
