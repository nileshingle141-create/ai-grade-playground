import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const generateContent = createServerFn({ method: "POST" })
  .inputValidator((input: { grade: number; subject: string; topic: string; duration: number }) =>
    z.object({
      grade: z.number().min(1).max(4),
      subject: z.string().min(1),
      topic: z.string().min(1),
      duration: z.number().min(10).max(60),
    }).parse(input)
  )
  .handler(async ({ data }) => {
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
  .inputValidator((input: { grade: number; subject: string; topic: string; lessonContent: string; keyPoints: string[]; story: string; duration: number }) =>
    z.object({
      grade: z.number().min(1).max(4),
      subject: z.string().min(1),
      topic: z.string().min(1),
      lessonContent: z.string().min(1),
      keyPoints: z.array(z.string()),
      story: z.string(),
      duration: z.number().min(10).max(60),
    }).parse(input)
  )
  .handler(async ({ data }) => {
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
  .inputValidator((input: { lessonId: string; quizzes: { question: string; optionA: string; optionB: string; optionC: string; optionD: string; correctAnswer: string }[] }) =>
    z.object({
      lessonId: z.string().uuid(),
      quizzes: z.array(z.object({
        question: z.string(),
        optionA: z.string(),
        optionB: z.string(),
        optionC: z.string(),
        optionD: z.string(),
        correctAnswer: z.string().regex(/^[A-D]$/),
      })),
    }).parse(input)
  )
  .handler(async ({ data }) => {
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
  .inputValidator((input: { lessonId: string; worksheetContent: string; answerKey: string }) =>
    z.object({
      lessonId: z.string().uuid(),
      worksheetContent: z.string(),
      answerKey: z.string(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("worksheets").insert({
      lesson_id: data.lessonId,
      worksheet_content: data.worksheetContent,
      answer_key: data.answerKey,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });
