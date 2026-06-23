
-- 1) Quizzes: allow students to read questions but not correct_answer
CREATE POLICY "Authenticated can view quiz questions"
ON public.quizzes
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.quizzes FROM authenticated;
GRANT SELECT (id, lesson_id, question, option_a, option_b, option_c, option_d)
  ON public.quizzes TO authenticated;
GRANT ALL ON public.quizzes TO service_role;

-- 2) Student progress: block self-reported scores/completion via a trigger.
-- Service role (used by submitQuiz via supabaseAdmin) bypasses this guard.
CREATE OR REPLACE FUNCTION public.guard_student_progress_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- service_role writes (trusted server) are allowed through unchanged
  IF current_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.score := 0;
    NEW.completed := false;
    NEW.time_spent_minutes := COALESCE(NEW.time_spent_minutes, 0);
    IF NEW.time_spent_minutes > 0 THEN
      NEW.time_spent_minutes := 0;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.score := OLD.score;
    NEW.completed := OLD.completed;
    NEW.time_spent_minutes := OLD.time_spent_minutes;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_student_progress_writes ON public.student_progress;
CREATE TRIGGER guard_student_progress_writes
BEFORE INSERT OR UPDATE ON public.student_progress
FOR EACH ROW EXECUTE FUNCTION public.guard_student_progress_writes();
