import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app/location/geofences')({
  component: GeofencesPage,
})

function GeofencesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Geofences - Coming Soon</h1>
      <p className="text-muted-foreground">This feature will be implemented in Phase 6.</p>
    </div>
  )
}
