# Product Requirements Document (PRD)

**Project Name:** IndoStock AI  
**Version:** 1.0 (MVP Phase)  
**Date:** 28 Desember 2025  
**Target Market:** Trader Saham Indonesia (IDX)

---

## 1. Ringkasan Eksekutif

Platform SaaS berbasis web yang berfungsi sebagai **asisten pribadi cerdas** untuk trader saham Indonesia. Platform ini menggunakan LLM (Large Language Model) sebagai "otak" untuk menganalisis data pasar, berita, dan laporan keuangan, kemudian menyajikannya dalam bahasa yang mudah dipahami oleh pemula, namun tetap berbobot untuk user tingkat lanjut.

### Unique Selling Point (USP)

| USP | Deskripsi |
|-----|-----------|
| **🧠 AI-First** | Analisa bukan berupa tabel kaku, melainkan percakapan dan ringkasan naratif |
| **🔄 Dynamic Brain** | Kemampuan mengganti model AI secara real-time dari admin panel tanpa coding ulang |
| **🎓 Newbie Friendly** | Menjelaskan istilah saham (PER, PBV, Support/Resist) secara otomatis dengan analogi sederhana |
| **📰 Morning Briefing** | Ringkasan pasar harian otomatis sebelum market buka |
| **🔍 AI Screener** | Cari saham dengan bahasa natural: "Saham murah dengan ROE tinggi" |

---

## 2. Target Pengguna (User Personas)

### 2.1 The Newbie (Primary Target - 60%)
- **Profile:** Baru belajar saham, bingung membaca laporan keuangan dan grafik candle
- **Pain Point:** Tidak paham istilah teknis, takut salah beli
- **Need:** *"Saham BBRI bagus gak buat dibeli sekarang? Kenapa?"* (Butuh alasan naratif dengan bahasa sederhana)
- **Feature Priority:** ELI5 Mode, Glossary Tooltip, Chat AI

### 2.2 The Intermediate (Secondary - 30%)
- **Profile:** Sudah paham teknikal dasar, butuh konfirmasi atau second opinion
- **Pain Point:** Riset manual memakan waktu, miss informasi penting
- **Need:** Screener cepat & rangkuman berita sentimen pasar hari ini
- **Feature Priority:** AI Screener, Morning Briefing, Watchlist + Alert

### 2.3 The Advanced (Tertiary - 10%)
- **Profile:** Trader berpengalaman yang butuh efisiensi waktu riset
- **Pain Point:** Data tersebar di banyak platform
- **Need:** Deep dive analisa fundamental dan korelasi makroekonomi secara instan
- **Feature Priority:** Advanced Ratio Analysis, Foreign Flow Data, API Access

---

## 3. Sumber Data (Data Sources)

> [!IMPORTANT]
> **Prioritas MVP:** Gunakan sumber data GRATIS terlebih dahulu untuk menekan biaya pengembangan.

### 3.1 Data Harga Saham (Free Sources)

| Source | Type | Delay | Coverage | Reliability | Priority |
|--------|------|-------|----------|-------------|----------|
| **Yahoo Finance (yfinance)** | Python Library | 15 min | IDX via `.JK` suffix | ⭐⭐⭐⭐ | 🥇 Primary |
| **Google Finance** | Scraping | 15 min | IDX supported | ⭐⭐⭐ | 🥈 Fallback |
| **Investing.com** | Scraping | 15 min | IDX + Global | ⭐⭐⭐ | 🥉 Backup |
| **IDX Website** | Scraping | Real-time | Official IDX | ⭐⭐ (unstable) | Emergency |

**Implementasi Yahoo Finance:**
```python
import yfinance as yf

# Contoh: Ambil data BBRI
bbri = yf.Ticker("BBRI.JK")
info = bbri.info  # Fundamental data
history = bbri.history(period="1mo")  # Price history
```

### 3.2 Data Fundamental (Free Sources)

