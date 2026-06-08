import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { platformAPI } from '../lib/api'
import toast from 'react-hot-toast'

export function usePlatformStats() {
  const queryClient = useQueryClient()

  const stats = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => platformAPI.getAllStats().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const syncLeetCode = useMutation({
    mutationFn: (username) => platformAPI.syncLeetCode(username),
    onSuccess: () => {
      toast.success('LeetCode synced successfully!')
      queryClient.invalidateQueries(['platform-stats'])
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to sync LeetCode')
    },
  })

  const syncCodeforces = useMutation({
    mutationFn: (username) => platformAPI.syncCodeforces(username),
    onSuccess: () => {
      toast.success('Codeforces synced successfully!')
      queryClient.invalidateQueries(['platform-stats'])
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to sync Codeforces')
    },
  })

  const syncGFG = useMutation({
    mutationFn: (username) => platformAPI.syncGFG(username),
    onSuccess: () => {
      toast.success('GeeksforGeeks synced successfully!')
      queryClient.invalidateQueries(['platform-stats'])
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to sync GFG')
    },
  })

  const leetcodeStats = useQuery({
    queryKey: ['leetcode-stats'],
    queryFn: () => platformAPI.getLeetCodeStats().then(r => r.data),
    staleTime: 10 * 60 * 1000,
  })

  const codeforcesStats = useQuery({
    queryKey: ['codeforces-stats'],
    queryFn: () => platformAPI.getCodeforcesStats().then(r => r.data),
    staleTime: 10 * 60 * 1000,
  })

  const gfgStats = useQuery({
    queryKey: ['gfg-stats'],
    queryFn: () => platformAPI.getGFGStats().then(r => r.data),
    staleTime: 10 * 60 * 1000,
  })

  return {
    stats: stats.data,
    isLoading: stats.isLoading,
    leetcodeStats: leetcodeStats.data,
    codeforcesStats: codeforcesStats.data,
    gfgStats: gfgStats.data,
    syncLeetCode: syncLeetCode.mutate,
    syncCodeforces: syncCodeforces.mutate,
    syncGFG: syncGFG.mutate,
    isSyncingLC: syncLeetCode.isPending,
    isSyncingCF: syncCodeforces.isPending,
    isSyncingGFG: syncGFG.isPending,
    refetch: stats.refetch,
  }
}
