import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useGeofences } from '@/hooks/useGeofences'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { ClientOnly } from '@/components/ClientOnly'
import { GeofenceCreateMap } from '@/components/maps/GeofenceCreateMap'
import type { GeofencesTriggerOnOptions } from '@/types/pocketbase-types'

export const Route = createFileRoute('/app/location/create-geofence')({
  component: CreateGeofencePage,
})

function CreateGeofencePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createGeofence, isCreating } = useGeofences()
  const { members } = useFamilyMembers()

  const [name, setName] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [radius, setRadius] = useState(200)
  const [triggerOn, setTriggerOn] = useState<GeofencesTriggerOnOptions>('both' as GeofencesTriggerOnOptions)
  const [watchUserId, setWatchUserId] = useState('')
  const [notifyUserId, setNotifyUserId] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    }
  }, [])

  const handleLocationSelect = (selectedLat: number, selectedLng: number) => {
    setLat(selectedLat)
    setLng(selectedLng)
  }

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the geofence')
      return
    }
    if (lat === null || lng === null) {
      toast.error('Please click on the map to set the geofence center')
      return
    }
    if (!watchUserId) {
      toast.error('Please select a family member to watch')
      return
    }
    if (!notifyUserId) {
      toast.error('Please select who should be notified')
      return
    }

    createGeofence(
      {
        name: name.trim(),
        lat,
        lng,
        radius,
        trigger_on: triggerOn,
        watch_user_id: watchUserId,
        notify_user_id: notifyUserId,
      },
      {
        onSuccess: () => {
          navigate({ to: '/app/location/geofences' })
        },
      }
    )
  }

  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [0, 0]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/location/geofences">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Geofence</h1>
          <p className="text-muted-foreground">
            Click on the map to set the center point
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>
              Click on the map to set the geofence center point
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] rounded-b-lg overflow-hidden">
              <ClientOnly fallback={<div className="h-full w-full bg-muted flex items-center justify-center">Loading map...</div>}>
                <GeofenceCreateMap
                  lat={lat}
                  lng={lng}
                  radius={radius}
                  onLocationSelect={handleLocationSelect}
                  center={defaultCenter}
                />
              </ClientOnly>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Home, School, Work"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label>Radius: {radius}m</Label>
                <Slider
                  value={[radius]}
                  onValueChange={(value) => setRadius(value[0])}
                  min={100}
                  max={2000}
                  step={50}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {radius < 200 && 'Small - good for buildings'}
                  {radius >= 200 && radius < 500 && 'Medium - good for properties'}
                  {radius >= 500 && radius < 1000 && 'Large - good for neighborhoods'}
                  {radius >= 1000 && 'Very large - good for districts'}
                </p>
              </div>

              <div>
                <Label>Trigger Type</Label>
                <Select
                  value={triggerOn}
                  onValueChange={(value) => setTriggerOn(value as GeofencesTriggerOnOptions)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enter">Enter Only</SelectItem>
                    <SelectItem value="exit">Exit Only</SelectItem>
                    <SelectItem value="both">Both Enter & Exit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Who to Watch & Notify</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Watch (track this person)</Label>
                <Select value={watchUserId} onValueChange={setWatchUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select family member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name || 'Unknown'}
                        {member.id === user?.id && ' (You)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notify (who gets the alert)</Label>
                <Select value={notifyUserId} onValueChange={setNotifyUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select family member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name || 'Unknown'}
                        {member.id === user?.id && ' (You)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {lat !== null && lng !== null && (
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">
                  <div>Latitude: {lat.toFixed(6)}</div>
                  <div>Longitude: {lng.toFixed(6)}</div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate({ to: '/app/location/geofences' })}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreate}
              disabled={isCreating || !lat || !lng || !name.trim() || !watchUserId || !notifyUserId}
            >
              {isCreating ? 'Creating...' : 'Create Geofence'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
