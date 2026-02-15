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

const dockerComposeYml = `version: '3.8'

services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    ports:
      - "8090:8090"
    volumes:
      - pb_data:/pb/pb_data
      - ./pb_migrations:/pb/pb_migrations
      - ./pb_hooks:/pb/pb_hooks
    restart: unless-stopped
    environment:
      - PB_LOG_LEVEL=info

volumes:
  pb_data:
`.trim()

const dockerComposeCmd = 'docker-compose up -d'

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
        'Cloud services (AWS, Azure, GCP - though self-hosting is recommended for cost)',
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
            <h1 className="text-4xl font-bold mb-4">Self-Hosting Guide</h1>
            <p className="text-lg text-muted-foreground">
              Deploy your own PocketBase server and take complete control of your family's data.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
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
            <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">1. Get the falimy Repository</h3>
                <p className="text-muted-foreground mb-3">
                  Clone or download the falimy repository from GitHub:
                </p>
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <code className="block p-4 bg-background rounded-md text-sm font-mono">
                      git clone https://github.com/jim-at-jibba/falimy.git
                    </code>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2. Run the Docker Container</h3>
                <p className="text-muted-foreground mb-3">
                  Navigate to the repository directory and start PocketBase with Docker Compose:
                </p>
                <div className="space-y-3">
                  <Card className="bg-muted/30">
                    <CardHeader>
                      <CardTitle className="text-base mb-2">docker-compose.yml</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(dockerComposeYml)}
                        className="ml-auto"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <pre className="p-4 bg-background rounded-md text-xs font-mono overflow-x-auto">
                        {dockerComposeYml}
                      </pre>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardHeader>
                      <CardTitle className="text-base mb-2">Command</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(dockerComposeCmd)}
                        className="ml-auto"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center gap-2 p-4 bg-background rounded-md">
                        <Code className="text-primary" />
                        <code className="text-sm font-mono">{dockerComposeCmd}</code>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3. Access PocketBase</h3>
                <p className="text-muted-foreground mb-3">
                  Your PocketBase server is now running at:
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
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <AlertCircle className="text-warning" />
              Important Notes
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="font-semibold">Security:</div>
                <div>
                  The default admin credentials are in the <code className="bg-muted/50 px-2 py-1 rounded text-sm">.env.example</code> file. 
                  Change these immediately after first login!
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
                  To update PocketBase, stop the container and restart with the new image.
                  Data is preserved in the volume.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-semibold">HTTPS:</div>
                <div>
                  HTTP works initially, but for production use, set up a reverse proxy with HTTPS.
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
