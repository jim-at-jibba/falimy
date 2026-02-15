import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/features/lists')({
  component: ListsFeaturePage,
})

function ListsFeaturePage() {
  return (
    <div className="min-h-screen">
      <h1>Lists Feature Guide - Coming Soon</h1>
    </div>
  )
}
