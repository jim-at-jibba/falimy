import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateServerUrl, setServerUrl } from '@/lib/pocketbase'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/server-url')({
  component: ServerUrlPage,
})

const serverUrlSchema = z.object({
  url: z.string().url('Please enter a valid URL').min(1, 'Server URL is required'),
})

type ServerUrlForm = z.infer<typeof serverUrlSchema>

function ServerUrlPage() {
  const navigate = useNavigate()
  const [isValidating, setIsValidating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServerUrlForm>({
    resolver: zodResolver(serverUrlSchema),
  })

  const onSubmit = async (data: ServerUrlForm) => {
    setIsValidating(true)
    try {
      const validated = await validateServerUrl(data.url)
      setServerUrl(validated)
      toast.success('Server URL saved successfully')
      navigate({ to: '/auth/login' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to validate server URL')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fadeaf]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Set Server URL</CardTitle>
          <CardDescription>
            Enter the URL of your PocketBase server. This is where your family's data is hosted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Server URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://your-server.com"
                {...register('url')}
                disabled={isValidating}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
            </div>

            <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
              <p className="font-medium mb-1">Examples:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>https://pb.example.com</li>
                <li>https://family.mydomain.com</li>
                <li>http://192.168.1.100:8090 (local)</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={isValidating}>
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
