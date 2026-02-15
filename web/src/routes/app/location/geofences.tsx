import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Plus, MapPin, Trash2, Edit, AlertCircle } from 'lucide-react'
import { useGeofences } from '@/hooks/useGeofences'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch as SwitchComponent } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'

export const Route = createFileRoute('/app/location/geofences')({
  component: GeofencesPage,
})

function GeofencesPage() {
  const { geofences, isLoading, toggleGeofence, deleteGeofence, isDeleting } = useGeofences()
  const { members } = useFamilyMembers()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [geofenceToDelete, setGeofenceToDelete] = useState<string | null>(null)

  const getMemberName = (memberId: string | undefined) => {
    if (!memberId) return 'Unknown'
    const member = members.find((m) => m.id === memberId)
    return member?.name || 'Unknown'
  }

  const getTriggerBadge = (trigger: string | undefined) => {
    switch (trigger) {
      case 'enter':
        return <Badge className="bg-green-100 text-green-800">Enter</Badge>
      case 'exit':
        return <Badge className="bg-orange-100 text-orange-800">Exit</Badge>
      case 'both':
        return <Badge className="bg-blue-100 text-blue-800">Both</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleDeleteGeofence = () => {
    if (!geofenceToDelete) return
    deleteGeofence(geofenceToDelete, {
      onSuccess: () => {
        setGeofenceToDelete(null)
        setDeleteDialogOpen(false)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading geofences...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/location">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Geofences</h1>
            <p className="text-muted-foreground">
              Get notified when family members enter or leave areas
            </p>
          </div>
        </div>
        <Link to="/app/location/create-geofence">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Geofence
          </Button>
        </Link>
      </div>

      {geofences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No geofences yet. Create your first geofence to get notified when family members
              enter or leave specific areas.
            </p>
            <Link to="/app/location/create-geofence">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Geofence
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {geofences.map((geofence) => (
            <Card key={geofence.id} className={!geofence.enabled ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{geofence.name}</CardTitle>
                      <CardDescription>
                        Radius: {geofence.radius || 100}m
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={geofence.enabled ? 'default' : 'secondary'}>
                      {geofence.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Trigger type */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trigger</span>
                    {getTriggerBadge(geofence.trigger_on)}
                  </div>

                  {/* Watch user */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Watch</span>
                    <span className="text-sm font-medium">
                      {getMemberName(geofence.watch_user_id)}
                    </span>
                  </div>

                  {/* Notify user */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Notify</span>
                    <span className="text-sm font-medium">
                      {getMemberName(geofence.notify_user_id)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <SwitchComponent
                        checked={geofence.enabled}
                        onCheckedChange={(checked) =>
                          toggleGeofence({ geofenceId: geofence.id, enabled: checked })
                        }
                      />
                      <span className="text-sm">Enabled</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          setGeofenceToDelete(geofence.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info card */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            How Geofences Work
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li>• Geofences are evaluated on the watched family member's device</li>
            <li>• For better battery life, geofences use native device location services</li>
            <li>• Notifications are sent when the device crosses the geofence boundary</li>
            <li>• Geofences work best on mobile devices with the falimy app installed</li>
          </ul>
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Geofence</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this geofence? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGeofence} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
