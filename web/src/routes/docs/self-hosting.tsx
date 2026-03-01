import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Code, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export const Route = createFileRoute('/docs/self-hosting')({
  component: SelfHostingPage,
})

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard!')
}

function SelfHostingPage() {
  const requirements = [
    {
      title: 'Docker Installed',
      description: 'Docker and Docker Compose must be installed on your system.',
    },
    {
      title: 'A Server or VPS',
      description: 'You need a machine that can run Docker 24/7. Options include:',
      options: [
        'VPS providers (DigitalOcean, Linode, Hetzner, etc.)',
        'Home server (Raspberry Pi, mini PC, NAS)',
        'Cloud services (AWS, Azure, GCP)',
      ],
    },
    {
      title: 'Domain Name (Optional but Recommended)',
      description: 'A custom domain for HTTPS access via reverse proxy.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold mb-4">Self-Hosting Guide</h1>
            <p className="text-lg text-muted-foreground font-medium">
              Deploy your own PocketBase server and take complete control of your family's data.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
              <CheckCircle className="text-primary" />
              Prerequisites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requirements.map((req) => (
                <div key={req.title}>
                  <h3 className="text-lg font-semibold mb-2">{req.title}</h3>
                  <p className="text-muted-foreground">{req.description}</p>
                  {req.options && (
                    <ul className="mt-2 ml-4 space-y-1 list-disc">
                      {req.options.map((opt, idx) => (
                        <li key={idx} className="text-muted-foreground">{opt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-extrabold mb-6">Quick Start</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3">1. Clone the Repository</h3>
                <p className="text-muted-foreground mb-3">
                  Clone the falimy repository from GitHub. The <code className="bg-muted/50 px-2 py-1 rounded text-sm">server/</code> directory
                  contains everything you need — the Dockerfile, docker-compose.yml, database migrations, and hooks.
                </p>
                <Card className="bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Clone</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('git clone https://github.com/jim-at-jibba/falimy.git')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <code className="block p-4 bg-background rounded-md text-sm font-mono">
                      git clone https://github.com/jim-at-jibba/falimy.git
                    </code>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">2. Configure Environment</h3>
                <p className="text-muted-foreground mb-3">
                  Navigate to the <code className="bg-muted/50 px-2 py-1 rounded text-sm">server/</code> directory and copy the example
                  environment file. Update the admin email and password before starting.
                </p>
                <div className="space-y-3">
                  <Card className="bg-muted/30">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Setup</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard('cd falimy/server\ncp .env.example .env')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <pre className="p-4 bg-background rounded-md text-sm font-mono">
{`cd falimy/server
cp .env.example .env`}
                      </pre>
                    </CardContent>
                  </Card>
                  <p className="text-muted-foreground">
                    Edit <code className="bg-muted/50 px-2 py-1 rounded text-sm">.env</code> and set your admin credentials:
                  </p>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-6">
                      <pre className="p-4 bg-background rounded-md text-sm font-mono">
{`PB_ADMIN_EMAIL=your_email@example.com
PB_ADMIN_PASSWORD=your_secure_password`}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">3. Start the Server</h3>
                <p className="text-muted-foreground mb-3">
                  Run Docker Compose from the <code className="bg-muted/50 px-2 py-1 rounded text-sm">server/</code> directory.
                  This builds the custom PocketBase binary and applies the database migrations automatically.
                </p>
                <Card className="bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Start</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('docker compose up -d')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center gap-2 p-4 bg-background rounded-md">
                      <Code className="text-primary" />
                      <code className="text-sm font-mono">docker compose up -d</code>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">4. Access PocketBase</h3>
                <p className="text-muted-foreground mb-3">
                  Your PocketBase server is now running. Access the admin panel at:
                </p>
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 p-4 bg-background rounded-md">
                      <CheckCircle className="text-primary" />
                      <code className="text-sm font-mono">http://YOUR_SERVER_IP:8090/_/</code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
              <AlertCircle className="text-warning" />
              Important Notes
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="font-semibold">Security:</div>
                <div>
                  Change the admin credentials in <code className="bg-muted/50 px-2 py-1 rounded text-sm">.env</code> before
                  first launch. These are used to create the PocketBase superuser account.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-semibold">Persistence:</div>
                <div>
                  Data is stored in the <code className="bg-muted/50 px-2 py-1 rounded text-sm">pb_data</code> Docker volume.
                  Back up this volume regularly to prevent data loss.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-semibold">Updates:</div>
                <div>
                  To update, pull the latest changes from the repo and rebuild:
                  <code className="bg-muted/50 px-2 py-1 rounded text-sm ml-1">docker compose down && docker compose up -d --build</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-semibold">HTTPS (Required):</div>
                <div>
                  The falimy web and mobile apps require the backend to be served over HTTPS.
                  You must set up a reverse proxy with SSL in front of PocketBase.
                  See the{' '}
                  <a href="/docs/reverse-proxy" className="text-primary hover:underline">
                    Reverse Proxy Guide
                  </a>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
