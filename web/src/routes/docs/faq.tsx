import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/faq')({
  component: FAQPage,
})

function FAQPage() {
  return (
    <div className="min-h-screen">
      <h1>FAQ - Coming Soon</h1>
    </div>
  )
}
