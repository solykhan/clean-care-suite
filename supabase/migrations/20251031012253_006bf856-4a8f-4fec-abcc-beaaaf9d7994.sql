-- Create runs table
CREATE TABLE public.runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id TEXT NOT NULL,
  clients TEXT,
  suburb TEXT,
  weeks TEXT,
  week_day TEXT,
  products TEXT,
  frequency TEXT,
  technicians TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access
CREATE POLICY "Allow public read access to runs"
ON public.runs
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to runs"
ON public.runs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to runs"
ON public.runs
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete to runs"
ON public.runs
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_runs_updated_at
BEFORE UPDATE ON public.runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();