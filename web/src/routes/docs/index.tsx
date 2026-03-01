import { createFileRoute, Link } from '@tanstack/react-router'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHeader } from '@/components/layout/PageHeader'
import { LifeBuoy, BookOpen, Wrench, HelpCircle, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/docs/')({
  component: DocsIndexPage,
})

function DocsIndexPage() {
  const docsSections = [
    {
      title: 'Getting Started',
      description: 'Quick setup guide to get your family running.',
      icon: <LifeBuoy className="h-7 w-7" />,
      color: '#b4dbfa',
      links: [
        { title: 'Getting Started', href: '/docs/getting-started' },
        { title: 'Self-Hosting Guide', href: '/docs/self-hosting' },
      ],
    },
    {
      title: 'Setup & Configuration',
      description: 'Server setup and configuration guides.',
      icon: <Wrench className="h-7 w-7" />,
      color: '#fadeaf',
      links: [
        { title: 'Fly.io Deployment', href: '/docs/fly-io' },
        { title: 'Reverse Proxy Setup', href: '/docs/reverse-proxy' },
      ],
    },
    {
      title: 'Feature Guides',
      description: 'Learn how to use falimy features.',
      icon: <BookOpen className="h-7 w-7" />,
      color: '#dad4fc',
      links: [
        { title: 'Shared Lists', href: '/docs/features/lists' },
        { title: 'Location Sharing', href: '/docs/features/location' },
        { title: 'Geofences', href: '/docs/features/geofences' },
      ],
    },
    {
      title: 'Support',
      description: 'Get help with common questions.',
      icon: <HelpCircle className="h-7 w-7" />,
      color: '#b2ecca',
      links: [
        { title: 'FAQ', href: '/docs/faq' },
        { title: 'Troubleshooting', href: '/docs/troubleshooting' },
      ],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <PageHeader
        title="Documentation"
        description="Everything you need to set up and use falimy, your privacy-first family hub."
        color="orange"
      />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docsSections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border-2 border-black p-6 dark:border-white/25"
                style={{ backgroundColor: section.color }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div>{section.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-black">{section.title}</h3>
                    <p className="text-black/60 font-medium text-sm">{section.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="flex items-center gap-2 text-black font-semibold hover:opacity-70 transition-opacity"
                      >
                        <ArrowRight className="size-4" />
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
