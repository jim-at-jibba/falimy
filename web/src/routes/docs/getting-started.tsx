import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/docs/getting-started')({
  component: GettingStartedPage,
})

const steps = [
  {
    title: 'Set up your PocketBase server',
    description: 'Deploy PocketBase using Docker or run it on your own hardware.',
    details: [
      'Install Docker on your server or machine',
      'Run the provided docker-compose.yml file from the repo',
      'Ensure port 8090 is accessible (firewall configuration)',
    ],
  },
  {
    title: 'Get the falimy mobile app',
    description: 'Download falimy from your app store (iOS or Android).',
    details: [
      'Search for "falimy" in the App Store or Google Play',
      'Install the app on your mobile device(s)',
    ],
  },
  {
    title: 'Create your family',
    description: 'Set up the first family account as the family admin.',
    details: [
      'Open falimy and tap "Create Family"',
      'Enter your family server URL (e.g., https://family.example.com)',
      'Choose a family name and create your admin account',
    ],
  },
  {
    title: 'Invite family members',
    description: 'Add your family members using QR codes or invite codes.',
    details: [
      'Go to Settings > Family in the app',
      'Show the QR code to family members in person',
      'Or share the invite code manually',
    ],
  },
]

function GettingStartedPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
            <p className="text-lg text-muted-foreground">
              Get your family set up and running in a few simple steps.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card key={step.title}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                      <CardDescription className="text-base">{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="size-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                After setting up your family, you can explore these features:
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/docs/features/lists"
                  className="flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  <span>Learn about Lists</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/docs/features/location"
                  className="flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  <span>Learn about Location Sharing</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/docs/features/geofences"
                  className="flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  <span>Learn about Geofences</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
