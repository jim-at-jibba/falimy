import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Copy, RefreshCw, Users as UsersIcon, Shield, User, Crown, Baby } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useFamily } from '@/hooks/useFamily'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { UsersRoleOptions } from '@/types/pocketbase-types'

export const Route = createFileRoute('/app/settings/family')({
  component: FamilySettingsPage,
})

function FamilySettingsPage() {
  const { user } = useAuth()
  const { family, isLoading: familyLoading, regenerateInvite, isRegenerating } = useFamily()
  const { members, isLoading: membersLoading, updateMemberRole, isUpdatingRole } = useFamilyMembers()
  const [qrDialogOpen, setQrDialogOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const getInviteUrl = () => {
    if (!family) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/auth/join-family?invite=${family.invite_code}&family=${family.id}`
  }

  const getRoleIcon = (role: UsersRoleOptions) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />
      case 'member':
        return <User className="h-4 w-4" />
      case 'child':
        return <Baby className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (role: UsersRoleOptions) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'member':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'child':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return ''
    }
  }

  if (familyLoading || membersLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading family settings...</div>
      </div>
    )
  }

  if (!family) {
    return (
      <div className="p-6">
        <div className="text-destructive">Failed to load family information</div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-[#fadeaf] border-b-2 border-black px-6 py-8 dark:border-white/25">
        <h1 className="text-3xl font-extrabold text-black">Family Management</h1>
        <p className="text-black/60 font-medium mt-1">Manage your family members and invite settings</p>
      </div>

      <div className="p-6 space-y-6 max-w-4xl">

      {/* Family Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Family Information</CardTitle>
          <CardDescription>Basic details about your family</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Family Name</div>
            <div className="text-lg font-semibold">{family.name}</div>
          </div>
          <Separator />
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Family ID</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                {family.id}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(family.id, 'Family ID')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Code Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Family Members</CardTitle>
          <CardDescription>
            Share this invite code or QR code with family members to join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Invite Code</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded text-lg font-mono font-bold">
                {family.invite_code}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(family.invite_code, 'Invite code')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => regenerateInvite()}
                  disabled={isRegenerating}
                >
                  <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Invite URL</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono break-all">
                {getInviteUrl()}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(getInviteUrl(), 'Invite URL')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Show QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Family Invite QR Code</DialogTitle>
                  <DialogDescription>
                    Scan this code with the falimy mobile app to join the family
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center p-6">
                  <QRCodeSVG value={getInviteUrl()} size={256} level="H" />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Family Members Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Family Members ({members.length})
          </CardTitle>
          <CardDescription>Manage roles and permissions for family members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border-2 border-black rounded-2xl dark:border-white/25"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold">
                      {member.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{member.name || 'Unnamed'}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && member.id !== user?.id ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        updateMemberRole({ memberId: member.id, role: value as UsersRoleOptions })
                      }
                      disabled={isUpdatingRole}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="member">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Member
                          </div>
                        </SelectItem>
                        <SelectItem value="child">
                          <div className="flex items-center gap-2">
                            <Baby className="h-4 w-4" />
                            Child
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getRoleBadgeColor(member.role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role}</span>
                      </div>
                    </Badge>
                  )}
                  {member.id === user?.id && (
                    <Badge variant="outline" className="ml-2">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!isAdmin && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <Shield className="h-4 w-4 inline mr-2" />
              Only admins can manage member roles
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
