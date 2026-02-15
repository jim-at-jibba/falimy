import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app/location/')({
  component: LocationPage,
})

function LocationPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Location - Coming Soon</h1>
      <p className="text-muted-foreground">Location feature will be implemented in Phase 6.</p>
    </div>
  )
}
