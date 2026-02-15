import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/location/geofences')({
  component: GeofencesPage,
})

function GeofencesPage() {
  return (
    <div className="min-h-screen">
      <h1>Geofences - Coming Soon</h1>
    </div>
  )
}
