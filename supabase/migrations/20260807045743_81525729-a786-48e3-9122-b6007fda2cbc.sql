
CREATE POLICY "portfolio owner reads files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin());
CREATE POLICY "portfolio owner uploads files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
CREATE POLICY "portfolio owner updates files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin()) WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
CREATE POLICY "portfolio owner deletes files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin());
