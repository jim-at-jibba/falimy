import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/features/geofences')({
  component: GeofencesFeaturePage,
})

function GeofencesFeaturePage() {
  return (
    <div className="min-h-screen">
      <h1>Geofences Guide - Coming Soon</h1>
    </div>
  )
}
