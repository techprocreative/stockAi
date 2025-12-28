# IndoStock AI - Foundation Setup (Week 1-2) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Next.js 14 project with Supabase, implement authentication, create database schema, and build landing page.

**Architecture:** Modern Next.js 14 App Router with Supabase backend, TypeScript, Tailwind CSS + shadcn/ui, Google OAuth + Email auth.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL, Auth), React Query

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `.env.local`
- Create: `.gitignore`

**Step 1: Create Next.js project**

Run: `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`

Prompts:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Customize default import alias: Yes (@/*)

Expected: Project created with app/ directory structure

**Step 2: Verify project structure**

Run: `ls -la`

Expected output should include:
```
app/
public/
package.json
tsconfig.json
next.config.js
tailwind.config.ts
```

**Step 3: Install additional dependencies**

Run: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @tanstack/react-query zustand class-variance-authority clsx tailwind-merge lucide-react`

Expected: Dependencies installed successfully

**Step 4: Install dev dependencies**

Run: `npm install -D @types/node prettier prettier-plugin-tailwindcss`

Expected: Dev dependencies installed

**Step 5: Create environment file template**

Create `.env.local`:
```bash
# Supabase (placeholder - get from supabase.com dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 6: Update .gitignore**

Ensure `.env.local` is in `.gitignore`:
```
# local env files
.env*.local
.env
```

**Step 7: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js 14 project with TypeScript and Tailwind

- Set up Next.js 14 with App Router
- Configure TypeScript, ESLint, Tailwind CSS
- Install Supabase and React Query dependencies
- Add environment file template"
```

---

## Task 2: Configure Tailwind CSS & Design Tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Create: `lib/utils.ts`

**Step 1: Update Tailwind config with design tokens**

Modify `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          900: "#1e3a8a",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          500: "#10b981",
          600: "#059669",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**Step 2: Install tailwindcss-animate**

Run: `npm install tailwindcss-animate`

Expected: Plugin installed

**Step 3: Update globals.css with design tokens**

Modify `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 217.2 91.2% 59.8%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

**Step 4: Create utility function**

Create `lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 5: Test the setup**

Run: `npm run dev`

Expected: Development server starts at http://localhost:3000

**Step 6: Commit**

```bash
git add .
git commit -m "feat: configure Tailwind CSS with IndoStock AI design tokens

- Add custom color palette (primary blue, success green, danger red)
- Configure design tokens for consistent theming
- Add cn() utility function for class merging
- Set up tailwindcss-animate plugin"
```

---

## Task 3: Set up shadcn/ui

**Files:**
- Create: `components.json`
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/card.tsx`

**Step 1: Initialize shadcn/ui**

Run: `npx shadcn-ui@latest init`

Prompts:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Expected: `components.json` created

**Step 2: Install base components**

Run: `npx shadcn-ui@latest add button input card label`

Expected: Components installed in `components/ui/`

**Step 3: Verify components**

Run: `ls components/ui/`

Expected output:
```
button.tsx
input.tsx
card.tsx
label.tsx
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: set up shadcn/ui component library

- Initialize shadcn/ui with default configuration
- Add base components (Button, Input, Card, Label)
- Configure components for IndoStock AI design system"
```

---

## Task 4: Create Supabase Client & Types

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `types/database.types.ts`

**Step 1: Create browser client**

Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create server client**

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**Step 3: Create middleware helper**

Create `lib/supabase/middleware.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

**Step 4: Create database types**

Create `types/database.types.ts`:
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'whale' | 'admin'
          user_level: 'newbie' | 'intermediate' | 'advanced'
          trading_style: 'scalper' | 'swing' | 'investor' | null
          preferred_sectors: string[] | null
          daily_chat_count: number
          chat_limit: number
          last_chat_reset: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'whale' | 'admin'
          user_level?: 'newbie' | 'intermediate' | 'advanced'
          trading_style?: 'scalper' | 'swing' | 'investor' | null
          preferred_sectors?: string[] | null
          daily_chat_count?: number
          chat_limit?: number
          last_chat_reset?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'whale' | 'admin'
          user_level?: 'newbie' | 'intermediate' | 'advanced'
          trading_style?: 'scalper' | 'swing' | 'investor' | null
          preferred_sectors?: string[] | null
          daily_chat_count?: number
          chat_limit?: number
          last_chat_reset?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
```

**Step 5: Install Supabase SSR package**

Run: `npm install @supabase/ssr`

Expected: Package installed

**Step 6: Commit**

```bash
git add .
git commit -m "feat: set up Supabase client configuration

- Create browser and server Supabase clients
- Add middleware helper for session management
- Define TypeScript database types for type safety
- Configure cookie-based authentication"
```

---

## Task 5: Create Database Migrations

**Files:**
- Create: `supabase/migrations/20251228000001_initial_schema.sql`
- Create: `supabase/migrations/20251228000002_rls_policies.sql`
- Create: `supabase/seed.sql`

**Step 1: Create migrations directory**

Run: `mkdir -p supabase/migrations`

Expected: Directory created

**Step 2: Create initial schema migration**

Create `supabase/migrations/20251228000001_initial_schema.sql`:
```sql
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
```

**Step 3: Create RLS policies migration**

Create `supabase/migrations/20251228000002_rls_policies.sql`:
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- AI providers policies (admin only)
CREATE POLICY "Only admins can manage AI providers"
  ON ai_providers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.subscription_tier = 'admin'
    )
  );

-- Chat sessions policies
CREATE POLICY "Users can manage own chat sessions"
  ON chat_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert chat messages in own sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Watchlists policies
CREATE POLICY "Users can manage own watchlist"
  ON watchlists FOR ALL
  USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Glossary terms policies (public read)
CREATE POLICY "Anyone can read glossary terms"
  ON glossary_terms FOR SELECT
  TO authenticated
  USING (true);

-- Stock fundamentals (public read for authenticated users)
ALTER TABLE stock_fundamentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read stock fundamentals"
  ON stock_fundamentals FOR SELECT
  TO authenticated
  USING (true);
```

**Step 4: Create seed data**

Create `supabase/seed.sql`:
```sql
-- Seed glossary terms
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
('Blue Chip', 'Saham perusahaan besar & stabil', 'Saham pemain utama, kayak pemain bintang di klub bola', 'general')
ON CONFLICT (term) DO NOTHING;
```

**Step 5: Create README for migrations**

Create `supabase/README.md`:
```markdown
# Supabase Database Migrations

## Running Migrations

These migrations need to be run manually in the Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run migrations in order:
   - `20251228000001_initial_schema.sql`
   - `20251228000002_rls_policies.sql`
4. Run `seed.sql` to populate initial data

## Note

In production, use Supabase CLI for automated migrations:
```bash
supabase db push
```
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: create database schema migrations

- Add initial schema with all tables (profiles, chat, watchlist, etc.)
- Implement Row Level Security policies
- Create triggers for auto-updating timestamps
- Add seed data for glossary terms
- Include migration instructions"
```

---

## Task 6: Create Middleware for Auth

**Files:**
- Create: `middleware.ts`

**Step 1: Create middleware file**

Create `middleware.ts`:
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 2: Test middleware**

Run: `npm run dev`

Expected: Server starts without errors

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add authentication middleware

- Create middleware to refresh user sessions
- Configure matcher to exclude static files
- Enable automatic session management across routes"
```

---

## Task 7: Build Landing Page

**Files:**
- Create: `app/page.tsx`
- Create: `components/landing/hero-section.tsx`
- Create: `components/landing/features-section.tsx`
- Create: `components/landing/cta-section.tsx`

**Step 1: Create Hero Section component**

Create `components/landing/hero-section.tsx`:
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Asisten AI Cerdas untuk Trader Saham Indonesia
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Analisa saham dalam bahasa Indonesia yang mudah dipahami.
            Didukung AI untuk membantu keputusan trading Anda.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Mulai Gratis
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">
                Lihat Fitur
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Create Features Section component**

Create `components/landing/features-section.tsx`:
```typescript
import { Brain, Zap, GraduationCap, Newspaper, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Brain,
    title: 'AI-First Analysis',
    description: 'Analisa bukan berupa tabel kaku, melainkan percakapan dan ringkasan naratif yang mudah dipahami.',
  },
  {
    icon: Zap,
    title: 'Dynamic Brain',
    description: 'Kemampuan mengganti model AI secara real-time dari admin panel tanpa coding ulang.',
  },
  {
    icon: GraduationCap,
    title: 'Newbie Friendly',
    description: 'Menjelaskan istilah saham (PER, PBV, Support/Resist) secara otomatis dengan analogi sederhana.',
  },
  {
    icon: Newspaper,
    title: 'Morning Briefing',
    description: 'Ringkasan pasar harian otomatis sebelum market buka, langsung di dashboard Anda.',
  },
  {
    icon: Search,
    title: 'AI Screener',
    description: 'Cari saham dengan bahasa natural: "Saham murah dengan ROE tinggi" dan dapatkan hasil instant.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Fitur Unggulan IndoStock AI
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Platform lengkap untuk analisa saham dengan bantuan AI
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="h-10 w-10 text-primary-500" />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

**Step 3: Create CTA Section component**

Create `components/landing/cta-section.tsx`:
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="bg-primary-600 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Siap untuk Trading Lebih Cerdas?
        </h2>
        <p className="mt-4 text-lg text-primary-50">
          Mulai gratis sekarang. Tidak perlu kartu kredit.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/sign-up">
              Daftar Sekarang
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
```

**Step 4: Update homepage**

Modify `app/page.tsx`:
```typescript
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { CTASection } from '@/components/landing/cta-section'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </main>
  )
}
```

**Step 5: Install lucide-react icons**

Run: `npm install lucide-react`

Expected: Package installed

**Step 6: Test landing page**

Run: `npm run dev`

Visit: http://localhost:3000

Expected: Landing page displays with hero, features, and CTA sections

**Step 7: Commit**

```bash
git add .
git commit -m "feat: build landing page with hero and features

- Create Hero section with CTA buttons
- Add Features section showcasing USPs
- Build CTA section for sign-up conversion
- Use shadcn/ui components and IndoStock branding"
```

---

## Task 8: Create Authentication Pages

**Files:**
- Create: `app/(auth)/auth/sign-in/page.tsx`
- Create: `app/(auth)/auth/sign-up/page.tsx`
- Create: `app/(auth)/auth/callback/route.ts`
- Create: `app/(auth)/layout.tsx`

**Step 1: Create auth layout**

Create `app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
```

**Step 2: Create sign-in page**

Create `app/(auth)/auth/sign-in/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
        <CardDescription>
          Masuk ke akun IndoStock AI Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Masuk dengan Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Atau lanjutkan dengan
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-sm text-danger-500">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : 'Masuk'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Belum punya akun?{' '}
          <Link href="/auth/sign-up" className="text-primary-600 hover:underline">
            Daftar
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
```

**Step 3: Create sign-up page**

Create `app/(auth)/auth/sign-up/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          username: email.split('@')[0],
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      router.push('/onboarding')
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Daftar</CardTitle>
        <CardDescription>
          Buat akun IndoStock AI gratis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Daftar dengan Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Atau lanjutkan dengan
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-sm text-danger-500">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : 'Daftar'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Sudah punya akun?{' '}
          <Link href="/auth/sign-in" className="text-primary-600 hover:underline">
            Masuk
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
```

**Step 4: Create auth callback route**

Create `app/(auth)/auth/callback/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      // Create profile if doesn't exist (Google OAuth)
      if (!profile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: data.user.user_metadata.full_name || data.user.email,
          username: data.user.email?.split('@')[0],
          avatar_url: data.user.user_metadata.avatar_url,
        })

        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Redirect based on onboarding status
      if (profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/dashboard`)
      } else {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

**Step 5: Test authentication flow**

Run: `npm run dev`

Visit: http://localhost:3000/auth/sign-in

Expected: Sign-in page displays with Google and email options

Note: Google OAuth won't work until Supabase is configured

**Step 6: Commit**

```bash
git add .
git commit -m "feat: implement authentication pages

- Create sign-in page with Google OAuth and email/password
- Build sign-up page with profile creation
- Add auth callback route handler
- Implement auth layout for centered forms
- Handle onboarding redirect flow"
```

---

## Task 9: Create Placeholder Dashboard

**Files:**
- Create: `app/(dashboard)/dashboard/page.tsx`
- Create: `app/(dashboard)/layout.tsx`
- Create: `components/layout/navbar.tsx`
- Create: `components/layout/sidebar.tsx`

**Step 1: Create dashboard layout**

Create `app/(dashboard)/layout.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-background-secondary">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 2: Create Navbar component**

Create `components/layout/navbar.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold text-primary-600">
          IndoStock AI
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleSignOut}>
            Keluar
          </Button>
        </div>
      </div>
    </nav>
  )
}
```

**Step 3: Create Sidebar component**

Create `components/layout/sidebar.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, MessageSquare, Search, Star, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat AI', icon: MessageSquare },
  { href: '/screener', label: 'Screener', icon: Search },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-background p-4">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

**Step 4: Create dashboard page**

Create `app/(dashboard)/dashboard/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Selamat datang, {profile?.full_name || 'Trader'}!
        </h1>
        <p className="text-muted-foreground">
          Dashboard IndoStock AI Anda
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Morning Briefing</CardTitle>
            <CardDescription>Ringkasan pasar hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fitur akan segera hadir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Watchlist</CardTitle>
            <CardDescription>Saham yang Anda pantau</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Belum ada saham di watchlist
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat Limit</CardTitle>
            <CardDescription>Sisa chat hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {profile?.chat_limit - profile?.daily_chat_count}/{profile?.chat_limit}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 5: Test dashboard**

Run: `npm run dev`

Expected: Dashboard requires authentication and shows welcome message

**Step 6: Commit**

```bash
git add .
git commit -m "feat: create dashboard layout and placeholder page

- Build dashboard layout with navbar and sidebar
- Create reusable Navbar and Sidebar components
- Add protected dashboard page with user greeting
- Implement navigation menu with active state
- Show placeholder cards for upcoming features"
```

---

## Task 10: Create Onboarding Flow (Placeholder)

**Files:**
- Create: `app/(onboarding)/onboarding/page.tsx`
- Create: `app/(onboarding)/layout.tsx`

**Step 1: Create onboarding layout**

Create `app/(onboarding)/layout.tsx`:
```typescript
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary">
      <div className="w-full max-w-2xl p-6">{children}</div>
    </div>
  )
}
```

**Step 2: Create onboarding page**

Create `app/(onboarding)/onboarding/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleCompleteOnboarding = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          Selamat datang di IndoStock AI! 👋
        </CardTitle>
        <CardDescription>
          Onboarding lengkap akan segera hadir. Untuk sementara, klik tombol di bawah untuk melanjutkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Onboarding akan mencakup:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Pilih level trading (Pemula / Menengah / Mahir)</li>
            <li>Tentukan gaya trading (Scalper / Swing / Investor)</li>
            <li>Pilih sektor favorit (Opsional)</li>
          </ul>
          <Button
            onClick={handleCompleteOnboarding}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Lanjutkan ke Dashboard'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 3: Test onboarding flow**

Run: `npm run dev`

Sign up with test account → Should redirect to onboarding → Click button → Redirect to dashboard

Expected: Flow works correctly

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add placeholder onboarding flow

- Create onboarding layout
- Build placeholder onboarding page
- Implement onboarding completion handler
- Add onboarding requirements list
- Full onboarding form will be built in Week 5-6"
```

---

## Task 11: Add README and Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/SETUP.md`

**Step 1: Update README**

Modify `README.md`:
```markdown
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
- `npm run format` - Format with Prettier

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
```

**Step 2: Create setup guide**

Create `docs/SETUP.md`:
```markdown
# IndoStock AI - Setup Guide

## Supabase Configuration

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization (or create new)
4. Fill in project details:
   - Name: indostock-ai
   - Database Password: (generate strong password)
   - Region: Singapore (closest to Indonesia)
5. Wait for project to be created (~2 minutes)

### 2. Get Supabase Credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Project API keys → anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Update `.env.local`

### 3. Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider:
   - Confirm email: Enabled
3. Enable Google provider:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
   - Redirect URL: Copy the URL shown
4. Add redirect URL to Google Cloud Console

### 4. Run Database Migrations

1. Go to SQL Editor
2. Create new query
3. Copy contents from `supabase/migrations/20251228000001_initial_schema.sql`
4. Run query
5. Repeat for `supabase/migrations/20251228000002_rls_policies.sql`
6. Run `supabase/seed.sql` to populate glossary terms

### 5. Verify Setup

1. Go to Table Editor
2. You should see tables:
   - profiles
   - ai_providers
   - chat_sessions
   - chat_messages
   - watchlists
   - stock_fundamentals
   - glossary_terms
   - alerts

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create new project: "IndoStock AI"
3. Enable APIs:
   - Google+ API
   - OAuth consent screen

### 2. Configure OAuth Consent Screen

1. Go to APIs & Services → OAuth consent screen
2. Select External
3. Fill in:
   - App name: IndoStock AI
   - User support email: your@email.com
   - Developer contact: your@email.com
4. Add scopes:
   - userinfo.email
   - userinfo.profile
5. Save

### 3. Create OAuth Credentials

1. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
2. Application type: Web application
3. Name: IndoStock AI Production
4. Authorized JavaScript origins:
   - http://localhost:3000 (development)
   - https://your-domain.com (production)
5. Authorized redirect URIs:
   - Copy from Supabase Auth settings
   - Should be: https://xxxxx.supabase.co/auth/v1/callback
6. Create
7. Copy Client ID and Client Secret
8. Add to Supabase → Authentication → Providers → Google

## Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

### Authentication not working

1. Check Supabase credentials in `.env.local`
2. Verify Google OAuth redirect URL matches Supabase
3. Clear browser cookies and try again

### Database connection errors

1. Verify Supabase project is active
2. Check RLS policies are enabled
3. Ensure migrations ran successfully

### Build errors

1. Delete `node_modules` and `.next`
2. Run `npm install` again
3. Check Node.js version (18+)

## Next Steps

After setup is complete:

1. Test authentication flow
2. Create test user account
3. Verify dashboard access
4. Proceed with Week 3-4 implementation (AI Chat)
```

**Step 3: Commit**

```bash
git add .
git commit -m "docs: add comprehensive README and setup guide

- Update README with features, tech stack, and roadmap
- Create detailed setup guide for Supabase and Google OAuth
- Add troubleshooting section
- Document project structure and development commands"
```

---

## Task 12: Final Testing and Verification

**Files:**
- None (testing only)

**Step 1: Test build**

Run: `npm run build`

Expected: Build completes successfully with no errors

**Step 2: Test production build**

Run: `npm start`

Visit: http://localhost:3000

Expected: Production build runs correctly

**Step 3: Test all routes**

Visit and verify:
- `/` - Landing page ✓
- `/auth/sign-in` - Sign-in page ✓
- `/auth/sign-up` - Sign-up page ✓
- `/dashboard` - Requires auth, redirects to sign-in ✓

Expected: All routes work as designed

**Step 4: Verify file structure**

Run: `find . -type f -name "*.tsx" -o -name "*.ts" | grep -E "(app|components|lib)" | sort`

Expected output should include all created files

**Step 5: Final commit**

```bash
git add .
git commit -m "test: verify Week 1-2 foundation setup complete

- Confirm build succeeds with no errors
- Test all routes and authentication flow
- Verify project structure matches design
- Ready for Week 3-4 (AI Chat implementation)"
```

---

## Summary

**Week 1-2 Foundation Complete! ✅**

**What we built:**
1. ✅ Next.js 14 project with TypeScript, Tailwind CSS, shadcn/ui
2. ✅ Supabase integration (client, server, middleware)
3. ✅ Complete database schema with RLS policies
4. ✅ Authentication (Google OAuth + Email/Password)
5. ✅ Landing page with hero, features, CTA
6. ✅ Protected dashboard with layout
7. ✅ Placeholder onboarding flow
8. ✅ Comprehensive documentation

**Next Steps (Week 3-4):**
- AI provider database & admin panel
- AI service abstraction layer
- Chat interface with streaming
- Yahoo Finance integration
- System prompt engineering

**Files created:** 30+
**Commits:** 12
**Estimated time:** 2 weeks

---

## Plan Execution Options

Plan complete and saved to `docs/plans/2025-12-28-foundation-setup.md`.

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach would you prefer?
