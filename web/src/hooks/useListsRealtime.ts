import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import type { ListsResponse, ListItemsResponse } from '@/types/pocketbase-types'

type RealtimeEvent<T> = {
  action: 'create' | 'update' | 'delete'
  record: T
}

type UnsubscribeFunc = () => void | Promise<void>

export function useListsRealtime() {
  const { pb, user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!pb || !user?.family_id) return

    let unsubscribe: UnsubscribeFunc | null = null

    // Subscribe to lists collection changes
    const subscribe = async () => {
      try {
        // Subscribe to lists changes for this family
        unsubscribe = await pb.collection('lists').subscribe('*', (e) => {
          const event = e as RealtimeEvent<ListsResponse>
          
          // Only process events for our family
          if (event.record.family_id !== user.family_id) return

          // Update the lists query cache
          queryClient.setQueryData<ListsResponse[]>(['lists', user.family_id], (oldData) => {
            if (!oldData) return oldData

            switch (event.action) {
              case 'create':
                return [event.record, ...oldData]

              case 'update':
                return oldData.map((list) =>
                  list.id === event.record.id ? event.record : list
                )

              case 'delete':
                return oldData.filter((list) => list.id !== event.record.id)

              default:
                return oldData
            }
          })
        })
      } catch (error) {
        console.error('Failed to subscribe to lists realtime:', error)
      }
    }

    subscribe()

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [pb, user?.family_id, queryClient])
}

export function useListItemsRealtime(listId: string | undefined) {
  const { pb } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!pb || !listId) return

    let unsubscribe: UnsubscribeFunc | null = null

    // Subscribe to list_items collection changes
    const subscribe = async () => {
      try {
        // Subscribe to list_items changes for this list
        unsubscribe = await pb.collection('list_items').subscribe('*', (e) => {
          const event = e as RealtimeEvent<ListItemsResponse>
          
          // Only process events for our list
          if (event.record.list_id !== listId) return

          // Update the list-items query cache
          queryClient.setQueryData<ListItemsResponse[]>(['list-items', listId], (oldData) => {
            if (!oldData) {
              if (event.action === 'create') {
                return [event.record]
              }
              return oldData
            }

            switch (event.action) {
              case 'create':
                return [...oldData, event.record]

              case 'update':
                return oldData.map((item) =>
                  item.id === event.record.id ? event.record : item
                )

              case 'delete':
                return oldData.filter((item) => item.id !== event.record.id)

              default:
                return oldData
            }
          })
        })
      } catch (error) {
        console.error('Failed to subscribe to list_items realtime:', error)
      }
    }

    subscribe()

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [pb, listId, queryClient])
}
