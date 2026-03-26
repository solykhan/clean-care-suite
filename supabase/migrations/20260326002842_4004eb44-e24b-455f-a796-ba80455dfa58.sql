
-- ============================================================
-- ROLE-BASED RLS: Full security lockdown
-- ============================================================

-- ---- 1. USER_ROLES: Explicit deny writes for non-service-role ----
-- No authenticated user should INSERT/UPDATE/DELETE roles (only edge functions via service role)
-- SELECT is already restricted to own row. Add explicit block policies for writes.
-- (RLS with no permissive INSERT/UPDATE/DELETE policy = denied by default — already correct.
--  Confirm by dropping any permissive write policies that may exist.)
DROP POLICY IF EXISTS "Allow public insert to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated insert to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete own role" ON public.user_roles;


-- ---- 2. CUSTOMERS: Admin-only access ----
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON public.customers;

CREATE POLICY "Admins can view customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete customers"
  ON public.customers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ---- 3. SERVICE_AGREEMENTS: Admin-only access ----
DROP POLICY IF EXISTS "Authenticated users can view service agreements" ON public.service_agreements;
DROP POLICY IF EXISTS "Authenticated users can insert service agreements" ON public.service_agreements;
DROP POLICY IF EXISTS "Authenticated users can update service agreements" ON public.service_agreements;
DROP POLICY IF EXISTS "Authenticated users can delete service agreements" ON public.service_agreements;

CREATE POLICY "Admins can view service agreements"
  ON public.service_agreements FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert service agreements"
  ON public.service_agreements FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update service agreements"
  ON public.service_agreements FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete service agreements"
  ON public.service_agreements FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ---- 4. CUSTOMER_SERVICE_REPORTS: Admin-only access ----
DROP POLICY IF EXISTS "Authenticated users can view service reports" ON public.customer_service_reports;
DROP POLICY IF EXISTS "Authenticated users can insert service reports" ON public.customer_service_reports;
DROP POLICY IF EXISTS "Authenticated users can update service reports" ON public.customer_service_reports;
DROP POLICY IF EXISTS "Authenticated users can delete service reports" ON public.customer_service_reports;

CREATE POLICY "Admins can view service reports"
  ON public.customer_service_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert service reports"
  ON public.customer_service_reports FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update service reports"
  ON public.customer_service_reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete service reports"
  ON public.customer_service_reports FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ---- 5. RUNS: Admins full access; technicians read their own runs only ----
DROP POLICY IF EXISTS "Authenticated users can view runs" ON public.runs;
DROP POLICY IF EXISTS "Authenticated users can insert runs" ON public.runs;
DROP POLICY IF EXISTS "Authenticated users can update runs" ON public.runs;
DROP POLICY IF EXISTS "Authenticated users can delete runs" ON public.runs;

-- Admins: full CRUD
CREATE POLICY "Admins can view runs"
  ON public.runs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert runs"
  ON public.runs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update runs"
  ON public.runs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete runs"
  ON public.runs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Technicians: read-only, only their own assigned runs
CREATE POLICY "Technicians can view their own runs"
  ON public.runs FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'technician')
    AND technicians ILIKE '%' || (
      SELECT username FROM public.profiles WHERE id = auth.uid()
    ) || '%'
  );
