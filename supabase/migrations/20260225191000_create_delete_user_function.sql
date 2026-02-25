CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the user from auth.users based on the current user's ID
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
