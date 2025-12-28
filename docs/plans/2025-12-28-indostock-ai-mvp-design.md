# IndoStock AI - MVP Technical Design

**Project:** IndoStock AI
**Version:** 1.0 MVP
**Date:** 2025-12-28
**Status:** Design Approved

---

## Executive Summary

IndoStock AI is an AI-powered stock analysis SaaS platform for Indonesian traders. This document outlines the technical design for the MVP (Minimum Viable Product) phase, focusing on building a working prototype with core features in 8 weeks.

### Unique Selling Points

- **AI-First Analysis**: Conversational AI that explains market data in plain Indonesian
- **Dynamic Brain**: Switch AI providers in real-time from admin panel without code changes
- **Newbie Friendly**: Auto-explains technical terms (PER, PBV, ROE) with ELI5 analogies
- **Morning Briefing**: Automated daily market summary before market open
- **AI Screener**: Natural language stock screening ("Saham murah dengan ROE tinggi")

---

## 1. Architecture Overview

### 1.1 Project Structure

```
indostock-ai/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth routes (sign-in, sign-up)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes (if needed for client-side calls)
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── chat/              # Chat-specific components
│   ├── stock/             # Stock display components
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Supabase client & helpers
│   ├── ai/                # AI provider abstraction layer
│   ├── data/              # Yahoo Finance & data fetching
│   └── utils/             # Utilities
├── supabase/
│   ├── migrations/        # Database migrations
│   └── seed.sql           # Initial data (glossary, etc.)
├── styles/
│   └── globals.css        # Global styles + design tokens
└── types/                 # TypeScript types
```

### 1.2 Tech Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | Next.js 14+ (App Router) | SSR, RSC, modern React patterns |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, customizable components |
| **State** | Zustand | Lightweight, simple API |
| **Backend** | Supabase Edge Functions | Serverless, close to database, Deno runtime |
| **Database** | Supabase PostgreSQL | Free tier, built-in Auth, RLS, Realtime |
| **Auth** | Supabase Auth | Google OAuth, email/password, magic links |
| **AI Primary** | OpenAI-compatible APIs | Groq, DeepSeek, OpenAI support |
| **AI Secondary** | Pollinations.ai | Free alternative with different API format |
| **Caching** | React Query + Supabase | Multi-layer caching strategy |
| **Charts** | TradingView Widgets | Professional, feature-rich charting |
| **Deployment** | Vercel (Frontend) + Supabase (Backend) | Free tiers, optimized DX |

### 1.3 Data Sources (All Free for MVP)

**Stock Prices:**
- Primary: Yahoo Finance (yfinance) - 15min delay, reliable
- Fallback: Google Finance - scraping backup
- Backup: Investing.com - scraping emergency

**Fundamentals:**
- Primary: Yahoo Finance (PER, PBV, ROE, Market Cap, Revenue)
- Secondary: Stockbit API (unofficial) - financial statements

**News:**
- Google News RSS Feed
- CNBC Indonesia RSS: `https://www.cnbcindonesia.com/market/rss`
- Bisnis.com RSS: `https://www.bisnis.com/rss`
- Kontan RSS: `https://www.kontan.co.id/rss`

**Macro Data:**
- Bank Indonesia: Interest rates, inflation, forex (scraping)
- Yahoo Finance: USD/IDR, commodities (Gold, Oil)
- FRED API: US economic data for global correlation

---

## 2. AI Provider System ("Dynamic Brain")

### 2.1 Multi-Provider Architecture

The core innovation is the ability to switch AI providers without code changes.

**Database Schema:**

```sql
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT only_one_active EXCLUDE (is_active WITH =) WHERE (is_active = TRUE)
);
```

### 2.2 AI Service Abstraction Layer

```typescript
// lib/ai/ai-service.ts
class AIService {
  async chat(messages: Message[], options?: ChatOptions): Promise<AIResponse> {
    // 1. Get active provider from DB (cached 5 minutes)
    const provider = await getActiveProvider();

    // 2. Route to correct adapter based on provider_type
    const adapter = provider.provider_type === "openai"
      ? new OpenAIAdapter(provider)
      : new PollinationsAdapter(provider);

    // 3. Execute with automatic fallback
    try {
      return await adapter.chat(messages, options);
    } catch (error) {
      return await this.chatWithFallback(messages, options);
    }
  }
}
```