| Source | Data Available | Format | Priority |
|--------|----------------|--------|----------|
| **Yahoo Finance** | PER, PBV, ROE, Market Cap, Revenue | JSON via yfinance | 🥇 Primary |
| **Stockbit API (Unofficial)** | Laporan Keuangan, Rasio | JSON | 🥈 Secondary |
| **IDX Annual Report** | Full Financial Statement | PDF (perlu parsing) | Manual backup |

### 3.3 Data Berita (Free Sources)

| Source | Language | Method | Priority |
|--------|----------|--------|----------|
| **Google News RSS** | ID/EN | RSS Feed | 🥇 Primary |
| **CNBC Indonesia** | ID | RSS/Scraping | 🥈 Secondary |
| **Bisnis.com** | ID | RSS Feed | 🥉 Tertiary |
| **Kontan.co.id** | ID | RSS Feed | Backup |
| **IDX News** | ID | Scraping | Official source |

**RSS Feed URLs:**
```
CNBC Indonesia: https://www.cnbcindonesia.com/market/rss
Bisnis.com: https://www.bisnis.com/rss
Kontan: https://www.kontan.co.id/rss
```

### 3.4 Data Makroekonomi (Free Sources)

| Source | Data | Method |
|--------|------|--------|
| **Bank Indonesia** | Suku Bunga, Kurs, Inflasi | Scraping/API |
| **Yahoo Finance** | USD/IDR, Commodities (Gold, Oil) | yfinance |
| **FRED API** | US Economic Data (untuk korelasi global) | Free API |

### 3.5 Paid Sources (Phase 2+)

| Source | Cost | Benefit |
|--------|------|---------|
| **GoAPI.id** | ~Rp 500k/bulan | Real-time IDX, Broker Summary |
| **RTI Business** | Negosiasi | Foreign Flow, Bandarmology |
| **IDX Data Feed** | Mahal | Official real-time tick data |

---

## 4. Spesifikasi Teknis (Tech Stack)

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    Next.js (App Router)                         │
│                    Deploy: Vercel (Free)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND / BFF                              │
│              Supabase Edge Functions (Deno)                     │
│  • AI Chat Handler                                              │
│  • Market Data Fetcher (Yahoo Finance)                          │
│  • News Aggregator                                              │
│  • Screener Engine                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   SUPABASE DB   │  │   AI PROVIDERS  │  │  DATA SOURCES   │
│   PostgreSQL    │  │ • OpenAI        │  │ • Yahoo Finance │
│   Auth          │  │ • Groq (Fast)   │  │ • Google News   │
│   Realtime      │  │ • DeepSeek      │  │ • RSS Feeds     │
│   Storage       │  │ • Pollinations  │  │ • BI/BPS        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 4.2 Tech Stack Detail

| Layer | Technology | Reason |
|-------|------------|--------|
| **Frontend** | Next.js 14+ (App Router) | SSR, RSC, modern React |
| **Styling** | Tailwind CSS + shadcn/ui | Fast development, modern UI |
| **State** | Zustand / Jotai | Lightweight state management |
| **Backend** | Supabase Edge Functions | Serverless, close to DB |
| **Database** | Supabase PostgreSQL | Free tier generous, RLS built-in |
| **Auth** | Supabase Auth | Google, Email, Magic Link |
| **AI Primary** | Groq (Llama 3.1 70B) | Fast & Free tier available |
| **AI Backup** | DeepSeek / Pollinations | Cost-effective alternatives |
| **Caching** | Supabase + Vercel Edge | Reduce API calls |
| **Charting** | Lightweight Charts (TradingView) | Free, fast, modern |

### 4.3 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Keys (stored in DB, not .env - for dynamic switching)
# Managed via Admin Panel

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## 5. Fitur Utama (Core Features)

### 5.1 🧠 AI Chat Module (The Brain)

**Capabilities:**
- Natural Language Query: *"Analisa saham TLKM dong"*
- Context Aware: Mengerti lot, fraksi harga, ARA/ARB, IHSG
- Multi-Turn Conversation: Ingat konteks percakapan sebelumnya
- ELI5 Mode: Otomatis jelaskan istilah teknis dengan analogi

