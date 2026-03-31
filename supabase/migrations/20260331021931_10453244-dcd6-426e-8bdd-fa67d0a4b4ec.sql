
ALTER TABLE public.runs 
ADD COLUMN original_technicians text DEFAULT NULL,
ADD COLUMN transferred boolean DEFAULT false;
