-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'whale', 'admin')),
  user_level TEXT DEFAULT 'newbie' CHECK (user_level IN ('newbie', 'intermediate', 'advanced')),
  trading_style TEXT CHECK (trading_style IN ('scalper', 'swing', 'investor')),
  preferred_sectors TEXT[],
  daily_chat_count INTEGER DEFAULT 0,
  chat_limit INTEGER DEFAULT 10,
  last_chat_reset TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_tier ON profiles(subscription_tier);

-- Create AI providers table
CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('openai', 'pollinations')),
  base_url TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  model_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  rate_limit INTEGER DEFAULT 60,
  max_tokens INTEGER DEFAULT 4096,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  cost_per_1k_tokens DECIMAL(10,6),
  supports_streaming BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_providers_active ON ai_providers(is_active) WHERE is_active = TRUE;

-- Create chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  stock_context TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id, created_at DESC);
CREATE INDEX idx_chat_sessions_stock ON chat_sessions(stock_context) WHERE stock_context IS NOT NULL;

-- Create chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  provider_used TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at ASC);

-- Create watchlist table
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_code TEXT NOT NULL,
  notes TEXT,
  target_price_high DECIMAL(15,2),
  target_price_low DECIMAL(15,2),
  alert_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stock_code)
);

CREATE INDEX idx_watchlists_user ON watchlists(user_id);

-- Create stock fundamentals cache table
CREATE TABLE stock_fundamentals (
  stock_code TEXT PRIMARY KEY,
  stock_name TEXT,
  sector TEXT,
  subsector TEXT,
  market_cap BIGINT,
  price DECIMAL(15,2),
  change_percent DECIMAL(5,2),
  volume BIGINT,
  per DECIMAL(10,2),
  pbv DECIMAL(10,2),
  roe DECIMAL(10,2),
  der DECIMAL(10,2),
  dividend_yield DECIMAL(5,2),
  data_source TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_fundamentals_sector ON stock_fundamentals(sector);
CREATE INDEX idx_stock_fundamentals_updated ON stock_fundamentals(last_updated);

-- Create glossary terms table
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT UNIQUE NOT NULL,
  definition TEXT NOT NULL,
  eli5_analogy TEXT,
  category TEXT CHECK (category IN ('fundamental', 'technical', 'general')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_glossary_terms_category ON glossary_terms(category);

-- Create alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_code TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'volume_spike', 'ara', 'arb')),
  trigger_value DECIMAL(15,2),
  triggered_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON alerts(user_id, created_at DESC);
CREATE INDEX idx_alerts_unread ON alerts(user_id, is_read) WHERE is_read = FALSE;

-- Create auto-update trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ai_providers_updated_at
  BEFORE UPDATE ON ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
