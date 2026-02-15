import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/location/')({
  component: LocationPage,
})

function LocationPage() {
  return (
    <div className="min-h-screen">
      <h1>Location Map - Coming Soon</h1>
    </div>
  )
}
