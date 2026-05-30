import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Clock, TrendingUp, Award, Flame, Loader2, Sparkles, Star, ChevronRight, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const subjectColors: Record<string, string> = {
  Mathematics: "from-blue-400 to-indigo-500 shadow-blue-500/20 text-white",
  English: "from-orange-400 to-amber-500 shadow-amber-500/20 text-white",
  Science: "from-green-400 to-emerald-500 shadow-emerald-500/20 text-white",
  EVS: "from-teal-400 to-cyan-500 shadow-cyan-500/20 text-white",
  Hindi: "from-rose-400 to-pink-500 shadow-rose-500/20 text-white",
  Computer: "from-purple-400 to-fuchsia-500 shadow-fuchsia-500/20 text-white",
};

const subjectIcons: Record<string, React.ReactNode> = {
  Mathematics: <span className="text-2xl font-bold font-mono">123</span>,
  English: <BookOpen className="h-6 w-6" />,
  Science: <span className="text-2xl">🔬</span>,
  EVS: <span className="text-2xl">🌍</span>,
  Hindi: <span className="text-2xl font-bold">हि</span>,
  Computer: <span className="text-2xl">💻</span>,
};

// Child-friendly leaderboards
const initialLeaderboard = [
  { rank: 1, name: "Kiara Sharma", xp: 1250, badge: "👑" },
  { rank: 2, name: "Aarav Patel", xp: 980, badge: "⭐" },
  { rank: 3, name: "You", xp: 0, badge: "🔥" }, // Will be dynamically synced with student's actual XP
  { rank: 4, name: "Kabir Roy", xp: 620, badge: "⚡" },
  { rank: 5, name: "Diya Rao", xp: 480, badge: "🛡️" },
];

