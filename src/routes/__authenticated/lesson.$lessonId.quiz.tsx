import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, Loader2, Award, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getQuizzesWithAnswersServer, seedQuizzesServer } from "@/lib/lessons.functions";

export const Route = createFileRoute("/__authenticated/lesson/$lessonId/quiz")({
  component: QuizPage,
});

type QuizResult = { id: string; correctAnswer: string; userAnswer: string | null; isCorrect: boolean };

const SAMPLE_QUIZZES_BY_TOPIC: Record<string, Array<{
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}>> = {
  "Counting 1 to 20": [
    { question: "What number comes after 15?", option_a: "14", option_b: "16", option_c: "17", option_d: "18", correct_answer: "B" },
    { question: "How many fingers do you have on both hands?", option_a: "5", option_b: "8", option_c: "10", option_d: "20", correct_answer: "C" },
    { question: "What is 10 + 5?", option_a: "14", option_b: "15", option_c: "16", option_d: "20", correct_answer: "B" },
    { question: "Count backwards: 20, 19, 18, __?", option_a: "17", option_b: "16", option_c: "15", option_d: "14", correct_answer: "A" },
    { question: "How many toes do you have?", option_a: "5", option_b: "8", option_c: "10", option_d: "20", correct_answer: "D" },
  ],
  "Simple Addition": [
    { question: "2 + 3 = ?", option_a: "4", option_b: "5", option_c: "6", option_d: "7", correct_answer: "B" },
    { question: "1 + 4 = ?", option_a: "5", option_b: "3", option_c: "6", option_d: "4", correct_answer: "A" },
    { question: "6 + 2 = ?", option_a: "7", option_b: "8", option_c: "9", option_d: "10", correct_answer: "B" }
  ],
  "The Alphabet": [
    { question: "Which letter comes after B?", option_a: "A", option_b: "C", option_c: "D", option_d: "E", correct_answer: "B" },
    { question: "How many letters are there in the English alphabet?", option_a: "24", option_b: "25", option_c: "26", option_d: "27", correct_answer: "C" },
    { question: "Which is the last letter of the alphabet?", option_a: "X", option_b: "Y", option_c: "Z", option_d: "W", correct_answer: "C" }
  ],
  "The Alphabet A-M": [
    { question: "What letter comes after B?", option_a: "A", option_b: "C", option_c: "D", option_d: "E", correct_answer: "B" },
    { question: "A is for?", option_a: "Ball", option_b: "Cat", option_c: "Apple", option_d: "Dog", correct_answer: "C" },
    { question: "How many letters are from A to M?", option_a: "10", option_b: "11", option_c: "12", option_d: "13", correct_answer: "D" },
    { question: "Which letter makes the sound /b/ ?", option_a: "A", option_b: "B", option_c: "C", option_d: "D", correct_answer: "B" },
    { question: "M is for?", option_a: "Moon", option_b: "Sun", option_c: "Star", option_d: "Cloud", correct_answer: "A" },
  ],
  "Vowels and Consonants": [
    { question: "Which of the following is a vowel?", option_a: "B", option_b: "E", option_c: "K", option_d: "M", correct_answer: "B" },
    { question: "How many vowels are there in English?", option_a: "3", option_b: "4", option_c: "5", option_d: "6", correct_answer: "C" },
    { question: "Is the letter T a vowel?", option_a: "Yes", option_b: "No", option_c: "Sometimes", option_d: "Maybe", correct_answer: "B" }
  ],
  "My Body Parts": [
    { question: "What body part do we use to see things?", option_a: "Ears", option_b: "Eyes", option_c: "Nose", option_d: "Mouth", correct_answer: "B" },
    { question: "How many ears do you have?", option_a: "1", option_b: "2", option_c: "3", option_d: "4", correct_answer: "B" },
    { question: "What do we smell nice flowers with?", option_a: "Eyes", option_b: "Hands", option_c: "Nose", option_d: "Feet", correct_answer: "C" }
  ],
  "Living and Non-living": [
    { question: "Which of these is a living thing?", option_a: "Chair", option_b: "Dog", option_c: "Pen", option_d: "Cup", correct_answer: "B" },
    { question: "Which of these is a non-living thing?", option_a: "Tree", option_b: "Fish", option_c: "Stone", option_d: "Bird", correct_answer: "C" },
    { question: "Do plants grow like other living things?", option_a: "Yes", option_b: "No", option_c: "Never", option_d: "Rarely", correct_answer: "A" }
  ],
  "Shapes Around Us": [
    { question: "Which shape is round like a ball?", option_a: "Square", option_b: "Triangle", option_c: "Circle", option_d: "Rectangle", correct_answer: "C" },
    { question: "How many sides does a triangle have?", option_a: "2", option_b: "3", option_c: "4", option_d: "5", correct_answer: "B" },
    { question: "A pizza slice looks like which shape?", option_a: "Circle", option_b: "Square", option_c: "Triangle", option_d: "Rectangle", correct_answer: "C" },
    { question: "A book is usually which shape?", option_a: "Circle", option_b: "Square", option_c: "Triangle", option_d: "Rectangle", correct_answer: "D" },
    { question: "A building block is usually what shape?", option_a: "Circle", option_b: "Square", option_c: "Triangle", option_d: "Oval", correct_answer: "B" },
  ],
  "My Family": [
    { question: "Who takes care of you at home?", option_a: "Teacher", option_b: "Mother and Father", option_c: "Doctor", option_d: "Friend", correct_answer: "B" },
    { question: "Your father's mother is your?", option_a: "Sister", option_b: "Aunt", option_c: "Grandmother", option_d: "Cousin", correct_answer: "C" },
    { question: "A family pet could be a?", option_a: "Car", option_b: "Dog", option_c: "Tree", option_d: "Book", correct_answer: "B" },
    { question: "Who is your father's brother?", option_a: "Uncle", option_b: "Grandfather", option_c: "Cousin", option_d: "Nephew", correct_answer: "A" },
    { question: "A brother and sister are your?", option_a: "Parents", option_b: "Siblings", option_c: "Cousins", option_d: "Friends", correct_answer: "B" },
  ],
  "Plants Around Us": [
    { question: "What do plants need to grow?", option_a: "Ice cream", option_b: "Water and sunlight", option_c: "Toys", option_d: "Shoes", correct_answer: "B" },
    { question: "Which part of the plant is underground?", option_a: "Leaf", option_b: "Flower", option_c: "Root", option_d: "Stem", correct_answer: "C" },
    { question: "Trees give us?", option_a: "Candy", option_b: "Clean air", option_c: "Toys", option_d: "Cars", correct_answer: "B" },
    { question: "Which plant gives us apples?", option_a: "Rose", option_b: "Oak tree", option_c: "Apple tree", option_d: "Pine tree", correct_answer: "C" },
    { question: "Leaves are usually what color?", option_a: "Blue", option_b: "Red", option_c: "Green", option_d: "Yellow", correct_answer: "C" },
  ],
  "Animals and Their Homes": [
    { question: "Where do birds live?", option_a: "Burrow", option_b: "Nest", option_c: "Pond", option_d: "Hive", correct_answer: "B" },
    { question: "A rabbit lives in a?", option_a: "Nest", option_b: "Kennel", option_c: "Burrow", option_d: "Hive", correct_answer: "C" },
    { question: "Bees live in a?", option_a: "Nest", option_b: "Burrow", option_c: "Hive", option_d: "Kennel", correct_answer: "C" },
    { question: "Where do fish live?", option_a: "Air", option_b: "Water", option_c: "Trees", option_d: "Ground", correct_answer: "B" },
    { question: "A dog lives in a?", option_a: "Nest", option_b: "Burrow", option_c: "Kennel", option_d: "Hive", correct_answer: "C" },
  ],
  "My School": [
    { question: "What do we do at school?", option_a: "Sleep", option_b: "Learn and play", option_c: "Cook", option_d: "Drive", correct_answer: "B" },
    { question: "Who helps us learn at school?", option_a: "Driver", option_b: "Teacher", option_c: "Doctor", option_d: "Farmer", correct_answer: "B" },
    { question: "Where do we play at school?", option_a: "Library", option_b: "Playground", option_c: "Canteen", option_d: "Office", correct_answer: "B" },
    { question: "Books are kept in the?", option_a: "Playground", option_b: "Canteen", option_c: "Library", option_d: "Office", correct_answer: "C" },
    { question: "We should be polite to our teachers?", option_a: "Rude", option_b: "Polite", option_c: "Noisy", option_d: "Lazy", correct_answer: "B" },
  ],
  "Good Habits": [
    { question: "How many times should we brush our teeth daily?", option_a: "One", option_b: "Two", option_c: "Three", option_d: "Four", correct_answer: "B" },
    { question: "When should we wash our hands?", option_a: "After eating only", option_b: "Before eating only", option_c: "Before and after eating", option_d: "Never", correct_answer: "C" },
    { question: "What should we say when someone helps us?", option_a: "Go away", option_b: "Thank you", option_c: "No", option_d: "Maybe", correct_answer: "B" },
    { question: "Helping parents is a?", option_a: "Bad habit", option_b: "Good habit", option_c: "Boring task", option_d: "Waste of time", correct_answer: "B" },
    { question: "We should say please when we request something?", option_a: "Demand something", option_b: "Request something", option_c: "Take something", option_d: "Hide something", correct_answer: "B" },
  ],
  "Safe and Clean": [
    { question: "When should we wash our hands?", option_a: "Never", option_b: "Before eating", option_c: "Once a year", option_d: "Only Sunday", correct_answer: "B" },
    { question: "How many times should we brush our teeth in a day?", option_a: "1", option_b: "2", option_c: "5", option_d: "0", correct_answer: "B" },
    { question: "What does a red traffic light mean?", option_a: "Go", option_b: "Stop", option_c: "Run", option_d: "Dance", correct_answer: "B" }
  ],
  "Parts of Computer": [
    { question: "What shows pictures on a computer?", option_a: "Mouse", option_b: "Monitor", option_c: "CPU", option_d: "Wire", correct_answer: "B" },
    { question: "What do we use to type letters and numbers?", option_a: "Keyboard", option_b: "Screen", option_c: "Speaker", option_d: "Mouse", correct_answer: "A" },
    { question: "What is known as the brain of the computer?", option_a: "Mouse", option_b: "CPU", option_c: "Monitor", option_d: "Cable", correct_answer: "B" }
  ],
  "Using the Mouse": [
    { question: "How many main buttons does a computer mouse have?", option_a: "1", option_b: "2", option_c: "3", option_d: "4", correct_answer: "B" },
    { question: "What action should you take to open a file?", option_a: "Single click", option_b: "Double click", option_c: "Right click", option_d: "No click", correct_answer: "B" },
    { question: "To select an item on the screen, which click do we use?", option_a: "Left click", option_b: "Shake", option_c: "Throw", option_d: "Press all", correct_answer: "A" }
  ],
};

