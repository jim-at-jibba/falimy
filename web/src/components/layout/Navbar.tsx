import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-black bg-background dark:border-white/25">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-extrabold text-foreground tracking-tight hover:opacity-80 transition-opacity">
            falimy
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/features"
              className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              to="/docs"
              className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors"
            >
              Docs
            </Link>
          </div>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link to="/auth/login">
            <Button>Admin Login</Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 mt-8">
              <Link
                to="/features"
                className="text-lg font-bold hover:opacity-70 transition-opacity"
              >
                Features
              </Link>
              <Link
                to="/docs"
                className="text-lg font-bold hover:opacity-70 transition-opacity"
              >
                Docs
              </Link>
              <Link to="/auth/login">
                <Button className="w-full">Admin Login</Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
