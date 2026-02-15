import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Loader2, QrCode } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { getPocketBase, getServerUrl } from '@/lib/pocketbase'
import { useAuth } from '@/contexts/AuthContext'
import { generateInviteCode } from '@/lib/invite'
import { toast } from 'sonner'
import QRCode from 'qrcode.react'
import { queryKeys } from '@/lib/queryClient'
import type { FamiliesResponse, UsersResponse } from '@/types/pocketbase-types'

export const Route = createFileRoute('/app/settings/family')({
  component: FamilySettingsPage,
})

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
  { label: 'Child', value: 'child' },
]

function FamilySettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Fetch family data
  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: queryKeys.family,
    queryFn: async () => {
      const pb = getPocketBase()
      if (!pb || !user?.family_id) return null
      return pb.collection('families').getOne<FamiliesResponse>(user.family_id)
    },
    enabled: !!user?.family_id,
  })

  // Fetch family members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: queryKeys.familyMembers,
    queryFn: async () => {
      const pb = getPocketBase()
      if (!pb || !user?.family_id) return []
      const records = await pb.collection('users').getFullList<UsersResponse>({
        filter: `family_id="${user.family_id}"`,
        sort: 'name',
      })
      return records.items
    },
    enabled: !!user?.family_id,
  })

  // Regenerate invite code mutation
  const regenerateInviteMutation = useMutation({
    mutationFn: async () => {
      const pb = getPocketBase()
      if (!pb || !family) throw new Error('Not connected to server')
      return pb.collection('families').update<FamiliesResponse>(family.id, {
        invite_code: await generateInviteCode(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.family })
      toast.success('Invite code regenerated!')
    },
    onError: () => {
      toast.error('Could not regenerate invite code')
    },
  })

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: UsersResponse['role'] }) => {
      const pb = getPocketBase()
      if (!pb) throw new Error('Not connected to server')
      return pb.collection('users').update(memberId, { role })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.familyMembers })
      toast.success('Role updated!')
    },
    onError: () => {
      toast.error('Could not update role')
    },
  })

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      await regenerateInviteMutation.mutateAsync()
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: UsersResponse['role']) => {
    updateRoleMutation.mutate({ memberId, role: newRole })
  }

  const serverUrl = getServerUrl()
  const isAdmin = user?.role === 'admin'

  const invitePayload = useMemo(() => {
    if (!family || !serverUrl) return null
    return JSON.stringify({
      server: serverUrl,
      invite: family.invite_code,
      family_id: family.id,
    })
  }, [family, serverUrl])

  const isLoading = familyLoading || membersLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!family) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No family assigned to this account.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Family</h1>
        <p className="text-muted-foreground">Manage your family settings and members.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{family.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Family ID:</span> {family.id}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Invite Code:</span> {family.invite_code}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Server:</span> {serverUrl || 'Not set'}
            </p>
          </div>

          {invitePayload && (
            <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <QRCode
                value={invitePayload}
                size={180}
                className="rounded-lg"
              />
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Scan to join family
              </p>
            </div>
          )}

          <Button
            onClick={handleRegenerate}
            variant="outline"
            disabled={isRegenerating || !isAdmin}
          >
            {isRegenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              'Regenerate Invite Code'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members && members.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No members yet.</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-secondary">
                          {member.name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name || member.email}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>

                    {isAdmin && member.id !== user?.id && (
                      <Select
                        value={member.role || 'member'}
                        onValueChange={(value) => handleRoleChange(member.id, value as UsersResponse['role'])}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
