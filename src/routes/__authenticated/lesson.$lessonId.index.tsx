import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Lightbulb,
  Sparkles,
  Download,
  Loader2,
  PenLine,
  Volume2,
  VolumeX,
  BookOpen,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/__authenticated/lesson/$lessonId/")({
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [worksheet, setWorksheet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<"story" | "content" | "revision">("content");

  useEffect(() => {
    async function loadLessonData() {
      if (!lessonId) return;
      try {
        setIsLoading(true);
        // Fetch lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", lessonId)
          .single();
        if (lessonError) throw lessonError;
        setLesson(lessonData);

        // Fetch user and check progress
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (userData.user) {
          const { data: existing } = await supabase
            .from("student_progress")
            .select("id, completed, score, time_spent_minutes")
            .eq("student_id", userData.user.id)
            .eq("lesson_id", lessonId)
            .maybeSingle();

          if (!existing) {
            await supabase.from("student_progress").insert({
              student_id: userData.user.id,
              lesson_id: lessonId,
              completed: false,
              score: 0,
              time_spent_minutes: 0,
            });
          }

          // Check if admin to load worksheet
          const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
            _user_id: userData.user.id,
            _role: "admin",
          });
          if (!roleError && isAdmin) {
            const { data: wsData } = await supabase
              .from("worksheets")
              .select("*")
              .eq("lesson_id", lessonId)
              .maybeSingle();
            setWorksheet(wsData);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLessonData();
  }, [lessonId]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function handleReadAloud() {
    if (!lesson) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.info("Reading stopped");
      return;
    }

    const textToRead =
      activeTab === "content"
        ? lesson.lesson_content
        : activeTab === "story"
          ? lesson.story
          : lesson.key_points?.join(". ") || "";

    if (!textToRead) {
      toast.warning("Nothing to read aloud");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95; // Child-friendly slow pace
    utterance.pitch = 1.1; // Cute clear pitch

    const voices = window.speechSynthesis.getVoices();
    const childVoice = voices.find(
      (v) => v.name.includes("Google US English") || v.name.includes("Natural"),
    );
    if (childVoice) utterance.voice = childVoice;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
    toast.success("AI Narrator started!");
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-linear-to-tr from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#0F172A] dark:via-[#1E1B4B] dark:to-[#1E293B] text-slate-800 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quest Board
        </Link>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-505 dark:text-indigo-400" />
          </div>
        ) : lesson ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Badge Card */}
            <div className="mb-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md p-6 shadow-md dark:shadow-none relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 bg-linear-to-br from-indigo-500 to-pink-500 rounded-full opacity-20 blur-2xl" />
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-full bg-linear-to-r from-indigo-500 to-purple-500 px-3.5 py-1.5 text-xs font-black text-white uppercase tracking-wider">
                  {lesson.subject}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/10 px-3.5 py-1.5 text-xs font-extrabold text-slate-700 dark:text-white/80">
                  <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />{" "}
                  {lesson.duration_minutes} min Quest
                </span>
              </div>
              <h1 className="font-heading text-3xl font-black text-slate-800 dark:text-white md:text-4xl tracking-tight leading-tight">
                {lesson.topic}
              </h1>
            </div>

            {/* Premium Tab Navigation */}
            <div className="mb-6 flex rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-1 backdrop-blur-md">
              <button
                onClick={() => {
                  setActiveTab("content");
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }}
                className={`flex-1 rounded-xl py-3 text-sm font-extrabold transition-all duration-300 ${activeTab === "content" ? "bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-lg" : "text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white"}`}
              >
                <BookOpen className="h-4 w-4 inline mr-1.5" /> Study Material
              </button>
              {lesson.story && (
                <button
                  onClick={() => {
                    setActiveTab("story");
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }}
                  className={`flex-1 rounded-xl py-3 text-sm font-extrabold transition-all duration-300 ${activeTab === "story" ? "bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-lg" : "text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white"}`}
                >
                  <Sparkles className="h-4 w-4 inline mr-1.5" /> Story Mode
                </button>
              )}
              {lesson.key_points && lesson.key_points.length > 0 && (
                <button
                  onClick={() => {
                    setActiveTab("revision");
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }}
                  className={`flex-1 rounded-xl py-3 text-sm font-extrabold transition-all duration-300 ${activeTab === "revision" ? "bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-lg" : "text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white"}`}
                >
                  <Lightbulb className="h-4 w-4 inline mr-1.5" /> Quick Revision
                </button>
              )}
            </div>

            {/* Tab Contents */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md p-6 sm:p-8 shadow-md dark:shadow-none relative"
              >
                {/* Floating TTS Narrator */}
                <button
                  onClick={handleReadAloud}
                  className={`absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 shadow-sm cursor-pointer ${
                    isSpeaking
                      ? "border-red-500/30 bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30"
                      : "border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30"
                  }`}
                  title={isSpeaking ? "Stop AI voice reader" : "Listen with AI voice reader"}
                >
                  {isSpeaking ? (
                    <VolumeX className="h-5 w-5 animate-pulse" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>

                {activeTab === "content" && (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line text-slate-700 dark:text-white/90 leading-relaxed text-base md:text-lg font-medium pr-10">
                      {lesson.lesson_content}
                    </p>
                  </div>
                )}

                {activeTab === "story" && (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                      <Sparkles className="h-3.5 w-3.5" /> Once upon a time...
                    </div>
                    <p className="whitespace-pre-line italic leading-relaxed text-indigo-900 dark:text-indigo-200 text-base md:text-lg font-semibold pr-10">
                      {lesson.story}
                    </p>
                  </div>
                )}

                {activeTab === "revision" && (
                  <div className="space-y-4">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 dark:bg-pink-500/20 border border-pink-200 dark:border-pink-500/30 px-3 py-1 text-xs font-bold text-pink-600 dark:text-pink-400">
                      <Lightbulb className="h-3.5 w-3.5" /> Key Revision Points
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {lesson.key_points.map((point: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 shadow-sm"
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-xs font-black text-white shadow-md">
                            {i + 1}
                          </span>
                          <p className="text-sm font-semibold text-slate-700 dark:text-white/90 leading-relaxed">
                            {point}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Smart AI Tutor Floating Banner */}
            <div className="mt-6 rounded-3xl border border-indigo-200 dark:border-indigo-500/20 bg-linear-to-r from-indigo-50 dark:from-indigo-900/30 via-purple-50 dark:via-purple-900/20 to-pink-50 dark:to-pink-900/20 backdrop-blur-md p-5 flex items-center justify-between shadow-md dark:shadow-none">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-bounce">🤖</span>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Have a doubt or need examples?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-white/60">
                    Ask my AI Tutor chatbot in the bottom right corner!
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            {/* Actions Grid */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/lesson/$lessonId/quiz" params={{ lessonId }} className="flex-1">
                <Button className="w-full rounded-2xl py-6 text-base font-extrabold bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/20 transform hover:-translate-y-0.5 transition-all cursor-pointer">
                  <PenLine className="mr-2 h-5 w-5 animate-pulse" /> Let's Take the Quiz!
                </Button>
              </Link>

              {worksheet && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl py-6 text-base font-extrabold border-slate-300 dark:border-white/20 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white shadow-sm transition-all cursor-pointer"
                  onClick={() => {
                    const blob = new Blob([worksheet.worksheet_content], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${lesson.topic}-worksheet.txt`;
                    a.click();
                    toast.success("Worksheet downloaded!");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Practice Sheet
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
            <HelpCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-white/30 mb-3" />
            <p className="text-lg text-slate-600 dark:text-white/70 font-bold">
              Quest page was not found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
