# Admin Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build full-featured admin panel with user management, AI provider configuration, analytics dashboard, content management, and system settings.

**Architecture:** Next.js App Router with route group `(admin)`, Server Components for data fetching, Client Components for interactivity, role-based access control via Supabase RLS checking `subscription_tier='admin'`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase (PostgreSQL + RLS), Recharts, shadcn/ui, Tailwind CSS

---

## Phase 1: Foundation & Authentication

### Task 1: Create Admin Route Group and Layout

**Files:**
- Create: `app/(admin)/layout.tsx`
- Create: `app/(admin)/admin/page.tsx`

**Step 1: Create admin layout with auth check**

Create `app/(admin)/layout.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/sign-in?redirect=/admin')
  }

  // Check admin authorization
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_tier !== 'admin') {
    redirect('/dashboard?error=unauthorized')
  }

  return <div>{children}</div>
}
```

**Step 2: Create placeholder dashboard page**

Create `app/(admin)/admin/page.tsx`:
```typescript
export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-2">Welcome to admin panel</p>
    </div>
  )
}
```

**Step 3: Test admin route protection**

Run: `npm run dev`

Navigate to: `http://localhost:3000/admin`

Expected:
- If not logged in → Redirect to `/auth/sign-in?redirect=/admin`
- If logged in as non-admin → Redirect to `/dashboard?error=unauthorized`
- If logged in as admin → See "Admin Dashboard" page

**Step 4: Create admin user for testing**

Run Supabase SQL:
```sql
-- Promote your test user to admin
UPDATE profiles
SET subscription_tier = 'admin'
WHERE email = 'your-test-email@example.com';
```

Expected: User can now access /admin

**Step 5: Commit**

```bash
git add app/(admin)
git commit -m "feat: create admin route group with auth protection"
```

---

### Task 2: Add Admin RLS Policies

**Files:**
- Create: `supabase/migrations/20251229000004_admin_rls_policies.sql`

**Step 1: Create RLS policies migration**

Create `supabase/migrations/20251229000004_admin_rls_policies.sql`:
```sql
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
```

**Step 2: Apply migration**

Copy migration content and run in Supabase SQL Editor or:
```bash
# If using local Supabase
supabase migration up
```

Expected: Policies created successfully

**Step 3: Commit**

```bash
git add supabase/migrations/20251229000004_admin_rls_policies.sql
git commit -m "feat: add admin RLS policies for all tables"
```

---

### Task 3: Create Admin Sidebar Component

**Files:**
- Create: `components/admin/sidebar.tsx`

**Step 1: Install recharts for later use**

Run:
```bash
npm install recharts
```

Expected: recharts added to package.json

**Step 2: Create admin sidebar component**

Create `components/admin/sidebar.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Brain,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/ai-providers', label: 'AI Providers', icon: Brain },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r-4 border-border bg-background p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">IndoStock AI</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all border-brutal',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-brutal-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

**Step 3: Create admin header component**

Create `components/admin/header.tsx`:
```typescript
'use client'

import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AdminHeaderProps {
  userEmail: string
  userName?: string
  avatarUrl?: string
}

