import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Loader2, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/__authenticated/subjects")({
  component: SubjectsPage,
});

const subjectColors: Record<string, string> = {
  Mathematics: "from-blue-400 to-indigo-500 shadow-blue-500/20 text-white",
  English: "from-orange-400 to-amber-500 shadow-amber-500/20 text-white",
  Science: "from-green-400 to-emerald-500 shadow-emerald-500/20 text-white",
  EVS: "from-teal-400 to-cyan-500 shadow-cyan-500/20 text-white",
  Hindi: "from-rose-400 to-pink-500 shadow-rose-500/20 text-white",
  Computer: "from-purple-400 to-fuchsia-500 shadow-fuchsia-500/20 text-white",
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#0F172A] dark:via-[#1E1B4B] dark:to-[#1E293B] text-slate-800 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-5xl">
        
        {/* Immersive Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md shadow-md dark:shadow-none relative overflow-hidden"
        >
          <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Academy Hub</span>
          </div>
          <h1 className="font-heading text-3xl font-black text-slate-800 dark:text-white sm:text-4xl tracking-tight leading-tight">All Active Subjects</h1>
          <p className="mt-2 text-slate-500 dark:text-white/60 font-bold uppercase tracking-wider text-sm">Grade {grade} School Curriculum</p>
        </motion.div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s: any, i: number) => (
              <motion.div 
                key={s.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group"
              >
                <Link to="/subject/$subjectId" params={{ subjectId: s.subject_name }} className="block">
                  <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md p-6 shadow-md dark:shadow-none relative overflow-hidden transition-all duration-300">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full blur-xl group-hover:bg-slate-100 dark:group-hover:bg-white/10" />
                    
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold bg-gradient-to-br ${subjectColors[s.subject_name] || "from-muted to-muted"} shadow-md`}>
                      {subjectIcons[s.subject_name] || <BookOpen className="h-5 w-5" />}
                    </div>
                    
                    <h3 className="font-heading text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">{s.subject_name}</h3>
                    <p className="text-xs text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest mt-1">Grade {s.grade} Level</p>

                    <div className="mt-6 flex items-center justify-between text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300">
                      <span>Begin Lesson Quest</span>
                      <Sparkles className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
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
