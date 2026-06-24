import { useEffect, useState } from "react";
import { Outlet, useNavigate, createFileRoute, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { Loader2, Sun, Moon } from "lucide-react";
import { AITutorChat } from "@/components/AITutorChat";
import { toast } from "sonner";

export const Route = createFileRoute("/__authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Track active navigation to update AI Chat context dynamically
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isLessonPage = currentPath.includes("/lesson/");
  const activeLessonId = isLessonPage
    ? currentPath
        .split("/")
        .find((part) =>
          part.match(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
          ),
        )
    : null;

  const [lessonContext, setLessonContext] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        navigate({ to: "/login" });
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });

    // Check saved theme on mount
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [navigate]);

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

  useEffect(() => {
    async function fetchLessonContext() {
      if (!activeLessonId) {
        setLessonContext(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("lessons")
          .select("subject, topic, lesson_content")
          .eq("id", activeLessonId)
          .single();
        if (!error && data) {
          setLessonContext(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchLessonContext();
  }, [activeLessonId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col pb-16 lg:pb-0">
        {/* Sticky Top Header with Day/Night Toggle at Top Right */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md px-6 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            <span className="font-heading text-lg font-black text-indigo-600 dark:text-indigo-400">
              {currentPath === "/dashboard"
                ? "My Dashboard 🎯"
                : currentPath.startsWith("/subjects")
                  ? "Learning Subjects 📚"
                  : currentPath.startsWith("/progress")
                    ? "My Progress Arena 🏆"
                    : currentPath.startsWith("/admin")
                      ? "Super Admin Center ⚙️"
                      : "Learning Quest 🚀"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* The Night Mode / Day Mode Toggle at the Top Right Side */}
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white shadow-sm transition-all duration-300 cursor-pointer"
              title={theme === "light" ? "Switch to Night Mode" : "Switch to Day Mode"}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-indigo-600" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400 animate-spin-slow" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Global Context-Aware AI Tutor Chatbot */}
      <AITutorChat
        subject={lessonContext?.subject}
        topic={lessonContext?.topic}
        lessonContent={lessonContext?.lesson_content}
      />
    </div>
  );
}
