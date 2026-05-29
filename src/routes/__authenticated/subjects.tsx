import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/__authenticated/subjects")({
  component: SubjectsPage,
});

const subjectColors: Record<string, string> = {
  Mathematics: "bg-math text-white",
  English: "bg-english text-white",
  Science: "bg-science text-white",
  EVS: "bg-evs text-white",
  Hindi: "bg-hindi text-white",
  Computer: "bg-computer text-white",
};

const subjectIcons: Record<string, string> = {
  Mathematics: "123",
  English: "📖",
  Science: "🔬",
  EVS: "🌍",
  Hindi: "हि",
  Computer: "💻",
};

function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grade, setGrade] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSubjectsData() {
      try {
        setIsLoading(true);
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (userData?.user) {
          const { data: profileData, error: profileErr } = await supabase
            .from("profiles")
            .select("grade")
            .eq("id", userData.user.id)
            .single();
          if (profileErr) throw profileErr;

          const userGrade = profileData?.grade || 1;
          setGrade(userGrade);

          const { data: subjectsData, error: subjectsErr } = await supabase
            .from("subjects")
            .select("*")
            .eq("grade", userGrade)
            .order("subject_name");
          if (subjectsErr) throw subjectsErr;

          setSubjects(subjectsData ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSubjectsData();
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">All Subjects</h1>
          <p className="mt-1 text-muted-foreground">Grade {grade} • Pick a subject to start learning</p>
        </motion.div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s: any, i: number) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to="/subject/$subjectId" params={{ subjectId: s.subject_name }} className="block">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl text-lg ${subjectColors[s.subject_name] || "bg-muted"}`}>
                      {subjectIcons[s.subject_name] || <BookOpen className="h-5 w-5" />}
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{s.subject_name}</h3>
                    <p className="text-sm text-muted-foreground">Grade {s.grade}</p>
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
