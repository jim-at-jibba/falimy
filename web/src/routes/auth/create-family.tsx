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
import { generateInviteCode, generateTopicPrefix } from '@/lib/invite'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/create-family')({
  component: CreateFamilyPage,
})

const createFamilySchema = z.object({
  familyName: z.string().min(1, 'Family name is required'),
  name: z.string().min(1, 'Your name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type CreateFamilyForm = z.infer<typeof createFamilySchema>

function CreateFamilyPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const serverUrl = getServerUrl()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFamilyForm>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      familyName: '',
      name: '',
      email: '',
      password: '',
    },
  })

  // Redirect to server URL setup if no server is configured
  if (!serverUrl) {
    navigate({ to: '/auth/server-url' })
    return null
  }

  const onSubmit = async (data: CreateFamilyForm) => {
    setIsLoading(true)
    try {
      const pb = getPocketBase()
      if (!pb) {
        throw new Error('PocketBase client not initialized')
      }

      // Create admin user account
      const user = await pb.collection('users').create({
        email: data.email.trim(),
        password: data.password,
        passwordConfirm: data.password,
        name: data.name.trim(),
        role: 'admin',
      })

      // Authenticate with the new user
      await pb.collection('users').authWithPassword(data.email.trim(), data.password)

      // Create the family
      const family = await pb.collection('families').create({
        name: data.familyName.trim(),
        invite_code: await generateInviteCode(),
        ntfy_topic_prefix: await generateTopicPrefix(),
        created_by: user.id,
      })

      // Update user with family ID and role
      await pb.collection('users').update(user.id, {
        family_id: family.id,
        role: 'admin',
      })

      await refresh()
      toast.success('Family created successfully!')
      navigate({ to: '/app' })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not create family. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#dad4fc]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create a Family</CardTitle>
          <CardDescription>This account will become the family admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                placeholder="The Smiths"
                {...register('familyName')}
                disabled={isLoading}
              />
              {errors.familyName && (
                <p className="text-sm text-destructive">{errors.familyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Jane Smith"
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
                  Creating...
                </>
              ) : (
                'Create Family'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <div>
            Already have a family?{' '}
            <Link to="/auth/join-family" className="text-primary hover:underline">
              Join one
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
