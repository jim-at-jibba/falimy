import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Lock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export const Route = createFileRoute('/docs/reverse-proxy')({
  component: ReverseProxyPage,
})

const nginxConfig = `server {
    listen 80;
    server_name your-family.example.com;

    location / {
        proxy_pass http://localhost:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`.trim()

const caddyConfig = `your-family.example.com {
    reverse_proxy localhost:8090
}`.trim()

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard!')
}

function ReverseProxyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold mb-4">Reverse Proxy Setup</h1>
            <p className="text-lg text-muted-foreground">
              Set up HTTPS and secure access to your PocketBase server using a reverse proxy.
            </p>
          </div>

          <Card className="mb-12 bg-muted/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="text-primary h-8 w-8" />
                <div>
                  <CardTitle className="text-xl mb-2">Why Use HTTPS?</CardTitle>
                  <CardDescription className="text-base">
                    HTTPS encrypts traffic between devices and your server, protecting your family's data. 
                    It's strongly recommended for production use, especially when accessing outside your local network.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="mb-12">
            <h2 className="text-2xl font-extrabold mb-6">Choose Your Proxy Server</h2>
            <p className="text-muted-foreground mb-8">
              We recommend using Caddy for automatic HTTPS, but Nginx is also supported.
            </p>

            <Tabs defaultValue="caddy" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="caddy">Caddy (Recommended)</TabsTrigger>
                <TabsTrigger value="nginx">Nginx</TabsTrigger>
              </TabsList>
              
              <TabsContent value="caddy">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Why Caddy?</h3>
                    <p className="text-muted-foreground mb-4">
                      Caddy automatically handles HTTPS with Let's Encrypt. No manual certificate management needed.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Caddyfile Configuration</h3>
                    <p className="text-muted-foreground mb-3">
                      Create a <code className="bg-muted/50 px-2 py-1 rounded text-sm">Caddyfile</code> in the falimy directory:
                    </p>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base mb-2">Caddyfile</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(caddyConfig)}
                          className="ml-auto"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <pre className="p-4 bg-background rounded-md text-xs font-mono overflow-x-auto">
                          {caddyConfig}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Run Caddy</h3>
                    <p className="text-muted-foreground mb-3">
                      Run Caddy with Docker Compose or standalone:
                    </p>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center gap-2 p-4 bg-background rounded-md">
                          <code className="text-sm font-mono">docker run -d -p 80:80 -p 443:443 --name caddy -v $(pwd)/Caddyfile:/etc/caddy/Caddyfile caddy:latest</code>
                        </div>
                        <div className="flex items-center gap-2 p-4 bg-background rounded-md">
                          <code className="text-sm font-mono">caddy run --config Caddyfile</code>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nginx">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Why Nginx?</h3>
                    <p className="text-muted-foreground mb-4">
                      Nginx is a powerful, widely-used reverse proxy. You'll need to manage SSL certificates manually.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Nginx Configuration</h3>
                    <p className="text-muted-foreground mb-3">
                      Add this configuration to your Nginx server block:
                    </p>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base mb-2">nginx.conf</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(nginxConfig)}
                          className="ml-auto"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <pre className="p-4 bg-background rounded-md text-xs font-mono overflow-x-auto">
                          {nginxConfig}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">SSL Certificates</h3>
                    <p className="text-muted-foreground mb-3">
                      Obtain SSL certificates from Let's Encrypt using certbot:
                    </p>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 p-4 bg-background rounded-md">
                          <Lock className="text-primary" />
                          <code className="text-sm font-mono">sudo certbot --nginx -d your-family.example.com</code>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl">Port Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="font-semibold">Port 80 (HTTP):</div>
                  <div className="text-muted-foreground">
                    Required for initial connections and HTTP redirect.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="font-semibold">Port 443 (HTTPS):</div>
                  <div className="text-muted-foreground">
                    Required for secure HTTPS connections.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="font-semibold">Port 8090 (PocketBase):</div>
                  <div className="text-muted-foreground">
                    PocketBase runs on port 8090. The reverse proxy forwards traffic to this port.
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Ensure your firewall allows traffic on ports 80 and 443.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
