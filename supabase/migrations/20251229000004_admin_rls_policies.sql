-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );

-- Allow admins to update user subscription tiers
CREATE POLICY "Admins can update user tiers"
  ON profiles FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );

-- Allow admins to delete users
CREATE POLICY "Admins can delete users"
  ON profiles FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );

-- Allow admins to read all chat sessions
CREATE POLICY "Admins can read all chat sessions"
  ON chat_sessions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );

-- Allow admins to read all chat messages
CREATE POLICY "Admins can read all chat messages"
  ON chat_messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );

-- Allow admins to read all watchlists
CREATE POLICY "Admins can read all watchlists"
  ON watchlists FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );

-- Allow admins full access to glossary terms
CREATE POLICY "Admins can manage glossary terms"
  ON glossary_terms FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );

-- Allow admins to manage morning briefings
CREATE POLICY "Admins can manage morning briefings"
  ON morning_briefings FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );
