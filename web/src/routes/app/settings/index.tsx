import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Settings - Coming Soon</h1>
      <p className="text-muted-foreground">Settings features will be implemented in Phase 4.</p>
    </div>
  )
}
