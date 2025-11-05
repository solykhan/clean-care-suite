-- Rename technician_email column to client_email
ALTER TABLE public.customer_service_reports 
RENAME COLUMN technician_email TO client_email;