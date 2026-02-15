import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/settings/family')({
  component: FamilySettingsPage,
})

function FamilySettingsPage() {
  return (
    <div className="min-h-screen">
      <h1>Family Settings - Coming Soon</h1>
    </div>
  )
}
