import { createFileRoute, Link } from '@tanstack/react-router'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHeader } from '@/components/layout/PageHeader'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/docs/getting-started')({
  component: GettingStartedPage,
})

const stepColors = ['#b4dbfa', '#dad4fc', '#fadeaf', '#f8d5f4']

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

      <PageHeader
        title="Getting Started"
        description="Get your family set up and running in a few simple steps."
        color="blue"
      />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/25 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)]"
                style={{ backgroundColor: stepColors[index] }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-black mb-1">{step.title}</h3>
                    <p className="text-black/60 text-base font-medium mb-3">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="size-4 text-black mt-0.5 flex-shrink-0" />
                          <span className="text-black/70 font-medium">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border-2 border-black bg-[#b2ecca] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/25 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)]">
            <h3 className="text-xl font-bold text-black mb-4">What's Next?</h3>
            <p className="mb-4 text-black/60 font-medium">
              After setting up your family, you can explore these features:
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/docs/features/lists"
                className="flex items-center gap-2 text-black font-semibold hover:opacity-70 transition-opacity"
              >
                <span>Learn about Lists</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/docs/features/location"
                className="flex items-center gap-2 text-black font-semibold hover:opacity-70 transition-opacity"
              >
                <span>Learn about Location Sharing</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/docs/features/geofences"
                className="flex items-center gap-2 text-black font-semibold hover:opacity-70 transition-opacity"
              >
                <span>Learn about Geofences</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
