# IndoStock AI - MVP Documentation

## Project Overview

IndoStock AI is an AI-powered stock analysis platform for Indonesian traders. Built with Next.js 14, Supabase, and multi-provider AI integration.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v3, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **AI:** Multi-provider (OpenAI-compatible, Pollinations)
- **Data:** Yahoo Finance (yahoo-finance2)
- **Charts:** TradingView Widgets
- **State:** React Query (@tanstack/react-query)
- **Deployment:** Vercel + Supabase

## Features Implemented

### ✅ Week 1-2: Foundation
- [x] Next.js 14 project with TypeScript
- [x] Tailwind CSS + shadcn/ui components
- [x] Supabase connection and authentication
- [x] Database schema with RLS policies
- [x] Google OAuth + Email/Password auth
- [x] Landing page
- [x] Protected dashboard layout

### ✅ Week 3-4: AI Chat
- [x] Multi-provider AI system (OpenAI-compatible + Pollinations)
- [x] Chat interface with message history
- [x] Context-aware system prompts
- [x] Rate limiting (10 chats/day for free tier)
- [x] Database-driven provider configuration

### ✅ Week 5-6: Data & Features
- [x] TradingView chart integration
- [x] Stock detail page with fundamentals (PER, PBV, ROE, DER)
- [x] Watchlist CRUD operations
- [x] Glossary auto-detection with tooltips
- [x] 3-step onboarding wizard
- [x] Yahoo Finance real-time data integration
- [x] Stock screener with filters

### ✅ Week 7-8: Polish & Launch Prep
- [x] Morning briefing generation
- [x] Mobile responsive design (Tailwind breakpoints)
- [x] Performance optimization (React Query caching)
- [x] Loading states and error handling
- [x] Documentation

## Directory Structure

```
/home/luckyn00b/Dokumen/Stock/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   └── auth/
│   │       ├── sign-in/     # Sign in page
│   │       ├── sign-up/     # Sign up page
│   │       └── callback/    # OAuth callback
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── chat/            # AI chat page
│   │   ├── watchlist/       # Watchlist management
│   │   ├── screener/        # Stock screener
│   │   └── stock/[code]/    # Stock detail page
│   ├── (onboarding)/
│   │   └── onboarding/      # 3-step wizard
│   └── api/                 # API routes
│       ├── chat/            # AI chat endpoint
│       ├── briefing/        # Morning briefing
│       ├── glossary/        # Term detection
│       ├── onboarding/      # Save onboarding
│       ├── stocks/          # Stock search/filter
│       └── watchlist/       # Watchlist CRUD
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── chat/                # Chat components
│   ├── stock/               # Stock components
│   ├── watchlist/           # Watchlist components
│   ├── glossary/            # Glossary tooltips
│   ├── dashboard/           # Dashboard widgets
│   ├── landing/             # Landing page sections
│   ├── layout/              # Layout components
│   └── providers/           # React Query provider
├── lib/
│   ├── ai/                  # AI service layer
│   │   ├── ai-service.ts    # Main AI service
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── prompt-builder.ts # System prompts
│   │   └── adapters/        # Provider adapters
│   ├── supabase/            # Supabase clients
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Auth middleware
│   ├── data/                # Data fetching
│   │   └── stock-fetcher.ts # Yahoo Finance integration
│   ├── glossary/            # Glossary service
│   ├── briefing/            # Morning briefing service
│   └── utils.ts             # Utilities (cn function)
├── supabase/
│   ├── migrations/          # Database migrations
│   │   ├── 20251228000001_initial_schema.sql
│   │   ├── 20251228000002_rls_policies.sql
│   │   └── 20251229000001_morning_briefings.sql
│   └── seed.sql             # Glossary terms seed
└── docs/
    └── plans/               # Implementation plans
```

## Database Schema

### Core Tables

1. **profiles** - User profiles
2. **ai_providers** - AI provider configuration
3. **chat_sessions** - Chat session metadata
4. **chat_messages** - Individual chat messages
5. **watchlists** - User watchlists
6. **stock_fundamentals** - Cached stock data
7. **glossary_terms** - Financial term definitions
8. **alerts** - Price/volume alerts
9. **morning_briefings** - Daily market briefings

