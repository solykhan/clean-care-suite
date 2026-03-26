
-- Allow technicians to read service agreements (needed for the customer service report form)
CREATE POLICY "Technicians can view service agreements"
  ON public.service_agreements FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'technician'::app_role));
