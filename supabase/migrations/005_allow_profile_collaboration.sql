-- Allow authenticated users to view other profiles for collaboration purposes
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');