### 2.3 Provider Adapters

**OpenAI-Compatible Adapter** (supports Groq, DeepSeek, OpenAI):

```typescript
class OpenAIAdapter {
  async chat(messages: Message[]): Promise<AIResponse> {
    const response = await fetch(`${this.provider.base_url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${decryptKey(this.provider.api_key_encrypted)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.provider.model_name,
        messages: messages,
        stream: this.provider.supports_streaming
      })
    });
    return response.json();
  }
}
```

**Pollinations Adapter:**

```typescript
class PollinationsAdapter {
  async chat(messages: Message[]): Promise<AIResponse> {
    const response = await fetch(`${this.provider.base_url}/openai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.provider.model_name,
        messages: messages
      })
    });
    return response.json();
  }
}
```

### 2.4 Admin Panel Integration

Admins manage providers through UI → writes to `ai_providers` table → set `is_active = true` → system caches active provider for 5 minutes.

---

## 3. Database Schema

### 3.1 Core Tables

**Profiles (extends Supabase Auth):**

```sql
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

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_tier ON profiles(subscription_tier);
```

**Chat Sessions & Messages:**

```sql
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
```

**Watchlist:**

```sql
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
```

**Stock Fundamentals Cache:**

```sql
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
```

**Glossary Terms:**

```sql
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT UNIQUE NOT NULL,
  definition TEXT NOT NULL,
  eli5_analogy TEXT,
  category TEXT CHECK (category IN ('fundamental', 'technical', 'general')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Alerts:**

```sql
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
```

### 3.2 Row Level Security (RLS)

```sql
-- Profiles: Users can only see/update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Chat sessions: Users can only access their own
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own chat sessions"
  ON chat_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Chat messages: Access via session ownership
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- AI providers: Admin only
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage AI providers"
  ON ai_providers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.subscription_tier = 'admin'
    )
  );
```

### 3.3 Triggers & Functions

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## 4. Frontend Design System

### 4.1 Brand Identity - "IndoStock AI"

**Color Palette:**

```css
/* Primary - Indonesian Market Blue */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-900: #1e3a8a;

/* Success - Stock Growth Green */
--success-500: #10b981;
--success-600: #059669;

/* Danger - Stock Loss Red */
--danger-500: #ef4444;
--danger-600: #dc2626;

/* Neutral - Modern Grays */
--neutral-50: #fafafa;
--neutral-800: #262626;
--neutral-900: #171717;

/* Semantic */
--background: #ffffff;
--background-secondary: #f8fafc;
--foreground: #0f172a;
--muted: #64748b;
--border: #e2e8f0;
```

**Typography:**

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Type Scale (16px base) */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-4xl: 2.25rem;   /* 36px */
```

**Spacing (8px grid):**

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

**Border Radius:**

```css
--radius-sm: 0.375rem;  /* 6px - Buttons, inputs */
--radius-md: 0.5rem;    /* 8px - Cards */
--radius-lg: 0.75rem;   /* 12px - Modals */
--radius-xl: 1rem;      /* 16px - Hero sections */
```

### 4.2 Component Architecture

**Base Components (shadcn/ui):**
- Button, Input, Card, Dialog, Dropdown, Tabs, Tooltip
- Customized with IndoStock AI brand colors

**Custom Components:**

```typescript
// Stock Components
StockCard                  // Display stock with price, change%, actions
StockChart                 // TradingView Advanced Chart wrapper
FundamentalMetrics         // PER, PBV, ROE with ELI5 tooltips

// Chat Components
ChatInterface              // Main chat UI with streaming
AIMessage                  // AI response with glossary detection
GlossaryTooltip           // Hover tooltip with term + analogy

// Dashboard Components
MorningBriefing           // Daily briefing card
WatchlistWidget           // Quick watchlist view
```

### 4.3 Page Layouts

**Dashboard Layout:**

```
┌─────────────────────────────────────────────────────┐
│ Navbar: Logo | Search | Watchlist | Profile         │
├──────────────┬──────────────────────────────────────┤
│              │  Morning Briefing Card               │
│  Sidebar     │  ┌────────────┬───────────────────┐  │
│  - Dashboard │  │ IHSG: 7234 │ USD/IDR: 15,823  │  │
│  - Chat      │  │ +0.45%     │ +0.12%           │  │
│  - Screener  │  └────────────┴───────────────────┘  │
│  - Watchlist │                                       │
│  - Settings  │  Watchlist Widget                    │
│              │  [BBRI, TLKM, BBCA...]               │
└──────────────┴──────────────────────────────────────┘
```

**Chat Page Layout:**

```
┌─────────────────────────────────────────────────────┐
│ Chat Header: Session Title | New Chat               │
├──────────────┬──────────────────────────────────────┤
│ Chat History │  Messages Area                       │
│ (Sidebar)    │  ┌────────────────────────────────┐  │
│              │  │ User: Analisa BBRI dong        │  │
│ [+] New Chat │  └────────────────────────────────┘  │
│              │  ┌────────────────────────────────┐  │
│ Recent:      │  │ AI: BBRI saat ini...           │  │
│ • BBRI       │  │ [Chart] [Metrics]              │  │
│ • TLKM       │  │ *PER: 9.2x (hover for ELI5)    │  │
│              │  └────────────────────────────────┘  │
│              │                                       │
│              │  Input: [Type your question...]      │
└──────────────┴──────────────────────────────────────┘
```

### 4.4 Responsive Breakpoints

- **Desktop (1280px+):** Full sidebar + main content
- **Tablet (768px-1279px):** Collapsible sidebar
- **Mobile (<768px):** Bottom navigation, stacked layout

---

## 5. Data Fetching & Caching

### 5.1 Multi-Source Fallback Strategy

```typescript
// lib/data/stock-price-fetcher.ts
class StockPriceFetcher {
  private sources = [
    { name: 'yahoo', fetcher: fetchFromYahoo, priority: 1 },
    { name: 'google', fetcher: fetchFromGoogle, priority: 2 },
    { name: 'investing', fetcher: fetchFromInvesting, priority: 3 }
  ];

  async getStockPrice(stockCode: string): Promise<StockPrice> {
    // 1. Check cache first
    const cached = await this.getFromCache(stockCode);
    if (cached && !this.isStale(cached)) return cached;

    // 2. Try sources in priority order
    for (const source of this.sources) {
      try {
        const data = await source.fetcher(stockCode);
        await this.saveToCache(stockCode, data, source.name);
        return data;
      } catch (error) {
        continue;
      }
    }

    // 3. Return stale cache or throw
    if (cached) return { ...cached, isStale: true };
    throw new Error('All data sources failed');
  }
}
```

### 5.2 Multi-Layer Cache

| Layer | Technology | TTL | Use Case |
|-------|------------|-----|----------|
| L1 Client | React Query | 30s (prices), 5min (fundamentals) | User session cache |
| L2 Edge | Vercel Edge Config | 1min (prices), 15min (fundamentals) | Shared across users |
| L3 Database | Supabase table | 5min (prices), 1 day (fundamentals) | Persistent storage |

**React Query Example:**

```typescript
const useStockPrice = (stockCode: string) => {
  return useQuery({
    queryKey: ['stock-price', stockCode],
    queryFn: () => fetchStockPrice(stockCode),
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000 // During market hours
  });
};
```

### 5.3 News Aggregation (Cron Job)

**Supabase Edge Function (runs every 15 minutes):**

```typescript
const NEWS_SOURCES = [
  { name: 'CNBC Indonesia', rss_url: 'https://www.cnbcindonesia.com/market/rss' },
  { name: 'Bisnis.com', rss_url: 'https://www.bisnis.com/rss' },
  { name: 'Kontan', rss_url: 'https://www.kontan.co.id/rss' }
];

async function aggregateNews() {
  const allNews = [];

  for (const source of NEWS_SOURCES) {
    const feed = await parseFeed(source.rss_url);
    const articles = feed.items.map(item => ({
      title: item.title,
      summary: item.contentSnippet,
      url: item.link,
      published_at: item.pubDate,
      source: source.name,
      mentioned_stocks: extractStockCodes(item.title + item.contentSnippet)
    }));
    allNews.push(...articles);
  }

  await supabase.from('news_articles').upsert(allNews);
}
```

### 5.4 Data Freshness Policy

| Data Type | Cache Duration | Refresh Strategy |
|-----------|----------------|------------------|
| Stock Prices | 30s-1min | Background refetch during market hours |
| Fundamentals | 1 day | On-demand + nightly batch job |
| News | 15 minutes | Cron job aggregator |
| Macro Data | 6 hours | Scheduled Edge Function |
| IHSG Index | 1 minute | Real-time polling (market hours) |
| Watchlist Alerts | Real-time | Supabase Realtime subscription |

---

## 6. Authentication & User Flow

### 6.1 Authentication Methods

**Supabase Auth Configuration:**

- **Google OAuth:** Primary (one-click sign up)
- **Email + Password:** Secondary
- **Magic Link:** Phase 2

```typescript
// Sign in with Google
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
}
```

### 6.2 User Onboarding Flow

**3-Step Onboarding:**

1. **Level Selection:** Newbie / Intermediate / Advanced
2. **Trading Style:** Scalper / Swing / Investor
3. **Sector Preferences:** Banking, Mining, Consumer, etc. (optional, multi-select)

```typescript
const ONBOARDING_STEPS = [
  {
    step: 1,
    title: 'Selamat datang di IndoStock AI! 👋',
    question: 'Apa level trading kamu?',
    field: 'user_level',
    options: [
      { value: 'newbie', label: 'Pemula', description: 'Baru belajar saham' },
      { value: 'intermediate', label: 'Menengah', description: 'Sudah paham dasar' },
      { value: 'advanced', label: 'Mahir', description: 'Trader berpengalaman' }
    ]
  },
  // ... steps 2 & 3
];
```

### 6.3 User Journey

**First-Time User:**

```
Landing Page
   ↓ "Mulai Gratis"
Sign Up (Google / Email)
   ↓
Onboarding (3 steps)
   ↓
Dashboard with tutorial overlay
   ↓
First chat: "Coba tanya apa saja tentang saham!"
```

**Returning User (Daily Flow):**

```
08:00 WIB: User opens app
   ↓
Morning Briefing displayed
   ↓
Check watchlist alerts
   ↓
Chat: "Gimana prospek BBCA hari ini?"
   ↓
AI responds with context (price + news)
   ↓
User satisfied → Close
```

### 6.4 Protected Routes (Middleware)

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const session = await getSession();

