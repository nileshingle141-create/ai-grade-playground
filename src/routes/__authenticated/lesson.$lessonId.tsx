import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Lightbulb, Sparkles, Download, Loader2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLesson, getWorksheet, markLessonViewed } from "@/lib/lessons.functions";
import { useEffect } from "react";

export const Route = createFileRoute("/__authenticated/lesson/$lessonId")({
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchLesson = useServerFn(getLesson);
  const fetchWorksheet = useServerFn(getWorksheet);
  const markViewed = useServerFn(markLessonViewed);

  const { data: lessonData, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => fetchLesson({ data: { id: lessonId } }),
    enabled: !!lessonId,
  });

  const { data: worksheetData } = useQuery({
    queryKey: ["worksheet", lessonId],
    queryFn: () => fetchWorksheet({ data: { lessonId } }),
    enabled: !!lessonId,
    retry: false,
  });

  useEffect(() => {
    if (!lessonId) return;
    markViewed({ data: { lessonId } })
      .then(() => queryClient.invalidateQueries({ queryKey: ["progress"] }))
      .catch(() => {});
  }, [lessonId, markViewed, queryClient]);

  const lesson = lessonData?.lesson;
  const worksheet = worksheetData?.worksheet;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : lesson ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{lesson.subject}</span>
                <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                  <Clock className="h-3 w-3" /> {lesson.duration_minutes} min
                </span>
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{lesson.topic}</h1>
            </div>

            {/* Content */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line text-foreground leading-relaxed">{lesson.lesson_content}</p>
              </div>
            </div>

            {/* Key Points */}
            {lesson.key_points && lesson.key_points.length > 0 && (
              <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  <h3 className="font-heading text-lg font-bold text-foreground">Key Points</h3>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {lesson.key_points.map((point: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                      <p className="text-sm text-foreground">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Story */}
            {lesson.story && (
              <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <h3 className="font-heading text-lg font-bold text-foreground">Story Time</h3>
                </div>
                <p className="text-sm italic leading-relaxed text-foreground">{lesson.story}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to={`/lesson/${lessonId}/quiz`} className="flex-1">
                <Button className="w-full rounded-xl py-5 font-bold">
                  <PenLine className="mr-2 h-4 w-4" /> Take Quiz
                </Button>
              </Link>
              {worksheet && (
                <Button variant="outline" className="flex-1 rounded-xl py-5 font-bold" onClick={() => {
                  const blob = new Blob([worksheet.worksheet_content], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${lesson.topic}-worksheet.txt`;
                  a.click();
                }}>
                  <Download className="mr-2 h-4 w-4" /> Download Worksheet
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground">Lesson not found</p>
        )}
      </div>
    </div>
  );
}
