import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, BarChart3, Settings } from "lucide-react";

const items = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Progress", url: "/dashboard", icon: BarChart3 },
  { title: "Admin", url: "/admin", icon: Settings },
];

export function MobileNav() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = currentPath === item.url || currentPath.startsWith(item.url + "/");
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
