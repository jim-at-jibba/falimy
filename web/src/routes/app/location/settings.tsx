import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/location/settings')({
  component: LocationSettingsPage,
})

function LocationSettingsPage() {
  return (
    <div className="min-h-screen">
      <h1>Location Settings - Coming Soon</h1>
    </div>
  )
}
