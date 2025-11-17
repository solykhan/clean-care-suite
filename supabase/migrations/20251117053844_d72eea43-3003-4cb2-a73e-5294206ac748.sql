-- Drop existing RLS policies on service_agreements table
DROP POLICY IF EXISTS "Authenticated users can view service agreements" ON service_agreements;
DROP POLICY IF EXISTS "Authenticated users can insert service agreements" ON service_agreements;
DROP POLICY IF EXISTS "Authenticated users can update service agreements" ON service_agreements;
DROP POLICY IF EXISTS "Authenticated users can delete service agreements" ON service_agreements;

-- Create new policies that allow all operations without authentication
CREATE POLICY "Allow all to view service agreements" ON service_agreements
  FOR SELECT USING (true);

CREATE POLICY "Allow all to insert service agreements" ON service_agreements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update service agreements" ON service_agreements
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all to delete service agreements" ON service_agreements
  FOR DELETE USING (true);