import { createFileRoute, Link } from '@tanstack/react-router'
import { Users, Server, Trash2, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/app/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const { user } = useAuth()

  const settingsCards = [
    {
      to: '/app/settings/family',
      icon: <Users className="h-8 w-8" />,
      title: 'Family Management',
      description: 'Manage family members, invite codes, and roles',
      color: '#fadeaf',
      enabled: true,
    },
    {
      icon: <User className="h-8 w-8" />,
      title: 'Account Settings',
      description: 'Coming soon - Manage your profile and account preferences',
      color: '#dad4fc',
      enabled: false,
    },
    {
      icon: <Server className="h-8 w-8" />,
      title: 'Server Settings',
      description: 'Coming soon - Change your PocketBase server URL',
      color: '#b4dbfa',
      enabled: false,
    },
  ]

  return (
    <div>
      {/* Colored header matching mobile Settings page (beige/orange) */}
      <div className="bg-[#fadeaf] border-b-2 border-black px-6 py-8 dark:border-white/25">
        <h1 className="text-3xl font-extrabold text-black">Settings</h1>
        <p className="text-black/60 font-medium mt-1">Manage your family, account, and preferences</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsCards.map((card) => {
            const content = (
              <div
                className={`rounded-2xl border-2 border-black p-6 dark:border-white/25 ${
                  card.enabled ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ backgroundColor: card.color }}
              >
                <div className="mb-3">{card.icon}</div>
                <h3 className="text-lg font-bold text-black">{card.title}</h3>
                <p className="text-black/60 font-medium text-sm">{card.description}</p>
              </div>
            )

            if (card.enabled && card.to) {
              return (
                <Link key={card.title} to={card.to}>
                  {content}
                </Link>
              )
            }

            return <div key={card.title}>{content}</div>
          })}

          {user?.role === 'admin' && (
            <div className="rounded-2xl border-2 border-destructive/50 p-6 opacity-50 cursor-not-allowed bg-white dark:bg-card">
              <Trash2 className="h-8 w-8 mb-3 text-destructive/50" />
              <h3 className="text-lg font-bold text-destructive/50">Danger Zone</h3>
              <p className="text-destructive/30 font-medium text-sm">
                Coming soon - Delete account or leave family
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
