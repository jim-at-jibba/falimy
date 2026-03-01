import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ShoppingCart,
  MapPin,
  Shield,
  Server,
  Users,
  Lock,
  Radio
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/features')({
  component: FeaturesPage,
})

function FeaturesPage() {
  const coreFeatures = [
    {
      icon: <ShoppingCart className="w-10 h-10" />,
      title: 'Shared Lists',
      description:
        'Create shopping lists, to-do lists, packing lists, or custom lists. Check off items, add notes, and see updates in real-time as family members make changes.',
      details: [
        'Real-time sync across all devices',
        'Color-coded by type (shopping, todo, packing, custom)',
        'Swipe to delete items',
        'Archive completed lists for reuse',
        'Assign lists to family members'
      ],
      color: '#b4dbfa',
    },
    {
      icon: <MapPin className="w-10 h-10" />,
      title: 'Location Sharing',
      description:
        'Opt-in location sharing with full privacy controls. See family members on a map with smart privacy modes that respect everyone\'s boundaries.',
      details: [
        'Four sharing modes: Off, Always, Timed, On-Request',
        'Timed sharing auto-expires (15min to 8hrs)',
        'Color-coded markers by recency',
        'Battery level indicators',
        'No third-party tracking'
      ],
      color: '#dad4fc',
    },
    {
      icon: <Radio className="w-10 h-10" />,
      title: 'Geofences',
      description:
        'Define important places like home, school, or work. Get notified when family members arrive or leave these locations.',
      details: [
        'Create custom zones with adjustable radius',
        'Enter, exit, or both triggers',
        'Watch specific family members',
        'Enable/disable per geofence',
        'Evaluated on-device for privacy'
      ],
      color: '#fadeaf',
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: 'Family Management',
      description:
        'Easy onboarding with QR code invites. Admins can manage roles and settings while maintaining a simple, intuitive experience for everyone.',
      details: [
        'QR code-based invites',
        'Role-based permissions (admin/member/child)',
        'Regenerate invite codes anytime',
        'Family member directory',
        'Profile avatars'
      ],
      color: '#f8d5f4',
    },
  ]

  const privacyFeatures = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy First',
      description: 'Your data never leaves your family\'s server. No analytics, no tracking, no third parties.',
      color: '#b2ecca',
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: 'Self-Hosted',
      description: 'Run PocketBase on your own server or cloud. Full control over your family\'s data.',
      color: '#fadeaf',
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Secure by Design',
      description: 'HTTPS required, server-side validation, rate limiting, and cryptographic invite codes.',
      color: '#dad4fc',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <PageHeader
        title="Features"
        description="Everything you need to stay connected with your family, privately."
        color="purple"
      />

      {/* Core Features */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border-2 border-black p-6 md:p-8 dark:border-white/25"
                style={{ backgroundColor: feature.color }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-2">{feature.title}</h3>
                    <p className="text-black/70 text-base font-medium mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-black/70">
                          <span className="text-black mt-1 font-bold">•</span>
                          <span className="font-medium">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="py-16 px-6 bg-[#b2ecca] border-y-2 border-black dark:border-white/25">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold text-center mb-12 text-black">Built for Privacy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {privacyFeatures.map((feature, index) => (
              <div
                key={index}
                className="text-center rounded-2xl border-2 border-black bg-white p-6 dark:border-white/25 dark:bg-card"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-base font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
            Set up your PocketBase server and start connecting your family.
          </p>
          <Link to="/docs/getting-started">
            <Button size="lg" className="text-base px-8">
              View Getting Started Guide
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
