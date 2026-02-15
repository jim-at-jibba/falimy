import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/reverse-proxy')({
  component: ReverseProxyPage,
})

function ReverseProxyPage() {
  return (
    <div className="min-h-screen">
      <h1>Reverse Proxy Setup - Coming Soon</h1>
    </div>
  )
}
