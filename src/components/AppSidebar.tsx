import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  Sparkles,
  BarChart3,
  Sun,
  Moon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Progress", url: "/progress", icon: BarChart3 },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    async function checkRole() {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: roleData } = await supabase.rpc("has_role", {
          _user_id: userData.user.id,
          _role: "admin",
        });
        setIsAdmin(!!roleData);
      }
    }
    checkRole();

    // Check saved theme
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      toast.success("Night Mode activated! 🌙");
    } else {
      document.documentElement.classList.remove("dark");
      toast.success("Day Mode activated! ☀️");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  const menuItems = [...items];
  if (isAdmin) {
    menuItems.push({ title: "Admin Panel", url: "/admin", icon: Settings });
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-navy-sidebar text-sidebar-foreground border-r border-white/10 shadow-xl bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-heading text-lg font-extrabold text-white tracking-wide">AI Tutor Studio</span>
          <span className="block text-xs text-indigo-400 font-bold uppercase tracking-widest">Super School</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-6">
        <div>
          <div className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-white/40">Learning Path</div>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = currentPath === item.url || currentPath.startsWith(item.url + "/");
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-white/60 group-hover:text-white"}`} />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Theme and Logout Controls */}
      <div className="border-t border-white/5 px-4 py-4 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold text-white/50 transition-all duration-300 hover:bg-white/5 hover:text-white"
        >
          {theme === "light" ? (
            <>
              <Moon className="h-5 w-5 text-indigo-400" />
              <span>Night Mode</span>
            </>
          ) : (
            <>
              <Sun className="h-5 w-5 text-yellow-400 animate-spin-slow" />
              <span>Day Mode</span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold text-white/50 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
