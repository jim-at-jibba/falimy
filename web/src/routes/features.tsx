import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  ShoppingCart, 
  MapPin, 
  Shield, 
  Server, 
  Users, 
  QrCode,
  Bell,
  Lock,
  Radio
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/features')({
  component: FeaturesPage,
})

function FeaturesPage() {
  const coreFeatures = [
    {
      icon: <ShoppingCart className="w-12 h-12" style={{ color: '#b4dbfa' }} />,
      title: 'Shared Lists',
      description:
        'Create shopping lists, to-do lists, packing lists, or custom lists. Check off items, add notes, and see updates in real-time as family members make changes.',
      details: [
        'Real-time sync across all devices',
        'Color-coded by type (shopping, todo, packing, custom)',
        'Swipe to delete items',
        'Archive completed lists for reuse',
        'Assign lists to family members'
      ]
    },
    {
      icon: <MapPin className="w-12 h-10" style={{ color: '#dad4fc' }} />,
      title: 'Location Sharing',
      description:
        'Opt-in location sharing with full privacy controls. See family members on a map with smart privacy modes that respect everyone\'s boundaries.',
      details: [
        'Four sharing modes: Off, Always, Timed, On-Request',
        'Timed sharing auto-expires (15min to 8hrs)',
        'Color-coded markers by recency',
        'Battery level indicators',
        'No third-party tracking'
      ]
    },
    {
      icon: <Radio className="w-12 h-12" style={{ color: '#fadeaf' }} />,
      title: 'Geofences',
      description:
        'Define important places like home, school, or work. Get notified when family members arrive or leave these locations.',
      details: [
        'Create custom zones with adjustable radius',
        'Enter, exit, or both triggers',
        'Watch specific family members',
        'Enable/disable per geofence',
        'Evaluated on-device for privacy'
      ]
    },
    {
      icon: <Users className="w-12 h-12" style={{ color: '#f8d5f4' }} />,
      title: 'Family Management',
      description:
        'Easy onboarding with QR code invites. Admins can manage roles and settings while maintaining a simple, intuitive experience for everyone.',
      details: [
        'QR code-based invites',
        'Role-based permissions (admin/member/child)',
        'Regenerate invite codes anytime',
        'Family member directory',
        'Profile avatars'
      ]
    },
  ]

  const privacyFeatures = [
    {
      icon: <Shield className="w-10 h-10" style={{ color: '#b2ecca' }} />,
      title: 'Privacy First',
      description: 'Your data never leaves your family\'s server. No analytics, no tracking, no third parties.'
    },
    {
      icon: <Server className="w-10 h-10" style={{ color: '#fadeaf' }} />,
      title: 'Self-Hosted',
      description: 'Run PocketBase on your own server or cloud. Full control over your family\'s data.'
    },
    {
      icon: <Lock className="w-10 h-10" style={{ color: '#dad4fc' }} />,
      title: 'Secure by Design',
      description: 'HTTPS required, server-side validation, rate limiting, and cryptographic invite codes.'
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <PageHeader 
        title="Features" 
        description="Everything you need to stay connected with your family, privately."
      />

      {/* Core Features */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-12">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">{feature.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Built for Privacy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {privacyFeatures.map((feature, index) => (
              <Card key={index} className="text-center border-2">
                <CardHeader>
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
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
