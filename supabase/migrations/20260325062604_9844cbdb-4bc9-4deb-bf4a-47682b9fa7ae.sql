
DROP POLICY IF EXISTS "Authenticated users can insert runs" ON public.runs;
DROP POLICY IF EXISTS "Authenticated users can view runs" ON public.runs;
DROP POLICY IF EXISTS "Authenticated users can update runs" ON public.runs;
DROP POLICY IF EXISTS "Authenticated users can delete runs" ON public.runs;

CREATE POLICY "Allow all to view runs" ON public.runs FOR SELECT USING (true);
CREATE POLICY "Allow all to insert runs" ON public.runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update runs" ON public.runs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to delete runs" ON public.runs FOR DELETE USING (true);
