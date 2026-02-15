import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen">
      <h1>Login - Coming Soon</h1>
    </div>
  )
}
