# Admin Panel Technical Reference

## Architecture Overview

### Technology Stack

```
Frontend:
- Next.js 14+ (App Router)
- React 18+ with Server Components
- TypeScript 5+
- Tailwind CSS 3+
- shadcn/ui components
- Recharts for data visualization

Backend:
- Next.js API Routes
- Supabase (PostgreSQL + RLS + Auth)
- Edge Runtime for middleware

Design:
- Brutalist design system
- Mobile-first responsive
- Accessible (WCAG 2.1)
```

### Directory Structure

```
app/
├── (admin)/                    # Admin route group
│   ├── layout.tsx             # Auth + layout wrapper
│   ├── admin/
│   │   ├── page.tsx           # Dashboard
│   │   ├── users/
│   │   │   ├── page.tsx       # Users list
│   │   │   └── [id]/
│   │   │       └── page.tsx   # User detail
│   │   ├── ai-providers/
│   │   │   └── page.tsx       # Providers management
│   │   ├── analytics/
│   │   │   └── page.tsx       # Analytics dashboard
│   │   ├── content/
│   │   │   └── page.tsx       # Content management
│   │   └── settings/
│   │       └── page.tsx       # System settings
├── api/admin/                  # Admin API routes
│   ├── users/[id]/
│   │   ├── route.ts           # User CRUD
│   │   └── tier/route.ts      # Tier updates
│   ├── ai-providers/
│   │   ├── route.ts           # Provider list/create
│   │   ├── [id]/route.ts      # Provider CRUD
│   │   └── test/route.ts      # Provider testing
│   ├── glossary/route.ts      # Glossary management
│   └── settings/route.ts      # Settings management
└── maintenance/page.tsx        # Maintenance mode page

components/admin/
├── sidebar.tsx                 # Navigation sidebar
├── header.tsx                  # Header with user menu
├── stats-card.tsx             # Dashboard stat card
├── users/
│   ├── users-filters.tsx      # Search + filter UI
│   ├── users-pagination.tsx   # Pagination controls
│   ├── edit-tier-dialog.tsx   # Edit subscription tier
│   └── delete-user-dialog.tsx # Delete user confirmation
├── providers/
│   ├── provider-form-dialog.tsx # Add/edit provider form
│   └── test-provider-dialog.tsx # Test provider UI
├── analytics/
│   ├── user-growth-chart.tsx  # Line chart
│   ├── chat-volume-chart.tsx  # Bar chart
│   └── tier-distribution-chart.tsx # Pie chart
├── content/
│   └── glossary-table.tsx     # Glossary management
└── settings/
    ├── chat-limits-config.tsx # Chat limits UI
    ├── feature-flags.tsx      # Feature toggles
    ├── admin-users.tsx        # Admin user list
    └── maintenance-mode.tsx   # Maintenance controls

lib/
├── admin/
│   ├── users.ts               # User queries
│   ├── providers.ts           # Provider queries
│   └── analytics.ts           # Analytics aggregations
└── supabase/
    └── middleware.ts          # Session + maintenance mode

middleware.ts                   # Route protection

supabase/migrations/
└── 20251229000004_admin_rls_policies.sql
```

---

## Database Schema

### Tables Used by Admin Panel

**profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ
);

-- Index for admin queries
CREATE INDEX idx_profiles_tier ON profiles(subscription_tier);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
```

**chat_sessions**
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created ON chat_sessions(created_at DESC);
```

**chat_messages**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
```

**ai_providers**
```sql
CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'groq', 'ollama'
  model_name TEXT NOT NULL,
  api_key TEXT,
  base_url TEXT,
  priority INTEGER DEFAULT 5,
  max_tokens INTEGER DEFAULT 4096,
  temperature REAL DEFAULT 0.7,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_providers_enabled ON ai_providers(enabled);
CREATE INDEX idx_ai_providers_priority ON ai_providers(priority DESC);
```

**glossary_terms**
```sql
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_glossary_terms_term ON glossary_terms(term);
```

**morning_briefings**
```sql
CREATE TABLE morning_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_morning_briefings_date ON morning_briefings(date DESC);
```

**watchlists**
```sql
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_watchlists_user ON watchlists(user_id);
```

---

## Row Level Security (RLS) Policies

### Admin-Only Access

All tables have admin-only policies:

```sql
-- Example: profiles table
CREATE POLICY "Admin full access on profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

Applied to:
- `profiles` - All operations
- `chat_sessions` - All operations
- `chat_messages` - All operations
- `ai_providers` - All operations
- `glossary_terms` - All operations
- `morning_briefings` - All operations
- `watchlists` - All operations

### Public Policies (Non-Admin)

Users have limited access to their own data:

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can view their own chat sessions
CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

---

## API Routes

