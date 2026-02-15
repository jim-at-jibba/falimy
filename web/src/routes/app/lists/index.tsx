import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/lists/')({
  component: ListsPage,
})

function ListsPage() {
  return (
    <div className="min-h-screen">
      <h1>Lists - Coming Soon</h1>
    </div>
  )
}
