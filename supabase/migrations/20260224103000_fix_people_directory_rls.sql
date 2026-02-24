-- Drop the old restrictive policy where users can only view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy allowing any authenticated employee to view the directory profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');
