
-- Roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Quizzes: remove public read (leaks correct_answer). Server fn will mediate.
DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Authenticated can insert quizzes" ON public.quizzes;
CREATE POLICY "Admins can view quizzes"
  ON public.quizzes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert quizzes"
  ON public.quizzes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Worksheets: remove public read (leaks answer_key).
DROP POLICY IF EXISTS "Anyone can view worksheets" ON public.worksheets;
DROP POLICY IF EXISTS "Authenticated can insert worksheets" ON public.worksheets;
CREATE POLICY "Admins can view worksheets"
  ON public.worksheets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert worksheets"
  ON public.worksheets FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Subjects: keep public read; restrict insert to admins.
DROP POLICY IF EXISTS "Authenticated can insert subjects" ON public.subjects;
CREATE POLICY "Admins can insert subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Lessons: keep public read; restrict insert to admins.
DROP POLICY IF EXISTS "Authenticated can insert lessons" ON public.lessons;
CREATE POLICY "Admins can insert lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