### Authentication Pattern

All admin API routes follow this pattern:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify admin authorization
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Perform admin operation
    // ... RLS policies automatically enforce admin access

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Endpoint Reference

#### User Management

**GET /api/admin/users**
- No params needed (returns all users due to RLS)
- Returns: Array of user profiles

**GET /api/admin/users/[id]**
- Params: User UUID in URL
- Returns: User profile + aggregated stats

**PATCH /api/admin/users/[id]/tier**
- Params: User UUID in URL
- Body: `{ subscription_tier: string }`
- Returns: Updated profile

**DELETE /api/admin/users/[id]**
- Params: User UUID in URL
- Validation: Cannot delete self
- Returns: Success message

#### AI Providers

**GET /api/admin/ai-providers**
- Returns: Array of all providers

**POST /api/admin/ai-providers**
- Body: Provider configuration object
- Validates required fields
- Returns: Created provider

**GET /api/admin/ai-providers/[id]**
- Params: Provider UUID in URL
- Returns: Provider details

**PATCH /api/admin/ai-providers/[id]**
- Params: Provider UUID in URL
- Body: Partial provider update
- Returns: Updated provider

**DELETE /api/admin/ai-providers/[id]**
- Params: Provider UUID in URL
- Returns: Success message

**POST /api/admin/ai-providers/test**
- Body: `{ providerId: UUID }`
- Simulates provider test
- Returns: Test results with response time

#### Content Management

**GET /api/admin/glossary**
- Returns: Array of all glossary terms

**POST /api/admin/glossary**
- Body: `{ term: string, definition: string }`
- Returns: Created term

**DELETE /api/admin/glossary**
- Query: `?id=<UUID>`
- Returns: Success message

#### Settings

**GET /api/admin/settings**
- Returns: Current settings object

**POST /api/admin/settings**
- Body: Settings update (partial)
- Syncs maintenance mode with middleware
- Returns: Updated settings

---

## Middleware

### Session Management

File: `lib/supabase/middleware.ts`

```typescript
export async function updateSession(request: NextRequest) {
  // 1. Create Supabase client with cookie handling
  const supabase = createServerClient(...)

  // 2. Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Check maintenance mode
  if (maintenanceMode.enabled) {
    // Allow admin users
    if (user && isAdmin(user)) {
      return response
    }
    // Redirect non-admin to maintenance page
    return NextResponse.redirect('/maintenance')
  }

  return response
}
```

### Maintenance Mode

**State Storage**:
- In-memory variable (development)
- Should use Redis/database (production)

**Functions**:
- `getMaintenanceMode()` - Read current state
- `setMaintenanceMode(settings)` - Update state

**Enforcement**:
1. Middleware checks on every request
2. Skips admin routes (`/admin/*`)
3. Allows API settings endpoint
4. Checks user subscription tier
5. Redirects non-admins to `/maintenance`

---

## Data Fetching Patterns

### Server Components

**Dashboard Stats**:
```typescript
import { getDashboardStats } from '@/lib/admin/analytics'

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  return <StatsDisplay stats={stats} />
}
```

**User List with Filters**:
```typescript
import { getUsers } from '@/lib/admin/users'

export default async function UsersPage({ searchParams }: PageProps) {
  const users = await getUsers({
    page: Number(searchParams.page) || 1,
    limit: 10,
    search: searchParams.search,
    tier: searchParams.tier,
  })
  return <UsersTable users={users} />
}
```

### Client Components

**Form Submission**:
```typescript
'use client'

export function EditTierDialog({ userId }: Props) {
  const [tier, setTier] = useState('free')

  const handleSubmit = async () => {
    const response = await fetch(`/api/admin/users/${userId}/tier`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_tier: tier }),
    })

    if (!response.ok) {
      throw new Error('Failed to update tier')
    }

    const data = await response.json()
    // Handle success
  }

  return (...)
}
```

**Real-Time Search**:
```typescript
'use client'

export function UsersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to page 1
    router.push(`/admin/users?${params.toString()}`)
  }

  return (...)
}
```

---

## Query Functions

### lib/admin/analytics.ts

**getDashboardStats()**
```typescript
export async function getDashboardStats() {
  const supabase = await createClient()

  // Parallel queries for performance
  const [
    { count: totalUsers },
    { count: activeToday },
    { count: newThisWeek },
    { count: adminUsers },
    { count: totalSessions },
    { count: chatsToday },
    { count: activeProviders },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .gte('last_seen_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .eq('subscription_tier', 'admin'),
    supabase.from('chat_sessions').select('*', { count: 'exact', head: true }),
    supabase.from('chat_messages').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]),
    supabase.from('ai_providers').select('*', { count: 'exact', head: true })
      .eq('enabled', true),
  ])

  return {
    totalUsers: totalUsers || 0,
    activeToday: activeToday || 0,
    newThisWeek: newThisWeek || 0,
    adminUsers: adminUsers || 0,
    totalSessions: totalSessions || 0,
    chatsToday: chatsToday || 0,
    activeProviders: activeProviders || 0,
    avgResponseTime: 245, // Mock data
  }
}
```

