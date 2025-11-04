-- Create customer_service_reports table
CREATE TABLE public.customer_service_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL,
  service_id TEXT,
  sanitary_bins NUMERIC,
  pedal_bins NUMERIC,
  sensor_bins NUMERIC,
  nappy_bins NUMERIC,
  medical_bins NUMERIC,
  sharps_1_4lt_8lt NUMERIC,
  air_fresheners NUMERIC,
  hand_soap NUMERIC,
  grit_soap NUMERIC,
  hand_sanitisers NUMERIC,
  sanitising_wipes NUMERIC,
  toilet_seat_sprays NUMERIC,
  wc_sanitisers NUMERIC,
  urinal_sanitisers NUMERIC,
  urinal_mats NUMERIC,
  urinal_treatment NUMERIC,
  others NUMERIC,
  comments TEXT,
  s_officer_sig TEXT,
  tech_sig TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_run_id FOREIGN KEY (run_id) REFERENCES public.runs(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.customer_service_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to customer_service_reports" 
ON public.customer_service_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to customer_service_reports" 
ON public.customer_service_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to customer_service_reports" 
ON public.customer_service_reports 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete to customer_service_reports" 
ON public.customer_service_reports 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customer_service_reports_updated_at
BEFORE UPDATE ON public.customer_service_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();