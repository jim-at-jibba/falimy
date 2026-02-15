import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="min-h-screen">
      <h1>Settings - Coming Soon</h1>
    </div>
  )
}
