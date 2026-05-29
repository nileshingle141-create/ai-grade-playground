import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/__authenticated/lesson/$lessonId/quiz")({
  component: QuizPage,
});

type Quiz = { id: string; question: string; option_a: string; option_b: string; option_c: string; option_d: string };
type QuizResult = { id: string; correctAnswer: string; userAnswer: string | null; isCorrect: boolean };

function QuizPage() {
  const { lessonId } = Route.useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (!lessonId) return;
    setIsLoading(true);
    supabase
      .from("quizzes")
      .select("id, lesson_id, question, option_a, option_b, option_c, option_d")
      .eq("lesson_id", lessonId)
      .then(({ data, error }) => {
        if (error) setFetchError(error.message);
        else setQuizzes(data ?? []);
        setIsLoading(false);
      });
  }, [lessonId]);

  useEffect(() => {
    if (submitted || isLoading) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return t - 1;
      });
    }, [submitted, isLoading]);
    return () => clearInterval(timer);
  }, [submitted, isLoading]);

  const currentQuiz = quizzes[currentQ];
  const total = quizzes.length;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  function handleSelect(opt: string) {
    if (submitted || !currentQuiz) return;
    setSelected(opt);
    setAnswers((prev) => ({ ...prev, [currentQuiz.id]: opt }));
  }

  async function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);
    const timeSpent = Math.round((Date.now() - startTime) / 60000);
    try {
      const { data: correctData } = await supabase
        .from("quizzes")
        .select("id, correct_answer")
        .eq("lesson_id", lessonId);

      const res = (correctData ?? []).map((q) => ({
        id: q.id,
        correctAnswer: q.correct_answer,
        userAnswer: answers[q.id] ?? null,
        isCorrect: answers[q.id] === q.correct_answer,
      }));

      const correct = res.filter((r) => r.isCorrect).length;
      const tot = res.length;
      const sc = tot > 0 ? Math.round((correct / tot) * 100) : 0;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("student_progress").upsert({
          student_id: user.id,
          lesson_id: lessonId,
          completed: true,
          score: sc,
          time_spent_minutes: timeSpent,
          updated_at: new Date().toISOString(),
        }, { onConflict: "student_id,lesson_id" });
      }
      setResults(res);
      setScore(sc);
      setCorrectCount(correct);
      toast.success(`Quiz completed! Score: ${sc}%`);
    } catch (e: any) {
      toast.error("Failed to submit: " + e.message);
    }
  }

  if (isLoading) return (
    
      
    
  );

  if (fetchError) return (
    
      Error loading quiz: {fetchError}
      Back to Dashboard
    
  );

  if (total === 0) return (
    
      No quiz questions found for this lesson.
      Back to Dashboard
    
  );

  return (
    
      
        
           Back to Lesson
        
        
          Quiz
          
             {formatTime(timeLeft)}
          
        
        
          {quizzes.map((_: any, i: number) => (
            
          ))}
        
        {!submitted ? (
          
            
              Question {currentQ + 1} of {total}
              {currentQuiz?.question}
              
                {[
                  { key: "A", text: currentQuiz?.option_a },
                  { key: "B", text: currentQuiz?.option_b },
                  { key: "C", text: currentQuiz?.option_c },
                  { key: "D", text: currentQuiz?.option_d },
                ].map((opt) => (
                   handleSelect(opt.key)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${selected === opt.key ? "border-primary bg-primary/10" : "border-border bg-muted/50 hover:bg-muted"}`}>
                    
                      {opt.key}
                    
                    {opt.text}
                  
                ))}
              
            
            
               { setCurrentQ((q) => q - 1); setSelected(answers[quizzes[currentQ - 1]?.id] || null); }}
                className="rounded-xl font-bold">Previous
              {currentQ < total - 1 ? (
                 { setCurrentQ((q) => q + 1); setSelected(answers[quizzes[currentQ + 1]?.id] || null); }}
                  className="rounded-xl font-bold">Next
              ) : (
                
                  Submit Quiz
              )}
            
          
        ) : (
          
            
              
                
              
              Quiz Complete!
              You scored
              {score}%
              {correctCount} out of {total} correct
              
                
                  Review Lesson
                
                
                  Back to Dashboard
                
              
              
                {results.map((r, i) => {
                  const q = quizzes.find((qq) => qq.id === r.id);
                  return (
                    
                      
                        {r.isCorrect ?  : }
                        
                          {i + 1}. {q?.question}
                          Your answer: {r.userAnswer || "-"} • Correct: {r.correctAnswer}
                        
                      
                    
                  );
                })}
              
            
          
        )}
      
    
  );
}