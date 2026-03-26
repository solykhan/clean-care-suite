-- Allow technicians to insert their own service reports
CREATE POLICY "Technicians can insert service reports"
  ON public.customer_service_reports FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'technician'));

-- Allow technicians to view their own service reports
CREATE POLICY "Technicians can view own service reports"
  ON public.customer_service_reports FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'technician')
    AND technician_name = (
      SELECT username FROM public.profiles WHERE id = auth.uid()
    )
  );