export function AdminHeader({ userEmail, userName, avatarUrl }: AdminHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
    router.refresh()
  }

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase()
    : userEmail[0].toUpperCase()

  return (
    <header className="border-b-4 border-border bg-background px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="border-brutal">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{userName || 'Admin'}</p>
              <p className="text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-brutal shadow-brutal-sm hover-lift"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
```

**Step 4: Update admin layout to use sidebar and header**

Modify `app/(admin)/layout.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/sign-in?redirect=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_tier !== 'admin') {
    redirect('/dashboard?error=unauthorized')
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader
          userEmail={user.email || ''}
          userName={profile.full_name}
          avatarUrl={profile.avatar_url}
        />
        <main className="flex-1 p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 5: Test sidebar navigation**

Run: `npm run dev`

Navigate to: `http://localhost:3000/admin`

Expected:
- Sidebar visible on left with 6 navigation items
- Header shows admin user info and logout button
- Active route highlighted in sidebar
- Clicking nav items changes URL (404 for now, we'll build pages next)

**Step 6: Commit**

```bash
git add components/admin package.json package-lock.json app/(admin)/layout.tsx
git commit -m "feat: add admin sidebar and header components"
```

---

## Phase 2: Dashboard Page

### Task 4: Create Stats Card Component

**Files:**
- Create: `components/admin/stats-card.tsx`

**Step 1: Create reusable stats card component**

Create `components/admin/stats-card.tsx`:
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendLabel?: string
}

export function StatsCard({ title, value, icon: Icon, trend, trendLabel }: StatsCardProps) {
  return (
    <Card className="border-brutal shadow-brutal-sm hover-lift transition-transform">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
        {trend && trendLabel && (
          <p className="text-xs text-muted-foreground mt-2">
            <span className={trend.startsWith('+') ? 'text-primary' : 'text-destructive'}>
              {trend}
            </span>{' '}
            {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add components/admin/stats-card.tsx
git commit -m "feat: create reusable stats card component"
```

---

### Task 5: Build Dashboard with Analytics Data

**Files:**
- Create: `lib/admin/analytics.ts`
- Modify: `app/(admin)/admin/page.tsx`

**Step 1: Create analytics data fetching functions**

Create `lib/admin/analytics.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Active today (users with chat messages today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: activeToday } = await supabase
    .from('chat_messages')
    .select('session_id, chat_sessions(user_id)')
    .gte('created_at', today.toISOString())

  const uniqueActiveUsers = new Set(
    activeToday?.map(m => (m.chat_sessions as any)?.user_id).filter(Boolean)
  ).size

  // New this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)

  const { count: newThisWeek } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString())

  // Admin users
  const { count: adminUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_tier', 'admin')

  // Total chat sessions
  const { count: totalSessions } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })

  // Chats today
  const { count: chatsToday } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Active AI providers
  const { count: activeProviders } = await supabase
    .from('ai_providers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Average response time today
  const { data: responseTimes } = await supabase
    .from('chat_messages')
    .select('response_time_ms')
    .gte('created_at', today.toISOString())
    .not('response_time_ms', 'is', null)

  const avgResponseTime = responseTimes && responseTimes.length > 0
    ? Math.round(
        responseTimes.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / responseTimes.length
      )
    : 0

  return {
    totalUsers: totalUsers || 0,
    activeToday: uniqueActiveUsers,
    newThisWeek: newThisWeek || 0,
    adminUsers: adminUsers || 0,
    totalSessions: totalSessions || 0,
    chatsToday: chatsToday || 0,
    activeProviders: activeProviders || 0,
    avgResponseTime,
  }
}
```

**Step 2: Build dashboard page with stats cards**

Modify `app/(admin)/admin/page.tsx`:
```typescript
import { getDashboardStats } from '@/lib/admin/analytics'
import { StatsCard } from '@/components/admin/stats-card'
import {
  Users,
  UserPlus,
  Shield,
  MessageSquare,
  Activity,
  Brain,
  Zap,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of system metrics and quick actions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
        />
        <StatsCard
          title="Active Today"
          value={stats.activeToday.toLocaleString()}
          icon={Activity}
        />
        <StatsCard
          title="New This Week"
          value={stats.newThisWeek.toLocaleString()}
          icon={UserPlus}
        />
        <StatsCard
          title="Admin Users"
          value={stats.adminUsers.toLocaleString()}
          icon={Shield}
        />
        <StatsCard
          title="Total Chat Sessions"
          value={stats.totalSessions.toLocaleString()}
          icon={MessageSquare}
        />
        <StatsCard
          title="Chats Today"
          value={stats.chatsToday.toLocaleString()}
          icon={TrendingUp}
        />
        <StatsCard
          title="Active AI Providers"
          value={stats.activeProviders.toLocaleString()}
          icon={Brain}
        />
        <StatsCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime}ms`}
          icon={Zap}
        />
      </div>

      {/* Quick Actions */}
      <div className="border-t-4 border-border pt-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Button
            asChild
            className="border-brutal shadow-brutal-sm hover-lift"
          >
            <Link href="/admin/ai-providers">
              <Brain className="h-4 w-4 mr-2" />
              Manage AI Providers
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-brutal shadow-brutal-sm hover-lift"
          >
            <Link href="/admin/analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Test dashboard page**

Run: `npm run dev`

Navigate to: `http://localhost:3000/admin`

Expected:
- 8 stats cards displayed in grid
- Real data from database shown
- Quick action buttons visible
- All styling matches brutalist design

**Step 4: Commit**

```bash
git add lib/admin/analytics.ts app/(admin)/admin/page.tsx
git commit -m "feat: build dashboard page with live stats"
```

---

## Phase 3: User Management

### Task 6: Create Users List Page

**Files:**
- Create: `app/(admin)/admin/users/page.tsx`
- Create: `lib/admin/users.ts`

**Step 1: Create user data fetching function**

Create `lib/admin/users.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'

interface GetUsersParams {
  page?: number
  search?: string
  tier?: string
  level?: string
  limit?: number
}

export async function getUsers({
  page = 1,
  search = '',
  tier = '',
  level = '',
  limit = 50,
}: GetUsersParams = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*, chat_sessions(count)', { count: 'exact' })

  // Apply search filter
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`)
  }

  // Apply tier filter
  if (tier) {
    query = query.eq('subscription_tier', tier)
  }

  // Apply level filter
  if (level) {
    query = query.eq('user_level', level)
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: users, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching users:', error)
    return { users: [], count: 0, totalPages: 0 }
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    users: users || [],
    count: count || 0,
    totalPages,
  }
}
```

**Step 2: Create users list page**

Create `app/(admin)/admin/users/page.tsx`:
```typescript
import { getUsers } from '@/lib/admin/users'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface PageProps {
  searchParams: {
    page?: string
    search?: string
    tier?: string
    level?: string
  }
}

export default async function UsersPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const tier = searchParams.tier || ''
  const level = searchParams.level || ''

  const { users, count, totalPages } = await getUsers({
    page,
    search,
    tier,
    level,
  })

  const tierColors = {
    free: 'bg-muted text-muted-foreground',
    pro: 'bg-primary/10 text-primary',
    whale: 'bg-secondary/10 text-secondary',
    admin: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, edit tiers, and view activity
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name or username..."
          defaultValue={search}
          className="flex-1 border-brutal"
        />
        <Select defaultValue={tier}>
          <SelectTrigger className="w-48 border-brutal">
            <SelectValue placeholder="All Tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tiers</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="whale">Whale</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue={level}>
          <SelectTrigger className="w-48 border-brutal">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="newbie">Newbie</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="border-brutal shadow-brutal bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b-4 border-border">
              <TableHead className="font-bold">User</TableHead>
              <TableHead className="font-bold">Tier</TableHead>
              <TableHead className="font-bold">Level</TableHead>
              <TableHead className="font-bold">Joined</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const initials = user.full_name
                ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                : user.username?.[0]?.toUpperCase() || 'U'

              return (
                <TableRow key={user.id} className="border-b-2 border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="border-brutal">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border-brutal ${tierColors[user.subscription_tier as keyof typeof tierColors]}`}
                    >
                      {user.subscription_tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {user.user_level || 'N/A'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-brutal shadow-brutal-sm"
                    >
                      <Link href={`/admin/users/${user.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          disabled={page === 1}
          className="border-brutal"
        >
          ← Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages} • {count} total users
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          className="border-brutal"
        >
          Next →
        </Button>
      </div>
    </div>
  )
}
```

**Step 3: Install date-fns for date formatting**

Run:
```bash
npm install date-fns
```

Expected: date-fns added to dependencies

**Step 4: Test users list page**

Run: `npm run dev`

Navigate to: `http://localhost:3000/admin/users`

Expected:
- Users table displays with avatar, name, tier, level, joined date
- Tier badges color-coded correctly
- Pagination shows correct counts
- Search and filters visible (not functional yet, will add client-side next)

**Step 5: Commit**

```bash
git add lib/admin/users.ts app/(admin)/admin/users/page.tsx package.json package-lock.json
git commit -m "feat: create users list page with table and filters"
```

---

### Task 7: Add Client-Side Search and Filters

**Files:**
- Create: `components/admin/users/users-filters.tsx`
- Modify: `app/(admin)/admin/users/page.tsx`

**Step 1: Create client component for filters**

Create `components/admin/users/users-filters.tsx`:
```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTransition } from 'react'

export function UsersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset to page 1 when filtering
    params.set('page', '1')

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`)
    })
  }

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search by name or username..."
        defaultValue={searchParams.get('search') || ''}
        onChange={(e) => updateFilters('search', e.target.value)}
        className="flex-1 border-brutal"
      />
      <Select
        defaultValue={searchParams.get('tier') || ''}
        onValueChange={(val) => updateFilters('tier', val)}
      >
        <SelectTrigger className="w-48 border-brutal">
          <SelectValue placeholder="All Tiers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Tiers</SelectItem>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="whale">Whale</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get('level') || ''}
        onValueChange={(val) => updateFilters('level', val)}
      >
        <SelectTrigger className="w-48 border-brutal">
          <SelectValue placeholder="All Levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Levels</SelectItem>
          <SelectItem value="newbie">Newbie</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>
      {isPending && (
        <div className="flex items-center text-sm text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  )
}
```

**Step 2: Update users page to use client filter component**

Modify `app/(admin)/admin/users/page.tsx` - replace the filters div with:
```typescript
import { UsersFilters } from '@/components/admin/users/users-filters'

// ... inside the component, replace the filters section:

{/* Filters */}
<UsersFilters />
```

**Step 3: Add pagination navigation**

Create `components/admin/users/users-pagination.tsx`:
```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface UsersPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
}

export function UsersPagination({
  currentPage,
  totalPages,
  totalCount,
}: UsersPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => navigate(currentPage - 1)}
        className="border-brutal"
      >
        ← Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages} • {totalCount} total users
      </span>
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => navigate(currentPage + 1)}
        className="border-brutal"
      >
        Next →
      </Button>
    </div>
  )
}
```

Update users page to use pagination component:
```typescript
import { UsersPagination } from '@/components/admin/users/users-pagination'