  // Redirect unauthenticated users
  const protectedPaths = ['/dashboard', '/chat', '/watchlist', '/admin'];
  if (isProtectedPath && !session) {
    return NextResponse.redirect('/auth/sign-in?redirectTo=' + req.url);
  }

  // Redirect to onboarding if not completed
  if (session && !profile.onboarding_completed) {
    return NextResponse.redirect('/onboarding');
  }

  // Admin-only routes
  if (req.url.startsWith('/admin') && profile.subscription_tier !== 'admin') {
    return NextResponse.redirect('/dashboard');
  }
}
```

### 6.5 Rate Limiting

```typescript
async function checkChatLimit(userId: string) {
  const profile = await getProfile(userId);

  // Reset counter if new day
  if (isNewDay(profile.last_chat_reset)) {
    await resetChatCount(userId);
    return { allowed: true, remaining: profile.chat_limit - 1 };
  }

  // Check limit
  if (profile.daily_chat_count >= profile.chat_limit) {
    return { allowed: false, remaining: 0, upgradeRequired: true };
  }

  // Increment counter
  await incrementChatCount(userId);
  return { allowed: true, remaining: profile.chat_limit - profile.daily_chat_count - 1 };
}
```

---

## 7. Core Features Implementation

### 7.1 AI Chat Module

**Supabase Edge Function: `ai-chat`**

```typescript
serve(async (req) => {
  const { messages, sessionId, stockCode } = await req.json();

  // 1. Rate limit check
  const { allowed } = await checkChatLimit(userId);
  if (!allowed) return new Response(JSON.stringify({ error: 'Daily limit reached' }), { status: 429 });

  // 2. Get active AI provider
  const provider = await getActiveProvider();

  // 3. Fetch real-time context
  const context = stockCode ? await buildStockContext(stockCode) : '';

  // 4. Get user profile for personalization
  const profile = await getProfile(userId);

  // 5. Build system prompt
  const systemPrompt = buildSystemPrompt({
    userLevel: profile.user_level,
    tradingStyle: profile.trading_style,
    context: context
  });

  // 6. Call AI with streaming
  const aiService = new AIService(provider);
  const stream = await aiService.chatStream([
    { role: 'system', content: systemPrompt },
    ...messages
  ]);

  // 7. Return streaming response
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
});
```

**System Prompt Template:**

```typescript
function buildSystemPrompt({ userLevel, tradingStyle, context }) {
  let prompt = `Kamu adalah asisten analisis saham Indonesia yang cerdas dan berpengalaman.

**Karaktermu:**
- Ramah dan mudah dimengerti
- Berbahasa Indonesia santai tapi profesional
- Selalu kasih alasan ("kenapa") bukan cuma fakta
- Gunakan analogi sederhana untuk konsep rumit

**User Info:**
- Level: ${userLevel}
- Style: ${tradingStyle}
`;

  if (userLevel === 'newbie') {
    prompt += `\n**Mode Pemula:**
- Jelaskan istilah teknis (PER, PBV, ROE) dengan analogi ELI5
- Hindari jargon tanpa penjelasan
- Berikan contoh konkret\n`;
  }

  if (context) {
    prompt += `\n**Context Data Terkini:**\n${context}\n`;
  }

  prompt += `\n**PENTING:**
- Selalu akhiri dengan disclaimer: "Ini bukan rekomendasi investasi, lakukan riset sendiri."
- Jika ditanya rekomendasi beli/jual, kasih analisa tapi user yang putuskan
- Jangan prediksi harga pasti, fokus ke analisa fundamental & teknikal\n`;

  return prompt;
}
```

**Glossary Auto-Detection:**

```typescript
// components/chat/AIMessage.tsx
function AIMessage({ content }) {
  const glossaryTerms = ['PER', 'PBV', 'ROE', 'DER', 'ARA', 'ARB', 'IHSG'];

  const enrichedContent = content.split(' ').map((word, i) => {
    const cleanWord = word.replace(/[.,!?]/g, '');

    if (glossaryTerms.includes(cleanWord.toUpperCase())) {
      return (
        <GlossaryTooltip key={i} term={cleanWord}>
          {word}
        </GlossaryTooltip>
      );
    }
    return word + ' ';
  });

  return <div className="prose">{enrichedContent}</div>;
}
```

### 7.2 AI Stock Screener

**Natural Language → SQL:**

```typescript
async function naturalLanguageScreener(query: string) {
  // 1. AI parses intent → generates JSON filters
  const filterPrompt = `Convert this to JSON filters:

  Request: "${query}"
  Available: per, pbv, roe, der, market_cap, sector, dividend_yield

  Return JSON:
  { "filters": { "pbv": { "operator": "<", "value": 1 } }, "sector": "banking" }`;

  const aiResponse = await aiService.chat([{ role: 'user', content: filterPrompt }]);
  const filters = JSON.parse(aiResponse.content);

  // 2. Build SQL query
  let query = supabase.from('stock_fundamentals').select('*');
  for (const [key, condition] of Object.entries(filters.filters)) {
    query = query.filter(key, condition.operator, condition.value);
  }
  if (filters.sector) query = query.eq('sector', filters.sector);

  const { data: stocks } = await query.limit(20);

  // 3. AI commentary
  const commentary = await aiService.chat([
    { role: 'user', content: `Explain why these stocks match "${query}":\n${JSON.stringify(stocks.slice(0, 5))}` }
  ]);

  return { stocks, commentary: commentary.content };
}
```

### 7.3 Morning Briefing

**Cron Job (runs daily at 06:00 WIB):**

```typescript
// Supabase Edge Function: generate-morning-briefing
async function generateMorningBriefing() {
  // 1. Fetch overnight global markets
  const globalMarkets = await fetchGlobalIndices(); // Dow, S&P, Nikkei, HSI

  // 2. Fetch forex & commodities
  const macroData = await fetchMacroData(); // USD/IDR, Gold, Oil

  // 3. Fetch top news (last 24 hours)
  const news = await supabase
    .from('news_articles')
    .select('*')
    .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000))
    .order('published_at', { ascending: false })
    .limit(10);

  // 4. AI sentiment analysis
  const sentimentPrompt = `Analyze sentiment dari berita ini:
${news.map(n => `- ${n.title}`).join('\n')}

Format:
- Sentimen: [Bullish/Bearish/Neutral]
- Ringkasan: [2-3 kalimat]
- Sektor Menarik: [1-2 sektor]`;

  const sentiment = await aiService.chat([{ role: 'user', content: sentimentPrompt }]);

  // 5. Save to database
  await supabase.from('morning_briefings').insert({
    date: new Date().toISOString().split('T')[0],
    global_markets: globalMarkets,
    macro_data: macroData,
    top_news: news.slice(0, 5),
    ai_sentiment: sentiment.content,
    generated_at: new Date()
  });
}
```

### 7.4 Watchlist & Alerts

**Real-Time Price Monitoring (runs every 1 minute during market hours):**

```typescript
async function checkWatchlistAlerts() {
  // 1. Get all active watchlists
  const watchlists = await supabase
    .from('watchlists')
    .select('*')
    .eq('alert_enabled', true);

  // 2. Fetch current prices
  const uniqueStocks = [...new Set(watchlists.map(w => w.stock_code))];
  const prices = await fetchStockPrices(uniqueStocks);

  // 3. Check conditions & trigger alerts
  for (const watchlist of watchlists) {
    const currentPrice = prices[watchlist.stock_code];

    // Price target alerts
    if (watchlist.target_price_high && currentPrice.price >= watchlist.target_price_high) {
      await createAlert({
        user_id: watchlist.user_id,
        stock_code: watchlist.stock_code,
        alert_type: 'price_above',
        trigger_value: currentPrice.price
      });
    }

    // Volume spike (>2x average)
    if (currentPrice.volume > currentPrice.avg_volume * 2) {
      await createAlert({
        user_id: watchlist.user_id,
        stock_code: watchlist.stock_code,
        alert_type: 'volume_spike',
        trigger_value: currentPrice.volume
      });
    }
  }
}
```

**Client-side Realtime Subscription:**

```typescript
const alertsSubscription = supabase
  .channel('alerts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'alerts',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    toast({
      title: `${payload.new.stock_code} Alert!`,
      description: formatAlertMessage(payload.new)
    });
  })
  .subscribe();
