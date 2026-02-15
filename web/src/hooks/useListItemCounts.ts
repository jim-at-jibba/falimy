import { useQueries } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import type { ListItemsResponse } from '@/types/pocketbase-types'

export function useListItemCounts(listIds: string[]) {
  const { pb } = useAuth()

  const queries = useQueries({
    queries: listIds.map((listId) => ({
      queryKey: ['list-items-count', listId],
      queryFn: async () => {
        if (!pb) {
          throw new Error('Not authenticated')
        }

        // Get total items and checked items count
        const items = await pb.collection('list_items').getFullList<ListItemsResponse>({
          filter: `list_id = "${listId}"`,
          fields: 'checked',
        })

        const total = items.length
        const checked = items.filter((item) => item.checked).length

        return { listId, total, checked }
      },
      enabled: !!pb && !!listId,
      staleTime: 30000, // Cache for 30 seconds
    })),
  })

  // Convert to a map for easy lookup
  const countsMap = new Map<string, { total: number; checked: number }>()
  
  queries.forEach((query, index) => {
    if (query.data) {
      countsMap.set(listIds[index], query.data)
    }
  })

  return countsMap
}
