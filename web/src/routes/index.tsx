import { createFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, MapPin, Shield, Server } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: 'Shared Lists',
      description:
        'Shopping lists, to-dos, packing lists — all synced in real-time across your family.',
      color: '#b4dbfa',
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Location Sharing',
      description:
        'Opt-in location sharing with privacy controls. See where your family is, when you need to.',
      color: '#dad4fc',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy First',
      description:
        'Your data stays on your server. No third parties, no tracking, no harvesting.',
      color: '#b2ecca',
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: 'Self-Hosted',
      description:
        'Run your own PocketBase backend with Docker. One command, complete control.',
      color: '#fadeaf',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center bg-[#b4dbfa] border-b-2 border-black dark:border-white/25">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight text-black">
            falimy
          </h1>
          <p className="text-xl md:text-2xl text-black/70 mb-10 max-w-2xl mx-auto font-semibold">
            A privacy-first family app where all data stays on your self-hosted backend
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/docs/getting-started">
              <Button size="lg" className="text-base px-8 bg-black text-white border-black hover:bg-black/80">
                Get Started
              </Button>
            </Link>
            <Link to="/docs/self-hosting">
              <Button size="lg" variant="outline" className="text-base px-8 bg-white">
                Self-Hosting Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold text-center mb-14">Everything you need, nothing you don't</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/25 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)]"
                style={{ backgroundColor: feature.color }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-black/70 font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#fadeaf] border-t-2 border-black dark:border-white/25">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold mb-4 text-black">Ready to take control of your family's data?</h2>
          <p className="text-lg text-black/70 mb-8 max-w-2xl mx-auto font-medium">
            Set up your own PocketBase server in minutes and connect your family through the falimy mobile app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/docs/self-hosting">
              <Button size="lg" className="text-base px-8 bg-black text-white border-black hover:bg-black/80">
                View Self-Hosting Guide
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="text-base px-8 bg-white">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
