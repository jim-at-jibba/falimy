import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Radio, MapPin, Bell, CheckCircle, Shield } from 'lucide-react'

export const Route = createFileRoute('/docs/features/geofences')({
  component: GeofencesFeaturePage,
})

function GeofencesFeaturePage() {
  const triggerTypes = [
    {
      name: 'Enter',
      description: 'Notified when the watched family member enters the geofence zone',
      icon: <MapPin className="h-5 w-5 text-success" />,
    },
    {
      name: 'Exit',
      description: 'Notified when the watched family member leaves the geofence zone',
      icon: <Bell className="h-5 w-5 text-info" />,
    },
    {
      name: 'Both',
      description: 'Notified for both entry and exit events',
      icon: <Radio className="h-5 w-5 text-primary" />,
    },
  ]

  const commonGeofences = [
    {
      name: 'Home',
      description: 'Your primary residence. Get notified when family members arrive or leave home.',
      icon: '🏠',
    },
    {
      name: 'School',
      description: 'School or university. Know when kids arrive at or leave school.',
      icon: '🏫',
    },
    {
      name: 'Work',
      description: 'Office or workplace. Monitor when family members commute to/from work.',
      icon: '🏢',
    },
    {
      name: 'Grandma\'s House',
      description: 'Relative\'s home. Get peace of mind about visits.',
      icon: '🏡',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Geofences</h1>
            <p className="text-lg text-muted-foreground">
              Define geographic zones and receive notifications when family members enter or leave them.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">What Are Geofences?</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                A geofence is a virtual perimeter around a specific location. When a family member you're watching crosses 
                that boundary (enters or leaves), you receive a notification.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Radio className="text-primary" />
                  How It Works
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Create:</div>
                      <div>Set a center point and radius for each geofence</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Watch:</div>
                      <div>Choose which family member to track for each geofence</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Trigger:</div>
                      <div>Set whether to notify on entry, exit, or both</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Notify:</div>
                      <div>Choose which family member receives the notification</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Trigger Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {triggerTypes.map((type) => (
                <div key={type.name} className="p-4 bg-card rounded-lg border">
                  <div className="flex items-start gap-3 mb-2">
                    {type.icon}
                    <h3 className="text-lg font-semibold">{type.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Common Geofence Ideas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonGeofences.map((fence) => (
                <div key={fence.name} className="p-4 bg-card rounded-lg border">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="text-2xl">{fence.icon}</div>
                    <h3 className="text-lg font-semibold">{fence.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{fence.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Creating Geofences</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">On Mobile</h3>
                <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                  <li>Go to Location > Geofences</li>
                  <li>Tap "Create Geofence"</li>
                  <li>Interact with the map to set the center point</li>
                  <li>Choose a radius (100m to 2km)</li>
                  <li>Select which family member to watch</li>
                  <li>Set trigger type (enter, exit, or both)</li>
                  <li>Enable or disable the geofence anytime</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Privacy & Battery</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Shield className="text-primary" />
                    <div>
                      <div className="font-semibold">Evaluated On-Device:</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Geofence evaluation happens on the watched family member's device. This means:
                  </p>
                  <ul className="ml-6 space-y-2 text-sm text-muted-foreground">
                    <li>• Better battery efficiency (no constant server polling)</li>
                    <li>• Faster notifications (device can trigger immediately)</li>
                    <li>• Privacy-preserving (location never leaves the device without consent)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Tips</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="font-semibold">•</div>
                <div>Start with larger radii for familiar places, then refine</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-semibold">•</div>
                <div>Use "Both" trigger for home/work to catch arrivals and departures</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-semibold">•</div>
                <div>Disable geofences when not needed to save battery</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-semibold">•</div>
                <div>Consider using school/work geofences only during relevant hours</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
