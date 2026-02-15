import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="min-h-screen">
      <h1>Dashboard - Coming Soon</h1>
    </div>
  )
}
