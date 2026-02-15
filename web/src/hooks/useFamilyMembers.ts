import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import type { UsersResponse, UsersRoleOptions } from '@/types/pocketbase-types'
import { toast } from 'sonner'

export function useFamilyMembers() {
  const { pb, user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all family members
  const {
    data: members,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['family-members', user?.family_id],
    queryFn: async () => {
      if (!pb || !user?.family_id) {
        throw new Error('Not authenticated or no family')
      }
      
      const members = await pb.collection('users').getFullList<UsersResponse>({
        filter: `family_id = "${user.family_id}"`,
        sort: '-created',
      })
      
      return members
    },
    enabled: !!pb && !!user?.family_id,
  })

  // Update member role (admin only)
  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: UsersRoleOptions }) => {
      if (!pb) {
        throw new Error('Not authenticated')
      }
      
      if (user?.role !== 'admin') {
        throw new Error('Only admins can change member roles')
      }
      
      const updated = await pb.collection('users').update<UsersResponse>(memberId, {
        role,
      })
      
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] })
      toast.success('Member role updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update member role: ' + String(error))
    },
  })

  // Remove member from family (admin only)
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      if (!pb) {
        throw new Error('Not authenticated')
      }
      
      if (user?.role !== 'admin') {
        throw new Error('Only admins can remove members')
      }
      
      // Set family_id to null to remove from family
      await pb.collection('users').update(memberId, {
        family_id: null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] })
      toast.success('Member removed from family')
    },
    onError: (error) => {
      toast.error('Failed to remove member: ' + String(error))
    },
  })

  return {
    members: members || [],
    isLoading,
    error,
    updateMemberRole: updateMemberRole.mutate,
    isUpdatingRole: updateMemberRole.isPending,
    removeMember: removeMember.mutate,
    isRemovingMember: removeMember.isPending,
  }
}
