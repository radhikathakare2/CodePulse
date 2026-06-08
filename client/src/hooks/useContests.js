import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contestAPI } from '../lib/api'
import toast from 'react-hot-toast'

export function useContests(platform = 'all', status = 'upcoming') {
  const queryClient = useQueryClient()

  const contests = useQuery({
    queryKey: ['contests', platform, status],
    queryFn: () => contestAPI.getContests(platform, status).then(r => r.data),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  })

  const myInterests = useQuery({
    queryKey: ['contest-interests'],
    queryFn: () => contestAPI.getMyInterests().then(r => r.data),
  })

  const registerInterest = useMutation({
    mutationFn: (contestId) => contestAPI.registerInterest(contestId),
    onSuccess: () => {
      toast.success('Added to your interests!')
      queryClient.invalidateQueries(['contest-interests'])
      queryClient.invalidateQueries(['contests'])
    },
    onError: () => toast.error('Failed to register interest'),
  })

  const removeInterest = useMutation({
    mutationFn: (contestId) => contestAPI.removeInterest(contestId),
    onSuccess: () => {
      toast.success('Removed from interests')
      queryClient.invalidateQueries(['contest-interests'])
      queryClient.invalidateQueries(['contests'])
    },
  })

  const setReminder = useMutation({
    mutationFn: ({ contestId, minutesBefore }) => contestAPI.setReminder(contestId, minutesBefore),
    onSuccess: () => toast.success('Reminder set!'),
    onError: () => toast.error('Failed to set reminder'),
  })

  const isInterested = (contestId) => {
    return myInterests.data?.interests?.includes(contestId) || false
  }

  return {
    contests: contests.data?.contests || [],
    isLoading: contests.isLoading,
    isError: contests.isError,
    myInterests: myInterests.data?.interests || [],
    registerInterest: registerInterest.mutate,
    removeInterest: removeInterest.mutate,
    setReminder: setReminder.mutate,
    isInterested,
    isRegistering: registerInterest.isPending,
    totalPages: contests.data?.totalPages || 1,
  }
}
