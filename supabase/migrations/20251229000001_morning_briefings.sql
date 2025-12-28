-- Create morning_briefings table
CREATE TABLE IF NOT EXISTS morning_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT UNIQUE NOT NULL,
  global_markets JSONB NOT NULL,
  macro_data JSONB NOT NULL,
  ai_sentiment TEXT NOT NULL,
  top_news JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_morning_briefings_date ON morning_briefings(date DESC);

-- Enable RLS
ALTER TABLE morning_briefings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read briefings"
  ON morning_briefings FOR SELECT
  USING (auth.role() = 'authenticated');
