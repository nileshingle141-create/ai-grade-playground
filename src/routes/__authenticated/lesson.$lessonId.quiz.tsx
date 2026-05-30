import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, Loader2, Award, Sparkles, HelpCircle } from "lucide-react";
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  
  // Instant grading state: locks selection and displays explanation
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState(false);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState<QuizResult[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [confetti, setConfetti] = useState<any[]>([]);

  const submittedRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});

  useEffect(() => {
    async function loadQuizzes() {
      if (!lessonId) return;
      try {
        setIsLoading(true);
        setFetchError(null);
        const { data: quizData, error } = await supabase
          .from("quizzes")
          .select("id, lesson_id, question, option_a, option_b, option_c, option_d, correct_answer")
          .eq("lesson_id", lessonId);
        if (error) throw error;
        setQuizzes(quizData ?? []);
      } catch (err: any) {
        console.error(err);
        setFetchError(err.message || "Failed to load quizzes");
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
    if (submittedRef.current || isChecked || !currentQuiz) return;
    setSelected(opt);
  }

  function handleCheckAnswer() {
    if (!selected || !currentQuiz || isChecked) return;
    
    const correct = currentQuiz.correct_answer === selected;
    setIsCorrectFeedback(correct);
    setIsChecked(true);
    
    // Save answer
    answersRef.current = { ...answersRef.current, [currentQuiz.id]: selected };
    setAnswers({ ...answersRef.current });

    if (correct) {
      toast.success("Awesome job! Correct answer! 🎉");
    } else {
      toast.error(`Not quite! The correct answer was: ${currentQuiz.correct_answer}`);
    }
  }

  function handleNextQuestion() {
    setIsChecked(false);
    setSelected(null);
    if (currentQ < total - 1) {
      setCurrentQ(q => q + 1);
    } else {
      handleSubmit();
    }
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
      const totalCount = list.length;
      const scoreValue = totalCount > 0 ? Math.round((correct / totalCount) * 100) : 0;

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

      // Trigger gamified confetti explosion
      if (scoreValue >= 80) {
        triggerConfetti();
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit quiz");
    }
  }

  function triggerConfetti() {
    const list: any[] = [];
    for (let i = 0; i < 80; i++) {
      list.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 40 - 20,
        color: ["#818CF8", "#A78BFA", "#F472B6", "#F59E0B", "#10B981"][Math.floor(Math.random() * 5)],
        size: Math.random() * 12 + 6,
        delay: Math.random() * 1.5,
      });
    }
    setConfetti(list);
  }

  // Kid-friendly explanations generator
  function getKidExplanation(quiz: any) {
    if (!quiz) return "";
    const correctLetter = quiz.correct_answer;
    let correctText = "";
    if (correctLetter === "A") correctText = quiz.option_a;
    else if (correctLetter === "B") correctText = quiz.option_b;
    else if (correctLetter === "C") correctText = quiz.option_c;
    else if (correctLetter === "D") correctText = quiz.option_d;

    return `Because "${correctText}" is the perfect description. Keep it up! 🚀`;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-[#0F172A] via-[#1E1B4B] to-[#1E293B]">
        <XCircle className="mx-auto h-16 w-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">Error Loading Quiz</h2>
        <p className="text-white/60 mb-6 max-w-md">{fetchError}</p>
        <Link to="/dashboard">
          <Button className="rounded-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 cursor-pointer">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-[#0F172A] via-[#1E1B4B] to-[#1E293B]">
        <HelpCircle className="mx-auto h-16 w-16 text-indigo-400 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-white mb-2">No Quiz Questions Found</h2>
        <p className="text-white/60 mb-6 max-w-md">There are no quiz questions seeded for this lesson in the database yet.</p>
        <Link to="/dashboard">
          <Button className="rounded-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 cursor-pointer">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-tr from-[#0F172A] via-[#1E1B4B] to-[#1E293B] relative overflow-hidden">
      
      {/* Confetti Elements */}
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="absolute rounded-md pointer-events-none"
          initial={{ top: "-10%", left: `${c.x}%` }}
          animate={{ top: "110%", rotate: 360 }}
          transition={{ duration: 3.5, delay: c.delay, ease: "linear", repeat: Infinity }}
          style={{
            backgroundColor: c.color,
            width: c.size,
            height: c.size,
            zIndex: 99,
          }}
        />
      ))}

      <div className="mx-auto max-w-2xl">
        <Link to="/lesson/$lessonId" params={{ lessonId }} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-white/50 hover:text-white transition-all">
          <ArrowLeft className="h-4 w-4" /> Back to Lesson
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-black text-white tracking-tight">Daily Quest Quiz</h1>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-black text-indigo-300">
            <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-3 flex-1 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${((currentQ) / (total || 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-black text-white/60">{currentQ} / {total} Done</span>
        </div>

        {!submitted ? (
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden">
              <p className="mb-1 text-xs font-bold text-indigo-400 uppercase tracking-widest">Question {currentQ + 1} of {total}</p>
              <h2 className="mb-6 font-heading text-lg md:text-xl font-black text-white leading-relaxed">{currentQuiz?.question}</h2>
              
              <div className="space-y-2.5">
                {[
                  { key: "A", text: currentQuiz?.option_a },
                  { key: "B", text: currentQuiz?.option_b },
                  { key: "C", text: currentQuiz?.option_c },
                  { key: "D", text: currentQuiz?.option_d },
                ].map((opt) => {
                  const isSelected = selected === opt.key;
                  const isCorrectAnswer = currentQuiz.correct_answer === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelect(opt.key)}
                      disabled={isChecked}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                        isChecked 
                          ? isCorrectAnswer 
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                            : isSelected
                              ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
                              : "border-white/5 bg-white/5 opacity-50"
                          : isSelected
                            ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all ${
                        isChecked
                          ? isCorrectAnswer
                            ? "bg-emerald-500 text-white"
                            : isSelected
                              ? "bg-rose-500 text-white"
                              : "bg-white/10 text-white/30"
                          : isSelected
                            ? "bg-indigo-500 text-white"
                            : "bg-white/10 text-white/60"
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-sm font-bold text-white">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanations Segment shown instantly after checking */}
              <AnimatePresence>
                {isChecked && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 rounded-2xl p-4 border ${
                      isCorrectFeedback 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isCorrectFeedback ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-wider">{isCorrectFeedback ? "Excellent Job! 🎉" : "Not Quite! 💡"}</h4>
                        <p className="text-xs text-white/70 font-semibold mt-1 leading-relaxed">
                          {isCorrectFeedback ? "You nailed it!" : `The correct option was ${currentQuiz.correct_answer}.`} {getKidExplanation(currentQuiz)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                disabled={currentQ === 0 || isChecked} 
                onClick={() => { const prev = quizzes[currentQ - 1]; setCurrentQ((q) => q - 1); setSelected(prev ? answersRef.current[prev.id] || null : null); }} 
                className="rounded-2xl font-black text-white/80 border-white/20 hover:bg-white/5"
              >
                Previous
              </Button>

              {!isChecked ? (
                <Button 
                  onClick={handleCheckAnswer} 
                  disabled={!selected}
                  className="rounded-2xl font-black bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg px-6"
                >
                  Check Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion} 
                  className="rounded-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg px-6"
                >
                  {currentQ < total - 1 ? "Continue" : "Submit Quest"}
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 shadow-lg animate-bounce">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="font-heading text-3xl font-black text-white">Quest Finished!</h2>
              <p className="mt-2 text-white/60 font-semibold text-base">You achieved a score of</p>
              <p className="font-heading text-6xl font-black text-indigo-400 mt-2 bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">{score}%</p>
              
              <div className="mt-4 flex items-center justify-center gap-1.5 bg-white/5 border border-white/5 rounded-2xl py-3 px-6 max-w-xs mx-auto">
                <Award className="h-5 w-5 text-yellow-400" />
                <span className="text-sm font-black text-white">{correctCount} of {total} correct answers</span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/lesson/$lessonId" params={{ lessonId }} className="inline-flex">
                  <Button variant="outline" className="rounded-2xl font-black border-white/20 bg-white/5 hover:bg-white/10 text-white px-6">Review Lesson</Button>
                </Link>
                <Link to="/dashboard" className="inline-flex">
                  <Button className="rounded-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 shadow-lg shadow-indigo-500/20">Back to Dashboard</Button>
                </Link>
              </div>

              {/* Performance Analytical Breakdown */}
              <div className="mt-8 space-y-3 text-left border-t border-white/10 pt-6">
                <h3 className="text-sm font-black text-white/70 uppercase tracking-widest mb-3">Quest Recap</h3>
                {results.map((r, i) => {
                  const q = quizzes.find((qq: any) => qq.id === r.id);
                  return (
                    <div key={r.id} className={`rounded-2xl border p-4 ${r.isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
                      <div className="flex items-start gap-2.5">
                        {r.isCorrect ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 text-rose-400 shrink-0" />}
                        <div>
                          <p className="text-sm font-bold text-white/95 leading-relaxed">{i + 1}. {q?.question}</p>
                          <p className="text-xs text-white/50 font-bold mt-1">Your answer: {r.userAnswer || "-"} • Correct: {r.correctAnswer}</p>
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