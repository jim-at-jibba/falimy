import {
  createFileRoute,
  Outlet,
  Link,
  useLocation,
} from "@tanstack/react-router";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, BookOpen, LifeBuoy, HelpCircle, Wrench } from "lucide-react";

export const Route = createFileRoute("/docs")({
  component: DocsLayout,
});

function DocsLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(`/docs${path}`);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link
            to="/"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Home className="size-4" />
            <span className="font-semibold">falimy</span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  to="/docs"
                  className={`flex items-center gap-2 ${isActive("/") ? "bg-accent" : ""}`}
                >
                  <BookOpen className="size-4" />
                  <span>Overview</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  to="/docs/getting-started"
                  className={`flex items-center gap-2 ${isActive("/getting-started") ? "bg-accent" : ""}`}
                >
                  <LifeBuoy className="size-4" />
                  <span>Getting Started</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  to="/docs/self-hosting"
                  className={`flex items-center gap-2 ${isActive("/self-hosting") ? "bg-accent" : ""}`}
                >
                  <Wrench className="size-4" />
                  <span>Self-Hosting</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  to="/docs/fly-io"
                  className={`flex items-center gap-2 ${isActive("/fly-io") ? "bg-accent" : ""}`}
                >
                  <Wrench className="size-4" />
                  <span>Fly.io Deployment</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  to="/docs/reverse-proxy"
                  className={`flex items-center gap-2 ${isActive("/reverse-proxy") ? "bg-accent" : ""}`}
                >
                  <Wrench className="size-4" />
                  <span>Reverse Proxy</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  to="/docs/faq"
                  className={`flex items-center gap-2 ${isActive("/faq") ? "bg-accent" : ""}`}
                >
                  <HelpCircle className="size-4" />
                  <span>FAQ</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  to="/docs/troubleshooting"
                  className={`flex items-center gap-2 ${isActive("/troubleshooting") ? "bg-accent" : ""}`}
                >
                  <Wrench className="size-4" />
                  <span>Troubleshooting</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter />
      </Sidebar>
      <Outlet />
    </SidebarProvider>
  );
}
