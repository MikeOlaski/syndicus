import { useNavigate, useLocation } from "react-router-dom";
import { 
  MessageSquare, 
  LayoutDashboard, 
  Users, 
  User, 
  Settings, 
  LogOut,
  Crown,
  Briefcase,
  MessagesSquare,
  Home,
  Webhook,
  FileText,
  Zap
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  userRole: string | null;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const subscriberItems = [
    { title: "Dashboard", url: "/subscriber-dashboard", icon: LayoutDashboard },
    { title: "My Coaches", url: "/subscriber-dashboard/coaches", icon: Users },
    { title: "My Syndic8s", url: "/subscriber-dashboard/syndic8s", icon: Zap },
    { title: "AI Chat", url: "/subscriber-dashboard/chat", icon: MessageSquare },
    { title: "Profile", url: "/subscriber-dashboard/profile", icon: User },
  ];

  const coachItems = [
    { title: "Dashboard", url: "/coach-dashboard", icon: LayoutDashboard },
    { title: "AI Assistant", url: "/coach-dashboard/chat", icon: MessageSquare },
    { title: "Templates", url: "/coach-dashboard/templates", icon: FileText },
    { title: "My Twin", url: "/coach-dashboard/my-twin", icon: Briefcase },
    { title: "Conversations", url: "/coach-dashboard/conversations", icon: MessagesSquare },
    { title: "My Subscribers", url: "/coach-dashboard/subscribers", icon: Users },
    { title: "Profile", url: "/coach-dashboard/profile", icon: Settings },
  ];

  const adminItems = [
    { title: "Dashboard", url: "/admin-dashboard", icon: LayoutDashboard },
    { title: "Coaches", url: "/admin-dashboard/coaches", icon: Briefcase },
    { title: "Templates", url: "/admin-dashboard/templates", icon: FileText },
    { title: "Manage Subscribers", url: "/admin-dashboard/subscribers", icon: Users },
    { title: "System Chat", url: "/admin-dashboard/chat", icon: MessageSquare },
    { title: "Webhook Endpoints", url: "/admin-dashboard/webhooks", icon: Webhook },
  ];

  const items = 
    userRole === "admin" ? adminItems :
    userRole === "coach" ? coachItems :
    subscriberItems;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        <div className="px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-sm">Syndic.us</h2>
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole === "admin" ? (
                    <span className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Admin
                    </span>
                  ) : userRole}
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-accent"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {(userRole === "admin" || userRole === "coach") && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  onClick={() => navigate("/")}
                  className="w-full hover:bg-accent text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-4 w-4" />
                  {!collapsed && <span>Back to Syndic.us</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={handleLogout}
                className="w-full hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Logout</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
