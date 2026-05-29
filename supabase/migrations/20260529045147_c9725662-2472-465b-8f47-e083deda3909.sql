CREATE POLICY "Authenticated users can view quizzes" ON public.quizzes FOR SELECT TO authenticated USING (true);
GRANT SELECT ON public.quizzes TO authenticated;