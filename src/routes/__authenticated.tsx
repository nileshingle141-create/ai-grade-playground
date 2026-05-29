import { useEffect, useState } from "react";
import { Outlet, useNavigate, createFileRoute, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { Loader2 } from "lucide-react";
import { AITutorChat } from "@/components/AITutorChat";

export const Route = createFileRoute("/__authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Track active navigation to update AI Chat context dynamically
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isLessonPage = currentPath.includes("/lesson/");
  const activeLessonId = isLessonPage ? currentPath.split("/").find(part => part.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) : null;

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
  }, [navigate]);

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
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col pb-16 lg:pb-0">
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
