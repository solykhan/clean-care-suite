
-- Explicitly block all writes to user_roles for authenticated users
-- Only the service role (used by edge functions) can write roles

-- Add a restrictive policy that blocks INSERT for all authenticated users
-- (Since RLS default is deny, but scanner wants explicit policies)
CREATE POLICY "Block user_roles insert for non-admins"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Block user_roles update for non-admins"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Block user_roles delete for non-admins"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (false);
