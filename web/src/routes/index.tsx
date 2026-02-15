import { createFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, MapPin, Shield, Server } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const features = [
    {
      icon: <ShoppingCart className="w-10 h-10" style={{ color: '#b4dbfa' }} />,
      title: 'Shared Lists',
      description:
        'Shopping lists, to-dos, packing lists — all synced in real-time across your family.',
    },
    {
      icon: <MapPin className="w-10 h-10" style={{ color: '#dad4fc' }} />,
      title: 'Location Sharing',
      description:
        'Opt-in location sharing with privacy controls. See where your family is, when you need to.',
    },
    {
      icon: <Shield className="w-10 h-10" style={{ color: '#b2ecca' }} />,
      title: 'Privacy First',
      description:
        'Your data stays on your server. No third parties, no tracking, no harvesting.',
    },
    {
      icon: <Server className="w-10 h-10" style={{ color: '#fadeaf' }} />,
      title: 'Self-Hosted',
      description:
        'Run your own PocketBase backend with Docker. One command, complete control.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            falimy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
            A privacy-first family app where all data stays on your self-hosted backend
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/docs/getting-started">
              <Button size="lg" className="text-base px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/docs/self-hosting">
              <Button size="lg" variant="outline" className="text-base px-8">
                Self-Hosting Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need, nothing you don't</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
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

      {/* CTA Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your family's data?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Set up your own PocketBase server in minutes and connect your family through the falimy mobile app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/docs/self-hosting">
              <Button size="lg" className="text-base px-8">
                View Self-Hosting Guide
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="text-base px-8">
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
