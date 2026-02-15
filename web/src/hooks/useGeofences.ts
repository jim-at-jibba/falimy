import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import type { GeofencesResponse, GeofencesTriggerOnOptions } from '@/types/pocketbase-types'
import { toast } from 'sonner'

type CreateGeofenceData = {
  name: string
  lat: number
  lng: number
  radius: number
  trigger_on: GeofencesTriggerOnOptions
  watch_user_id: string
  notify_user_id: string
}

type UpdateGeofenceData = {
  name?: string
  lat?: number
  lng?: number
  radius?: number
  trigger_on?: GeofencesTriggerOnOptions
  watch_user_id?: string
  notify_user_id?: string
  enabled?: boolean
}

export function useGeofences() {
  const { pb, user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all geofences for the family
  const {
    data: geofences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['geofences', user?.family_id],
    queryFn: async () => {
      if (!pb || !user?.family_id) {
        throw new Error('Not authenticated or no family')
      }

      const geofences = await pb.collection('geofences').getFullList<GeofencesResponse>({
        filter: `family_id = "${user.family_id}"`,
        sort: '-created',
        expand: 'watch_user_id,notify_user_id',
      })

      return geofences
    },
    enabled: !!pb && !!user?.family_id,
  })

  // Create a new geofence
  const createGeofence = useMutation({
    mutationFn: async (data: CreateGeofenceData) => {
      if (!pb || !user?.family_id) {
        throw new Error('Not authenticated')
      }

      const newGeofence = await pb.collection('geofences').create<GeofencesResponse>({
        ...data,
        family_id: user.family_id,
        enabled: true,
      })

      return newGeofence
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('Geofence created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create geofence: ' + String(error))
    },
  })

  // Update a geofence
  const updateGeofence = useMutation({
    mutationFn: async ({ geofenceId, data }: { geofenceId: string; data: UpdateGeofenceData }) => {
      if (!pb) {
        throw new Error('Not authenticated')
      }

      const updated = await pb.collection('geofences').update<GeofencesResponse>(geofenceId, data)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('Geofence updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update geofence: ' + String(error))
    },
  })

  // Delete a geofence
  const deleteGeofence = useMutation({
    mutationFn: async (geofenceId: string) => {
      if (!pb) {
        throw new Error('Not authenticated')
      }

      await pb.collection('geofences').delete(geofenceId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('Geofence deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete geofence: ' + String(error))
    },
  })

  // Toggle geofence enabled state
  const toggleGeofence = useMutation({
    mutationFn: async ({ geofenceId, enabled }: { geofenceId: string; enabled: boolean }) => {
      if (!pb) {
        throw new Error('Not authenticated')
      }

      await pb.collection('geofences').update(geofenceId, { enabled })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
    },
    onError: (error) => {
      toast.error('Failed to toggle geofence: ' + String(error))
    },
  })

  return {
    geofences: geofences || [],
    isLoading,
    error,
    createGeofence: createGeofence.mutate,
    isCreating: createGeofence.isPending,
    updateGeofence: updateGeofence.mutate,
    isUpdating: updateGeofence.isPending,
    deleteGeofence: deleteGeofence.mutate,
    isDeleting: deleteGeofence.isPending,
    toggleGeofence: toggleGeofence.mutate,
    isToggling: toggleGeofence.isPending,
  }
}
