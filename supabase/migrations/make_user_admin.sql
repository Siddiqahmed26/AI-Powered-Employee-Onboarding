-- First, you need to know your user ID.
-- Replace 'YOUR_EMAIL_HERE' with the email address of the account you want to make an Admin.

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Look up the UUID of the user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'YOUR_EMAIL_HERE';

    IF target_user_id IS NOT NULL THEN
        -- Insert or update the user_roles table to make them an admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE 
        SET role = 'admin';

        RAISE NOTICE 'User has been made an admin!';
    ELSE
        RAISE EXCEPTION 'Could not find a user with that email. Make sure they have signed up first.';
    END IF;
END $$;
