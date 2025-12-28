-- Add INSERT policy for morning_briefings (service_role only)
CREATE POLICY "Allow service role to insert briefings"
  ON morning_briefings FOR INSERT
  WITH CHECK (auth.role() IN ('service_role', 'authenticated'));

-- Add UPDATE policy for morning_briefings (for upsert)
CREATE POLICY "Allow service role to update briefings"
  ON morning_briefings FOR UPDATE
  USING (auth.role() IN ('service_role', 'authenticated'));