function QuizPage() {
  const { lessonId } = Route.useParams();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lessonTopic, setLessonTopic] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
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
        
        // 1. Fetch quizzes (Try client-side first, fallback to Server Function if RLS or database permission error blocks it)
        try {
          const { data: quizData, error } = await supabase
            .from("quizzes")
            .select("id, lesson_id, question, option_a, option_b, option_c, option_d, correct_answer")
            .eq("lesson_id", lessonId);
          if (error) throw error;
          
          if (quizData && quizData.length > 0) {
            setQuizzes(quizData);
          } else {
            // Fallback to Server Function (bypasses RLS)
            const serverRes = await getQuizzesWithAnswersServer({ data: { lessonId } });
            setQuizzes(serverRes.quizzes ?? []);
          }
        } catch (clientErr) {
          console.warn("Client-side quiz fetch failed, attempting server function fallback:", clientErr);
          try {
            const serverRes = await getQuizzesWithAnswersServer({ data: { lessonId } });
            setQuizzes(serverRes.quizzes ?? []);
          } catch (serverErr: any) {
            throw new Error(serverErr.message || "Failed to load quizzes from both client and server");
          }
        }

        // 2. Fetch lesson topic for auto-seeding
        const { data: lessonData } = await supabase
          .from("lessons")
          .select("topic")
          .eq("id", lessonId)
          .single();
        if (lessonData) setLessonTopic(lessonData.topic);

        // 3. Check user admin status with isolated safety try-catch
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: hasAdminRole } = await supabase.rpc("has_role", {
              _user_id: user.id,
              _role: "admin"
            });
            setIsAdmin(!!hasAdminRole);
          }
        } catch (adminErr) {
          console.warn("Failed to check admin role, defaulting to false:", adminErr);
          setIsAdmin(false);
        }
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

  async function handleAutoSeed() {
    if (!lessonTopic || !lessonId) return;
    const sample = SAMPLE_QUIZZES_BY_TOPIC[lessonTopic];
    if (!sample) {
      toast.error(`No sample quiz available for topic: ${lessonTopic}`);
      return;
    }
    try {
      setIsSeeding(true);
      const rows = sample.map((q) => ({
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
      }));
      
      // Call Server Function to seed (bypasses RLS completely)
      await seedQuizzesServer({ data: { lessonId, quizzes: rows } });
      toast.success("Sample quizzes auto-seeded!");
      
      // Reload quizzes using Server Function to bypass RLS
      const serverRes = await getQuizzesWithAnswersServer({ data: { lessonId } });
      setQuizzes(serverRes.quizzes ?? []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to seed quizzes");
    } finally {
      setIsSeeding(false);
    }
  }

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0F172A] transition-colors duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#0F172A] dark:via-[#1E1B4B] dark:to-[#1E293B] text-slate-800 dark:text-white transition-colors duration-300">
        <XCircle className="mx-auto h-16 w-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-heading font-black mb-2">Error Loading Quiz</h2>
        <p className="text-slate-500 dark:text-white/60 mb-6 max-w-md">{fetchError}</p>
        <Link to="/dashboard">
          <Button className="rounded-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 cursor-pointer">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (quizzes.length === 0) {
    const hasSampleQuiz = lessonTopic && SAMPLE_QUIZZES_BY_TOPIC[lessonTopic];

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#0F172A] dark:via-[#1E1B4B] dark:to-[#1E293B] text-slate-800 dark:text-white transition-colors duration-300">
        <HelpCircle className="mx-auto h-16 w-16 text-indigo-500 dark:text-indigo-400 mb-4 animate-bounce" />
        <h2 className="text-2xl font-heading font-black mb-2">No Quiz Questions Found</h2>
        <p className="text-slate-500 dark:text-white/60 mb-4 max-w-md">
          {lessonTopic ? `There are no quiz questions seeded for the topic "${lessonTopic}" yet.` : "There are no quiz questions seeded for this lesson in the database yet."}
        </p>

        {hasSampleQuiz ? (
          <div className="mb-6 flex flex-col items-center gap-2">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">✨ Quick Seeding Available</p>
            <Button 
              onClick={handleAutoSeed} 
              disabled={isSeeding}
              className="rounded-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white px-8 py-6 shadow-lg shadow-indigo-500/20 transform hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Seeding Quizzes...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-pulse" /> Auto-Seed Lesson Quizzes
                </>
              )}
            </Button>
            <p className="text-[10px] text-slate-500 dark:text-white/40 italic">Click to populate this quiz with Grade 1 curriculum questions instantly</p>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 max-w-md text-left shadow-sm">
            <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">💡 Developer / Student Hint</p>
            <p className="text-xs text-slate-600 dark:text-white/80 leading-relaxed font-semibold">
              The quizzes table is currently empty in your database. You can easily populate all Grade 1 quizzes by copying and running the <code className="bg-slate-100 dark:bg-white/15 px-1.5 py-0.5 rounded text-[11px] text-slate-800 dark:text-white">seed_quizzes_editor.sql</code> script (located in your workspace root folder) inside the **Supabase SQL Editor** dashboard.
            </p>
          </div>
        )}

        <Link to="/dashboard">
          <Button variant="outline" className="rounded-2xl font-black border-slate-300 dark:border-white/20 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white px-6 cursor-pointer transition-all">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#0F172A] dark:via-[#1E1B4B] dark:to-[#1E293B] text-slate-800 dark:text-white transition-colors duration-300 relative overflow-hidden">
      
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
        <Link to="/lesson/$lessonId" params={{ lessonId }} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white transition-all">
          <ArrowLeft className="h-4 w-4" /> Back to Lesson
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-black text-slate-800 dark:text-white tracking-tight">Daily Quest Quiz</h1>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-200/50 dark:bg-white/10 px-3.5 py-1.5 text-xs font-black text-indigo-600 dark:text-indigo-300">
            <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-3 flex-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${((currentQ) / (total || 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-500 dark:text-white/60">{currentQ} / {total} Done</span>
        </div>

        {!submitted ? (
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md p-6 shadow-md dark:shadow-2xl relative overflow-hidden">
              <p className="mb-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Question {currentQ + 1} of {total}</p>
              <h2 className="mb-6 font-heading text-lg md:text-xl font-black text-slate-800 dark:text-white leading-relaxed">{currentQuiz?.question}</h2>
              
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
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer ${
                        isChecked 
                          ? isCorrectAnswer 
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : isSelected
                              ? "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                              : "border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 opacity-50"
                          : isSelected
                            ? "border-indigo-500 bg-indigo-500/10 shadow-md shadow-indigo-500/10"
                            : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10"
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all ${
                        isChecked
                          ? isCorrectAnswer
                            ? "bg-emerald-500 text-white"
                            : isSelected
                              ? "bg-rose-500 text-white"
                              : "bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/30"
                          : isSelected
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/60"
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-white">{opt.text}</span>
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
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                        : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isCorrectFeedback ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-wider">{isCorrectFeedback ? "Excellent Job! 🎉" : "Not Quite! 💡"}</h4>
                        <p className="text-xs text-slate-600 dark:text-white/70 font-semibold mt-1 leading-relaxed">
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
                className="rounded-2xl font-black text-slate-600 border-slate-300 dark:border-white/20 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/80 cursor-pointer"
              >
                Previous
              </Button>

              {!isChecked ? (
                <Button 
                  onClick={handleCheckAnswer} 
                  disabled={!selected}
                  className="rounded-2xl font-black bg-indigo-500 hover:bg-indigo-600 text-white shadow-md px-6 cursor-pointer"
                >
                  Check Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion} 
                  className="rounded-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md px-6 cursor-pointer"
                >
                  {currentQ < total - 1 ? "Continue" : "Submit Quest"}
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md p-8 shadow-md dark:shadow-2xl">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 shadow-lg animate-bounce">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="font-heading text-3xl font-black text-slate-800 dark:text-white">Quest Finished!</h2>
              <p className="mt-2 text-slate-500 dark:text-white/60 font-semibold text-base">You achieved a score of</p>
              <p className="font-heading text-6xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{score}%</p>
              
              <div className="mt-4 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl py-3 px-6 max-w-xs mx-auto shadow-sm">
                <Award className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                <span className="text-sm font-black text-slate-700 dark:text-white">{correctCount} of {total} correct answers</span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/lesson/$lessonId" params={{ lessonId }} className="inline-flex">
                  <Button variant="outline" className="rounded-2xl font-black border-slate-300 dark:border-white/20 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white px-6 cursor-pointer">Review Lesson</Button>
                </Link>
                <Link to="/dashboard" className="inline-flex">
                  <Button className="rounded-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 shadow-md dark:shadow-none cursor-pointer">Back to Dashboard</Button>
                </Link>
              </div>

              {/* Performance Analytical Breakdown */}
              <div className="mt-8 space-y-3 text-left border-t border-slate-200 dark:border-white/10 pt-6">
                <h3 className="text-sm font-black text-slate-600 dark:text-white/70 uppercase tracking-widest mb-3">Quest Recap</h3>
                {results.map((r, i) => {
                  const q = quizzes.find((qq: any) => qq.id === r.id);
                  return (
                    <div key={r.id} className={`rounded-2xl border p-4 ${r.isCorrect ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-50/5" : "border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-50/5"}`}>
                      <div className="flex items-start gap-2.5">
                        {r.isCorrect ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />}
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white/95 leading-relaxed">{i + 1}. {q?.question}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50 font-bold mt-1">Your answer: {r.userAnswer || "-"} • Correct: {r.correctAnswer}</p>
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