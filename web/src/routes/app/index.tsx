import { createFileRoute, Link } from '@tanstack/react-router'
import { List, Map, Settings, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/app/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()

  const cards = [
    {
      to: '/app/lists',
      icon: <List className="h-8 w-8" />,
      title: 'Lists',
      description: 'Manage shopping, todo, and packing lists',
      color: '#b4dbfa',
    },
    {
      to: '/app/location',
      icon: <Map className="h-8 w-8" />,
      title: 'Location',
      description: 'View family members and manage location sharing',
      color: '#b2ecca',
    },
    {
      to: '/app/settings/family',
      icon: <Users className="h-8 w-8" />,
      title: 'Family Settings',
      description: 'Manage family members, invite codes, and roles',
      color: '#fadeaf',
    },
    {
      to: '/app/settings',
      icon: <Settings className="h-8 w-8" />,
      title: 'Account Settings',
      description: 'Change server URL, manage your account',
      color: '#dad4fc',
    },
  ]

  return (
    <div>
      {/* Colored header */}
      <div className="bg-[#b4dbfa] border-b-2 border-black px-6 py-8 dark:border-white/25">
        <h2 className="text-3xl font-extrabold text-black">
          Welcome{user && `, ${user.name}`}!
        </h2>
        <p className="text-black/60 font-medium mt-1">
          Here's an overview of your family's falimy hub.
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <Link key={card.to} to={card.to}>
              <div
                className="rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:opacity-80 transition-opacity dark:border-white/25 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)]"
                style={{ backgroundColor: card.color }}
              >
                <div className="mb-3">{card.icon}</div>
                <h3 className="text-lg font-bold text-black">{card.title}</h3>
                <p className="text-black/60 font-medium text-sm">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
