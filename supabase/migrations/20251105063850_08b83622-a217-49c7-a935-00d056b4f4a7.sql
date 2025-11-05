-- Add report_date column to customer_service_reports table
ALTER TABLE customer_service_reports 
ADD COLUMN report_date timestamp with time zone NOT NULL DEFAULT now();