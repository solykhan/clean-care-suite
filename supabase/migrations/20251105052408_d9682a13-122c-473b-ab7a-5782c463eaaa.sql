-- Add technician_email column to customer_service_reports table
ALTER TABLE public.customer_service_reports 
ADD COLUMN technician_email text;