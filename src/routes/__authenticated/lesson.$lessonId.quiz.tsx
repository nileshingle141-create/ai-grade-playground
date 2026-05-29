import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/__authenticated/lesson/$lessonId/quiz")({
  component: QuizPage,
});

type QuizResult = { id: string; correctAnswer: string; userAnswer: string | null; isCorrect: boolean };

function QuizPage() {
  const { lessonId } = Route.useParams();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState<QuizResult[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const submittedRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});

  useEffect(() => {
    async function loadQuizzes() {
      if (!lessonId) return;
      try {
        setIsLoading(true);
        const { data: quizData, error } = await supabase
          .from("quizzes")
          .select("id, lesson_id, question, option_a, option_b, option_c, option_d")
          .eq("lesson_id", lessonId);
        if (error) throw error;
        setQuizzes(quizData ?? []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load quizzes");
      } finally {
        setIsLoading(false);
      }
    }
    loadQuizzes();
  }, [lessonId]);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const currentQuiz = quizzes[currentQ];
  const total = quizzes.length;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  function handleSelect(opt: string) {
    if (submittedRef.current || !currentQuiz) return;
    setSelected(opt);
    answersRef.current = { ...answersRef.current, [currentQuiz.id]: opt };
    setAnswers({ ...answersRef.current });
  }

  async function handleSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    const timeSpent = Math.round((Date.now() - startTime) / 60000);
    try {
      const { data: quizAnswers, error: quizError } = await supabase
        .from("quizzes")
        .select("id, correct_answer")
        .eq("lesson_id", lessonId);
      if (quizError) throw quizError;

      const list = quizAnswers ?? [];
      const resultsData = list.map((q) => ({
        id: q.id,
        correctAnswer: q.correct_answer,
        userAnswer: answersRef.current[q.id] ?? null,
        isCorrect: answersRef.current[q.id] === q.correct_answer,
      }));
      const correct = resultsData.filter((r) => r.isCorrect).length;
      const total = list.length;
      const scoreValue = total > 0 ? Math.round((correct / total) * 100) : 0;

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error("No user found");

      const { error: progErr } = await supabase
        .from("student_progress")
        .upsert({
          student_id: userData.user.id,
          lesson_id: lessonId,
          completed: true,
          score: scoreValue,
          time_spent_minutes: timeSpent,
        }, { onConflict: "student_id,lesson_id" });

      if (progErr) throw progErr;

      setResults(resultsData);
      setScore(scoreValue);
      setCorrectCount(correct);
      toast.success(`Quiz completed! Score: ${scoreValue}%`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit quiz");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <Link to="/lesson/$lessonId" params={{ lessonId }} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Lesson
        </Link>

        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-foreground">Quiz</h1>
          <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-bold text-muted-foreground">
            <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
          </span>
        </div>

        <div className="mb-6 flex gap-1.5">
          {quizzes.map((_: any, i: number) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${
              i < currentQ ? "bg-primary" : i === currentQ ? "bg-accent" : "bg-muted"
            }`} />
          ))}
        </div>

        {!submitted ? (
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-1 text-sm text-muted-foreground">Question {currentQ + 1} of {total}</p>
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">{currentQuiz?.question}</h2>
              <div className="space-y-2">
                {[
                  { key: "A", text: currentQuiz?.option_a },
                  { key: "B", text: currentQuiz?.option_b },
                  { key: "C", text: currentQuiz?.option_c },
                  { key: "D", text: currentQuiz?.option_d },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleSelect(opt.key)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      selected === opt.key
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      selected === opt.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {opt.key}
                    </span>
                    <span className="text-sm font-medium text-foreground">{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <Button variant="outline" disabled={currentQ === 0} onClick={() => { const prev = quizzes[currentQ - 1]; setCurrentQ((q) => q - 1); setSelected(prev ? answersRef.current[prev.id] || null : null); }} className="rounded-xl font-bold">
                Previous
              </Button>
              {currentQ < total - 1 ? (
                <Button onClick={() => { const next = quizzes[currentQ + 1]; setCurrentQ((q) => q + 1); setSelected(next ? answersRef.current[next.id] || null : null); }} className="rounded-xl font-bold">
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="rounded-xl font-bold bg-accent text-accent-foreground hover:bg-accent/90">
                  Submit Quiz
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">Quiz Complete!</h2>
              <p className="mt-2 text-lg text-muted-foreground">You scored</p>
              <p className="font-heading text-5xl font-extrabold text-primary">{score}%</p>
              <p className="mt-2 text-sm text-muted-foreground">{correctCount} out of {total} correct</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/lesson/$lessonId" params={{ lessonId }} className="inline-flex">
                  <Button variant="outline" className="rounded-xl font-bold">Review Lesson</Button>
                </Link>
                <Link to="/dashboard" className="inline-flex">
                  <Button className="rounded-xl font-bold">Back to Dashboard</Button>
                </Link>
              </div>

              <div className="mt-8 space-y-3 text-left">
                {results.map((r, i) => {
                  const q = quizzes.find((qq: any) => qq.id === r.id);
                  return (
                    <div key={r.id} className={`rounded-xl border p-3 ${r.isCorrect ? "border-science/30 bg-science/5" : "border-destructive/30 bg-destructive/5"}`}>
                      <div className="flex items-start gap-2">
                        {r.isCorrect ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-science" /> : <XCircle className="mt-0.5 h-4 w-4 text-destructive" />}
                        <div>
                          <p className="text-sm font-bold text-foreground">{i + 1}. {q?.question}</p>
                          <p className="text-xs text-muted-foreground">Your answer: {r.userAnswer || "-"} • Correct: {r.correctAnswer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
