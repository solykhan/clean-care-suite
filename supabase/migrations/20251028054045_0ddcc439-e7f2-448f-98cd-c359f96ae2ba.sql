-- Create customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id text UNIQUE NOT NULL,
  site_name text NOT NULL,
  site_street_name text,
  site_suburb text,
  site_post_code text,
  site_email_address text,
  date_cancel date,
  site_fax_no text,
  postal_address text,
  site_contact_first_name text,
  site_contact_lastname text,
  site_accounts_contact text,
  site_telephone_no1 text,
  site_telephone_no2 text,
  delete_tag boolean DEFAULT false,
  contract_date date,
  contract_notes text,
  notes text,
  site_pobox text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_agreements table
CREATE TABLE public.service_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id text NOT NULL REFERENCES public.customers(service_id) ON DELETE CASCADE,
  products text,
  areas_covered text,
  cpm_device_onsite text,
  service_frequency text,
  service_active_inactive text,
  unit_price decimal(10,2),
  cpm_pricing decimal(10,2),
  comments text,
  invoice_type text,
  cpi decimal(10,2),
  total decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_agreements ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
CREATE POLICY "Allow public read access to customers"
  ON public.customers FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to customers"
  ON public.customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to customers"
  ON public.customers FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete to customers"
  ON public.customers FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to service_agreements"
  ON public.service_agreements FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to service_agreements"
  ON public.service_agreements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to service_agreements"
  ON public.service_agreements FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete to service_agreements"
  ON public.service_agreements FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_customers_service_id ON public.customers(service_id);
CREATE INDEX idx_service_agreements_service_id ON public.service_agreements(service_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_agreements_updated_at
  BEFORE UPDATE ON public.service_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();