// ... replace pagination section:

{/* Pagination */}
<UsersPagination
  currentPage={page}
  totalPages={totalPages}
  totalCount={count}
/>
```

**Step 4: Test filters and pagination**

Run: `npm run dev`

Navigate to: `http://localhost:3000/admin/users`

Test:
- Type in search box → URL updates with `?search=...`
- Select tier filter → URL updates, table filters
- Click pagination → Page changes, data updates

Expected: All filters and pagination work with URL params

**Step 5: Commit**

```bash
git add components/admin/users app/(admin)/admin/users/page.tsx
git commit -m "feat: add client-side filters and pagination to users list"
```

---

## Phase 4: User Detail Page

### Task 8: Create User Detail Page

**Files:**
- Create: `app/(admin)/admin/users/[id]/page.tsx`
- Create: `lib/admin/users.ts` (add function)

**Step 1: Add getUserById function**

Add to `lib/admin/users.ts`:
```typescript
export async function getUserById(userId: string) {
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('profiles')
    .select(`
      *,
      chat_sessions(count),
      watchlists(count),
      alerts(count)
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  // Get recent chat sessions
  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('id, title, message_count, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    ...user,
    recentSessions: sessions || [],
  }
}
```

**Step 2: Create user detail page**

Create `app/(admin)/admin/users/[id]/page.tsx`:
```typescript
import { getUserById } from '@/lib/admin/users'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageSquare,
  Star,
  Bell,
  Calendar,
  Activity,
} from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: PageProps) {
  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.username?.[0]?.toUpperCase() || 'U'

  const tierColors = {
    free: 'bg-muted text-muted-foreground',
    pro: 'bg-primary/10 text-primary',
    whale: 'bg-secondary/10 text-secondary',
    admin: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">User Detail</h1>
        <p className="text-muted-foreground mt-2">
          View and manage user information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Profile Info */}
        <div className="md:col-span-1">
          <Card className="border-brutal shadow-brutal">
            <CardHeader>
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 border-brutal mb-4">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl text-center mb-1">
                  {user.full_name || 'N/A'}
                </CardTitle>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm font-medium break-all">
                  {/* Email from auth.users, need to fetch separately */}
                  {user.id}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Subscription Tier</Label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={`border-brutal ${tierColors[user.subscription_tier as keyof typeof tierColors]}`}
                  >
                    {user.subscription_tier}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">User Level</Label>
                <p className="text-sm font-medium capitalize">
                  {user.user_level || 'N/A'}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Trading Style</Label>
                <p className="text-sm font-medium capitalize">
                  {user.trading_style || 'N/A'}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Joined</Label>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(user.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Chat Usage</Label>
                <p className="text-sm font-medium">
                  {user.daily_chat_count} / {user.chat_limit} today
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity Stats */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-brutal shadow-brutal-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Chats
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {user.chat_sessions?.[0]?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-brutal shadow-brutal-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Watchlist
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {user.watchlists?.[0]?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-brutal shadow-brutal-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Alerts
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {user.alerts?.[0]?.count || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Chat Sessions */}
          <Card className="border-brutal shadow-brutal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Chat Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.recentSessions.length > 0 ? (
                user.recentSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="border-brutal p-4 bg-muted/30"
                  >
                    <p className="font-medium">{session.title || 'Untitled Chat'}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.message_count} messages •{' '}
                      {formatDistanceToNow(new Date(session.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No chat sessions yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-brutal border-destructive shadow-brutal">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-brutal"
              >
                Send Password Reset Email
              </Button>
              <Button
                variant="destructive"
                className="w-full border-brutal"
              >
                Delete User Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Test user detail page**

Run: `npm run dev`

Navigate to: `http://localhost:3000/admin/users`

Click "View" on any user

Expected:
- User detail page shows profile info
- Stats cards display chat/watchlist/alert counts
- Recent chat sessions listed (if any)
- Danger zone actions visible

**Step 4: Commit**

```bash
git add lib/admin/users.ts app/(admin)/admin/users/[id]/page.tsx
git commit -m "feat: create user detail page with stats and activity"
```

---

**Note:** Implementation plan ini sudah mencakup:
- ✅ Foundation & Auth (Tasks 1-3)
- ✅ Dashboard Page (Tasks 4-5)
- ✅ User Management List (Tasks 6-7)
- ✅ User Detail Page (Task 8)

Saya akan melanjutkan dengan Phase 5-8 untuk melengkapi implementasi:
- Phase 5: User Tier Editing & Deletion
- Phase 6: AI Providers Management
- Phase 7: Analytics Dashboard
- Phase 8: Content Management & Settings

Apakah saya lanjutkan menulis semua tasks hingga selesai? Atau kamu ingin review dulu tasks 1-8 yang sudah saya tulis?
