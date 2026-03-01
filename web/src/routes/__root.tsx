import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { queryClient } from '@/lib/queryClient'
import { Toaster } from '@/components/ui/sonner'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'falimy - Privacy-First Family Hub',
      },
      {
        name: 'description',
        content: 'A privacy-first family app where all data stays on your self-hosted backend. Share lists, locations, and stay connected.',
      },
      {
        property: 'og:title',
        content: 'falimy - Privacy-First Family Hub',
      },
      {
        property: 'og:description',
        content: 'A privacy-first family app where all data stays on your self-hosted backend. Share lists, locations, and stay connected.',
      },
      {
        property: 'og:image',
        content: 'https://falimy.jamesbest.uk/og.png',
      },
      {
        property: 'og:url',
        content: 'https://falimy.jamesbest.uk',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'falimy - Privacy-First Family Hub',
      },
      {
        name: 'twitter:description',
        content: 'A privacy-first family app where all data stays on your self-hosted backend. Share lists, locations, and stay connected.',
      },
      {
        name: 'twitter:image',
        content: 'https://falimy.jamesbest.uk/og.png',
      },
      {
        name: 'theme-color',
        content: '#dad4fc',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
