-- Learn progress tracking per user and course
CREATE TABLE public.learn_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.learn_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own progress" ON public.learn_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
