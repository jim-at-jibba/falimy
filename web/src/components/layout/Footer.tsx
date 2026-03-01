import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="border-t-2 border-black bg-background dark:border-white/25">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-extrabold text-lg mb-3">falimy</h3>
            <p className="text-sm text-muted-foreground">
              Privacy-first family hub. Self-hosted, secure, and simple.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/docs/getting-started" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link to="/docs/self-hosting" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Self-Hosting Guide
                </Link>
              </li>
              <li>
                <Link to="/docs/faq" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/jim-at-jibba/falimy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-black dark:border-white/25 text-center text-sm text-muted-foreground font-medium">
          <p>&copy; {new Date().getFullYear()} falimy. Open source and privacy-focused.</p>
        </div>
      </div>
    </footer>
  )
}
