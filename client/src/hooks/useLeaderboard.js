import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { leaderboardAPI } from '../lib/api'

export function useLeaderboard() {
  const [activeTab, setActiveTab] = useState('global')
  const [page, setPage] = useState(1)

  const global = useQuery({
    queryKey: ['leaderboard', 'global', page],
    queryFn: () => leaderboardAPI.getGlobal(page).then(r => r.data),
    enabled: activeTab === 'global',
    staleTime: 3 * 60 * 1000,
    keepPreviousData: true,
  })

  const weekly = useQuery({
    queryKey: ['leaderboard', 'weekly', page],
    queryFn: () => leaderboardAPI.getWeekly(page).then(r => r.data),
    enabled: activeTab === 'weekly',
    staleTime: 3 * 60 * 1000,
  })

  const monthly = useQuery({
    queryKey: ['leaderboard', 'monthly', page],
    queryFn: () => leaderboardAPI.getMonthly(page).then(r => r.data),
    enabled: activeTab === 'monthly',
    staleTime: 3 * 60 * 1000,
  })

  const friends = useQuery({
    queryKey: ['leaderboard', 'friends'],
    queryFn: () => leaderboardAPI.getFriends().then(r => r.data),
    enabled: activeTab === 'friends',
    staleTime: 5 * 60 * 1000,
  })

  const myRank = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => leaderboardAPI.getMyRank().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const currentData = {
    global: global.data,
    weekly: weekly.data,
    monthly: monthly.data,
    friends: friends.data,
  }[activeTab]

  const isLoading = {
    global: global.isLoading,
    weekly: weekly.isLoading,
    monthly: monthly.isLoading,
    friends: friends.isLoading,
  }[activeTab]

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPage(1)
  }

  return {
    activeTab,
    setActiveTab: handleTabChange,
    page,
    setPage,
    data: currentData,
    users: currentData?.users || [],
    totalPages: currentData?.totalPages || 1,
    isLoading,
    myRank: myRank.data,
  }
}
