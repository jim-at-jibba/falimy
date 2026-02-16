import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api'
import { useFamilyLocations } from '@/hooks/useFamilyLocations'
import { useGeofences } from '@/hooks/useGeofences'
import { useAuth } from '@/contexts/AuthContext'

const containerStyle = {
  width: '100%',
  height: '100%',
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  clickableIcons: false,
}

type FamilyMapProps = {
  userLocation: { lat: number; lng: number } | null
}

export function FamilyMap({ userLocation }: FamilyMapProps) {
  const { user } = useAuth()
  const { members } = useFamilyLocations()
  const { geofences } = useGeofences()
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [selectedGeofence, setSelectedGeofence] = useState<string | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

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

  const defaultCenter = userLocation
    ? { lat: userLocation.lat, lng: userLocation.lng }
    : members[0]?.last_lat && members[0]?.last_lng
      ? { lat: members[0].last_lat, lng: members[0].last_lng }
      : { lat: 0, lng: 0 }

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng })
    }
  }, [userLocation])

  if (!isLoaded) return <div className="h-full w-full flex items-center justify-center">Loading map...</div>

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {members.map((member) => {
        if (!member.last_lat || !member.last_lng) return null
        const color = getMarkerColor(member.last_location_at)
        return (
          <Marker
            key={member.id}
            position={{ lat: member.last_lat, lng: member.last_lng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            onClick={() => setSelectedMember(member.id)}
          />
        )
      })}

      {selectedMember && members.find(m => m.id === selectedMember) && (
        <InfoWindow
          position={{
            lat: members.find(m => m.id === selectedMember)!.last_lat!,
            lng: members.find(m => m.id === selectedMember)!.last_lng!,
          }}
          onCloseClick={() => setSelectedMember(null)}
        >
          <div className="p-2">
            <div className="font-semibold mb-1">
              {members.find(m => m.id === selectedMember)?.name || 'Unknown'}
              {members.find(m => m.id === selectedMember)?.id === user?.id && ' (You)'}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-1">
                📍 {formatTimeSince(members.find(m => m.id === selectedMember)?.last_location_at)}
              </div>
            </div>
          </div>
        </InfoWindow>
      )}

      {geofences.filter(g => g.enabled && g.lat && g.lng).map((geofence) => (
        <Circle
          key={geofence.id}
          center={{ lat: geofence.lat!, lng: geofence.lng! }}
          radius={geofence.radius || 100}
          options={{
            strokeColor: '#b4dbfa',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#b4dbfa',
            fillOpacity: 0.2,
            clickable: true,
          }}
          onClick={() => setSelectedGeofence(geofence.id)}
        />
      ))}

      {selectedGeofence && geofences.find(g => g.id === selectedGeofence) && (
        <InfoWindow
          position={{
            lat: geofences.find(g => g.id === selectedGeofence)!.lat!,
            lng: geofences.find(g => g.id === selectedGeofence)!.lng!,
          }}
          onCloseClick={() => setSelectedGeofence(null)}
        >
          <div className="p-2">
            <div className="font-semibold">{geofences.find(g => g.id === selectedGeofence)?.name}</div>
            <div className="text-sm text-muted-foreground">
              Radius: {geofences.find(g => g.id === selectedGeofence)?.radius || 100}m
            </div>
          </div>
        </InfoWindow>
      )}

      {userLocation && (
        <Circle
          center={{ lat: userLocation.lat, lng: userLocation.lng }}
          radius={50}
          options={{
            strokeColor: '#3B82F6',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#3B82F6',
            fillOpacity: 0.3,
          }}
        />
      )}
    </GoogleMap>
  )
}
