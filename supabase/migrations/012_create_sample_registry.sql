-- Sample data registry (run-based)
-- Purpose: create / track / safely cleanup UI sample data by run_key

CREATE TABLE IF NOT EXISTS public.sample_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_key TEXT NOT NULL UNIQUE,
  label TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.sample_run_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.sample_runs(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(run_id, table_name, entity_key)
);

CREATE INDEX IF NOT EXISTS idx_sample_run_entities_run_id ON public.sample_run_entities(run_id);
CREATE INDEX IF NOT EXISTS idx_sample_run_entities_table_name ON public.sample_run_entities(table_name);

ALTER TABLE public.sample_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_run_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sample_runs"
  ON public.sample_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sample_runs"
  ON public.sample_runs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sample_runs"
  ON public.sample_runs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete sample_runs"
  ON public.sample_runs FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sample_run_entities"
  ON public.sample_run_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sample_run_entities"
  ON public.sample_run_entities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sample_run_entities"
  ON public.sample_run_entities FOR DELETE TO authenticated USING (true);
