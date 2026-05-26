import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Save, BookOpen, PenLine, FileText, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateContent, saveLesson, saveQuizzes, saveWorksheet, checkAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin - AI Teaching Studio" },
      { name: "description", content: "AI Content Generator for AI Teaching Studio" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState<any>(null);

  const generateFn = useServerFn(generateContent);
  const saveLessonFn = useServerFn(saveLesson);
  const saveQuizzesFn = useServerFn(saveQuizzes);
  const saveWorksheetFn = useServerFn(saveWorksheet);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!grade || !subject || !topic) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      // For demo, generate mock content if webhook not configured
      const mockResult = {
        lesson: {
          grade: parseInt(grade),
          subject,
          topic,
          lessonContent: `Welcome to ${topic}! This is an AI-generated lesson for Grade ${grade} ${subject}. In this lesson, we will explore the wonderful world of ${topic} through fun activities and stories.`,
          keyPoints: [`Key point 1 about ${topic}`, `Key point 2 about ${topic}`, `Key point 3 about ${topic}`],
          story: `Once upon a time, there was a curious student who loved learning about ${topic}. One day, they discovered something amazing...`,
          duration: parseInt(duration),
        },
        quizzes: Array.from({ length: 5 }, (_, i) => ({
          question: `Question ${i + 1} about ${topic}?`,
          optionA: "Option A",
          optionB: "Option B",
          optionC: "Option C",
          optionD: "Option D",
          correctAnswer: ["A", "B", "C", "D"][i % 4] as "A" | "B" | "C" | "D",
        })),
        worksheet: `Worksheet for ${topic}\n\n1. Describe what you learned about ${topic}.\n2. Draw a picture related to ${topic}.\n3. Write three new things you discovered.`,
        answerKey: `1. Students should describe key concepts.\n2. Drawing should reflect the topic.\n3. Any three valid discoveries.`,
      };
      setGenerated(mockResult);
      toast.success("Content generated! (Demo mode - configure webhook for real AI)");
    } catch (err: any) {
      toast.error(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!generated) return;
    setSaving(true);
    try {
      const lesson = await saveLessonFn({ data: {
        grade: generated.lesson.grade,
        subject: generated.lesson.subject,
        topic: generated.lesson.topic,
        lessonContent: generated.lesson.lessonContent,
        keyPoints: generated.lesson.keyPoints,
        story: generated.lesson.story,
        duration: generated.lesson.duration,
      }});

      if (lesson.lesson) {
        await saveQuizzesFn({ data: { lessonId: lesson.lesson.id, quizzes: generated.quizzes }});
        await saveWorksheetFn({ data: {
          lessonId: lesson.lesson.id,
          worksheetContent: generated.worksheet,
          answerKey: generated.answerKey,
        }});
      }

      toast.success("Saved to database!");
      setGenerated(null);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">AI Content Generator</h1>
              <p className="text-sm text-muted-foreground">Generate lessons, quizzes, and worksheets with AI</p>
            </div>
          </div>

          {/* Generator Form */}
          <form onSubmit={handleGenerate} className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Grade 1</SelectItem>
                    <SelectItem value="2">Grade 2</SelectItem>
                    <SelectItem value="3">Grade 3</SelectItem>
                    <SelectItem value="4">Grade 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="EVS">EVS</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Computer">Computer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Topic</Label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Counting 1-20" className="mt-1 rounded-xl" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="mt-4 w-full rounded-xl py-5 font-bold">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {loading ? "Generating..." : "Generate Content"}
            </Button>
          </form>

          {/* Output Tabs */}
          {generated && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Tabs defaultValue="lesson" className="rounded-2xl border border-border bg-card shadow-sm">
                <TabsList className="w-full rounded-t-2xl bg-muted/50 p-1">
                  <TabsTrigger value="lesson" className="flex-1 rounded-xl font-bold"><BookOpen className="mr-2 h-4 w-4" />Lesson</TabsTrigger>
                  <TabsTrigger value="quiz" className="flex-1 rounded-xl font-bold"><PenLine className="mr-2 h-4 w-4" />Quiz</TabsTrigger>
                  <TabsTrigger value="worksheet" className="flex-1 rounded-xl font-bold"><FileText className="mr-2 h-4 w-4" />Worksheet</TabsTrigger>
                  <TabsTrigger value="answers" className="flex-1 rounded-xl font-bold"><KeyRound className="mr-2 h-4 w-4" />Answer Key</TabsTrigger>
                </TabsList>
                <TabsContent value="lesson" className="p-5">
                  <h3 className="font-heading text-lg font-bold">{generated.lesson.topic}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{generated.lesson.lessonContent}</p>
                  <div className="mt-4">
                    <h4 className="font-bold text-sm">Key Points:</h4>
                    <ul className="mt-1 list-disc pl-5 text-sm">
                      {generated.lesson.keyPoints.map((p: string, i: number) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                  <div className="mt-4 rounded-xl bg-primary/5 p-3">
                    <h4 className="font-bold text-sm">Story:</h4>
                    <p className="mt-1 text-sm italic">{generated.lesson.story}</p>
                  </div>
                </TabsContent>
                <TabsContent value="quiz" className="p-5 space-y-3">
                  {generated.quizzes.map((q: any, i: number) => (
                    <div key={i} className="rounded-xl border border-border p-3">
                      <p className="font-bold text-sm">{i + 1}. {q.question}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {["A", "B", "C", "D"].map((opt) => (
                          <div key={opt} className={`rounded-lg px-3 py-2 text-xs font-bold ${q.correctAnswer === opt ? "bg-science/10 text-science" : "bg-muted"}`}>
                            {opt}. {q[`option${opt}` as keyof typeof q]}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="worksheet" className="p-5">
                  <Textarea value={generated.worksheet} readOnly className="min-h-[200px] rounded-xl font-mono text-sm" />
                </TabsContent>
                <TabsContent value="answers" className="p-5">
                  <Textarea value={generated.answerKey} readOnly className="min-h-[200px] rounded-xl font-mono text-sm" />
                </TabsContent>
              </Tabs>

              <Button onClick={handleSave} disabled={saving} className="mt-4 w-full rounded-xl py-5 font-bold bg-accent text-accent-foreground hover:bg-accent/90">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {saving ? "Saving..." : "Save to Database"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
