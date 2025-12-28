# IndoStock AI

AI-powered stock analysis SaaS platform for Indonesian traders.

## Features

- **AI-First Analysis**: Conversational AI that explains market data in plain Indonesian
- **Dynamic Brain**: Switch AI providers in real-time without code changes
- **Newbie Friendly**: Auto-explains technical terms with ELI5 analogies
- **Morning Briefing**: Automated daily market summary
- **AI Screener**: Natural language stock screening

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State**: Zustand, React Query
- **Charts**: TradingView Widgets
- **Deployment**: Vercel + Supabase

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd indostock-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your Supabase credentials:
   - Get URL and anon key from https://supabase.com/dashboard
   - Add to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Run database migrations:
   - Go to Supabase SQL Editor
   - Run migrations from `supabase/migrations/` in order
   - Run `supabase/seed.sql` to populate initial data

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000

## Project Structure

```
indostock-ai/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/    # Protected dashboard routes
│   └── (onboarding)/   # Onboarding flow
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Navbar, Sidebar
│   └── landing/        # Landing page sections
├── lib/
│   ├── supabase/       # Supabase clients
│   └── utils/          # Utility functions
├── supabase/
│   ├── migrations/     # Database migrations
│   └── seed.sql        # Seed data
└── types/              # TypeScript types
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Documentation

- [Setup Guide](docs/SETUP.md)
- [Design Document](docs/plans/2025-12-28-indostock-ai-mvp-design.md)
- [Implementation Plan](docs/plans/2025-12-28-foundation-setup.md)

## Roadmap

### Week 1-2: Foundation (Current)
- ✅ Next.js project setup
- ✅ Supabase integration
- ✅ Authentication (Google OAuth + Email)
- ✅ Database schema
- ✅ Landing page
- ✅ Basic dashboard

### Week 3-4: Core AI Chat
- AI provider system
- Chat interface with streaming
- Yahoo Finance integration
- System prompt engineering

### Week 5-6: Data & Features
- Stock detail pages with TradingView charts
- Watchlist functionality
- Glossary system
- Full onboarding flow

### Week 7-8: Polish & Launch
- Morning Briefing
- Mobile responsive design
- Performance optimization
- Beta testing
- Soft launch

## License

MIT

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.