**Prompt Engineering:**
```
System Prompt Structure:
1. Persona: Analis saham Indonesia berpengalaman
2. Language: Bahasa Indonesia santai tapi profesional
3. Context Injection: Data harga + berita terkini
4. User Level: Newbie/Intermediate/Advanced (personalized)
5. Disclaimer: Selalu akhiri dengan disclaimer investasi
```

**Request Flow:**
```
User Input → Edge Function:
  1. Get active AI config from DB
  2. Fetch real-time price from Yahoo Finance
  3. Fetch latest news from RSS
  4. Compose prompt with context
  5. Call AI Provider
  6. Format & return response
```

### 5.2 🔍 AI Stock Screener

**Natural Language Queries:**
- *"Saham dengan PBV < 1 dan ROE > 15%"*
- *"Saham banking yang undervalued"*
- *"Blue chip dengan dividen tinggi"*

**MVP Implementation:**
1. Pre-fetch fundamental data semua saham LQ45/IDX30 (cached daily)
2. Store di Supabase table `stock_fundamentals`
3. AI menerjemahkan query → SQL filter
4. Return hasil + AI commentary

### 5.3 📰 Morning Briefing

**Content (Auto-generated 06:00 WIB):**
1. **Global Overnight:** Dow, S&P 500, Nikkei, Hang Seng
2. **Forex & Commodities:** USD/IDR, Gold, Oil, CPO
3. **Top News:** 5 berita terpenting dari RSS aggregation
4. **Sentiment:** AI analysis dari news (Bullish/Bearish/Neutral)
5. **Watchlist Alert:** Perubahan signifikan di saham user

**Delivery:**
- Dashboard widget (default)
- Email notification (optional)
- Push notification (Phase 2)

### 5.4 📋 Watchlist & Alerts

**Watchlist Features:**
- Add/remove saham
- Custom notes per saham
- Quick view: Price, Change%, Volume
- AI-generated short summary

**Alert Types (MVP):**
- Price target reached (above/below)
- Volume spike (>2x average)
- ARA/ARB notification

### 5.5 📊 Stock Detail Page

**Sections:**
1. **Header:** Logo, Name, Price, Change
2. **Chart:** Lightweight Charts (candlestick + volume)
3. **AI Summary:** One-paragraph analysis
4. **Fundamentals:** Key ratios (PER, PBV, ROE, DER)
5. **News:** Latest 5 news related to stock
6. **Similar Stocks:** AI recommendation

### 5.6 📚 Glossary & ELI5 System

**Implementation:**
- Database table `glossary_terms`
- Auto-detect istilah teknis dalam AI response
- Hover tooltip dengan definisi + analogi
- Link ke full explanation page

**Example:**
| Term | Definition | ELI5 Analogy |
|------|------------|--------------|
| PER | Price to Earnings Ratio | Harga dibanding untung. Kayak beli warteg, mau balik modal berapa lama? |
| PBV | Price to Book Value | Harga dibanding nilai aset. Kayak beli rumah, lebih mahal dari harga tanah + bangunan gak? |
| ROE | Return on Equity | Seberapa jago perusahaan pakai uang pemilik buat cari untung |

---

## 6. Admin Panel

### 6.1 AI Provider Manager

| Field | Type | Description |
|-------|------|-------------|
| `provider_name` | string | OpenAI, Groq, DeepSeek, etc. |
| `base_url` | string | API endpoint URL |
| `api_key` | encrypted string | API key (encrypted in DB) |
| `model_name` | string | gpt-4o, llama-3.1-70b, etc. |
| `is_active` | boolean | Currently active provider |
| `priority` | integer | Fallback order |
| `rate_limit` | integer | Requests per minute |
| `cost_per_1k_tokens` | decimal | For cost tracking |

### 6.2 System Prompt Manager

**Configurable Prompts:**
- Main Persona
- Newbie Mode Additions
- Pro Mode Additions
- Risk Disclaimer
- Morning Briefing Template

### 6.3 User Management

- View all users
- Change subscription tier
- Ban/Suspend user
- View usage statistics
- Manual subscription upgrade

### 6.4 Analytics Dashboard

- Daily Active Users
- Total chats / queries
- Most asked stocks
- AI cost tracking
- Error rates