export const Route = createFileRoute("/__authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData?.user) return;

        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();
        if (profileErr) throw profileErr;
        setProfile(profileData);

        if (profileData) {
          const [subjectsRes, progressRes] = await Promise.all([
            supabase
              .from("subjects")
              .select("*")
              .eq("grade", profileData.grade)
              .order("subject_name"),
            supabase
              .from("student_progress")
              .select("*, lessons(id, topic, subject)")
              .eq("student_id", userData.user.id)
              .order("updated_at", { ascending: false }),
          ]);

          if (subjectsRes.error) throw subjectsRes.error;
          if (progressRes.error) throw progressRes.error;

          setSubjects(subjectsRes.data ?? []);
          setProgress(progressRes.data ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const completedCount = progress.filter((p: any) => p.completed).length;
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / progress.length)
    : 0;
  const totalTime = progress.reduce((sum: number, p: any) => sum + (p.time_spent_minutes || 0), 0);
  
  // XP Point Logic matching BYJU'S/Duolingo style
  const xpPoints = completedCount * 50 + avgScore * 2;
  const currentStreak = completedCount > 0 ? Math.min(completedCount + 1, 7) : 0; // Simulated active streak

  // Dynamic ranking logic
  const syncedLeaderboard = initialLeaderboard.map(student => {
    if (student.name === "You") {
      return { ...student, xp: xpPoints };
    }
    return student;
  }).sort((a, b) => b.xp - a.xp).map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-tr from-[#0F172A] via-[#1E1B4B] to-[#1E293B]">
      <div className="mx-auto max-w-6xl">
        {/* Welcome Glowing Header Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8 p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-black text-white uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> Grade {profile?.grade || 1} Champion
              </span>
              <h1 className="mt-3 font-heading text-3xl font-black text-white sm:text-4xl tracking-tight leading-tight">
                Hello, {profile?.name?.split(" ")[0] || "Student"}! 👋
              </h1>
              <p className="mt-2 text-white/80 font-semibold max-w-md">
                Ready to conquer your daily quests and raise your leaderboard rank?
              </p>
            </div>
            <Link to="/subjects" className="inline-flex shrink-0">
              <button className="bg-white hover:bg-indigo-50 text-indigo-600 font-black rounded-2xl px-6 py-3.5 shadow-lg transform hover:-translate-y-0.5 transition-all text-sm flex items-center gap-1">
                Start Learning Quest <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Primary Gamified Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-3 space-y-8">
            
            {/* Gamification Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              <StatCard icon={<Flame className="h-6 w-6" />} label="Daily Streak" value={`${currentStreak} Days`} color="bg-orange-500 shadow-orange-500/20" />
              <StatCard icon={<Star className="h-6 w-6" />} label="XP earned" value={String(xpPoints)} color="bg-indigo-500 shadow-indigo-500/20" />
              <StatCard icon={<BookOpen className="h-6 w-6" />} label="Quests Done" value={String(completedCount)} color="bg-purple-500 shadow-purple-500/20" />
              <StatCard icon={<Trophy className="h-6 w-6" />} label="Avg Score" value={`${avgScore}%`} color="bg-pink-500 shadow-pink-500/20" />
            </motion.div>

            {/* Subjects List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-black text-white tracking-tight">Active Subjects</h2>
                <Link to="/subjects" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">View all</Link>
              </div>

              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject: any, i: number) => {
                    const progressPercentage = Math.min((completedCount / (subjects.length || 1)) * 100, 100);
                    return (
                      <motion.div 
                        key={subject.id} 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ delay: 0.05 * i }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="group relative"
                      >
                        <Link to="/subject/$subjectId" params={{ subjectId: subject.subject_name }} className="block">
                          <div className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg relative overflow-hidden`}>
                            <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all duration-300" />
                            <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${subjectColors[subject.subject_name] || "from-muted to-muted"} shadow-md`}>
                              {subjectIcons[subject.subject_name] || <BookOpen className="h-5 w-5" />}
                            </div>
                            <h3 className="font-heading text-lg font-black text-white">{subject.subject_name}</h3>
                            <p className="text-xs text-white/50 font-bold uppercase tracking-wider mt-0.5">Grade {subject.grade}</p>
                            
                            <div className="mt-4">
                              <div className="flex justify-between text-xs font-black text-white/60 mb-1.5">
                                <span>Quest Progress</span>
                                <span>{Math.round(progressPercentage)}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="mb-4 font-heading text-xl font-black text-white tracking-tight">Recent Activity Log</h2>
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-xl space-y-3">
                {isLoading ? (
                  <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
                ) : progress.length === 0 ? (
                  <p className="py-6 text-center text-sm font-extrabold text-white/40">No quest activity yet. Start your first lesson!</p>
                ) : (
                  <div className="space-y-2.5">
                    {progress.slice(0, 4).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 p-4 transition-all hover:bg-white/10">
                        <div>
                          <p className="text-sm font-black text-white">{p.lessons?.topic || "Lesson"}</p>
                          <p className="text-xs font-bold text-white/50 mt-0.5">{p.lessons?.subject || "Subject"}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${p.completed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/60"}`}>
                              {p.completed ? "Complete" : "Ongoing"}
                            </span>
                            {p.score > 0 && <p className="mt-1 text-xs font-black text-indigo-400">{p.score}% Accuracy</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Gamified Leaderboard Side Panel (BYJU'S & Duolingo style) */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.25 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -left-12 -top-12 w-28 h-28 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full opacity-10 blur-xl" />
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400 animate-bounce" />
                <h2 className="font-heading text-lg font-black text-white tracking-tight">Arena Leaderboard</h2>
              </div>
              <div className="space-y-2.5">
                {syncedLeaderboard.map((student) => {
                  const isUser = student.name === "You";
                  return (
                    <div 
                      key={student.rank} 
                      className={`flex items-center justify-between rounded-2xl p-3.5 transition-all duration-300 border ${
                        isUser 
                          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/30 shadow-lg" 
                          : "bg-white/5 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-white/80 w-6 text-center">{student.rank}</span>
                        <span className="text-xl">{student.badge}</span>
                        <div>
                          <p className={`text-xs font-black ${isUser ? "text-indigo-400 font-black" : "text-white"}`}>
                            {isUser ? `${profile?.name?.split(" ")[0] || "You"} (You)` : student.name}
                          </p>
                          <p className="text-[10px] font-bold text-white/40">{student.xp} XP points</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-white/50">#{student.rank}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-lg flex items-center gap-3.5 transition-all hover:bg-white/10 duration-300">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color} text-white`}>
        {icon}
      </div>
      <div>
        <p className="font-heading text-xl font-black text-white leading-none">{value}</p>
        <p className="text-xxs font-extrabold text-white/40 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
}
