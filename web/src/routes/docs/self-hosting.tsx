import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/self-hosting')({
  component: SelfHostingPage,
})

function SelfHostingPage() {
  return (
    <div className="min-h-screen">
      <h1>Self-Hosting Guide - Coming Soon</h1>
    </div>
  )
}
