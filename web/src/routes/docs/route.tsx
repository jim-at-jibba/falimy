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
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <Home className="size-4" />
            <span className="font-bold">falimy</span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  to="/docs"
                  className={`flex items-center gap-2 font-semibold ${isActive("/") ? "bg-[#dad4fc]" : ""}`}
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
                  className={`flex items-center gap-2 font-semibold ${isActive("/getting-started") ? "bg-[#b4dbfa]" : ""}`}
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
                  className={`flex items-center gap-2 font-semibold ${isActive("/self-hosting") ? "bg-[#fadeaf]" : ""}`}
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
                  className={`flex items-center gap-2 font-semibold ${isActive("/fly-io") ? "bg-[#fadeaf]" : ""}`}
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
                  className={`flex items-center gap-2 font-semibold ${isActive("/reverse-proxy") ? "bg-[#fadeaf]" : ""}`}
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
                  className={`flex items-center gap-2 font-semibold ${isActive("/faq") ? "bg-[#b2ecca]" : ""}`}
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
                  className={`flex items-center gap-2 font-semibold ${isActive("/troubleshooting") ? "bg-[#f8d5f4]" : ""}`}
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
