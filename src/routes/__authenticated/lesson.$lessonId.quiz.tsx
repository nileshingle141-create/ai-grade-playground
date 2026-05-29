import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/__authenticated/lesson/$lessonId/quiz")({
  component: QuizPage,
});

type Quiz = { id: string; question: string; option_a: string; option_b: string; option_c: string; option_d: string };
type QuizResult = { id: string; correctAnswer: string; userAnswer: string | null; isCorrect: boolean };

function QuizPage() {
  const { lessonId } = Route.useParams();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState([]);
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
    if (submitted || isLoading) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, [submitted, isLoading]);
    return () => clearInterval(timer);
  }, [submitted, isLoading]);

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