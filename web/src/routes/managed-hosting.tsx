import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Cloud,
  Shield,
  RefreshCw,
  HardDrive,
  Server,
  Lock,
  UserPlus,
  Settings,
  Link2,
  Smartphone,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/managed-hosting')({
  component: ManagedHostingPage,
})

const stepColors = ['#b4dbfa', '#dad4fc', '#fadeaf', '#f8d5f4']

const steps = [
  {
    icon: <UserPlus className="w-6 h-6" />,
    title: 'Sign up & register interest',
    description:
      'Let us know you want a managed instance. We\'ll get you set up.',
  },
  {
    icon: <Settings className="w-6 h-6" />,
    title: 'We provision your server',
    description:
      'We deploy a dedicated PocketBase instance on Fly.io, just for your family.',
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: 'You get your server URL',
    description:
      'We send you a unique URL for your private server, ready to go.',
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Plug it into the falimy app',
    description:
      'Enter your server URL in the app — same experience as self-hosting.',
  },
]

const benefits = [
  {
    icon: <Cloud className="w-8 h-8" />,
    title: 'No Technical Setup',
    description:
      'No Docker, no VPS, no reverse proxies. We handle all the infrastructure so you can focus on your family.',
    color: '#b4dbfa',
  },
  {
    icon: <RefreshCw className="w-8 h-8" />,
    title: 'Always Up to Date',
    description:
      'We handle updates and migrations. Your server always runs the latest version of falimy.',
    color: '#dad4fc',
  },
  {
    icon: <HardDrive className="w-8 h-8" />,
    title: 'Automatic Backups',
    description:
      'Your data is backed up regularly. No need to worry about losing your family\'s information.',
    color: '#fadeaf',
  },
]

const privacyPoints = [
  'Dedicated isolated instance — not a shared database',
  'Your data stays on your own server',
  'We don\'t access your data',
  'Encryption at rest and in transit',
  'Same open-source PocketBase you\'d self-host',
]

function ManagedHostingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <PageHeader
        title="Managed Hosting"
        description="Your own private server, without the hassle."
        color="pink"
      />

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            How It Works
          </h2>
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
                    <h3 className="text-xl font-bold text-black mb-1">
                      {step.title}
                    </h3>
                    <p className="text-black/60 text-base font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Managed Hosting? */}
      <section className="py-16 px-6 border-y-2 border-black dark:border-white/25 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            Why Managed Hosting?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/25 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)]"
                style={{ backgroundColor: benefit.color }}
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-black mb-2">
                  {benefit.title}
                </h3>
                <p className="text-black/70 font-medium">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Privacy, Still Protected */}
      <section className="py-16 px-6 bg-[#b2ecca] border-y-2 border-black dark:border-white/25">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-black" />
            <h2 className="text-3xl font-extrabold text-black">
              Your Privacy, Still Protected
            </h2>
          </div>
          <p className="text-center text-black/70 font-medium mb-8 max-w-2xl mx-auto">
            Managed hosting doesn't mean giving up privacy. You get the same
            isolation and security as self-hosting.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {privacyPoints.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
                <span className="text-black font-semibold">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Self-Hosting vs Managed */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            Self-Hosting vs Managed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/25 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] bg-[#fadeaf]">
              <div className="flex items-center gap-3 mb-4">
                <Server className="w-7 h-7 text-black" />
                <h3 className="text-xl font-bold text-black">Self-Hosting</h3>
              </div>
              <p className="text-black/60 font-medium mb-4">
                Best if you want maximum control and are comfortable with
                Docker.
              </p>
              <ul className="space-y-3">
                {[
                  'Full control over your infrastructure',
                  'Run on your own hardware',
                  'Choose your own cloud provider',
                  'Manage your own updates and backups',
                  'Requires Docker and technical setup',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-black mt-1 font-bold">•</span>
                    <span className="text-black/70 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link to="/docs/self-hosting">
                  <Button
                    variant="outline"
                    className="bg-white text-black border-black"
                  >
                    Self-Hosting Guide
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/25 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] bg-[#f8d5f4]">
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="w-7 h-7 text-black" />
                <h3 className="text-xl font-bold text-black">
                  Managed Hosting
                </h3>
              </div>
              <p className="text-black/60 font-medium mb-4">
                Best if you want privacy without the technical overhead.
              </p>
              <ul className="space-y-3">
                {[
                  'No technical setup required',
                  'We handle updates and migrations',
                  'Automatic backups included',
                  'Dedicated isolated server',
                  'Same privacy as self-hosting',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-black mt-1 font-bold">•</span>
                    <span className="text-black/70 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <a
                  href="https://github.com/jim-at-jibba/falimy/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-black text-white border-black hover:bg-black/80">
                    Register Interest
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#f8d5f4] border-t-2 border-black dark:border-white/25">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold mb-4 text-black">
            Interested in managed hosting?
          </h2>
          <p className="text-lg text-black/70 mb-8 max-w-2xl mx-auto font-medium">
            Managed hosting is coming soon. Register your interest and we'll
            notify you when it's ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/jim-at-jibba/falimy/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="text-base px-8 bg-black text-white border-black hover:bg-black/80"
              >
                Register Interest
              </Button>
            </a>
            <Link to="/docs/self-hosting">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 bg-white"
              >
                Self-Hosting Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
