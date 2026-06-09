-- Define overloaded get_current_user_role(uuid) function
CREATE OR REPLACE FUNCTION public.get_current_user_role(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN public.get_user_role_secure(user_uuid);
END;
$$;