**getUserGrowthData()**
```typescript
export async function getUserGrowthData() {
  const supabase = await createClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const { data } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  // Aggregate by day
  const dailyCounts = /* ... */

  return dailyCounts
}
```

### lib/admin/users.ts

**getUsers()**
```typescript
interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  tier?: string
}

export async function getUsers(params: GetUsersParams = {}) {
  const { page = 1, limit = 10, search, tier } = params
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })

  // Apply filters
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`)
  }

  if (tier && tier !== 'all') {
    query = query.eq('subscription_tier', tier)
  }

  // Pagination
  const offset = (page - 1) * limit
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) throw error

  return {
    users: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  }
}
```

---

## Component Patterns

### Dialog Pattern

Used for: Edit Tier, Delete User, Add Provider, Test Provider

```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ExampleDialog({ itemId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await performAction(itemId)
      toast({ title: 'Success' })
      setOpen(false)
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        {/* Form content */}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
```

### Stats Card Pattern

```typescript
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="border-brutal shadow-brutal bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-primary" />
      </div>
      {trend && (
        <p className={cn(
          "text-sm mt-2",
          trend.isPositive ? "text-green-600" : "text-red-600"
        )}>
          {trend.isPositive ? '↑' : '↓'} {trend.value}%
        </p>
      )}
    </div>
  )
}
```

### Filter Pattern

```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset pagination
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search..."
        defaultValue={searchParams.get('search') || ''}
        onChange={(e) => updateFilter('search', e.target.value)}
      />
      <Select
        value={searchParams.get('tier') || 'all'}
        onValueChange={(value) => updateFilter('tier', value)}
      >
        {/* Options */}
      </Select>
    </div>
  )
}
```

---

## Styling System

### Brutalist Design Tokens

```css
/* Tailwind config extends */
{
  borderRadius: {
    DEFAULT: '0px', /* No rounded corners */
  },
  boxShadow: {
    'brutal': '4px 4px 0px 0px rgba(0,0,0,1)',
    'brutal-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
  },
  animation: {
    'hover-lift': 'transform 0.2s ease',
  },
}
```

### Common Classes

```typescript
// Borders
"border-brutal" // 4px solid black border
"border-2 border-border" // 2px border
"border-b-4 border-border" // Bottom border only

// Shadows
"shadow-brutal" // 4px 4px shadow
"shadow-brutal-sm" // 2px 2px shadow

// Cards
"border-brutal shadow-brutal bg-card p-6"

// Buttons
"border-brutal shadow-brutal-sm hover-lift"

// Tables
"border-b-2 border-border" // Row separator
"border-b-4 border-border" // Header separator

// Responsive
"p-4 lg:p-8" // Mobile 16px, Desktop 32px
"text-sm lg:text-base" // Mobile small, Desktop base
"hidden lg:block" // Hide on mobile, show on desktop
```

### Mobile Responsive Utilities

```typescript
// Sidebar
"fixed lg:relative" // Fixed on mobile, relative on desktop
"-translate-x-full lg:translate-x-0" // Hidden on mobile, visible on desktop
"w-64" // Fixed width sidebar

// Layout
"pl-14 lg:pl-0" // Padding for mobile hamburger menu
"pt-20 lg:pt-8" // Top padding for fixed header

// Typography
"text-lg lg:text-xl" // Smaller on mobile
"text-xs lg:text-sm" // Extra small on mobile

// Spacing
"gap-2 lg:gap-4" // Less gap on mobile
"space-y-4 lg:space-y-6" // Tighter vertical spacing
```

---

## Performance Optimization

### Server Component Benefits
- Zero JavaScript for static content
- Automatic code splitting
- Streaming SSR

### Query Optimization
- Parallel queries with `Promise.all()`
- Count-only queries with `{ count: 'exact', head: true }`
- Index-backed filters (see Database Schema)

### Caching Strategy (Recommended for Production)

**Redis for Settings**:
```typescript
// Store maintenance mode, feature flags, chat limits
import { Redis } from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)

export async function getSettings() {
  const cached = await redis.get('admin:settings')
  if (cached) return JSON.parse(cached)

  const settings = await fetchFromDatabase()
  await redis.set('admin:settings', JSON.stringify(settings), 'EX', 300) // 5min TTL
  return settings
}
```

**Next.js Caching**:
```typescript
// Revalidate dashboard stats every 60 seconds
export const revalidate = 60

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  return <Dashboard stats={stats} />
}
```

---

## Testing

### Unit Tests (Recommended)

```typescript
// __tests__/lib/admin/analytics.test.ts
import { getDashboardStats } from '@/lib/admin/analytics'

