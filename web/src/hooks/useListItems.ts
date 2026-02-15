import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import type { ListItemsResponse } from '@/types/pocketbase-types'
import { toast } from 'sonner'

type CreateItemData = {
  name: string
  quantity?: string
  note?: string
}

type UpdateItemData = {
  name?: string
  quantity?: string
  note?: string
  checked?: boolean
}

export function useListItems(listId: string | undefined) {
  const { pb, user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all items for a list
  const {
    data: items,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['list-items', listId],
    queryFn: async () => {
      if (!pb || !listId) {
        throw new Error('Not authenticated or no list ID')
      }

      const items = await pb.collection('list_items').getFullList<ListItemsResponse>({
        filter: `list_id = "${listId}"`,
        sort: 'sort_order,-created',
        expand: 'checked_by,created_by',
      })

      return items
    },
    enabled: !!pb && !!listId,
  })

  // Separate checked and unchecked items
  const uncheckedItems = items?.filter((item) => !item.checked) || []
  const checkedItems = items?.filter((item) => item.checked) || []

  // Create a new item
  const createItem = useMutation({
    mutationFn: async (data: CreateItemData) => {
      if (!pb || !listId || !user) {
        throw new Error('Not authenticated')
      }

      // Get current max sort_order
      const currentItems = await pb.collection('list_items').getList(1, 1, {
        filter: `list_id = "${listId}"`,
        sort: '-sort_order',
      })
      
      const maxSortOrder = currentItems.items[0]?.sort_order || 0

      const newItem = await pb.collection('list_items').create<ListItemsResponse>({
        name: data.name,
        quantity: data.quantity,
        note: data.note,
        list_id: listId,
        created_by: user.id,
        sort_order: maxSortOrder + 1,
        checked: false,
      })

      return newItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] })
      toast.success('Item added')
    },
    onError: (error) => {
      toast.error('Failed to add item: ' + String(error))
    },
  })

  // Update an item
  const updateItem = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: UpdateItemData }) => {
      if (!pb || !user) {
        throw new Error('Not authenticated')
      }

      // If checking/unchecking, also update checked_by
      const updateData: Record<string, unknown> = { ...data }
      if (data.checked !== undefined) {
        updateData.checked_by = data.checked ? user.id : null
      }

      const updated = await pb.collection('list_items').update<ListItemsResponse>(itemId, updateData)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] })
    },
    onError: (error) => {
      toast.error('Failed to update item: ' + String(error))
    },
  })

  // Delete an item
  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      if (!pb) {
        throw new Error('Not authenticated')
      }

      await pb.collection('list_items').delete(itemId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] })
      toast.success('Item deleted')
    },
    onError: (error) => {
      toast.error('Failed to delete item: ' + String(error))
    },
  })

  // Toggle item checked state
  const toggleChecked = useMutation({
    mutationFn: async ({ itemId, checked }: { itemId: string; checked: boolean }) => {
      if (!pb || !user) {
        throw new Error('Not authenticated')
      }

      const updated = await pb.collection('list_items').update<ListItemsResponse>(itemId, {
        checked,
        checked_by: checked ? user.id : null,
      })

      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] })
    },
    onError: (error) => {
      toast.error('Failed to update item: ' + String(error))
    },
  })

  return {
    items: items || [],
    uncheckedItems,
    checkedItems,
    isLoading,
    error,
    createItem: createItem.mutate,
    isCreating: createItem.isPending,
    updateItem: updateItem.mutate,
    isUpdating: updateItem.isPending,
    deleteItem: deleteItem.mutate,
    isDeleting: deleteItem.isPending,
    toggleChecked: toggleChecked.mutate,
    isToggling: toggleChecked.isPending,
  }
}
