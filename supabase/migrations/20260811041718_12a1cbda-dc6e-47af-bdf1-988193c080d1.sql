-- 1) SECURITY DEFINER helpers -> SECURITY INVOKER where safe
ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY INVOKER;
ALTER FUNCTION public.is_admin() SECURITY INVOKER;

-- trigger-only helpers: not callable via API
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- 2) profile: hide phone from anonymous visitors (column-level grants)
REVOKE SELECT ON public.profile FROM anon;
GRANT SELECT (
  id, full_name, title, headline, about_headline, about_description,
  short_bio, professional_summary, email, location, linkedin_url,
  github_url, resume_url, photo_url, open_to_work, created_at, updated_at
) ON public.profile TO anon;
