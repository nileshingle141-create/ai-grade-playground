import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .single();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

export const getSubjects = createServerFn({ method: "GET" })
  .inputValidator((input: { grade: number }) =>
    z.object({ grade: z.number().min(1).max(4) }).parse(input)
  )
  .handler(async ({ data }) => {
    const { data: subjects, error } = await supabaseAdmin
      .from("subjects")
      .select("*")
      .eq("grade", data.grade)
      .order("subject_name");
    if (error) throw new Error(error.message);
    return { subjects: subjects ?? [] };
  });

export const getLessons = createServerFn({ method: "GET" })
  .inputValidator((input: { grade: number; subject: string }) =>
    z.object({ grade: z.number().min(1).max(4), subject: z.string() }).parse(input)
  )
  .handler(async ({ data }) => {
    const { data: lessons, error } = await supabaseAdmin
      .from("lessons")
      .select("*")
      .eq("grade", data.grade)
      .eq("subject", data.subject)
      .order("created_at");
    if (error) throw new Error(error.message);
    return { lessons: lessons ?? [] };
  });

export const getLesson = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data }) => {
    const { data: lesson, error } = await supabaseAdmin
      .from("lessons")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return { lesson };
  });

// Returns quiz questions WITHOUT correct_answer — never leak answers to the client.
export const getQuizzes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lessonId: string }) =>
    z.object({ lessonId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data }) => {
    const { data: quizzes, error } = await supabaseAdmin
      .from("quizzes")
      .select("id, lesson_id, question, option_a, option_b, option_c, option_d")
      .eq("lesson_id", data.lessonId);
    if (error) throw new Error(error.message);
    return { quizzes: quizzes ?? [] };
  });

// Server-side quiz grading: takes user answers, returns score + per-question correctness + correct answers.
export const submitQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lessonId: string; answers: Record<string, string>; timeSpent: number }) =>
    z.object({
      lessonId: z.string().uuid(),
      answers: z.record(z.string().uuid(), z.enum(["A", "B", "C", "D"])),
      timeSpent: z.number().min(0).max(10000),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { data: quizzes, error } = await supabaseAdmin
      .from("quizzes")
      .select("id, correct_answer")
      .eq("lesson_id", data.lessonId);
    if (error) throw new Error(error.message);
    const list = quizzes ?? [];
    const results = list.map((q) => ({
      id: q.id,
      correctAnswer: q.correct_answer,
      userAnswer: data.answers[q.id] ?? null,
      isCorrect: data.answers[q.id] === q.correct_answer,
    }));
    const correct = results.filter((r) => r.isCorrect).length;
    const total = list.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    const { error: progErr } = await context.supabase
      .from("student_progress")
      .upsert({
        student_id: context.userId,
        lesson_id: data.lessonId,
        completed: true,
        score,
        time_spent_minutes: data.timeSpent,
      }, { onConflict: "student_id,lesson_id" });
    if (progErr) throw new Error(progErr.message);

    return { score, correct, total, results };
  });

export const getStudentProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("student_progress")
      .select("*, lessons(topic, subject)")
      .eq("student_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { progress: data ?? [] };
  });

export const saveProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lessonId: string; score: number; timeSpent: number }) =>
    z.object({
      lessonId: z.string().uuid(),
      score: z.number().min(0).max(100),
      timeSpent: z.number().min(0),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("student_progress")
      .upsert({
        student_id: context.userId,
        lesson_id: data.lessonId,
        completed: true,
        score: data.score,
        time_spent_minutes: data.timeSpent,
      }, { onConflict: "student_id,lesson_id" });
    if (error) throw new Error(error.message);
    return { success: true };
  });

// Admin-only: worksheets contain answer keys.
export const getWorksheet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lessonId: string }) =>
    z.object({ lessonId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden: admin role required");
    const { data: worksheet, error } = await supabaseAdmin
      .from("worksheets")
      .select("*")
      .eq("lesson_id", data.lessonId)
      .single();
    if (error) throw new Error(error.message);
    return { worksheet };
  });
