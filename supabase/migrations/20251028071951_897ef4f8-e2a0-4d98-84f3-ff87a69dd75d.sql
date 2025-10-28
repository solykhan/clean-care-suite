-- Remove foreign key constraint from service_agreements to customers
ALTER TABLE public.service_agreements
DROP CONSTRAINT IF EXISTS service_agreements_service_id_fkey;

-- Remove unique constraint on customers.service_id (no longer needed)
ALTER TABLE public.customers
DROP CONSTRAINT IF EXISTS customers_service_id_unique;

-- Drop the index that was created for the foreign key
DROP INDEX IF EXISTS idx_service_agreements_service_id;