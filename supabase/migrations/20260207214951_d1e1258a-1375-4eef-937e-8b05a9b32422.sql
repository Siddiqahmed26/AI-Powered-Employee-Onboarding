
-- Create documents table for HR policies and Tool SOPs
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hr_policy', 'tool_sop')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view documents
CREATE POLICY "Authenticated users can view documents"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert documents
CREATE POLICY "Admins can insert documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete documents
CREATE POLICY "Admins can delete documents"
ON public.documents
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update documents
CREATE POLICY "Admins can update documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for hr-docs bucket (bucket already exists)
-- Allow authenticated users to read files
CREATE POLICY "Authenticated users can read hr-docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'hr-docs');

-- Allow admins to upload files
CREATE POLICY "Admins can upload to hr-docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hr-docs' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete files
CREATE POLICY "Admins can delete from hr-docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'hr-docs' AND public.has_role(auth.uid(), 'admin'));
