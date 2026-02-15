import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app/lists/')({
  component: ListsPage,
})

function ListsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Lists - Coming Soon</h1>
      <p className="text-muted-foreground">Lists feature will be implemented in Phase 5.</p>
    </div>
  )
}
