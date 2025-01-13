CREATE OR REPLACE FUNCTION verify_admin_password(input_email TEXT, input_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_credentials
    WHERE email = input_email
    AND password_hash = crypt(input_password, password_hash)
  );
END;
$$;