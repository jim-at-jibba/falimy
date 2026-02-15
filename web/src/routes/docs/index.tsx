import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LifeBuoy, BookOpen, Wrench, HelpCircle, ShoppingCart, MapPin, Radio } from 'lucide-react'

export const Route = createFileRoute('/docs/')({
  component: DocsIndexPage,
})

function DocsIndexPage() {
  const docsSections = [
    {
      title: 'Getting Started',
      description: 'Quick setup guide to get your family running.',
      icon: <LifeBuoy className="h-8 w-8" />,
      links: [
        { title: 'Getting Started', href: '/docs/getting-started' },
        { title: 'Self-Hosting Guide', href: '/docs/self-hosting' },
      ],
    },
    {
      title: 'Setup & Configuration',
      description: 'Server setup and configuration guides.',
      icon: <Wrench className="h-8 w-8" />,
      links: [
        { title: 'Reverse Proxy Setup', href: '/docs/reverse-proxy' },
      ],
    },
    {
      title: 'Feature Guides',
      description: 'Learn how to use falimy features.',
      icon: <BookOpen className="h-8 w-8" />,
      links: [
        { title: 'Shared Lists', href: '/docs/features/lists' },
        { title: 'Location Sharing', href: '/docs/features/location' },
        { title: 'Geofences', href: '/docs/features/geofences' },
      ],
    },
    {
      title: 'Support',
      description: 'Get help with common questions.',
      icon: <HelpCircle className="h-8 w-8" />,
      links: [
        { title: 'FAQ', href: '/docs/faq' },
        { title: 'Troubleshooting', href: '/docs/troubleshooting' },
      ],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Everything you need to set up and use falimy, your privacy-first family hub.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docsSections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {section.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="flex items-center gap-2 text-primary hover:underline font-medium"
                        >
                          <ShoppingCart className="size-4" />
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