---

## 7. Database Schema

### 7.1 Core Tables

```sql
-- User profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- free, pro, whale
  user_level TEXT DEFAULT 'newbie', -- newbie, intermediate, advanced
  trading_style TEXT, -- scalper, swing, investor
  daily_chat_count INTEGER DEFAULT 0,
  last_chat_reset TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System configurations (Admin Panel)
CREATE TABLE system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Provider configurations
CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  model_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  rate_limit INTEGER DEFAULT 60,
  cost_per_1k_tokens DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  provider_used TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist
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

-- Stock fundamentals cache
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

-- Glossary terms
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT UNIQUE NOT NULL,
  definition TEXT NOT NULL,
  eli5_analogy TEXT,
  category TEXT, -- fundamental, technical, general
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts history
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_code TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- price_above, price_below, volume_spike, ara, arb
  trigger_value DECIMAL(15,2),
  triggered_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.2 Row Level Security (RLS)

```sql
-- Profiles: Users can only read/update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- System configs: Only service role / admin
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can access configs" ON system_configs USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND subscription_tier = 'admin')
);

-- Watchlist: Users can only access their own
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own watchlist" ON watchlists 
  FOR ALL USING (auth.uid() = user_id);
```

---

## 8. User Flow

### 8.1 First Time User

```
Landing Page → Sign Up (Google/Email) → Onboarding:
  1. "Apa level trading kamu?" (Newbie/Intermediate/Advanced)
  2. "Gaya trading apa yang kamu suka?" (Scalper/Swing/Investor)
  3. "Sektor apa yang menarik?" (Optional)
