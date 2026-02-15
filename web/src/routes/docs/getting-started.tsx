import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/getting-started')({
  component: GettingStartedPage,
})

function GettingStartedPage() {
  return (
    <div className="min-h-screen">
      <h1>Getting Started - Coming Soon</h1>
    </div>
  )
}