```

### 7.5 Stock Detail Page

**Server Component with ISR:**

```typescript
// app/(dashboard)/stock/[code]/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export async function generateStaticParams() {
  const lq45 = ['BBRI', 'BBCA', 'TLKM', 'ASII', /* ... */];
  return lq45.map(code => ({ code }));
}

export default async function StockDetailPage({ params }) {
  const stockCode = params.code;

  // Parallel data fetching
  const [price, fundamentals, news, aiSummary] = await Promise.all([
    fetchStockPrice(stockCode),
    fetchFundamentals(stockCode),
    fetchStockNews(stockCode, limit: 5),
    generateAISummary(stockCode) // Cached 1 hour
  ]);

  return (
    <div className="container mx-auto p-6">
      <StockHeader stock={price} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradingViewChart stockCode={stockCode} />
          <AISummaryCard summary={aiSummary} />
          <NewsSection news={news} />
        </div>
        <div>
          <FundamentalMetrics data={fundamentals} />
          <SimilarStocksCard stockCode={stockCode} />
        </div>
      </div>
    </div>
  );
}
```

---

## 8. MVP Implementation Roadmap

### Week 1-2: Foundation
- [ ] Next.js 14 project setup with TypeScript
- [ ] Tailwind CSS + shadcn/ui configuration
- [ ] Supabase project connection (placeholder credentials)
- [ ] Database schema creation + migrations
- [ ] Basic authentication (Google OAuth + Email)
- [ ] Landing page with hero + features
- [ ] Basic routing structure

### Week 3-4: Core AI Chat
- [ ] AI provider database table + RLS
- [ ] AI service abstraction layer (OpenAI + Pollinations adapters)
- [ ] Admin panel for AI provider management
- [ ] Chat interface UI with message history
- [ ] Streaming response implementation
- [ ] Yahoo Finance integration (price + fundamentals)
- [ ] System prompt engineering

### Week 5-6: Data & Features
- [ ] Stock detail page with TradingView chart
- [ ] Watchlist CRUD operations
- [ ] Glossary table seed + GlossaryTooltip component
- [ ] User onboarding flow (3 steps)
- [ ] News aggregation Edge Function
- [ ] Basic screener (manual filters)

### Week 7-8: Polish & Launch
- [ ] Morning Briefing generation (basic version)
- [ ] Mobile responsive design
- [ ] Performance optimization (caching, prefetch)
- [ ] Loading states + error handling
- [ ] Beta testing with 10-20 users
- [ ] Bug fixes
- [ ] Soft launch to public

---

## 9. Security Considerations

### 9.1 API Key Protection

- API keys stored encrypted in database (pgcrypto)
- Never exposed to frontend
- All AI calls via Supabase Edge Functions
- Rate limiting per user tier

### 9.2 Data Protection

- RLS enabled on all user tables
- Input sanitization for user queries
- Parameterized SQL queries (no string concatenation)
- XSS prevention (React escapes by default)

### 9.3 Compliance

- Investment disclaimer on every AI response
- Privacy policy & Terms of Service
- Data retention policy (30 days for free tier)
- GDPR-compliant data deletion on request

---

## 10. Success Metrics

### MVP Launch (Month 1-2)

| Metric | Target |
|--------|--------|
| Registered Users | 500 |
| Daily Active Users | 50 |
| Chats per day | 200 |
| NPS Score | > 30 |

### Growth Phase (Month 3-6)

| Metric | Target |
|--------|--------|
| Registered Users | 5,000 |
| Pro Subscribers | 100 (2% conversion) |
| MRR | Rp 7,900,000 |
| Churn Rate | < 10% |

---

## 11. Risk Mitigation

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Yahoo Finance API blocked | Medium | Multiple fallback sources (Google, Investing.com) |
| AI hallucination | High | Always inject fresh data + clear disclaimer |
| Competitor launch | Medium | Focus on simplicity & price advantage |
| Data source down | Low | Multi-layer caching + graceful degradation |
| AI cost overrun | Medium | Rate limiting + cost monitoring + cheaper models |

---

## 12. Next Steps

1. **Environment Setup:** Create Supabase project, get credentials
2. **Project Initialization:** Run `npx create-next-app@latest` with config
3. **Database Setup:** Run migrations, seed glossary data
4. **AI Provider Setup:** Get API keys (Groq free tier, Pollinations)
5. **Implementation:** Follow weekly roadmap
6. **Testing:** Beta test with 10-20 users before public launch

---

**Document Version:** 1.0
**Last Updated:** 2025-12-28
**Status:** Ready for Implementation

---

## Appendix A: Initial Glossary Seed Data

```sql
INSERT INTO glossary_terms (term, definition, eli5_analogy, category) VALUES
('IHSG', 'Indeks Harga Saham Gabungan', 'Nilai rata-rata semua saham di BEI, kayak nilai rapor kelas', 'general'),
('ARA', 'Auto Reject Atas', 'Batas naik maksimal harga saham per hari, biar gak gila-gilaan', 'general'),
('ARB', 'Auto Reject Bawah', 'Batas turun maksimal, perlindungan biar gak anjlok seketika', 'general'),
('Lot', '1 Lot = 100 lembar saham', 'Paket minimal beli saham, kayak beli gorengan minimal 1 bungkus', 'general'),
('PER', 'Price to Earnings Ratio', 'Berapa tahun balik modal dari laba. Makin kecil makin cepet balik modal', 'fundamental'),
('PBV', 'Price to Book Value', 'Harga saham dibanding nilai bukunya. Kayak beli barang second, mahal atau murah dari harga asli', 'fundamental'),
('ROE', 'Return on Equity', 'Seberapa jago perusahaan pake duit investor buat cari untung', 'fundamental'),
('DER', 'Debt to Equity Ratio', 'Perbandingan utang vs modal. Makin kecil makin sehat', 'fundamental'),
('Dividen', 'Pembagian laba ke pemegang saham', 'Bonus tahunan buat pemilik saham, kayak THR', 'fundamental'),
('Blue Chip', 'Saham perusahaan besar & stabil', 'Saham pemain utama, kayak pemain bintang di klub bola', 'general');
```

## Appendix B: Environment Variables Template

```env
# Supabase (get from supabase.com dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Keys (managed in database, not .env)
# Use Admin Panel to configure

# Optional: Analytics (Phase 2)
# NEXT_PUBLIC_POSTHOG_KEY=
```

## Appendix C: Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Supabase (syntax highlighting for SQL)
- TypeScript + JavaScript
- Error Lens
