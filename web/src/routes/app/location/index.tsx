import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Navigation, Settings, MapPin, Users } from 'lucide-react'
import { useFamilyLocations } from '@/hooks/useFamilyLocations'
import { useGeofences } from '@/hooks/useGeofences'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { ClientOnly } from '@/components/ClientOnly'
import { FamilyMap } from '@/components/maps/FamilyMap'

export const Route = createFileRoute('/app/location/')({
  component: LocationPage,
})

function LocationPage() {
  const { user } = useAuth()
  const { members, isLoading: membersLoading, updateLocation } = useFamilyLocations()
  const { isLoading: geofencesLoading } = useGeofences()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        updateLocation({
          lat: latitude,
          lng: longitude,
          accuracy,
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [updateLocation])

  const getMarkerColor = (lastLocationAt: string | undefined) => {
    if (!lastLocationAt) return '#9CA3AF'
    const now = new Date()
    const lastUpdate = new Date(lastLocationAt)
    const diffMs = now.getTime() - lastUpdate.getTime()
    const diffMins = diffMs / (1000 * 60)
    if (diffMins < 30) return '#14B8A6'
    if (diffMins < 120) return '#F59E0B'
    return '#9CA3AF'
  }

  const formatTimeSince = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown'
    const now = new Date()
    const lastUpdate = new Date(dateString)
    const diffMs = now.getTime() - lastUpdate.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (membersLoading || geofencesLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="px-4 py-4 border-b-2 border-black bg-[#b2ecca] dark:border-white/25">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-black">Family Map</h1>
            <p className="text-sm text-black/60 font-medium">
              See where your family members are
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!userLocation}
              title="My Location"
            >
              <Navigation className="h-4 w-4 mr-1" />
              My Location
            </Button>
            <Link to="/app/location/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </Link>
            <Link to="/app/location/geofences">
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-1" />
                Geofences
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <ClientOnly fallback={<div className="h-full w-full bg-muted flex items-center justify-center">Loading map...</div>}>
            <FamilyMap userLocation={userLocation} />
          </ClientOnly>
        </div>

        <div className="w-80 border-l-2 border-black bg-background overflow-y-auto dark:border-white/25">
          <div className="p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Family Members
            </h2>
            <div className="space-y-2">
              {members.map((member) => {
                const color = getMarkerColor(member.last_location_at)
                const isCurrentUser = member.id === user?.id
                return (
                  <Card key={member.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {member.name || 'Unknown'}
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimeSince(member.last_location_at)}
                          </div>
                        </div>
                      </div>
                      {member.location_sharing_mode && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {member.location_sharing_mode}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
