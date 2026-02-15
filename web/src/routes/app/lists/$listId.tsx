import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/lists/$listId')({
  component: ListDetailPage,
})

function ListDetailPage() {
  return (
    <div className="min-h-screen">
      <h1>List Detail - Coming Soon</h1>
    </div>
  )
}