describe('getDashboardStats', () => {
  it('returns all 8 metrics', async () => {
    const stats = await getDashboardStats()
    expect(stats).toHaveProperty('totalUsers')
    expect(stats).toHaveProperty('activeToday')
    // ... 6 more assertions
  })
})
```

### Integration Tests

```typescript
// __tests__/api/admin/users.test.ts
import { GET } from '@/app/api/admin/users/route'

describe('GET /api/admin/users', () => {
  it('returns 401 for unauthenticated requests', async () => {
    const response = await GET(mockRequest())
    expect(response.status).toBe(401)
  })

  it('returns 403 for non-admin users', async () => {
    const response = await GET(mockRequest({ tier: 'free' }))
    expect(response.status).toBe(403)
  })

  it('returns users for admin', async () => {
    const response = await GET(mockRequest({ tier: 'admin' }))
    expect(response.status).toBe(200)
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/admin/users.spec.ts
import { test, expect } from '@playwright/test'

test('admin can edit user tier', async ({ page }) => {
  await page.goto('/admin/users')
  await page.click('button:has-text("Edit Tier")')
  await page.selectOption('select[name="tier"]', 'pro')
  await page.click('button:has-text("Save")')
  await expect(page.locator('.toast')).toContainText('Success')
})
```

---

## Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # For admin operations

# Production only
REDIS_URL=redis://... # For settings cache
```

### Build Configuration

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['xxx.supabase.co'], // For user avatars
  },
}
```

### Migration Checklist

1. ✅ Run database migrations
   ```bash
   supabase db push
   ```

2. ✅ Create initial admin user
   ```sql
   UPDATE profiles SET subscription_tier = 'admin' WHERE email = 'admin@example.com';
   ```

3. ✅ Test RLS policies
   ```sql
   SET ROLE authenticated;
   SELECT * FROM profiles; -- Should work for admin
   ```

4. ✅ Configure AI providers (add at least one)

5. ✅ Test all admin routes manually

6. ✅ Enable Redis caching (production)

7. ✅ Set up monitoring (error tracking, performance)

---

## Security Considerations

### Admin User Management
- Only promote trusted users to admin tier
- Implement admin activity logging
- Regular security audits

### API Key Storage
- AI provider API keys stored encrypted in database
- Never expose keys in client-side code
- Rotate keys regularly

### Rate Limiting (Recommended)
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
})

export async function GET(request: NextRequest) {
  await limiter(request)
  // ... rest of handler
}
```

### Input Validation
```typescript
import { z } from 'zod'

const tierSchema = z.object({
  subscription_tier: z.enum(['free', 'pro', 'whale', 'admin']),
})

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const validated = tierSchema.parse(body) // Throws on invalid input
  // ... proceed with validated data
}
```

---

## Monitoring & Logging

### Error Tracking (Recommended)

```typescript
import * as Sentry from '@sentry/nextjs'

export async function GET(request: NextRequest) {
  try {
    // ... handler logic
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: 'admin-users' },
      user: { id: user?.id },
    })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### Analytics Events

```typescript
import { track } from '@/lib/analytics'

// Track admin actions
track('admin.user.tier_updated', {
  userId: targetUserId,
  newTier: tier,
  adminId: currentUserId,
})

track('admin.provider.created', {
  providerType: provider.provider_type,
  adminId: currentUserId,
})
```

### Audit Log (Recommended)

```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_created ON admin_audit_log(created_at DESC);
```

---

## Common Patterns & Recipes

### Adding a New Admin Page

1. Create page file: `app/(admin)/admin/new-feature/page.tsx`
2. Add server component with data fetching
3. Add to sidebar navigation in `components/admin/sidebar.tsx`
4. Create API route if needed: `app/api/admin/new-feature/route.ts`
5. Add RLS policy for new table (if applicable)
6. Update documentation

### Adding a New Setting

1. Add to settings object in `app/api/admin/settings/route.ts`
2. Create component in `components/admin/settings/new-setting.tsx`
3. Add to settings page: `app/(admin)/admin/settings/page.tsx`
4. Use setting in application code
5. Test toggle/save workflow

### Adding a New Chart

1. Create component: `components/admin/analytics/new-chart.tsx`
2. Add data fetching function in `lib/admin/analytics.ts`
3. Import Recharts component (Line, Bar, Pie, Area, etc.)
4. Add to analytics page
5. Style with brutalist theme

---

*This document is a living reference. Update as the admin panel evolves.*
