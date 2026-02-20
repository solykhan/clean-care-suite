
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view runs" ON public.runs;
DROP POLICY IF EXISTS "Authenticated users can insert runs" ON public.runs;
DROP POLICY IF EXISTS "Authenticated users can update runs" ON public.runs;
DROP POLICY IF EXISTS "Authenticated users can delete runs" ON public.runs;

-- Recreate as permissive policies
CREATE POLICY "Authenticated users can view runs"
ON public.runs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert runs"
ON public.runs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update runs"
ON public.runs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete runs"
ON public.runs FOR DELETE
TO authenticated
USING (true);
