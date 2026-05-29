import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, BarChart3, Settings, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const items = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Progress", url: "/progress", icon: BarChart3 },
];

export function MobileNav() {
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

  const menuItems = [...items];
  if (isAdmin) {
    menuItems.push({ title: "Admin", url: "/admin", icon: Settings });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0F172A]/90 backdrop-blur-xl lg:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex items-center justify-around px-3 py-3">
        {menuItems.map((item) => {
          const isActive = currentPath === item.url || currentPath.startsWith(item.url + "/");
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1 text-xs font-extrabold transition-all duration-300 ${
                isActive ? "text-indigo-400 scale-105" : "text-white/40 hover:text-white/70"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" : ""}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}

        {/* Dedicated Night / Day Theme Mode Switch Button */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-1 rounded-xl px-4 py-1 text-xs font-extrabold text-white/40 hover:text-white/70 transition-all duration-300"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 text-indigo-400" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400 animate-spin-slow" />
          )}
          <span>{theme === "light" ? "Night" : "Day"}</span>
        </button>
      </div>
    </nav>
  );
}
