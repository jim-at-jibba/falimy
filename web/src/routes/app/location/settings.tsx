import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useFamilyLocations } from '@/hooks/useFamilyLocations'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UsersLocationSharingModeOptions } from '@/types/pocketbase-types'

export const Route = createFileRoute('/app/location/settings')({
  component: LocationSettingsPage,
})

function LocationSettingsPage() {
  const { user } = useAuth()
  const { members, updateSharingMode, isUpdatingSharingMode, updateRetentionDays, isUpdatingRetentionDays } = useFamilyLocations()

  // Find current user's settings
  const currentUser = members.find((m) => m.id === user?.id)

  const handleSharingModeChange = (mode: UsersLocationSharingModeOptions) => {
    updateSharingMode({ mode })
  }

  const handleTimedChange = (until: string) => {
    const untilDate = new Date()
    switch (until) {
      case '15m':
        untilDate.setMinutes(untilDate.getMinutes() + 15)
        break
      case '30m':
        untilDate.setMinutes(untilDate.getMinutes() + 30)
        break
      case '1h':
        untilDate.setHours(untilDate.getHours() + 1)
        break
      case '2h':
        untilDate.setHours(untilDate.getHours() + 2)
        break
      case '4h':
        untilDate.setHours(untilDate.getHours() + 4)
        break
      case '8h':
        untilDate.setHours(untilDate.getHours() + 8)
        break
      default:
        return
    }
    
    updateSharingMode({
      mode: 'timed' as UsersLocationSharingModeOptions,
      until: untilDate.toISOString(),
    })
  }

  return (
    <div>
      <div className="bg-[#b2ecca] border-b-2 border-black px-6 py-6 dark:border-white/25">
        <div className="flex items-center gap-4">
          <Link to="/app/location">
            <Button variant="ghost" size="icon" className="border-transparent">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-black">Location Settings</h1>
            <p className="text-black/60 font-medium">Manage your location sharing preferences</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-2xl">

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>Your current location sharing settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl">
              {currentUser?.location_sharing_mode === 'off' && '🔴'}
              {currentUser?.location_sharing_mode === 'always' && '🟢'}
              {currentUser?.location_sharing_mode === 'timed' && '🟡'}
              {currentUser?.location_sharing_mode === 'on_request' && '🔵'}
            </div>
            <div>
              <div className="font-semibold capitalize">
                {currentUser?.location_sharing_mode || 'Unknown'}
              </div>
              {currentUser?.location_sharing_until && (
                <div className="text-sm text-muted-foreground">
                  Until {new Date(currentUser.location_sharing_until).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sharing Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Sharing Mode</CardTitle>
          <CardDescription>
            Choose when your location is shared with family members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentUser?.location_sharing_mode || 'off'}
            onValueChange={(value) => handleSharingModeChange(value as UsersLocationSharingModeOptions)}
            disabled={isUpdatingSharingMode}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 border-2 border-black rounded-2xl dark:border-white/25">
                <RadioGroupItem value="off" id="off" />
                <div className="flex-1">
                  <Label htmlFor="off" className="font-semibold">
                    Off
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Your location is not shared with anyone
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border-2 border-black rounded-2xl dark:border-white/25">
                <RadioGroupItem value="always" id="always" />
                <div className="flex-1">
                  <Label htmlFor="always" className="font-semibold">
                    Always
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Your location is always shared while this tab is open
                  </p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                    ⚠️ Web limitation: Location sharing only works while this browser tab is open.
                    For continuous sharing, use the mobile app.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border-2 border-black rounded-2xl dark:border-white/25">
                <RadioGroupItem value="timed" id="timed" />
                <div className="flex-1">
                  <Label htmlFor="timed" className="font-semibold">
                    Timed
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Share your location for a specific duration
                  </p>
                  {currentUser?.location_sharing_mode === 'timed' && (
                    <Select onValueChange={handleTimedChange}>
                      <SelectTrigger className="w-40 mt-2">
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15m">15 minutes</SelectItem>
                        <SelectItem value="30m">30 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="2h">2 hours</SelectItem>
                        <SelectItem value="4h">4 hours</SelectItem>
                        <SelectItem value="8h">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border-2 border-black rounded-2xl dark:border-white/25">
                <RadioGroupItem value="on_request" id="on_request" />
                <div className="flex-1">
                  <Label htmlFor="on_request" className="font-semibold">
                    On Request
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Family members must request your location each time
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* History Retention */}
      <Card>
        <CardHeader>
          <CardTitle>History Retention</CardTitle>
          <CardDescription>
            Choose how long location history is kept. Older records are automatically deleted during sync.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={String(currentUser?.location_history_retention_days ?? 30)}
            onValueChange={(value) => updateRetentionDays(Number(value))}
            disabled={isUpdatingRetentionDays}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select retention" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="0">Forever</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Privacy Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Your location is only shared with family members</li>
            <li>• Location data is stored on your self-hosted server</li>
            <li>• You can turn off sharing at any time</li>
            <li>• On web, sharing only works while the tab is open</li>
            <li>• For continuous background sharing, use the mobile app</li>
          </ul>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
