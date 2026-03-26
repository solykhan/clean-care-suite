
-- Fix 1: Restrict customers table to authenticated users only (remove public access)
DROP POLICY IF EXISTS "Allow all to view customers" ON public.customers;
DROP POLICY IF EXISTS "Allow all to insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow all to update customers" ON public.customers;
DROP POLICY IF EXISTS "Allow all to delete customers" ON public.customers;

CREATE POLICY "Authenticated users can view customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete customers"
  ON public.customers FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Fix 2: Restrict runs table to authenticated users only
DROP POLICY IF EXISTS "Allow all to view runs" ON public.runs;
DROP POLICY IF EXISTS "Allow all to insert runs" ON public.runs;
DROP POLICY IF EXISTS "Allow all to update runs" ON public.runs;
DROP POLICY IF EXISTS "Allow all to delete runs" ON public.runs;

CREATE POLICY "Authenticated users can view runs"
  ON public.runs FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert runs"
  ON public.runs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update runs"
  ON public.runs FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete runs"
  ON public.runs FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Fix 3: Restrict service_agreements table to authenticated users only
DROP POLICY IF EXISTS "Allow all to view service agreements" ON public.service_agreements;
DROP POLICY IF EXISTS "Allow all to insert service agreements" ON public.service_agreements;
DROP POLICY IF EXISTS "Allow all to update service agreements" ON public.service_agreements;
DROP POLICY IF EXISTS "Allow all to delete service agreements" ON public.service_agreements;

CREATE POLICY "Authenticated users can view service agreements"
  ON public.service_agreements FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert service agreements"
  ON public.service_agreements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update service agreements"
  ON public.service_agreements FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete service agreements"
  ON public.service_agreements FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Fix 4: Remove the self-assign role INSERT policy (privilege escalation risk)
-- Only service role key (used by edge functions) can insert into user_roles
DROP POLICY IF EXISTS "Allow public insert to user_roles" ON public.user_roles;
