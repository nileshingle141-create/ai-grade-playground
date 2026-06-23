
-- Ensure students can read quiz questions without seeing correct_answer.
DROP POLICY IF EXISTS "Authenticated can view quiz questions" ON public.quizzes;
DROP POLICY IF EXISTS "Students can view quiz questions without answers" ON public.quizzes;

CREATE POLICY "Students can view quiz questions without answers"
ON public.quizzes
FOR SELECT
TO authenticated
USING (true);

-- Strip any prior table-wide SELECT and grant only the safe columns.
REVOKE ALL ON public.quizzes FROM authenticated;
REVOKE ALL ON public.quizzes FROM anon;
GRANT SELECT (id, lesson_id, question, option_a, option_b, option_c, option_d)
  ON public.quizzes TO authenticated;
GRANT ALL ON public.quizzes TO service_role;
