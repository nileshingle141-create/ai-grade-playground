import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(supabase: any, userId: string) {
  const { data: isAdmin, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!isAdmin) throw new Error("Forbidden: admin role required");
}

export const generateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { grade: number; subject: string; topic: string; duration: number }) =>
    z
      .object({
        grade: z.number().min(1).max(4),
        subject: z.string().min(1).max(100),
        topic: z.string().min(1).max(200),
        duration: z.number().min(10).max(60),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("Make.com webhook URL not configured");
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    const result = await response.json();
    return { result };
  });

export const saveLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      grade: number;
      subject: string;
      topic: string;
      lessonContent: string;
      keyPoints: string[];
      story: string;
      duration: number;
    }) =>
      z
        .object({
          grade: z.number().min(1).max(4),
          subject: z.string().min(1).max(100),
          topic: z.string().min(1).max(200),
          lessonContent: z.string().min(1).max(20000),
          keyPoints: z.array(z.string().max(500)).max(50),
          story: z.string().max(20000),
          duration: z.number().min(10).max(60),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: lesson, error } = await supabaseAdmin
      .from("lessons")
      .insert({
        grade: data.grade,
        subject: data.subject,
        topic: data.topic,
        lesson_content: data.lessonContent,
        key_points: data.keyPoints,
        story: data.story,
        duration_minutes: data.duration,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { lesson };
  });

export const saveQuizzes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      lessonId: string;
      quizzes: {
        question: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        correctAnswer: string;
      }[];
    }) =>
      z
        .object({
          lessonId: z.string().uuid(),
          quizzes: z
            .array(
              z.object({
                question: z.string().min(1).max(2000),
                optionA: z.string().min(1).max(500),
                optionB: z.string().min(1).max(500),
                optionC: z.string().min(1).max(500),
                optionD: z.string().min(1).max(500),
                correctAnswer: z.string().regex(/^[A-D]$/),
              }),
            )
            .max(100),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const rows = data.quizzes.map((q) => ({
      lesson_id: data.lessonId,
      question: q.question,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD,
      correct_answer: q.correctAnswer,
    }));
    const { error } = await supabaseAdmin.from("quizzes").insert(rows);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const saveWorksheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lessonId: string; worksheetContent: string; answerKey: string }) =>
    z
      .object({
        lessonId: z.string().uuid(),
        worksheetContent: z.string().min(1).max(20000),
        answerKey: z.string().max(20000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("worksheets").insert({
      lesson_id: data.lessonId,
      worksheet_content: data.worksheetContent,
      answer_key: data.answerKey,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

// Lightweight check so the admin UI can verify access on mount.
export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: !!isAdmin };
  });
