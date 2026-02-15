import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/join-family')({
  component: JoinFamilyPage,
})

function JoinFamilyPage() {
  return (
    <div className="min-h-screen">
      <h1>Join Family - Coming Soon</h1>
    </div>
  )
}
