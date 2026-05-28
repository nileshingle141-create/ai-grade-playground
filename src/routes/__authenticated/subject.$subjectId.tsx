import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Loader2, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLessons } from "@/lib/lessons.functions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/__authenticated/subject/$subjectId")({
  component: SubjectPage,
});

function SubjectPage() {
  const { subjectId } = Route.useParams();
  const subject = decodeURIComponent(subjectId);
  const [grade, setGrade] = useState(1);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const g = data.user?.user_metadata?.grade || 1;
      setGrade(g);
    });
  }, []);

  const fetchLessons = useServerFn(getLessons);
  const { data, isLoading } = useQuery({
    queryKey: ["lessons", grade, subject],
    queryFn: () => fetchLessons({ data: { grade, subject } }),
    enabled: !!grade && !!subject,
  });

  const lessons = data?.lessons || [];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{subject}</h1>
          <p className="mt-1 text-muted-foreground">Grade {grade} • {lessons.length} lessons</p>
        </motion.div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="mt-6 space-y-3">
            {lessons.map((lesson: any, i: number) => (
              <motion.div key={lesson.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }} className="block">
                  <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-base font-bold text-foreground truncate">{lesson.topic}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration_minutes} min</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{lesson.subject}</span>
                      </div>
                    </div>
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
