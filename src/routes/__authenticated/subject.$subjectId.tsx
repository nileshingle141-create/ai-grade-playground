import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Loader2, Play, Search, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/__authenticated/subject/$subjectId")({
  component: SubjectPage,
});

function SubjectPage() {
  const { subjectId } = Route.useParams();
  const subject = decodeURIComponent(subjectId);
  const [grade, setGrade] = useState(1);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const filteredLessons = searchQuery
    ? lessons.filter((l) => l.topic?.toLowerCase().includes(searchQuery.toLowerCase()))
    : lessons;

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(inputValue.trim());
      setSelectedIndex(0);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [inputValue]);

  useEffect(() => {
    async function loadLessons() {
      try {
        setIsLoading(true);
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        let userGrade = 1;
        if (userData?.user) {
          const { data: profileData, error: profileErr } = await supabase
            .from("profiles")
            .select("grade")
            .eq("id", userData.user.id)
            .single();
          if (!profileErr && profileData) {
            userGrade = profileData.grade || 1;
          }
        }
        setGrade(userGrade);

        if (subject) {
          const { data: lessonsData, error: lessonsErr } = await supabase
            .from("lessons")
            .select("*")
            .eq("grade", userGrade)
            .eq("subject", subject)
            .order("created_at");
          if (lessonsErr) throw lessonsErr;
          setLessons(lessonsData ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLessons();
  }, [subject]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredLessons.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredLessons.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredLessons[selectedIndex];
      if (selected) {
        navigate({ to: "/lesson/$lessonId", params: { lessonId: selected.id } });
      }
    } else if (e.key === "Escape") {
      setInputValue("");
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#0F172A] dark:via-[#1E1B4B] dark:to-[#1E293B] text-slate-800 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        {/* Dynamic Subject Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md shadow-md dark:shadow-none relative overflow-hidden"
        >
          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
              Subject Hub
            </span>
          </div>
          <h1 className="font-heading text-3xl font-black text-slate-800 dark:text-white sm:text-4xl tracking-tight leading-tight">
            {subject}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-white/60 font-bold uppercase tracking-wider text-sm">
            Grade {grade} • {lessons.length} Learning Quests
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 relative"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 dark:text-white/40" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search lessons by topic..."
            aria-label="Search lessons"
            aria-autocomplete="list"
            className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md py-3 pl-10 pr-10 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
          {inputValue && (
            <button
              onClick={() => setInputValue("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : lessons.length === 0 ? (
          // Friendly fallback when this subject has no lessons for the student's grade
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md p-10 text-center shadow-md"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <h2 className="font-heading text-xl font-black text-slate-800 dark:text-white">
              No lessons here yet
            </h2>
            <p className="mt-2 max-w-sm text-sm font-bold text-slate-500 dark:text-white/60">
              We couldn't find any "{subject}" quests for Grade {grade}. Try another subject from
              your dashboard!
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/subjects"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-5 py-3 text-sm font-black text-white shadow-md hover:scale-105 transition-transform"
              >
                Browse all subjects
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-black text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              >
                Back to dashboard
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredLessons.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Search className="h-10 w-10 text-slate-300 dark:text-white/20 mb-3" />
                <p className="text-sm font-bold text-slate-500 dark:text-white/50">
                  No lessons match "{searchQuery}"
                </p>
                <button
                  onClick={() => setInputValue("")}
                  className="mt-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Clear search
                </button>
              </motion.div>
            )}
            {filteredLessons.map((lesson: any, i: number) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="group"
              >
                <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }} className="block">
                  <div
                    className={`flex items-center gap-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md p-5 shadow-sm dark:shadow-none transition-all duration-300 hover:bg-slate-50 dark:hover:bg-white/10 ${i === selectedIndex ? "ring-2 ring-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10" : ""}`}
                  >
                    {/* Play Bubble Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <Play className="h-5 w-5 fill-white text-white translate-x-0.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-base md:text-lg font-black text-slate-800 dark:text-white truncate leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {lesson.topic}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-white/50">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />{" "}
                          {lesson.duration_minutes} min quest
                        </span>
                        <span className="rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-300 tracking-wider">
                          {lesson.subject}
                        </span>
                      </div>
                    </div>

                    <BookOpen className="h-5 w-5 text-slate-400 dark:text-white/40 group-hover:text-slate-700 dark:hover:text-white transition-colors shrink-0" />
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
