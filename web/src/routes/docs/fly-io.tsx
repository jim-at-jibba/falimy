import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Copy, CheckCircle, AlertCircle, ExternalLink, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export const Route = createFileRoute('/docs/fly-io')({
  component: FlyIoPage,
})

const dockerfile = `FROM alpine:latest

ARG PB_VERSION=0.25.8

RUN apk add --no-cache \\
    unzip \\
    ca-certificates \\
    openssh

ADD https://github.com/pocketbase/pocketbase/releases/download/v\${PB_VERSION}/pocketbase_\${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

EXPOSE 8080

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
`.trim()

const flyToml = `app = "your-app-name"
primary_region = "ams"

[mounts]
  source = "pb_data"
  destination = "/pb/pb_data"

[build.args]
  PB_VERSION = "0.25.8"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

  [http_service.concurrency]
    type = "requests"
    soft_limit = 500
    hard_limit = 550
`.trim()

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard!')
}

function FlyIoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <Cloud className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Deploy to Fly.io</h1>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground">
              Deploy falimy to Fly.io for a fully managed cloud hosting solution with automatic HTTPS and persistent storage.
            </p>
          </div>

          <div className="mb-8 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-warning mt-0.5" />
              <div>
                <p className="font-semibold">Prerequisites</p>
                <ul className="mt-2 text-muted-foreground space-y-1 list-disc ml-4">
                  <li>A Fly.io account (free tier available)</li>
                  <li>flyctl CLI installed</li>
                  <li>Payment method added to Fly.io account (required for verification, free tier still available)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Step 1: Create the Dockerfile</h2>
            <p className="text-muted-foreground mb-4">
              Create a <code className="bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">Dockerfile</code> in your project root:
            </p>
            <Card className="bg-muted/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Dockerfile</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(dockerfile)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-2">
                <pre className="p-3 sm:p-4 bg-background rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
                  {dockerfile}
                </pre>
              </CardContent>
            </Card>
          </div>

          <div className="mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Step 2: Install Flyctl</h2>
            <p className="text-muted-foreground mb-4">
              Follow the installation instructions from the Fly.io documentation:
            </p>
            <a 
              href="https://fly.io/docs/hands-on/install-flyctl/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Install Flyctl <ExternalLink className="h-4 w-4" />
            </a>
            <div className="mt-4 space-y-2">
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <code className="block text-sm font-mono">flyctl auth signup</code>
                  <p className="text-muted-foreground text-sm mt-2">Create a Fly.io account (email or GitHub)</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <code className="block text-sm font-mono">flyctl auth login</code>
                  <p className="text-muted-foreground text-sm mt-2">Login to your account</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Step 3: Launch Your App</h2>
            <p className="text-muted-foreground mb-4">
              Navigate to your project directory and run:
            </p>
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <code className="block text-sm font-mono">flyctl launch --build-only</code>
              </CardContent>
            </Card>
            <div className="mt-4 text-muted-foreground space-y-2">
              <p>When prompted, select <strong>Yes</strong> to tweak settings. In the configuration page:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Choose a region that is <strong>NOT</strong> marked with an asterisk (*) for free tier</li>
                <li>Set VM memory to 256MB or 512MB for free tier allowance</li>
              </ul>
            </div>
          </div>

          <div className="mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Step 4: Create Persistent Volume</h2>
            <p className="text-muted-foreground mb-4">
              Create a 1GB persistent volume for your PocketBase data:
            </p>
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <code className="block text-sm font-mono">flyctl volumes create pb_data --size=1</code>
              </CardContent>
            </Card>
            <p className="text-muted-foreground mt-4">
              Select the same region you chose in Step 3. Type <strong>y</strong> to confirm when prompted.
            </p>
          </div>

          <div className="mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Step 5: Configure fly.toml</h2>
            <p className="text-muted-foreground mb-4">
              Update your <code className="bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">fly.toml</code> file to include the volume mount:
            </p>
            <Card className="bg-muted/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">fly.toml</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(flyToml)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-2">
                <pre className="p-3 sm:p-4 bg-background rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
                  {flyToml}
                </pre>
              </CardContent>
            </Card>
          </div>

          <div className="mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Step 6: Deploy</h2>
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <code className="block text-sm font-mono">flyctl deploy</code>
              </CardContent>
            </Card>
            <p className="text-muted-foreground mt-4">
              Your PocketBase instance will be available at:{' '}
              <code className="bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm break-all">https://YOUR_APP_NAME.fly.dev/_/</code>
            </p>
          </div>

          <div className="mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              First-Time Setup
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                On first access, you'll need to create your superuser account. Check your Fly.io logs for the installer URL:
              </p>
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <code className="block text-sm font-mono">flyctl logs</code>
                </CardContent>
              </Card>
              <p>
                Look for a URL containing <code className="bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">/_/</code> and replace 
                <code className="bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">localhost</code> with your Fly.io app URL.
              </p>
            </div>
          </div>

          <div className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-warning flex-shrink-0" />
              Backup &amp; Data Management
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Fly.io automatically creates daily snapshots of your volume (kept for 5 days). 
                To download a local copy of your <code className="bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">pb_data</code>:
              </p>
              <div className="space-y-2">
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Terminal 1 - Register SSH key:</p>
                    <code className="block text-sm font-mono">flyctl ssh issue --agent</code>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Terminal 1 - Start proxy:</p>
                    <code className="block text-sm font-mono">flyctl proxy 10022:22</code>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Terminal 2 - Copy data:</p>
                    <code className="block text-sm font-mono">scp -r -P 10022 root@localhost:/pb/pb_data ./pb_data_backup</code>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-warning flex-shrink-0" />
              Important Notes
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                <div className="font-semibold">Idle Timeout:</div>
                <div>
                  Fly.io has a 60s timeout for idle connections. You may see periodic errors in the console 
                  when using realtime features. These can be safely ignored as the SDK handles reconnection automatically.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                <div className="font-semibold">Free Tier:</div>
                <div>
                  Fly.io offers a free tier with limited resources. Check the{' '}
                  <a 
                    href="https://fly.io/docs/about/pricing/#free-allowances" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    pricing page <ExternalLink className="h-3 w-3" />
                  </a>{' '}
                  for current allowances.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                <div className="font-semibold">Updates:</div>
                <div>
                  To update PocketBase, change the <code className="bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">PB_VERSION</code> in 
                  your Dockerfile or <code className="bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">fly.toml</code> and run 
                  <code className="bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">flyctl deploy</code> again.
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              This guide is based on the official{' '}
              <a 
                href="https://github.com/pocketbase/pocketbase/discussions/537" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                PocketBase Fly.io discussion <ExternalLink className="h-3 w-3" />
              </a>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
