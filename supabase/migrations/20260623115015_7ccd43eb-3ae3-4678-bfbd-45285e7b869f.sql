DROP POLICY IF EXISTS "Students can view quiz questions without answers" ON public.quizzes;
REVOKE SELECT ON public.quizzes FROM authenticated;