
-- Fix 1: Remove permissive "Allow all to view customers" if it exists
DROP POLICY IF EXISTS "Allow all to view customers" ON customers;

-- Fix 2: Fix user_roles privilege escalation
-- Drop the broken permissive policies that use false
DROP POLICY IF EXISTS "Block user_roles insert for non-admins" ON user_roles;
DROP POLICY IF EXISTS "Block user_roles update for non-admins" ON user_roles;
DROP POLICY IF EXISTS "Block user_roles delete for non-admins" ON user_roles;

-- Create RESTRICTIVE policies to actually block non-admin mutations
CREATE POLICY "Only service role can insert user_roles"
ON user_roles FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "Only service role can update user_roles"
ON user_roles FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "Only service role can delete user_roles"
ON user_roles FOR DELETE TO authenticated
USING (false);

-- Fix 3: Add technician-scoped UPDATE/DELETE policies for service reports
CREATE POLICY "Technicians can update own service reports"
ON customer_service_reports FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'technician'::app_role)
  AND technician_name = (SELECT profiles.username FROM profiles WHERE profiles.id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'technician'::app_role)
  AND technician_name = (SELECT profiles.username FROM profiles WHERE profiles.id = auth.uid())
);

CREATE POLICY "Technicians can delete own service reports"
ON customer_service_reports FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'technician'::app_role)
  AND technician_name = (SELECT profiles.username FROM profiles WHERE profiles.id = auth.uid())
);
