-- Drop existing RLS policies on customers table
DROP POLICY IF EXISTS "Authenticated users can view customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON customers;

-- Create new policies that allow all operations without authentication
CREATE POLICY "Allow all to view customers" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Allow all to insert customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update customers" ON customers
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all to delete customers" ON customers
  FOR DELETE USING (true);