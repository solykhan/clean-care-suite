
-- Fix 1: Prevent username changes (immutable after initial set)
-- This closes the attack where a user changes their username to match another technician
CREATE OR REPLACE FUNCTION public.prevent_username_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.username IS NOT NULL AND NEW.username IS DISTINCT FROM OLD.username THEN
    RAISE EXCEPTION 'Username cannot be changed once set';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_immutable_username
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_username_change();

-- Add uniqueness constraint on username to prevent duplicates
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Fix 2: Drop the old permissive false-check policies on user_roles and replace with proper ones
-- (These may already exist from prior migration, so use IF EXISTS)
DROP POLICY IF EXISTS "Only service role can insert user_roles" ON user_roles;
DROP POLICY IF EXISTS "Only service role can update user_roles" ON user_roles;
DROP POLICY IF EXISTS "Only service role can delete user_roles" ON user_roles;

-- Use RESTRICTIVE policies - these apply as AND with any permissive policies
CREATE POLICY "Restrict user_roles insert"
ON user_roles AS RESTRICTIVE
FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "Restrict user_roles update"
ON user_roles AS RESTRICTIVE
FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "Restrict user_roles delete"
ON user_roles AS RESTRICTIVE
FOR DELETE TO authenticated
USING (false);
