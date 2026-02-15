import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/server-url')({
  component: ServerUrlPage,
})

function ServerUrlPage() {
  return (
    <div className="min-h-screen">
      <h1>Set Server URL - Coming Soon</h1>
    </div>
  )
}
