import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, LogOut, LogIn, UserPlus, Briefcase, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const goToDashboard = async () => {
    try {
      let role = userRole;
      if (!role && user) {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        if (!error) {
          const roles = (data ?? []).map((r: any) => r.role);
          role = roles.includes("admin") ? "admin" : roles.includes("coach") ? "coach" : roles.includes("subscriber") ? "subscriber" : null;
          if (role) setUserRole(role);
        }
      }
      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "coach") navigate("/coach-dashboard");
      else if (role === "subscriber") navigate("/subscriber-dashboard");
      else navigate("/auth");
    } catch (e) {
      navigate("/auth");
    }
  };

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        // Defer database calls to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            loadUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // THEN check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      if (error) {
        console.error("Error loading user role:", error);
        return;
      }
      
      const roles = (data ?? []).map((r: any) => r.role);
      const resolved = roles.includes("admin")
        ? "admin"
        : roles.includes("coach")
        ? "coach"
        : roles.includes("subscriber")
        ? "subscriber"
        : null;
      setUserRole(resolved);
    } catch (error) {
      console.error("Exception loading user role:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Syndic.us</h1>
            <p className="text-xs text-muted-foreground">Syndicated Digital Twin PersonaBots</p>
          </div>
        </a>
        
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <a href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </a>
          <a href="/coaches" className="text-sm font-medium hover:text-primary transition-colors">
            Coaches
          </a>
          <a href="/syndic8" className="text-sm font-medium hover:text-primary transition-colors">
            Syndic8
          </a>
          <a href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </a>
          <a href="/create-claim" className="text-sm font-medium hover:text-primary transition-colors">
            Create or Claim
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Button
                variant="outline"
                className="hidden sm:flex"
                onClick={() => navigate("/auth")}
              >
                Join as Subscriber
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Join as Coach
              </Button>
            </>
          ) : null}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-background z-50">
              {!user ? (
                <>
                  <DropdownMenuLabel className="pb-2">
                    <div className="font-semibold text-base">Welcome to Syndic.us</div>
                    <div className="text-xs font-normal text-muted-foreground mt-1">
                      Sign in to access your account
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/auth")}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/auth")}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/auth")} className="text-primary">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Join as Coach
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/help")}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-xs font-normal text-muted-foreground mt-1 capitalize">
                      {userRole === "admin" ? "Admin" : userRole || "Loading..."}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={goToDashboard}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/help")}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
