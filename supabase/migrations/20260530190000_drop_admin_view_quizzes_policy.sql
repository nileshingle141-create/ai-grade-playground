-- Drop the redundant admin view quizzes policy which causes permission errors for has_role function
DROP POLICY IF EXISTS "Admins can view quizzes" ON public.quizzes;