→ Dashboard dengan Tutorial Overlay
→ First Chat: "Coba tanya apa saja tentang saham!"
```

### 8.2 Daily User Flow

```
08:00 WIB: User buka app
→ Morning Briefing tampil otomatis
→ Cek Watchlist alerts
→ Chat: "Gimana prospek BBCA hari ini?"
→ AI Response dengan context: harga terkini + berita
→ User: "Bandingkan dengan BBRI"
→ AI ingat context, kasih comparison
→ User satisfied, close app
```

### 8.3 Screener Flow

```
User: "Cari saham undervalued di sektor banking"
→ AI parse intent → Generate SQL query
→ Query stock_fundamentals table
→ Return: List saham + AI commentary
→ User click saham → Detail page
```

---

## 9. Pricing Model

| Tier | Harga/bulan | Limits | Features |
|------|-------------|--------|----------|
| **Free** | Rp 0 | 10 chat/hari, 3 watchlist | Basic chat, delayed data, ads |
| **Pro** | Rp 79.000 | 100 chat/hari, 20 watchlist | Full features, no ads, alerts |
| **Whale** | Rp 199.000 | Unlimited | Priority support, API access, export |

> [!NOTE]
> Harga lebih murah dari Stockbit Pro (Rp 199k) untuk menarik early adopters.

---

## 10. Roadmap

### Phase 1: MVP (8 Minggu)

**Week 1-2: Foundation**
- [ ] Setup Next.js + Supabase project
- [ ] Implement authentication (Google + Email)
- [ ] Create database schema + RLS
- [ ] Basic landing page

**Week 3-4: Core Features**
- [ ] Admin Panel: AI Provider Manager
- [ ] Chat Interface dengan AI integration
- [ ] Yahoo Finance integration (price + fundamental)
- [ ] Basic Stock Detail page

**Week 5-6: Enhanced Features**
- [ ] Watchlist functionality
- [ ] Basic Screener (manual filter)
- [ ] Glossary system + tooltips
- [ ] User onboarding flow

**Week 7-8: Polish & Launch**
- [ ] Morning Briefing (basic RSS aggregation)
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] Beta testing & bug fixes
- [ ] Soft launch

### Phase 2: Growth (8 Minggu)

- [ ] AI Screener (natural language)
- [ ] Alert system (price + volume)
- [ ] Advanced charting (TradingView widget)
- [ ] News sentiment analysis
- [ ] Payment gateway (Midtrans)
- [ ] Email notifications

### Phase 3: Scale (8 Minggu)

- [ ] Foreign flow / Bandarmology (paid data)
- [ ] Community features (share watchlist)
- [ ] Mobile app (React Native / PWA)
- [ ] API access for Whale tier
- [ ] Backtesting module
- [ ] Broker integration research

---

## 11. Keamanan (Security)

### 11.1 API Key Protection

```
✓ API Keys stored in DB, encrypted
✓ Never exposed to frontend
✓ All AI calls via Edge Functions
✓ Rate limiting per user tier
```

### 11.2 Data Protection

```
✓ RLS enabled on all user tables
✓ Input sanitization
✓ SQL injection prevention (parameterized queries)
✓ XSS prevention
```

### 11.3 Compliance

```
✓ Disclaimer investasi di setiap response AI
✓ Privacy policy & ToS
✓ Data retention policy
```

---

## 12. Success Metrics

### 12.1 MVP Launch (Month 1-2)

| Metric | Target |
|--------|--------|
| Registered Users | 500 |
| Daily Active Users | 50 |
| Chats per day | 200 |
| NPS Score | > 30 |

### 12.2 Growth Phase (Month 3-6)

| Metric | Target |
|--------|--------|
| Registered Users | 5,000 |
| Pro Subscribers | 100 (2% conversion) |
| MRR | Rp 7.900.000 |
| Churn Rate | < 10% |

---

## 13. Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Yahoo Finance API blocked | Medium | High | Multiple fallback sources (Google, scraping) |
| AI hallucination | High | Medium | Always inject fresh data + clear disclaimer |
| Competitor launch | Medium | Medium | Focus on simplicity & price advantage |
| Data source down | Low | High | Caching + graceful degradation |
| AI cost overrun | Medium | Medium | Rate limiting + cost monitoring + cheaper models |

---

## 14. Appendix

### A. Competitor Analysis

| Platform | Strength | Weakness | Our Advantage |
|----------|----------|----------|---------------|
| **Stockbit** | Community, Data | Expensive, Complex | Simpler, Cheaper, AI-first |
| **RTI** | Bandarmology | Outdated UI | Modern UX, AI chat |
| **TradingView** | Charting | Not localized | Indonesia-focused, Bahasa |
| **ChatGPT** | General AI | No real-time data | Integrated market data |

### B. Glossary Data (Initial Seed)

```json
[
  {"term": "IHSG", "definition": "Indeks Harga Saham Gabungan", "eli5": "Nilai rata-rata semua saham di BEI, kayak nilai rapor kelas"},
  {"term": "ARA", "definition": "Auto Reject Atas", "eli5": "Batas naik maksimal harga saham per hari, biar gak gila-gilaan"},
  {"term": "ARB", "definition": "Auto Reject Bawah", "eli5": "Batas turun maksimal, perlindungan biar gak anjlok seketika"},
  {"term": "Lot", "definition": "1 Lot = 100 lembar saham", "eli5": "Paket minimal beli saham, kayak beli gorengan minimal 1 bungkus"},
  {"term": "PER", "definition": "Price to Earnings Ratio", "eli5": "Berapa tahun balik modal dari laba. Makin kecil makin cepet balik modal"},
  {"term": "PBV", "definition": "Price to Book Value", "eli5": "Harga saham dibanding nilai bukunya. Kayak beli barang second, mahal atau murah dari harga asli"},
  {"term": "ROE", "definition": "Return on Equity", "eli5": "Seberapa jago perusahaan pake duit investor buat cari untung"},
  {"term": "DER", "definition": "Debt to Equity Ratio", "eli5": "Perbandingan utang vs modal. Makin kecil makin sehat"},
  {"term": "Dividen", "definition": "Pembagian laba ke pemegang saham", "eli5": "Bonus tahunan buat pemilik saham, kayak THR"},
  {"term": "Blue Chip", "definition": "Saham perusahaan besar & stabil", "eli5": "Saham pemain utama, kayak pemain bintang di klub bola"}
]
```

---

> **Document Version Control**
> - v1.0 (28 Des 2025): Initial PRD dengan fokus free data sources untuk MVP
