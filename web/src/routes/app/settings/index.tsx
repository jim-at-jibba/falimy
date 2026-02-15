import { createFileRoute, Link } from '@tanstack/react-router'
import { Users, Server, Trash2, User } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/app/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your family, account, and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/app/settings/family">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <Users className="h-8 w-8 mb-2" style={{ color: '#fadeaf' }} />
              <CardTitle>Family Management</CardTitle>
              <CardDescription>
                Manage family members, invite codes, and roles
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader>
            <User className="h-8 w-8 mb-2" style={{ color: '#dad4fc' }} />
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Coming soon - Manage your profile and account preferences
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader>
            <Server className="h-8 w-8 mb-2" style={{ color: '#b4dbfa' }} />
            <CardTitle>Server Settings</CardTitle>
            <CardDescription>
              Coming soon - Change your PocketBase server URL
            </CardDescription>
          </CardHeader>
        </Card>

        {user?.role === 'admin' && (
          <Card className="opacity-50 cursor-not-allowed border-destructive/20">
            <CardHeader>
              <Trash2 className="h-8 w-8 mb-2 text-destructive/50" />
              <CardTitle className="text-destructive/50">Danger Zone</CardTitle>
              <CardDescription>
                Coming soon - Delete account or leave family
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
