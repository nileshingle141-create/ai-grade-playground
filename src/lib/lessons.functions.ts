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

export const getQuizzes = createServerFn({ method: "GET" })
  .inputValidator((input: { lessonId: string }) =>
    z.object({ lessonId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data }) => {
    const { data: quizzes, error } = await supabaseAdmin
      .from("quizzes")
      .select("*")
      .eq("lesson_id", data.lessonId);
    if (error) throw new Error(error.message);
    return { quizzes: quizzes ?? [] };
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

export const getWorksheet = createServerFn({ method: "GET" })
  .inputValidator((input: { lessonId: string }) =>
    z.object({ lessonId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data }) => {
    const { data: worksheet, error } = await supabaseAdmin
      .from("worksheets")
      .select("*")
      .eq("lesson_id", data.lessonId)
      .single();
    if (error) throw new Error(error.message);
    return { worksheet };
  });
