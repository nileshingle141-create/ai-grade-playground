-- Enable Row Level Security explicitly on public.profiles and public.user_roles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- Secure public.profiles
-- ----------------------------------------------------

-- Drop any potentially overly permissive or existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block delete on profiles" ON public.profiles;

-- Create strict, optimized policies for profiles using cached auth.uid()
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Block delete on profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (false);


-- ----------------------------------------------------
-- Secure public.user_roles
-- ----------------------------------------------------

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Block insert on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Block update on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Block delete on user_roles" ON public.user_roles;

-- Create strict, optimized policies for user_roles using cached auth.uid()
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Explicitly block normal users from inserting, updating, or deleting user roles (only service_role/postgres bypasses this)
CREATE POLICY "Block insert on user_roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Block update on user_roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "Block delete on user_roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (false);


-- ----------------------------------------------------
-- Optimize other policies to prevent InitPlan warning
-- ----------------------------------------------------

-- Optimize student_progress policy
DROP POLICY IF EXISTS "students own progress" ON public.student_progress;
CREATE POLICY "students own progress"
  ON public.student_progress FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = student_id)
  WITH CHECK ((SELECT auth.uid()) = student_id);
