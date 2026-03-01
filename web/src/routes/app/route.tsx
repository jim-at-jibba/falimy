import {
  createFileRoute,
  Outlet,
  useNavigate,
  Link,
} from "@tanstack/react-router";
import { useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Home, List, Map, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/auth/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground font-semibold">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-primary font-extrabold dark:border-white/25">
              f
            </div>
            <div className="flex flex-col">
              <span className="font-bold">falimy</span>
              {user && (
                <span className="text-xs text-muted-foreground font-medium">
                  {user.family_id || "No family"}
                </span>
              )}
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/app" className="flex items-center gap-2 font-semibold">
                  <Home className="size-4" />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/app/lists" className="flex items-center gap-2 font-semibold">
                  <List className="size-4" />
                  <span>Lists</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/app/location" className="flex items-center gap-2 font-semibold">
                  <Map className="size-4" />
                  <span>Location</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/app/settings" className="flex items-center gap-2 font-semibold">
                  <Settings className="size-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-3 px-3 py-2">
            {user && (
              <Avatar className="size-8 border-2 border-black dark:border-white/25">
                <AvatarFallback className="bg-secondary font-bold">
                  {user.name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