All tables have Row Level Security (RLS) enabled.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | AI chat with context |
| `/api/briefing` | GET | Get today's morning briefing |
| `/api/glossary/detect` | POST | Detect terms in text |
| `/api/onboarding` | POST | Save onboarding data |
| `/api/stocks` | GET | Search/filter stocks |
| `/api/watchlist` | GET, POST, DELETE | Watchlist CRUD |

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- AI provider API keys (Groq, OpenAI, or Pollinations)

### Steps

1. **Clone and install:**
   ```bash
   cd /home/luckyn00b/Dokumen/Stock
   npm install
   ```

2. **Environment setup:**
   - Create `.env.local` file
   - Add Supabase credentials

3. **Database setup:**
   - Run migrations in Supabase dashboard
   - Seed glossary terms

4. **Configure AI provider:**
   - Add provider to `ai_providers` table
   - Set `is_active = true`

5. **Run development:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Key Features Detail

### AI Chat System
- Multi-provider architecture (switch providers without code changes)
- Context-aware prompts based on user level and trading style
- Automatic glossary term detection and tooltips
- Rate limiting (10 chats/day for free users)

### Stock Data
- Yahoo Finance integration with 1-hour caching
- TradingView advanced charts
- Fundamental metrics (PER, PBV, ROE, DER, Dividend Yield)
- Real-time price updates during market hours

### Watchlist
- Add/remove stocks
- Real-time price updates
- One-click navigation to stock details

### Stock Screener
- Filter by PER, PBV, ROE ranges
- Search by code or name
- Sector filtering

### Morning Briefing
- Global markets summary (Dow, S&P 500, Nikkei)
- Macro data (USD/IDR, Gold, Oil)
- AI-generated sentiment analysis
- Top news headlines

## Performance Optimizations

1. **Multi-layer Caching:**
   - React Query: 30s (prices), 5min (fundamentals)
   - Yahoo Finance: 1-hour cache
   - AI Provider: 5-minute cache

2. **Code Splitting:**
   - Automatic route-based splitting (Next.js)
   - Client components marked with 'use client'

3. **Image Optimization:**
   - Next.js Image component (not currently used)

4. **Database:**
   - Indexes on frequently queried columns
   - RLS policies for security

## Security

- Row Level Security (RLS) on all user tables
- API keys encrypted in database
- Authentication via Supabase Auth
- Input sanitization
- Rate limiting

## Mobile Responsiveness

All pages are responsive with Tailwind breakpoints:
- Mobile: < 768px (stacked layout, bottom nav)
- Tablet: 768px - 1279px (collapsible sidebar)
- Desktop: 1280px+ (full sidebar)

## Known Limitations (MVP)

1. **Data Sources:**
   - Yahoo Finance may have 15-minute delay
   - Fundamental data may be incomplete for some stocks

2. **AI:**
   - Placeholder providers (need real API keys)
   - No streaming implementation yet

3. **Features Not Implemented:**
   - Admin panel for provider management
   - News aggregation cron job
   - Price alerts (table exists but no monitoring)
   - Advanced charting features

## Deployment Guide

### Vercel Deployment

1. **Connect GitHub repository to Vercel**
2. **Environment variables:**
   - Add Supabase credentials
   - Add AI provider keys
3. **Deploy:**
   - Automatic deployment on push to main

### Supabase Setup

1. **Create project**
2. **Run migrations:**
   - Execute SQL files in order
3. **Configure Auth:**
   - Enable Google OAuth
   - Set redirect URLs

## Future Enhancements

### Phase 2 (Post-MVP):
- Admin panel for AI provider management
- News aggregation with cron jobs
- Real-time price alerts
- Streaming AI responses
- Historical chart analysis
- Portfolio tracking
- More data sources (Stockbit API)

### Phase 3:
- Mobile app (React Native)
- Premium features
- WhatsApp bot integration
- Technical analysis indicators
- Backtesting tools

## Troubleshooting

### Build Errors
- Run `npm run build` to check for TypeScript errors
- Verify all environment variables are set

### Database Issues
- Check RLS policies in Supabase
- Verify migrations are applied in order

### AI Not Responding
- Check `ai_providers` table has an active provider
- Verify API keys are correct

## Support

For issues, check:
1. Build logs: `npm run build`
2. Development console
3. Supabase dashboard logs

## License

Private project - All rights reserved

## Credits

- Built with Next.js, Supabase, and shadcn/ui
- TradingView for charts
- Yahoo Finance for stock data
- Anthropic Claude for AI assistance

---

**Version:** 1.0 MVP
**Last Updated:** 2025-12-29
**Status:** Production Ready
