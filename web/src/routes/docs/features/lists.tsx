import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ShoppingCart, CheckCircle, Trash2, Users, Archive } from 'lucide-react'

export const Route = createFileRoute('/docs/features/lists')({
  component: ListsFeaturePage,
})

const features = [
  {
    title: 'Real-Time Sync',
    description: 'Changes made by family members appear instantly on all devices.',
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
  },
  {
    title: 'List Types',
    description: 'Support for shopping lists, to-dos, packing lists, and custom lists.',
    icon: <ShoppingCart className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Item Management',
    description: 'Add, check off, and delete items with swipe gestures.',
    icon: <Trash2 className="h-6 w-6 text-primary" />,
  },
  {
    title: 'List Assignment',
    description: 'Assign lists to specific family members for ownership.',
    icon: <Users className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Archive & Reuse',
    description: 'Archive completed lists and reuse them later.',
    icon: <Archive className="h-6 w-6 text-primary" />,
  },
]

function ListsFeaturePage() {
  const listTypes = [
    {
      name: 'Shopping Lists',
      color: '#b4dbfa',
      uses: 'Grocery runs, weekly shopping, specialty stores',
    },
    {
      name: 'To-Do Lists',
      color: '#dad4fc',
      uses: 'Daily tasks, weekly goals, project planning',
    },
    {
      name: 'Packing Lists',
      color: '#fadeaf',
      uses: 'Vacation prep, camp trips, weekend getaways',
    },
    {
      name: 'Custom Lists',
      color: '#f8d5f4',
      uses: 'Anything you need - create your own list type',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold mb-4">Shared Lists</h1>
            <p className="text-lg text-muted-foreground">
              Keep your family organized with shared lists that sync in real-time across all devices.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-extrabold mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {feature.icon}
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-extrabold mb-6">List Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listTypes.map((type) => (
                <div key={type.name} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: type.color }}
                    />
                    <h3 className="text-lg font-semibold">{type.name}</h3>
                  </div>
                  <p className="text-muted-foreground">{type.uses}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold mb-6">How to Use</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Creating Lists</h3>
                <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                  <li>Open falimy and navigate to the Lists tab</li>
                  <li>Tap the "+" button to create a new list</li>
                  <li>Choose a list type and give it a name</li>
                  <li>Optionally assign it to a family member</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Managing Items</h3>
                <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                  <li>Tap a list to view its items</li>
                  <li>Tap "+" to add new items (name and optional quantity)</li>
                  <li>Tap items to check them off</li>
                  <li>Swipe left on any item to delete it</li>
                  <li>Checked items sink to the bottom of the list</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Real-Time Updates</h3>
                <p className="text-muted-foreground">
                  When family members add or check off items, you'll see the changes instantly. 
                  No need to refresh - everything stays in sync automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold mb-6">Tips</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="font-semibold">•</div>
                <div>Use the archive feature to reuse shopping lists for recurring trips</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-semibold">•</div>
                <div>Assign lists to track who's responsible for what</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-semibold">•</div>
                <div>Use quantity notes for items like "2 lbs", "dozen", etc.</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-semibold">•</div>
                <div>All lists work offline and sync when connected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
