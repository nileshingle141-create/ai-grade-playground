import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Clock, TrendingUp, Award, Flame, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, getSubjects, getStudentProgress } from "@/lib/lessons.functions";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

const subjectColors: Record<string, string> = {
  Mathematics: "bg-math text-white",
  English: "bg-english text-white",
  Science: "bg-science text-white",
  EVS: "bg-evs text-white",
  Hindi: "bg-hindi text-white",
  Computer: "bg-computer text-white",
};

const subjectIcons: Record<string, React.ReactNode> = {
  Mathematics: <span className="text-xl">123</span>,
  English: <BookOpen className="h-5 w-5" />,
  Science: <span className="text-xl">🔬</span>,
  EVS: <span className="text-xl">🌍</span>,
  Hindi: <span className="text-xl">हि</span>,
  Computer: <span className="text-xl">💻</span>,
};

export const Route = createFileRoute("/__authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const fetchProfile = useServerFn(getProfile);
  const fetchSubjects = useServerFn(getSubjects);
  const fetchProgress = useServerFn(getStudentProgress);

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile({ data: undefined }),
    enabled: !!user,
  });

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects", profileData?.profile?.grade],
    queryFn: () => fetchSubjects({ data: { grade: profileData?.profile?.grade || 1 } }),
    enabled: !!profileData?.profile?.grade,
  });

  const { data: progressData } = useQuery({
    queryKey: ["progress"],
    queryFn: () => fetchProgress({ data: undefined }),
    enabled: !!user,
  });

  const profile = profileData?.profile;
  const subjects = subjectsData?.subjects || [];
  const progress = progressData?.progress || [];

  const completedCount = progress.filter((p: any) => p.completed).length;
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / progress.length)
    : 0;
  const totalTime = progress.reduce((sum: number, p: any) => sum + (p.time_spent_minutes || 0), 0);
  const xpPoints = completedCount * 50 + avgScore * 2;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Hello, {profile?.name?.split(" ")[0] || "Student"}! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Grade {profile?.grade || 1} • Ready to learn something new today?
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Lessons Done" value={String(completedCount)} color="bg-primary" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Avg Score" value={`${avgScore}%`} color="bg-science" />
          <StatCard icon={<Clock className="h-5 w-5" />} label="Time Spent" value={`${totalTime}m`} color="bg-english" />
          <StatCard icon={<Award className="h-5 w-5" />} label="XP Points" value={String(xpPoints)} color="bg-evs" />
        </motion.div>

        {/* Streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-foreground">{completedCount > 0 ? "Keep it up!" : "Start your streak!"}</p>
            <p className="text-xs text-muted-foreground">{completedCount} lessons completed</p>
          </div>
        </motion.div>

        {/* Subjects */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Your Subjects</h2>
          {subjectsLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject: any, i: number) => (
                <motion.div key={subject.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                  <Link to="/subject/$subjectId" params={{ subjectId: subject.subject_name }} className="block">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${subjectColors[subject.subject_name] || "bg-muted"}`}>
                        {subjectIcons[subject.subject_name] || <BookOpen className="h-5 w-5" />}
                      </div>
                      <h3 className="font-heading text-lg font-bold text-foreground">{subject.subject_name}</h3>
                      <p className="text-sm text-muted-foreground">Grade {subject.grade}</p>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((completedCount / 8) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Recent Activity</h2>
          <div className="rounded-2xl border border-border bg-card p-4">
            {progress.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No activity yet. Start learning!</p>
            ) : (
              <div className="space-y-3">
                {progress.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{p.lessons?.topic || "Lesson"}</p>
                      <p className="text-xs text-muted-foreground">{p.lessons?.subject || ""}</p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.completed ? "bg-science/20 text-science" : "bg-muted text-muted-foreground"}`}>
                        {p.completed ? "Done" : "In Progress"}
                      </span>
                      {p.score > 0 && <p className="mt-1 text-xs font-bold text-primary">{p.score}%</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${color} text-white`}>
        {icon}
      </div>
      <p className="font-heading text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
