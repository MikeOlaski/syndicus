-- Create evaluation cases table for test questions
CREATE TABLE public.syndic8_eval_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  expected_council_template TEXT NOT NULL DEFAULT 'balanced',
  expected_themes JSONB DEFAULT '[]'::jsonb,
  expected_dissent_topics JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evaluation results table
CREATE TABLE public.syndic8_eval_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  eval_case_id UUID NOT NULL REFERENCES public.syndic8_eval_cases(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.syndic8_groups(id) ON DELETE CASCADE,
  synthesis_output JSONB,
  expert_drafts JSONB,
  expert_critiques JSONB,
  scores JSONB DEFAULT '{}'::jsonb,
  latency_ms INTEGER,
  stage_timings JSONB DEFAULT '{}'::jsonb,
  passed BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.syndic8_eval_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndic8_eval_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for eval_cases (admin only for write, authenticated for read)
CREATE POLICY "Authenticated users can view eval cases"
ON public.syndic8_eval_cases
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage eval cases"
ON public.syndic8_eval_cases
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for eval_results (owner or admin)
CREATE POLICY "Users can view their own eval results"
ON public.syndic8_eval_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.syndic8_groups g
    WHERE g.id = group_id AND g.owner_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can insert eval results for their groups"
ON public.syndic8_eval_results
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.syndic8_groups g
    WHERE g.id = group_id AND g.owner_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage all eval results"
ON public.syndic8_eval_results
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_syndic8_eval_cases_category ON public.syndic8_eval_cases(category);
CREATE INDEX idx_syndic8_eval_cases_difficulty ON public.syndic8_eval_cases(difficulty);
CREATE INDEX idx_syndic8_eval_results_eval_case ON public.syndic8_eval_results(eval_case_id);
CREATE INDEX idx_syndic8_eval_results_group ON public.syndic8_eval_results(group_id);
CREATE INDEX idx_syndic8_eval_results_passed ON public.syndic8_eval_results(passed);

-- Add updated_at trigger for eval_cases
CREATE TRIGGER update_syndic8_eval_cases_updated_at
BEFORE UPDATE ON public.syndic8_eval_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();