-- Grant execute permission on has_role function to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
