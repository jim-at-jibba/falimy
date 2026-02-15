import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AlertTriangle, RefreshCw, Wifi, AlertCircle, Server } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/troubleshooting')({
  component: TroubleshootingPage,
})

const issues = [
  {
    category: 'Connection Problems',
    icon: <Wifi className="text-warning" />,
    problems: [
      {
        title: 'Cannot connect to server',
        solution: [
          'Verify the server URL is correct (include http:// or https://)',
          'Check that the server is running (docker ps to see if pocketbase container is up)',
          'Ensure port 8090 is not blocked by firewall',
          'Try accessing the server URL directly in a browser - you should see PocketBase admin',
          'If using HTTPS, verify your reverse proxy is working',
        ],
      },
      {
        title: 'Connection works but login fails',
        solution: [
          'Verify email and password are correct',
          'Check that the user exists in the PocketBase admin panel',
          'Ensure the user has a family_id assigned',
          'Try clearing app cache and logging in again',
        ],
      },
      {
        title: 'Slow performance',
        solution: [
          'Check server resources (CPU, RAM) - PocketBase needs about 512MB RAM minimum',
          'Reduce polling intervals if you have many geofences or lists',
          'Consider upgrading server resources if hosting many family members',
          'Check database size - consider archiving old lists or clearing location history',
        ],
      },
    ],
  },
  {
    category: 'Sync Problems',
    icon: <RefreshCw className="text-info" />,
    problems: [
      {
        title: 'Changes not appearing for other family members',
        solution: [
          'Check that both users are on the same family',
          'Ensure both users have internet connectivity',
          'Pull to refresh on both devices',
          'Check PocketBase admin panel to verify data exists',
          'Verify real-time subscriptions are active (SSE connection)',
        ],
      },
      {
        title: 'Stale data showing',
        solution: [
          'Force refresh the data (pull-to-refresh)',
          'Check last sync timestamp in app settings',
          'Verify PocketBase has the latest records',
          'If on mobile, check background sync permissions',
        ],
      },
      {
        title: 'Offline changes not syncing',
        solution: [
          'Wait until you have internet connection',
          'Check PocketBase server is reachable',
          'Ensure you have write permissions to the collections',
          'Try manual sync from settings',
        ],
      },
    ],
  },
  {
    category: 'Location Problems',
    icon: <MapPin className="text-primary" />,
    problems: [
      {
        title: 'Location not updating',
        solution: [
          'Verify location sharing is enabled in Settings > Location',
          'Check that the watched family member has sharing enabled on their device',
          'Ensure location permissions are granted in device settings',
          'On mobile, check background location permissions',
          'On web, verify the browser tab is open',
        ],
      },
      {
        title: 'Geofence not triggering',
        solution: [
          'Verify the geofence is enabled',
          'Check the watched family member is actively sharing location',
          'Ensure radius is large enough for the location (start with 500m)',
          'Verify trigger type matches your expectations (enter, exit, or both)',
          'Check that the device has location permission and is actively tracking',
        ],
      },
      {
        title: 'Battery drain from location',
        solution: [
          'Use "Timed" mode instead of "Always" when possible',
          'Reduce geofence count or increase check intervals',
          'Disable location sharing when not needed',
          'On mobile, ensure background tasks are efficient',
        ],
      },
    ],
  },
  {
    category: 'Self-Hosting Issues',
    icon: <Server className="text-destructive" />,
    problems: [
      {
        title: 'Docker container won\'t start',
        solution: [
          'Check if Docker is running: docker ps',
          'View container logs: docker logs pocketbase',
          'Ensure port 8090 is not already in use',
          'Verify docker-compose.yml syntax (no trailing spaces, correct indentation)',
          'Try rebuilding: docker-compose down && docker-compose up --build',
        ],
      },
      {
        title: 'Cannot access admin panel',
        solution: [
          'Check PocketBase is running on port 8090',
          'Access via http://YOUR_IP:8090/_/',
          'If using reverse proxy, check proxy configuration',
          'Verify firewall allows access to the port',
          'Check admin credentials from .env.example or docker-compose.yml',
        ],
      },
      {
        title: 'Migrations not running',
        solution: [
          'Verify pb_migrations directory is mounted correctly',
          'Check migration filenames match expected format (timestamp_description.js)',
          'View container logs for migration errors',
          'Manually run migrations via PocketBase admin if needed',
          'Ensure PocketBase version supports the migrations',
        ],
      },
    ],
  },
]

function TroubleshootingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Troubleshooting</h1>
            <p className="text-lg text-muted-foreground">
              Common issues and solutions for falimy setup and usage.
            </p>
          </div>

          <div className="space-y-8">
            {issues.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  {category.icon}
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.problems.map((problem, probIndex) => (
                    <details key={probIndex} className="group">
                      <summary className="list-none cursor-pointer p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="text-warning" />
                          <h3 className="text-lg font-semibold">{problem.title}</h3>
                        </div>
                      </summary>
                      <div className="px-4 py-4 bg-muted/30">
                        <ul className="space-y-2">
                          {problem.solution.map((sol, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-muted-foreground">{idx + 1}. {sol}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <AlertCircle className="text-destructive" />
              Still Need Help?
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                If you're still having trouble, here are some options:
              </p>
              <div className="space-y-3 ml-6">
                <div className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Check the <Link to="/docs/faq" className="text-primary hover:underline">FAQ</Link> for more information</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Review the <Link to="/docs/self-hosting" className="text-primary hover:underline">Self-Hosting Guide</Link> for setup help</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Check the <Link to="/docs/reverse-proxy" className="text-primary hover:underline">Reverse Proxy Guide</Link> for HTTPS issues</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Report issues on <a href="https://github.com/jim-at-jibba/falimy/issues" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub Issues</a></span>
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
