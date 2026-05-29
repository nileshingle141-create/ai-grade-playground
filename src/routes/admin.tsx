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
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState<any>(null);

  const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/rz4j66q2149zn4ylrcx99x32jem961ms";

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        navigate({ to: "/login" });
        return;
      }
      try {
        const { data: isAdminRes, error: roleError } = await supabase.rpc("has_role", {
          _user_id: data.user.id,
          _role: "admin",
        });
        if (roleError) throw roleError;
        setIsAdmin(!!isAdminRes);
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!grade || !subject || !topic) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    setGenerated(null);
    try {
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: parseInt(grade),
          subject,
          topic,
          duration: parseInt(duration),
        }),
      });
      if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
      const result = await res.json();
      if (!result?.lesson_id) throw new Error("Webhook response missing lesson_id");
      setGenerated({
        lesson: result.lesson ?? "",
        quiz: Array.isArray(result.quiz) ? result.quiz : [],
        worksheet: result.worksheet ?? "",
        answer_key: result.answer_key ?? "",
        lesson_id: result.lesson_id,
      });
      toast.success("Content generated!");
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
      const rows = generated.quiz.map((q: any) => ({
        lesson_id: generated.lesson_id,
        question: q.question ?? q.q ?? "",
        option_a: q.option_a ?? q.optionA ?? q.a ?? "",
        option_b: q.option_b ?? q.optionB ?? q.b ?? "",
        option_c: q.option_c ?? q.optionC ?? q.c ?? "",
        option_d: q.option_d ?? q.optionD ?? q.d ?? "",
        correct_answer: String(q.correct_answer ?? q.correctAnswer ?? "A").toUpperCase(),
      }));
      if (rows.length > 0) {
        const { error } = await supabase.from("quizzes").insert(rows);
        if (error) throw error;
      }
      toast.success("Lesson saved!");
      setGenerated(null);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="font-heading text-xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not have admin privileges. Ask an existing admin to grant you the <code>admin</code> role.
          </p>
          <Button className="mt-4 rounded-xl" onClick={() => navigate({ to: "/dashboard" })}>Back to Dashboard</Button>
        </div>
      </div>
    );
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
                  <h3 className="font-heading text-lg font-bold">{topic}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{generated.lesson}</p>
                </TabsContent>
                <TabsContent value="quiz" className="p-5 space-y-3">
                  {generated.quiz.length === 0 && (
                    <p className="text-sm text-muted-foreground">No quiz questions returned.</p>
                  )}
                  {generated.quiz.map((q: any, i: number) => {
                    const correct = String(q.correct_answer ?? q.correctAnswer ?? "").toUpperCase();
                    const opts: Record<string, string> = {
                      A: q.option_a ?? q.optionA ?? q.a ?? "",
                      B: q.option_b ?? q.optionB ?? q.b ?? "",
                      C: q.option_c ?? q.optionC ?? q.c ?? "",
                      D: q.option_d ?? q.optionD ?? q.d ?? "",
                    };
                    return (
                      <div key={i} className="rounded-xl border border-border p-3">
                        <p className="font-bold text-sm">{i + 1}. {q.question ?? q.q}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {(["A", "B", "C", "D"] as const).map((opt) => (
                            <div key={opt} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${correct === opt ? "bg-science/10 text-science" : "bg-muted"}`}>
                              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${correct === opt ? "bg-science text-white" : "bg-background border border-border"}`}>{opt}</span>
                              <span>{opts[opt]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
                <TabsContent value="worksheet" className="p-5">
                  <Textarea value={generated.worksheet} readOnly className="min-h-[200px] rounded-xl font-mono text-sm" />
                </TabsContent>
                <TabsContent value="answers" className="p-5">
                  <Textarea value={generated.answer_key} readOnly className="min-h-[200px] rounded-xl font-mono text-sm" />
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
