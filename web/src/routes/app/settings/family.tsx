import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app/settings/family')({
  component: FamilySettingsPage,
})

function FamilySettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Family Settings - Coming Soon</h1>
      <p className="text-muted-foreground">This feature will be implemented in Phase 4.</p>
    </div>
  )
}
