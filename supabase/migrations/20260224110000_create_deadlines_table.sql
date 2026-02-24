-- Create company_deadlines table
CREATE TABLE public.company_deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.company_deadlines ENABLE ROW LEVEL SECURITY;

-- Admins can manage deadlines
CREATE POLICY "Admins can manage deadlines" ON public.company_deadlines
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- All authenticated users can read deadlines
CREATE POLICY "Authenticated users can view deadlines" ON public.company_deadlines
    FOR SELECT USING (auth.role() = 'authenticated');
