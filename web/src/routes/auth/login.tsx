import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getPocketBase, getServerUrl } from '@/lib/pocketbase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const serverUrl = getServerUrl()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect to server URL setup if no server is configured
  if (!serverUrl) {
    navigate({ to: '/auth/server-url' })
    return null
  }

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const pb = getPocketBase()
      if (!pb) {
        throw new Error('PocketBase client not initialized')
      }

      await pb.collection('users').authWithPassword(data.email, data.password)
      await refresh()
      toast.success('Logged in successfully')
      navigate({ to: '/app' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your falimy account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Server: <span className="font-mono text-foreground">{serverUrl}</span>
              {' · '}
              <Link to="/auth/server-url" className="text-primary hover:underline">
                Change
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <div>
            Don't have an account?{' '}
            <Link to="/auth/create-family" className="text-primary hover:underline">
              Create a family
            </Link>
            {' or '}
            <Link to="/auth/join-family" className="text-primary hover:underline">
              join one
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
