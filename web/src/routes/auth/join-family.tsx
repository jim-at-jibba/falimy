import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getPocketBase, validateServerUrl, setServerUrl, resetPocketBase, getServerUrl } from '@/lib/pocketbase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/join-family')({
  component: JoinFamilyPage,
})

const joinFamilySchema = z.object({
  server: z.string().url('Invalid server URL').min(1, 'Server URL is required'),
  inviteCode: z.string().min(1, 'Invite code is required'),
  familyId: z.string().min(1, 'Family ID is required'),
  name: z.string().min(1, 'Your name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type JoinFamilyForm = z.infer<typeof joinFamilySchema>

function JoinFamilyPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const search = useSearch({ from: '/auth/join-family' })
  
  const currentServerUrl = getServerUrl()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<JoinFamilyForm>({
    resolver: zodResolver(joinFamilySchema),
    defaultValues: {
      server: (search.server as string) || currentServerUrl || '',
      inviteCode: (search.invite as string) || '',
      familyId: (search.familyId as string) || '',
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: JoinFamilyForm) => {
    setIsLoading(true)
    try {
      // Step 1: Validate and set server URL
      const normalized = await validateServerUrl(data.server)
      await setServerUrl(normalized)
      resetPocketBase()

      const pb = getPocketBase()
      if (!pb) {
        throw new Error('Could not connect to server. Check the server URL.')
      }

      // Step 2: Call server-side join endpoint
      const response = await fetch(`${pb.baseUrl}/api/falimy/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: data.familyId.trim(),
          inviteCode: data.inviteCode.trim(),
          email: data.email.trim(),
          password: data.password,
          name: data.name.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        const message = result?.message || 'Could not join the family. Check your details and try again.'

        // Map server errors to specific form fields where possible
        if (response.status === 404) {
          toast.error(message)
          return
        } else if (response.status === 401) {
          toast.error(message)
          return
        } else if (response.status === 409) {
          toast.error(message)
          return
        } else {
          toast.error(message)
          return
        }
      }

      // Step 3: Hydrate auth store with the returned token
      pb.authStore.save(result.token, result.record)

      await refresh()
      toast.success('Joined family successfully!')
      navigate({ to: '/app' })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not join the family. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Join a Family</CardTitle>
          <CardDescription>Enter the invite code from your family admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="server">Server URL</Label>
              <Input
                id="server"
                type="url"
                placeholder="https://your-server.com"
                {...register('server')}
                disabled={isLoading}
              />
              {errors.server && (
                <p className="text-sm text-destructive">{errors.server.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="abc123xyz"
                {...register('inviteCode')}
                disabled={isLoading}
              />
              {errors.inviteCode && (
                <p className="text-sm text-destructive">{errors.inviteCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyId">Family ID</Label>
              <Input
                id="familyId"
                placeholder="Family ID from QR code"
                {...register('familyId')}
                disabled={isLoading}
              />
              {errors.familyId && (
                <p className="text-sm text-destructive">{errors.familyId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

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
                placeholder="•••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Family'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <div>
            Want to create a new family instead?{' '}
            <Link to="/auth/create-family" className="text-primary hover:underline">
              Create a Family
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
