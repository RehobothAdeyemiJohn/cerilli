
-- Create SQL policy for orders table
CREATE POLICY "Enable all access to orders table" ON "public"."orders"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant full access to orders table
GRANT ALL ON "public"."orders" TO authenticated;
GRANT ALL ON "public"."orders" TO anon;
