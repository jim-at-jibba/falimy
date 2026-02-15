import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, Settings, MapPin, Users, Clock } from 'lucide-react'
import { useFamilyLocations } from '@/hooks/useFamilyLocations'
import { useGeofences } from '@/hooks/useGeofences'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom marker icons by recency
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export const Route = createFileRoute('/app/location/')({
  component: LocationPage,
})

function LocationPage() {
  const { user } = useAuth()
  const { members, isLoading: membersLoading, updateLocation } = useFamilyLocations()
  const { geofences, isLoading: geofencesLoading } = useGeofences()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        
        // Update location on server
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

  // Get marker color based on last location update
  const getMarkerColor = (lastLocationAt: string | undefined) => {
    if (!lastLocationAt) return '#9CA3AF' // Grey - no data
    
    const now = new Date()
    const lastUpdate = new Date(lastLocationAt)
    const diffMs = now.getTime() - lastUpdate.getTime()
    const diffMins = diffMs / (1000 * 60)
    
    if (diffMins < 30) return '#14B8A6' // Teal - recent (< 30 mins)
    if (diffMins < 120) return '#F59E0B' // Amber - stale (< 2 hours)
    return '#9CA3AF' // Grey - old
  }

  // Format time since last update
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

  // Default center (user's location or first family member)
  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : members[0]?.last_lat && members[0]?.last_lng
      ? [members[0].last_lat, members[0].last_lng]
      : [0, 0]

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Family Map</h1>
            <p className="text-sm text-muted-foreground">
              See where your family members are
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (userLocation && mapRef.current) {
                  mapRef.current.setView([userLocation.lat, userLocation.lng], 15)
                }
              }}
              disabled={!userLocation}
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

      {/* Map and sidebar */}
      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            className="h-full w-full"
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Family member markers */}
            {members.map((member) => {
              if (!member.last_lat || !member.last_lng) return null
              
              const color = getMarkerColor(member.last_location_at)
              const isCurrentUser = member.id === user?.id
              
              return (
                <Marker
                  key={member.id}
                  position={[member.last_lat, member.last_lng]}
                  icon={createMarkerIcon(color)}
                >
                  <Popup>
                    <div className="p-2">
                      <div className="font-semibold mb-1">
                        {member.name || 'Unknown'}
                        {isCurrentUser && ' (You)'}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeSince(member.last_location_at)}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}

            {/* Geofence circles */}
            {geofences.filter(g => g.enabled && g.lat && g.lng).map((geofence) => (
              <Circle
                key={geofence.id}
                center={[geofence.lat!, geofence.lng!]}
                radius={geofence.radius || 100}
                pathOptions={{
                  color: '#b4dbfa',
                  fillColor: '#b4dbfa',
                  fillOpacity: 0.2,
                }}
              >
                <Popup>
                  <div className="p-2">
                    <div className="font-semibold">{geofence.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Radius: {geofence.radius || 100}m
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* User location marker */}
            {userLocation && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={50}
                pathOptions={{
                  color: '#3B82F6',
                  fillColor: '#3B82F6',
                  fillOpacity: 0.3,
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* Sidebar with member list */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
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
