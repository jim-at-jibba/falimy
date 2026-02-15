import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/features/location')({
  component: LocationFeaturePage,
})

function LocationFeaturePage() {
  return (
    <div className="min-h-screen">
      <h1>Location Sharing Guide - Coming Soon</h1>
    </div>
  )
}
