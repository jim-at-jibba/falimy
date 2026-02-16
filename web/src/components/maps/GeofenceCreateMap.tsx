import { useCallback, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100%',
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  clickableIcons: false,
}

type GeofenceCreateMapProps = {
  lat: number | null
  lng: number | null
  radius: number
  onLocationSelect: (lat: number, lng: number) => void
  center: [number, number]
}

export function GeofenceCreateMap({
  lat,
  lng,
  radius,
  onLocationSelect,
  center,
}: GeofenceCreateMapProps) {
  const [currentCenter] = useState({ lat: center[0], lng: center[1] })

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    map.setOptions({ draggableCursor: 'crosshair' })
  }, [])

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onLocationSelect(e.latLng.lat(), e.latLng.lng())
    }
  }, [onLocationSelect])

  if (!isLoaded) return <div className="h-full w-full flex items-center justify-center">Loading map...</div>

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentCenter}
      zoom={14}
      onLoad={onLoad}
      onClick={onMapClick}
      options={mapOptions}
    >
      {lat !== null && lng !== null && (
        <>
          <Marker position={{ lat, lng }} />
          <Circle
            center={{ lat, lng }}
            radius={radius}
            options={{
              strokeColor: '#b4dbfa',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#b4dbfa',
              fillOpacity: 0.3,
            }}
          />
        </>
      )}
    </GoogleMap>
  )
}
