import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import type { UsersResponse, UsersLocationSharingModeOptions } from '@/types/pocketbase-types'
import { toast } from 'sonner'

type LocationData = {
  lat: number
  lng: number
  accuracy?: number
  battery_level?: number
}

export function useFamilyLocations() {
  const { pb, user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all family members with location data
  const {
    data: members,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['family-locations', user?.family_id],
    queryFn: async () => {
      if (!pb || !user?.family_id) {
        throw new Error('Not authenticated or no family')
      }

      const members = await pb.collection('users').getFullList<UsersResponse>({
        filter: `family_id = "${user.family_id}"`,
        sort: 'name',
      })

      return members
    },
    enabled: !!pb && !!user?.family_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Update own location
  const updateLocation = useMutation({
    mutationFn: async (data: LocationData) => {
      if (!pb || !user) {
        throw new Error('Not authenticated')
      }

      await pb.collection('users').update(user.id, {
        last_lat: data.lat,
        last_lng: data.lng,
        last_location_at: new Date().toISOString(),
      })

      // Also create a location history entry
      await pb.collection('location_history').create({
        user_id: user.id,
        lat: data.lat,
        lng: data.lng,
        accuracy: data.accuracy,
        battery_level: data.battery_level,
        timestamp: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-locations'] })
    },
    onError: (error) => {
      console.error('Failed to update location:', error)
    },
  })

  // Update location sharing mode
  const updateSharingMode = useMutation({
    mutationFn: async ({
      mode,
      until,
    }: {
      mode: UsersLocationSharingModeOptions
      until?: string
    }) => {
      if (!pb || !user) {
        throw new Error('Not authenticated')
      }

      await pb.collection('users').update(user.id, {
        location_sharing_mode: mode,
        location_sharing_until: until || null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-locations'] })
      toast.success('Location sharing updated')
    },
    onError: (error) => {
      toast.error('Failed to update location sharing: ' + String(error))
    },
  })

  // Update location history retention
  const updateRetentionDays = useMutation({
    mutationFn: async (days: number) => {
      if (!pb || !user) {
        throw new Error('Not authenticated')
      }

      await pb.collection('users').update(user.id, {
        location_history_retention_days: days,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-locations'] })
      toast.success('History retention updated')
    },
    onError: (error) => {
      toast.error('Failed to update retention setting: ' + String(error))
    },
  })

  return {
    members: members || [],
    isLoading,
    error,
    updateLocation: updateLocation.mutate,
    isUpdatingLocation: updateLocation.isPending,
    updateSharingMode: updateSharingMode.mutate,
    isUpdatingSharingMode: updateSharingMode.isPending,
    updateRetentionDays: updateRetentionDays.mutate,
    isUpdatingRetentionDays: updateRetentionDays.isPending,
  }
}
