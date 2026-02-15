import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  auth: ['auth'] as const,
  family: ['family'] as const,
  familyMembers: ['family', 'members'] as const,
  lists: ['lists'] as const,
  list: (id: string) => ['lists', id] as const,
  listItems: (listId: string) => ['lists', listId, 'items'] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  locations: ['locations'] as const,
  geofences: ['geofences'] as const,
  geofence: (id: string) => ['geofences', id] as const,
}
