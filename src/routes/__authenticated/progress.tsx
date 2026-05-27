import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, BookOpen, Clock, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStudentProgress } from "@/lib/lessons.functions";

export const Route = createFileRoute("/__authenticated/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const fetchProgress = useServerFn(getStudentProgress);
  const { data, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: () => fetchProgress({ data: undefined }),
  });

  const progress = data?.progress || [];
  const completed = progress.filter((p: any) => p.completed).length;
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((s: number, p: any) => s + (p.score || 0), 0) / progress.length)
    : 0;
  const totalTime = progress.reduce((s: number, p: any) => s + (p.time_spent_minutes || 0), 0);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Your Progress</h1>
          <p className="mt-1 text-muted-foreground">Track your learning journey</p>
        </motion.div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat icon={<BookOpen className="h-5 w-5" />} label="Completed" value={String(completed)} color="bg-primary" />
          <Stat icon={<TrendingUp className="h-5 w-5" />} label="Avg Score" value={`${avgScore}%`} color="bg-science" />
          <Stat icon={<Clock className="h-5 w-5" />} label="Minutes" value={String(totalTime)} color="bg-english" />
        </div>

        <h2 className="mb-3 font-heading text-lg font-bold text-foreground">All Activity</h2>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : progress.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Award className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No activity yet. Start a lesson to track your progress!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {progress.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div>
                  <p className="font-bold text-foreground">{p.lessons?.topic || "Lesson"}</p>
                  <p className="text-xs text-muted-foreground">{p.lessons?.subject || ""} • {p.time_spent_minutes || 0} min</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.completed ? "bg-science/20 text-science" : "bg-muted text-muted-foreground"}`}>
                    {p.completed ? "Completed" : "In Progress"}
                  </span>
                  {p.score > 0 && <p className="mt-1 text-sm font-bold text-primary">{p.score}%</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${color} text-white`}>{icon}</div>
      <p className="font-heading text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
