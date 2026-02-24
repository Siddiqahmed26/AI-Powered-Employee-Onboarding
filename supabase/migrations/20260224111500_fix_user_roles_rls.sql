-- First, make sure RLS is enabled on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own role
CREATE POLICY "Users can read own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow admins to read all roles
CREATE POLICY "Admins can read all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert/update/delete roles
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));
