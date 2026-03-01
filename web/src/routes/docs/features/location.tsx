import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MapPin, Shield, Clock, BellRing, Smartphone } from 'lucide-react'

export const Route = createFileRoute('/docs/features/location')({
  component: LocationFeaturePage,
})

function LocationFeaturePage() {
  const privacyModes = [
    {
      name: 'Off',
      description: 'Location sharing is disabled. No one can see your location.',
      icon: <Shield className="h-5 w-5 text-muted-foreground" />,
    },
    {
      name: 'Always',
      description: 'Your location is shared continuously. Family members can see you anytime.',
      icon: <MapPin className="h-5 w-5 text-primary" />,
    },
    {
      name: 'Timed',
      description: 'Share your location for a set duration (15 minutes to 8 hours). Auto-disables when time expires.',
      icon: <Clock className="h-5 w-5 text-warning" />,
    },
    {
      name: 'On Request',
      description: 'Family members can "ping" you. You\'ll receive a notification and can choose to share or ignore.',
      icon: <BellRing className="h-5 w-5 text-info" />,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold mb-4">Location Sharing</h1>
            <p className="text-lg text-muted-foreground">
              Opt-in location sharing that respects privacy and keeps family connected.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-extrabold mb-6">Privacy-First Approach</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                falimy's location sharing is designed around consent and privacy. All location data stays on your family's 
                PocketBase server - no third-party tracking or cloud services.
              </p>
              <div className="bg-[#b2ecca] p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/25 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)]">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="text-primary" />
                  Key Privacy Principles
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="font-semibold">• Opt-In:</div>
                    <div>Location sharing is off by default for all new users.</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="font-semibold">• Granular Control:</div>
                    <div>Choose exactly when and with whom you share your location.</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="font-semibold">• Self-Hosted:</div>
                    <div>Your data never leaves your family's server.</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-extrabold mb-6">Sharing Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {privacyModes.map((mode) => (
                <div key={mode.name} className="p-4 bg-card rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/25 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)]">
                  <div className="flex items-start gap-3 mb-3">
                    {mode.icon}
                    <h3 className="text-lg font-semibold">{mode.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{mode.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-extrabold mb-6">How It Works</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">On Mobile</h3>
                <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                  <li>Location updates are posted to your PocketBase server</li>
                  <li>Battery level is included for context</li>
                  <li>Updates continue in the background when "Always" mode is on</li>
                  <li>"Timed" mode automatically stops sharing when duration expires</li>
                  <li>"On Request" sends you a notification - you approve or decline each ping</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">On Web</h3>
                <div className="bg-[#fadeaf] p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/25 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)]">
                  <div className="flex items-start gap-3 mb-3">
                    <Smartphone className="text-warning" />
                    <div>
                      <div className="font-semibold">Web Limitations:</div>
                    </div>
                  </div>
                  <ol className="list-decimal ml-6 space-y-2 text-muted-foreground text-sm">
                    <li>Location sharing only works while the browser tab is open</li>
                    <li>Background tracking is not available on web (browser limitation)</li>
                    <li>Use the mobile app for continuous background location sharing</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold mb-6">Family Map</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                The family map shows all members who have location sharing enabled. Members are color-coded by how recently 
                their location was updated:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-teal-400" />
                  <span>Recent (within 5 min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <span>Stale (5-30 min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-400" />
                  <span>Old (30+ min)</span>
                </div>
              </div>
              <p className="text-sm mt-4">
                Tap any family member on the map to see their last updated time and current battery level.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
