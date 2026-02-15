import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/troubleshooting')({
  component: TroubleshootingPage,
})

function TroubleshootingPage() {
  return (
    <div className="min-h-screen">
      <h1>Troubleshooting - Coming Soon</h1>
    </div>
  )
}
