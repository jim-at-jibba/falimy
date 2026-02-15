import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import type { ListsResponse, ListsTypeOptions, ListsStatusOptions } from '@/types/pocketbase-types'
import { toast } from 'sonner'

type CreateListData = {
  name: string
  type: ListsTypeOptions
  assigned_to?: string
}

type UpdateListData = {
  name?: string
  status?: ListsStatusOptions
  assigned_to?: string
}

export function useLists() {
  const { pb, user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all lists for the family
  const {
    data: lists,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lists', user?.family_id],
    queryFn: async () => {
      if (!pb || !user?.family_id) {
        throw new Error('Not authenticated or no family')
      }

      const lists = await pb.collection('lists').getFullList<ListsResponse>({
        filter: `family_id = "${user.family_id}"`,
        sort: '-created',
        expand: 'assigned_to,created_by',
      })

      return lists
    },
    enabled: !!pb && !!user?.family_id,
  })

  // Create a new list
  const createList = useMutation({
    mutationFn: async (data: CreateListData) => {
      if (!pb || !user?.family_id) {
        throw new Error('Not authenticated')
      }

      const newList = await pb.collection('lists').create<ListsResponse>({
        name: data.name,
        type: data.type,
        family_id: user.family_id,
        assigned_to: data.assigned_to,
        created_by: user.id,
        status: 'active',
      })

      return newList
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      toast.success('List created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create list: ' + String(error))
    },
  })

  // Update a list
  const updateList = useMutation({
    mutationFn: async ({ listId, data }: { listId: string; data: UpdateListData }) => {
      if (!pb) {
        throw new Error('Not authenticated')
      }

      const updated = await pb.collection('lists').update<ListsResponse>(listId, data)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      toast.success('List updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update list: ' + String(error))
    },
  })

  // Delete a list
  const deleteList = useMutation({
    mutationFn: async (listId: string) => {
      if (!pb) {
        throw new Error('Not authenticated')
      }

      await pb.collection('lists').delete(listId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      toast.success('List deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete list: ' + String(error))
    },
  })

  // Archive a list
  const archiveList = useMutation({
    mutationFn: async (listId: string) => {
      if (!pb) {
        throw new Error('Not authenticated')
      }

      await pb.collection('lists').update(listId, { status: 'archived' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      toast.success('List archived successfully')
    },
    onError: (error) => {
      toast.error('Failed to archive list: ' + String(error))
    },
  })

  return {
    lists: lists || [],
    isLoading,
    error,
    createList: createList.mutate,
    isCreating: createList.isPending,
    updateList: updateList.mutate,
    isUpdating: updateList.isPending,
    deleteList: deleteList.mutate,
    isDeleting: deleteList.isPending,
    archiveList: archiveList.mutate,
    isArchiving: archiveList.isPending,
  }
}
