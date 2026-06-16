ALTER TABLE public.student_progress
  ADD CONSTRAINT student_progress_score_range CHECK (score >= 0 AND score <= 100),
  ADD CONSTRAINT student_progress_time_nonneg CHECK (time_spent_minutes >= 0);