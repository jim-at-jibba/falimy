import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import type { FamiliesResponse } from '@/types/pocketbase-types'
import { toast } from 'sonner'

export function useFamily() {
  const { pb, user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch family details
  const {
    data: family,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['family', user?.family_id],
    queryFn: async () => {
      if (!pb || !user?.family_id) {
        throw new Error('Not authenticated or no family')
      }
      const family = await pb.collection('families').getOne<FamiliesResponse>(user.family_id)
      return family
    },
    enabled: !!pb && !!user?.family_id,
  })

  // Regenerate invite code
  const regenerateInvite = useMutation({
    mutationFn: async () => {
      if (!pb || !user?.family_id) {
        throw new Error('Not authenticated')
      }
      
      // Call the PocketBase hook to regenerate invite code
      const result = await pb.send('/api/falimy/regenerate-invite', {
        method: 'POST',
      })
      
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] })
      toast.success('Invite code regenerated successfully')
    },
    onError: (error) => {
      toast.error('Failed to regenerate invite code: ' + String(error))
    },
  })

  return {
    family,
    isLoading,
    error,
    regenerateInvite: regenerateInvite.mutate,
    isRegenerating: regenerateInvite.isPending,
  }
}
