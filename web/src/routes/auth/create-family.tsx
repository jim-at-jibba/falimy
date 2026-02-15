import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/create-family')({
  component: CreateFamilyPage,
})

function CreateFamilyPage() {
  return (
    <div className="min-h-screen">
      <h1>Create Family - Coming Soon</h1>
    </div>
  )
}
