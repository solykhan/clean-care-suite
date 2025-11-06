-- Drop existing insecure policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable update for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.customers;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.service_agreements;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.service_agreements;
DROP POLICY IF EXISTS "Enable update for all users" ON public.service_agreements;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.service_agreements;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.customer_service_reports;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.customer_service_reports;
DROP POLICY IF EXISTS "Enable update for all users" ON public.customer_service_reports;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.customer_service_reports;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.runs;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.runs;
DROP POLICY IF EXISTS "Enable update for all users" ON public.runs;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.runs;

-- Secure customers table - only authenticated users
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

-- Secure service_agreements table - only authenticated users
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

-- Secure customer_service_reports table - only authenticated users
CREATE POLICY "Authenticated users can view service reports"
ON public.customer_service_reports FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert service reports"
ON public.customer_service_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update service reports"
ON public.customer_service_reports FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete service reports"
ON public.customer_service_reports FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Secure runs table - only authenticated users
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