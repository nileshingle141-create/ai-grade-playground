-- Enable RLS on all tables
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist, then recreate
DROP POLICY IF EXISTS "auth users read quizzes" ON quizzes;
CREATE POLICY "auth users read quizzes"
  ON quizzes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth users read lessons" ON lessons;
CREATE POLICY "auth users read lessons"
  ON lessons FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "students own progress" ON student_progress;
CREATE POLICY "students own progress"
  ON student_progress FOR ALL TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);
