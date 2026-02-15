import { createFileRoute, Link } from '@tanstack/react-router'
import { List, Map, Settings, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/app/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          Welcome{user && `, ${user.name}`}!
        </h2>
        <p className="text-muted-foreground">
          Here's an overview of your family's falimy hub.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/app/lists">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <List className="h-8 w-8 mb-2" style={{ color: '#b4dbfa' }} />
              <CardTitle>Lists</CardTitle>
              <CardDescription>Manage shopping, todo, and packing lists</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/app/location">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <Map className="h-8 w-8 mb-2" style={{ color: '#dad4fc' }} />
              <CardTitle>Location</CardTitle>
              <CardDescription>View family members and manage location sharing</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/app/settings/family">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <Users className="h-8 w-8 mb-2" style={{ color: '#fadeaf' }} />
              <CardTitle>Family Settings</CardTitle>
              <CardDescription>Manage family members, invite codes, and roles</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/app/settings">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <Settings className="h-8 w-8 mb-2" style={{ color: '#f8d5f4' }} />
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Change server URL, manage your account</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
