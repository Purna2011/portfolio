CREATE TABLE public.project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  label text NOT NULL DEFAULT '',
  snapshot jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX project_versions_project_idx ON public.project_versions (project_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_versions TO authenticated;
GRANT ALL ON public.project_versions TO service_role;

ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project versions admin all" ON public.project_versions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());