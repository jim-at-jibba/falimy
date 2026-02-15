import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/location/create-geofence')({
  component: CreateGeofencePage,
})

function CreateGeofencePage() {
  return (
    <div className="min-h-screen">
      <h1>Create Geofence - Coming Soon</h1>
    </div>
  )
}
