import { Link, useRouterState } from "@tanstack/react-router";
import { useSidebar } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  Sparkles,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Progress", url: "/progress", icon: BarChart3 },
  { title: "Admin", url: "/admin", icon: Settings },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-navy-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <span className="font-heading text-lg font-bold text-white">AI Teaching</span>
          <span className="block text-xs text-white/60">Studio</span>
        </div>
      </div>

      <div className="flex-1 px-3 py-4">
        <div className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-white/40">Menu</div>
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = currentPath === item.url || currentPath.startsWith(item.url + "/");
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
