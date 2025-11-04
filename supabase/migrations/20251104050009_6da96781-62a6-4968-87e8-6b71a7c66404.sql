-- Add technician_name and site_officer_name columns to customer_service_reports table
ALTER TABLE public.customer_service_reports 
ADD COLUMN technician_name TEXT,
ADD COLUMN site_officer_name TEXT;