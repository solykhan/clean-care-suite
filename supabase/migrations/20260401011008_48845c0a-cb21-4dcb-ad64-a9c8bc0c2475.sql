
-- Fix 1: Technicians can only insert service reports with their own username
DROP POLICY IF EXISTS "Technicians can insert service reports" ON customer_service_reports;

CREATE POLICY "Technicians can insert own service reports"
  ON customer_service_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'technician'::app_role)
    AND technician_name = (
      SELECT username FROM profiles WHERE id = auth.uid()
    )
  );

-- Fix 2: Tighten runs ILIKE to exact comma-delimited matching
DROP POLICY IF EXISTS "Technicians can view their own runs" ON runs;

CREATE POLICY "Technicians can view their own runs"
  ON runs
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'technician'::app_role)
    AND (
      technicians = (SELECT username FROM profiles WHERE id = auth.uid())
      OR technicians ILIKE ((SELECT username FROM profiles WHERE id = auth.uid()) || ',%')
      OR technicians ILIKE ('%,' || (SELECT username FROM profiles WHERE id = auth.uid()) || ',%')
      OR technicians ILIKE ('%,' || (SELECT username FROM profiles WHERE id = auth.uid()))
    )
  );
