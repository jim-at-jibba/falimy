import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/')({
  component: DocsIndexPage,
})

function DocsIndexPage() {
  return (
    <div className="min-h-screen">
      <h1>Documentation - Coming Soon</h1>
    </div>
  )
}
