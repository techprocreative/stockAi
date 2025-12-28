# Admin Panel Design - IndoStock AI

**Date:** 29 December 2025
**Type:** Full Featured Admin Suite
**Estimated Dev Time:** 7-10 days
**Design Pattern:** Role-Based Access, Sidebar Navigation, Neo-Brutalist UI

---

## 1. Architecture Overview

### System Design

Admin panel is a separate application within route group `app/(admin)/admin/*` with authentication middleware checking `subscription_tier = 'admin'`. Uses Server Components for data fetching and Client Components for interactivity.

**Route Structure:**
```
/admin                    → Dashboard (stats overview)
/admin/users              → User management list
/admin/users/[id]         → User detail & edit
/admin/ai-providers       → AI provider CRUD
/admin/analytics          → Analytics & charts
/admin/content            → Content management (glossary, briefings)
/admin/settings           → System settings
```

### Authentication Flow

1. User navigates to `/admin`
2. Middleware checks authentication → redirect to `/auth/sign-in` if not logged in
3. Admin layout checks `subscription_tier = 'admin'` → redirect to `/dashboard` with error toast if not admin
4. Admin granted full access to panel

### Layout Architecture

- Shared admin layout with persistent sidebar navigation
- Neo-brutalist design matching main app (border-brutal, shadow-brutal, warm beige background)
- Responsive: sidebar collapses to hamburger menu on mobile (<768px)
- Header bar shows current admin user avatar + name + logout button
- Breadcrumb navigation below header

**Sidebar Navigation Items:**
- Dashboard (LayoutDashboard icon)
- Users (Users icon)
- AI Providers (Brain icon)
- Analytics (BarChart3 icon)
- Content (FileText icon)
- Settings (Settings icon)

### Data Fetching Strategy

- **Server-side pagination:** 50 items per page default
- **Search/filter via URL params:** `?search=john&tier=pro&page=2`
- **Supabase RLS policies:** Only `subscription_tier='admin'` can read all user data
- **Cache strategy:** Analytics cached for 5 minutes to reduce DB load
- **Optimistic updates:** Client-side mutations with revalidation

---

## 2. Dashboard Page - Key Metrics Overview

### Stats Cards Section

8 metric cards in 4-column grid (responsive: 2 cols tablet, 1 col mobile)

**Top Row - User Metrics:**
1. **Total Users** - `COUNT(*) FROM profiles`
2. **Active Today** - Users with chat messages `created_at >= today()`
3. **New This Week** - `created_at >= today() - 7 days`
4. **Admin Users** - `COUNT(*) WHERE subscription_tier = 'admin'`

**Bottom Row - System Metrics:**
5. **Total Chat Sessions** - Lifetime count
6. **Chats Today** - `COUNT(*) FROM chat_messages WHERE created_at >= today()`
7. **Active AI Providers** - `COUNT(*) WHERE is_active = true`
8. **Avg Response Time** - `AVG(response_time_ms) FROM chat_messages WHERE created_at >= today()`

**Card Component Design:**
```tsx
<Card className="border-brutal shadow-brutal-sm hover-lift">
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Total Users
    </CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-4xl font-bold">1,234</div>
    <p className="text-xs text-muted-foreground mt-2">
      <span className="text-primary">+12%</span> from last week
    </p>
  </CardContent>
</Card>
```

### Quick Actions Section

3 brutalist action buttons below stats:
- **Add User Manually** → Opens dialog to create admin/whale tier user
- **Manage AI Providers** → Link to /admin/ai-providers
- **View Analytics** → Link to /admin/analytics

### Data Fetching

All metrics fetched server-side in Dashboard page component. No real-time updates (manual refresh). Queries optimized with `.count()` and proper indexing.

---

## 3. User Management

### Users List Page (`/admin/users`)

#### Search & Filters (Top Bar)

```tsx
<div className="flex gap-4 mb-6">
  <Input
    placeholder="Search by name, email, username..."
    className="flex-1"
  />
  <Select> {/* Tier filter */}
    <option>All Tiers</option>
    <option>Free</option>
    <option>Pro</option>
    <option>Whale</option>
    <option>Admin</option>
  </Select>
  <Select> {/* Level filter */}
    <option>All Levels</option>
    <option>Newbie</option>
    <option>Intermediate</option>
    <option>Advanced</option>
  </Select>
  <Select> {/* Onboarding filter */}
    <option>All Status</option>
    <option>Completed</option>
    <option>Incomplete</option>
  </Select>
</div>
```

Filters persist in URL params: `/admin/users?search=john&tier=pro&page=2`

#### Data Table

**Columns:**
- Avatar (40x40 circle)
- Full Name
- Email
- Username
- Subscription Tier (badge with color coding)
- User Level
- Chat Count (lifetime)
- Joined Date (relative: "2 days ago")
- Actions (View, Edit buttons)

**Table Features:**
- Server-side sorted by `created_at DESC` default
- 50 users per page
- Pagination: `[← Previous] Page 1 of 24 [Next →]`
- Click entire row to navigate to user detail page
- Tier badges: free=gray, pro=blue, whale=purple, admin=red

**Data Fetching:**
```typescript
const { data: users, count } = await supabase
  .from('profiles')
  .select('*, auth.users(email)', { count: 'exact' })
  .ilike('full_name', `%${search}%`)
  .eq('subscription_tier', tier) // if filtered
  .range((page - 1) * 50, page * 50 - 1)
  .order('created_at', { ascending: false })
```

### User Detail Page (`/admin/users/[id]`)

#### Layout: Two Column Grid

**Left Column - Profile Card:**
```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <Avatar className="w-32 h-32 border-brutal mx-auto">
      <AvatarImage src={user.avatar_url} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
    <h2 className="text-2xl font-bold text-center mt-4">
      {user.full_name}
    </h2>
    <p className="text-muted-foreground text-center">
      @{user.username}
    </p>
    <p className="text-sm text-muted-foreground text-center">
      {user.email}
    </p>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Editable Tier */}
    <div>
      <Label>Subscription Tier</Label>
      <Select value={tier} onValueChange={handleTierUpdate}>
        <option>free</option>
        <option>pro</option>
        <option>whale</option>
        <option>admin</option>
      </Select>
      <Button onClick={saveTier}>Save Tier</Button>
    </div>

    {/* Display-only fields */}
    <div>
      <Label>User Level</Label>
      <p>{user.user_level}</p>
    </div>
    <div>
      <Label>Trading Style</Label>
      <p>{user.trading_style}</p>
    </div>
    <div>
      <Label>Joined</Label>
      <p>{formatDate(user.created_at)}</p>
    </div>
    <div>
      <Label>Last Active</Label>
      <p>{relativeTime(user.last_active)}</p>
    </div>
    <div>
      <Label>Chat Usage</Label>
      <p>{user.daily_chat_count} / {user.chat_limit} today</p>
    </div>
  </CardContent>
</Card>
```

**Right Column - Activity Stats:**
```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <CardTitle>Activity Overview</CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-2 gap-4">
      <StatCard label="Total Chats" value={totalChats} />
      <StatCard label="Watchlist" value={watchlistCount} />
      <StatCard label="Active Alerts" value={alertCount} />
      <StatCard label="Sessions" value={sessionCount} />
    </div>

    {/* Recent Chat Sessions */}
    <div>
      <h3 className="font-semibold mb-3">Recent Chat Sessions</h3>
      {sessions.slice(0, 5).map(session => (
        <div key={session.id} className="border-brutal p-3 mb-2">
          <p className="font-medium">{session.title}</p>
          <p className="text-sm text-muted-foreground">
            {session.message_count} messages • {relativeTime(session.created_at)}
          </p>
        </div>
      ))}
      <Link href={`/admin/users/${id}/sessions`}>
        View All Sessions →
      </Link>
    </div>
  </CardContent>
</Card>
```

#### Danger Zone (Bottom)

```tsx
<Card className="border-brutal border-destructive mt-6">
  <CardHeader>
    <CardTitle className="text-destructive">Danger Zone</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <Button
      variant="outline"
      className="w-full border-brutal"
      onClick={sendPasswordReset}
    >
      Send Password Reset Email
    </Button>
    <Button
      variant="destructive"
      className="w-full border-brutal"
      onClick={() => setDeleteDialogOpen(true)}
    >
      Delete User Account
    </Button>
  </CardContent>
</Card>
```

**Delete Confirmation Dialog:**
- Warning message about cascade deletion
- "Type DELETE to confirm" input field
- Final confirmation button

---

## 4. AI Providers Management

### Provider List Page (`/admin/ai-providers`)

#### Top Actions Bar

```tsx
<div className="flex justify-between mb-6">
  <Button
    className="border-brutal shadow-brutal-sm hover-lift"
    onClick={() => setAddModalOpen(true)}
  >
    <Plus className="h-4 w-4 mr-2" />
    Add New Provider
  </Button>
  <Button
    variant="outline"
    className="border-brutal shadow-brutal-sm hover-lift"
    onClick={refreshProviders}
  >
    <RefreshCw className="h-4 w-4 mr-2" />
    Refresh Status
  </Button>
</div>
```

#### Provider Cards Grid (2 columns, 1 on mobile)

```tsx
<Card className="border-brutal shadow-brutal hover-lift">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-3 h-3 rounded-full",
          isActive ? "bg-primary" : "bg-destructive"
        )} />
        <div>
          <CardTitle>OpenAI GPT-4</CardTitle>
          <CardDescription>
            Priority: 1 • {isActive ? 'Active' : 'Inactive'}
          </CardDescription>
        </div>
      </div>
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {provider.provider_type}
      </Badge>
    </div>
  </CardHeader>
  <CardContent>
    <dl className="space-y-2 text-sm">
      <div>
        <dt className="text-muted-foreground">Model</dt>
        <dd className="font-medium">{provider.model_name}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Base URL</dt>
        <dd className="font-mono text-xs">{provider.base_url}</dd>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <dt className="text-muted-foreground">Rate Limit</dt>
          <dd className="font-medium">{provider.rate_limit} req/min</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Max Tokens</dt>
          <dd className="font-medium">{provider.max_tokens}</dd>
        </div>
      </div>
      <div>
        <dt className="text-muted-foreground">Cost per 1k tokens</dt>
        <dd className="font-medium">${provider.cost_per_1k_tokens}</dd>
      </div>
    </dl>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button
      size="sm"
      variant="outline"
      className="flex-1 border-brutal"
      onClick={() => openEditModal(provider)}
    >
      Edit
    </Button>
    <Button
      size="sm"
      variant={isActive ? 'destructive' : 'default'}
      className="flex-1 border-brutal"
      onClick={() => toggleActive(provider.id)}
    >
      {isActive ? 'Deactivate' : 'Activate'}
    </Button>
    <Button
      size="sm"
      variant="outline"
      className="border-brutal"
      onClick={() => testProvider(provider.id)}
    >
      Test
    </Button>
  </CardFooter>
</Card>
```

#### Add/Edit Provider Dialog

```tsx
<Dialog>
  <DialogContent className="border-brutal shadow-brutal max-w-2xl">
    <DialogHeader>
      <DialogTitle>
        {isEdit ? 'Edit' : 'Add New'} AI Provider
      </DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div>
        <Label>Provider Name</Label>
        <Input
          placeholder="OpenAI GPT-4"
          value={formData.provider_name}
          onChange={e => setFormData({...formData, provider_name: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>Provider Type</Label>
        <Select
          value={formData.provider_type}
          onValueChange={val => setFormData({...formData, provider_type: val})}
          required
        >
          <option value="openai">OpenAI</option>
          <option value="pollinations">Pollinations</option>
        </Select>
      </div>

      <div>
        <Label>Base URL</Label>
        <Input
          placeholder="https://api.openai.com/v1"
          value={formData.base_url}
          onChange={e => setFormData({...formData, base_url: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>API Key</Label>
        <Input
          type="password"
          placeholder="sk-..."
          value={formData.api_key_encrypted}
          onChange={e => setFormData({...formData, api_key_encrypted: e.target.value})}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Will be encrypted before saving
        </p>
      </div>

      <div>
        <Label>Model Name</Label>
        <Input
          placeholder="gpt-4-turbo-preview"
          value={formData.model_name}
          onChange={e => setFormData({...formData, model_name: e.target.value})}
          required
        />
      </div>

      {/* Advanced Settings - Collapsible */}
      <Collapsible>
        <CollapsibleTrigger className="font-semibold">
          Advanced Settings
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Input
                type="number"
                min="1"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label>Rate Limit (req/min)</Label>
              <Input
                type="number"
                value={formData.rate_limit}
                onChange={e => setFormData({...formData, rate_limit: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={formData.max_tokens}
                onChange={e => setFormData({...formData, max_tokens: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label>Temperature</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formData.temperature}
                onChange={e => setFormData({...formData, temperature: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cost per 1k tokens ($)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.cost_per_1k_tokens}
                onChange={e => setFormData({...formData, cost_per_1k_tokens: parseFloat(e.target.value)})}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Checkbox
                checked={formData.supports_streaming}
                onCheckedChange={val => setFormData({...formData, supports_streaming: val})}
              />
              <Label>Supports Streaming</Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="border-brutal"
          onClick={() => setDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="border-brutal shadow-brutal-sm"
        >
          Save Provider
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

#### Provider Routing Logic Info Box

```tsx
<Alert className="border-brutal mb-6">
  <Info className="h-4 w-4" />
  <AlertTitle>Provider Routing Logic</AlertTitle>
  <AlertDescription>
    Providers are used by priority order (lower number = higher priority).
    If Priority 1 fails or hits rate limit, system automatically falls back
    to Priority 2. Only active providers are used.
  </AlertDescription>
</Alert>
```

#### Test Provider Functionality

When clicking "Test" button:
1. Show loading state
2. Send POST request to `/api/admin/ai-providers/test` with provider ID
3. Backend sends test prompt: "Say 'OK' if you can read this"
4. Measure response time
5. Show toast with result:
   - Success: "✓ Provider responded in 2.3s"
   - Failure: "✗ Provider failed: [error message]"

---

## 5. Analytics Dashboard

### Time Range Selector (Top)

```tsx
<div className="flex gap-4 mb-6">
  <Select
    value={timeRange}
    onValueChange={setTimeRange}
  >
    <option value="7">Last 7 Days</option>
    <option value="30">Last 30 Days</option>
    <option value="90">Last 90 Days</option>
    <option value="all">All Time</option>
  </Select>
  <Button
    variant="outline"
    className="border-brutal"
    onClick={refreshAnalytics}
  >
    <RefreshCw className="h-4 w-4 mr-2" />
    Refresh
  </Button>
</div>
```

### Section 1: User Growth

**Stats Row:**
```tsx
<div className="grid grid-cols-3 gap-4 mb-6">
  <StatCard
    title="Total Users"
    value={totalUsers}
    icon={Users}
  />
  <StatCard
    title="New (7d)"
    value={newUsers}
    trend="+12%"
    icon={UserPlus}
  />
  <StatCard
    title="Growth Rate"
    value="7.2%"
    icon={TrendingUp}
  />
</div>
```

**Line Chart - User Growth:**
```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <CardTitle>User Growth Over Time</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={userGrowthData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

**Data Shape:**
```typescript
const userGrowthData = [
  { date: '2025-12-23', count: 1100 },
  { date: '2025-12-24', count: 1150 },
  { date: '2025-12-25', count: 1180 },
  // ...
]
```

### Section 2: Engagement Metrics

**Stats Row:**
```tsx
<div className="grid grid-cols-4 gap-4 mb-6">
  <StatCard title="Total Chats" value={2456} icon={MessageSquare} />
  <StatCard title="Today" value={342} icon={Activity} />
  <StatCard title="Avg/User" value="7.2" icon={BarChart} />
  <StatCard title="Watchlist Items" value={1234} icon={Star} />
</div>
```

**Bar Chart - Daily Chat Volume:**
```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <CardTitle>Daily Chat Volume</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chatVolumeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="count"
          fill="hsl(var(--accent))"
        />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

### Section 3: Subscription Distribution

**Donut Chart - Users by Tier:**
```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <CardTitle>Users by Subscription Tier</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={tierDistribution}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="count"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {tierDistribution.map((entry, index) => (
            <Cell key={index} fill={TIER_COLORS[entry.tier]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>

    {/* Legend */}
    <div className="grid grid-cols-2 gap-2 mt-4">
      {tierDistribution.map(tier => (
        <div key={tier.tier} className="flex items-center gap-2">
          <div
            className="w-4 h-4 border-brutal"
            style={{ backgroundColor: TIER_COLORS[tier.tier] }}
          />
          <span className="text-sm">
            {tier.tier}: {tier.count} ({tier.percentage}%)
          </span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

**Tier Colors:**
```typescript
const TIER_COLORS = {
  free: 'hsl(var(--muted))',
  pro: 'hsl(var(--primary))',
  whale: 'hsl(var(--secondary))',
  admin: 'hsl(var(--destructive))',
}
```

### Section 4: System Health

**AI Provider Performance Table:**
```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <CardTitle>AI Provider Performance (Last 7 Days)</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Provider</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requests</TableHead>
          <TableHead>Avg Response</TableHead>
          <TableHead>Success Rate</TableHead>
          <TableHead>Last Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providerStats.map(provider => (
          <TableRow key={provider.id}>
            <TableCell className="font-medium">
              {provider.provider_name}
            </TableCell>
            <TableCell>
              <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                {provider.is_active ? '🟢 Active' : '🔴 Inactive'}
              </Badge>
            </TableCell>
            <TableCell>{provider.request_count}</TableCell>
            <TableCell>{provider.avg_response}s</TableCell>
            <TableCell>
              <span className={cn(
                provider.success_rate > 95 ? 'text-primary' : 'text-destructive'
              )}>
                {provider.success_rate}%
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {provider.last_error || 'None'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### Data Caching Strategy

```typescript
// Cache analytics data for 5 minutes
export async function getAnalyticsData(timeRange: number) {
  const cacheKey = `analytics:${timeRange}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  const data = await fetchAnalyticsFromDB(timeRange)
  await redis.set(cacheKey, JSON.stringify(data), 'EX', 300) // 5 min TTL

  return data
}
```

---

## 6. Content Management

### Tab Navigation Component

```tsx
<Tabs defaultValue="glossary">
  <TabsList className="border-brutal">
    <TabsTrigger value="glossary">Glossary Terms</TabsTrigger>
    <TabsTrigger value="briefings">Morning Briefings</TabsTrigger>
    <TabsTrigger value="news">News Sources</TabsTrigger>
  </TabsList>

  <TabsContent value="glossary">
    {/* Glossary content */}
  </TabsContent>

  <TabsContent value="briefings">
    {/* Briefings content */}
  </TabsContent>

  <TabsContent value="news">
    {/* News sources content */}
  </TabsContent>
</Tabs>
```

### Tab 1: Glossary Terms

**Top Actions:**
```tsx
<div className="flex gap-4 mb-6">
  <Input
    placeholder="Search glossary terms..."
    className="flex-1"
    value={search}
    onChange={e => setSearch(e.target.value)}
  />
  <Select
    value={category}
    onValueChange={setCategory}
  >
    <option value="">All Categories</option>
    <option value="fundamental">Fundamental</option>
    <option value="technical">Technical</option>
    <option value="general">General</option>
  </Select>
  <Button
    className="border-brutal shadow-brutal-sm"
    onClick={() => setAddTermOpen(true)}
  >
    <Plus className="h-4 w-4 mr-2" />
    Add Term
  </Button>
</div>
```

**Glossary Table:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Term</TableHead>
      <TableHead>Definition Preview</TableHead>
      <TableHead>Category</TableHead>
      <TableHead className="text-center">Has ELI5</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {glossaryTerms.map(term => (
      <TableRow key={term.id}>
        <TableCell className="font-semibold">{term.term}</TableCell>
        <TableCell className="max-w-md truncate text-muted-foreground">
          {term.definition}
        </TableCell>
        <TableCell>
          <Badge variant="outline">{term.category}</Badge>
        </TableCell>
        <TableCell className="text-center">
          {term.eli5_analogy ? '✓' : '—'}
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="border-brutal"
            onClick={() => editTerm(term)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="border-brutal"
            onClick={() => deleteTerm(term.id)}
          >
            Delete
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

{/* Pagination */}
<div className="flex justify-center gap-2 mt-6">
  <Button
    variant="outline"
    disabled={page === 1}
    onClick={() => setPage(p => p - 1)}
  >
    ← Previous
  </Button>
  <span className="flex items-center px-4">
    Page {page} of {totalPages}
  </span>
  <Button
    variant="outline"
    disabled={page === totalPages}
    onClick={() => setPage(p => p + 1)}
  >
    Next →
  </Button>
</div>
```

**Add/Edit Term Dialog:**
```tsx
<Dialog open={termDialogOpen} onOpenChange={setTermDialogOpen}>
  <DialogContent className="border-brutal shadow-brutal max-w-2xl">
    <DialogHeader>
      <DialogTitle>
        {editingTerm ? 'Edit' : 'Add New'} Glossary Term
      </DialogTitle>
    </DialogHeader>

    <form onSubmit={handleTermSubmit} className="space-y-4">
      <div>
        <Label>Term</Label>
        <Input
          placeholder="e.g., PER"
          value={termForm.term}
          onChange={e => setTermForm({...termForm, term: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>Category</Label>
        <Select
          value={termForm.category}
          onValueChange={val => setTermForm({...termForm, category: val})}
          required
        >
          <option value="fundamental">Fundamental</option>
          <option value="technical">Technical</option>
          <option value="general">General</option>
        </Select>
      </div>

      <div>
        <Label>Definition</Label>
        <Textarea
          placeholder="Detailed explanation of the term..."
          value={termForm.definition}
          onChange={e => setTermForm({...termForm, definition: e.target.value})}
          rows={5}
          className="font-mono text-sm"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Supports markdown formatting
        </p>
      </div>

      <div>
        <Label>ELI5 Analogy (Optional)</Label>
        <Textarea
          placeholder="Simple analogy for beginners..."
          value={termForm.eli5_analogy}
          onChange={e => setTermForm({...termForm, eli5_analogy: e.target.value})}
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Shown to newbie-tier users automatically
        </p>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => setTermDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit" className="border-brutal shadow-brutal-sm">
          {editingTerm ? 'Update' : 'Add'} Term
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

**Delete Confirmation:**
```tsx
// Before deleting, check if term is referenced in chat messages
const usageCount = await supabase
  .from('chat_messages')
  .select('id', { count: 'exact', head: true })
  .ilike('content', `%${term.term}%`)

if (usageCount > 0) {
  toast({
    title: "Warning",
    description: `This term appears in ${usageCount} chat messages. Delete anyway?`,
    variant: "destructive"
  })
}
```

### Tab 2: Morning Briefings

**Briefing List (Last 30 days):**
```tsx
<div className="space-y-4">
  {briefings.map(briefing => (
    <Card key={briefing.id} className="border-brutal shadow-brutal-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {formatDate(briefing.date)}
            </CardTitle>
            <CardDescription>
              Generated at {formatTime(briefing.created_at)} WIB
            </CardDescription>
          </div>
          <Badge variant="outline">
            {briefing.auto_generated ? 'Auto' : 'Manual'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Global Markets</dt>
            <dd className="font-medium">
              DOW {briefing.global_markets.dow.change > 0 ? '↑' : '↓'}
              {briefing.global_markets.dow.change}%
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">USD/IDR</dt>
            <dd className="font-medium">
              {briefing.macro_data.usd_idr.value.toLocaleString()}
              ({briefing.macro_data.usd_idr.change > 0 ? '+' : ''}
              {briefing.macro_data.usd_idr.change}%)
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <dt className="text-sm text-muted-foreground mb-2">AI Sentiment Preview</dt>
          <dd className="text-sm line-clamp-3">
            {briefing.ai_sentiment}
          </dd>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-brutal"
          onClick={() => viewBriefing(briefing)}
        >
          View Full
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-brutal"
          onClick={() => regenerateBriefing(briefing.date)}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Regenerate
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-brutal"
          onClick={() => editBriefing(briefing)}
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>
```

**View/Edit Briefing Dialog:**
```tsx
<Dialog open={briefingDialogOpen} onOpenChange={setBriefingDialogOpen}>
  <DialogContent className="border-brutal shadow-brutal max-w-4xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        Morning Briefing - {formatDate(selectedBriefing.date)}
      </DialogTitle>
      <DialogDescription>
        {editMode ? 'Edit briefing data' : 'View briefing details'}
      </DialogDescription>
    </DialogHeader>

    <Tabs defaultValue="sentiment">
      <TabsList>
        <TabsTrigger value="sentiment">AI Sentiment</TabsTrigger>
        <TabsTrigger value="markets">Market Data</TabsTrigger>
        <TabsTrigger value="news">Top News</TabsTrigger>
      </TabsList>

      <TabsContent value="sentiment">
        {editMode ? (
          <Textarea
            value={briefingForm.ai_sentiment}
            onChange={e => setBriefingForm({...briefingForm, ai_sentiment: e.target.value})}
            rows={15}
            className="font-mono text-sm"
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{selectedBriefing.ai_sentiment}</ReactMarkdown>
          </div>
        )}
      </TabsContent>

      <TabsContent value="markets">
        {editMode ? (
          <div className="space-y-4">
            <h3 className="font-semibold">Global Markets</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>DOW Value</Label>
                <Input
                  type="number"
                  value={briefingForm.global_markets.dow.value}
                  onChange={e => updateMarketData('dow', 'value', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>DOW Change (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={briefingForm.global_markets.dow.change}
                  onChange={e => updateMarketData('dow', 'change', parseFloat(e.target.value))}
                />
              </div>
              {/* Repeat for SP500, Nikkei */}
            </div>

            <h3 className="font-semibold mt-6">Macro Data</h3>
            <div className="grid grid-cols-3 gap-4">
              {/* USD/IDR, Gold, Oil inputs */}
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicator</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>DOW Jones</TableCell>
                <TableCell>{selectedBriefing.global_markets.dow.value}</TableCell>
                <TableCell className={cn(
                  selectedBriefing.global_markets.dow.change > 0
                    ? 'text-primary'
                    : 'text-destructive'
                )}>
                  {selectedBriefing.global_markets.dow.change > 0 ? '+' : ''}
                  {selectedBriefing.global_markets.dow.change}%
                </TableCell>
              </TableRow>
              {/* More rows */}
            </TableBody>
          </Table>
        )}
      </TabsContent>

      <TabsContent value="news">
        {editMode ? (
          <div className="space-y-4">
            {briefingForm.top_news.map((news, idx) => (
              <Card key={idx} className="border-brutal p-4">
                <div className="space-y-2">
                  <Input
                    placeholder="News title"
                    value={news.title}
                    onChange={e => updateNews(idx, 'title', e.target.value)}
                  />
                  <Input
                    placeholder="URL"
                    value={news.url}
                    onChange={e => updateNews(idx, 'url', e.target.value)}
                  />
                  <Input
                    placeholder="Source"
                    value={news.source}
                    onChange={e => updateNews(idx, 'source', e.target.value)}
                  />
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={addNewsItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add News Item
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedBriefing.top_news.map((news, idx) => (
              <Card key={idx} className="border-brutal p-4">
                <h4 className="font-semibold">{news.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Source: {news.source}
                </p>
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-2 inline-block"
                >
                  Read more →
                </a>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>

    <DialogFooter>
      {editMode ? (
        <>
          <Button
            variant="outline"
            onClick={() => setEditMode(false)}
          >
            Cancel
          </Button>
          <Button
            className="border-brutal shadow-brutal-sm"
            onClick={saveBriefing}
          >
            Save Changes
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={() => setBriefingDialogOpen(false)}
          >
            Close
          </Button>
          <Button
            className="border-brutal shadow-brutal-sm"
            onClick={() => setEditMode(true)}
          >
            Edit Briefing
          </Button>
        </>
      )}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Regenerate Briefing:**
```typescript
async function regenerateBriefing(date: string) {
  const confirmed = await confirm({
    title: "Regenerate Briefing?",
    description: "This will overwrite the existing briefing with fresh AI-generated content."
  })

  if (!confirmed) return

  const response = await fetch('/api/admin/briefings/regenerate', {
    method: 'POST',
    body: JSON.stringify({ date })
  })

  if (response.ok) {
    toast({
      title: "Success",
      description: "Briefing regenerated successfully"
    })
    refreshBriefings()
  }
}
```

### Tab 3: News Sources

**Placeholder Content:**
```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <CardTitle>News Sources Configuration</CardTitle>
    <CardDescription>
      Manage RSS feeds and scraping targets
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Alert className="border-brutal">
      <Info className="h-4 w-4" />
      <AlertTitle>Coming Soon</AlertTitle>
      <AlertDescription>
        News source management will allow you to:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Add/remove RSS feed URLs</li>
          <li>Configure web scraping targets</li>
          <li>Set sentiment analysis filters</li>
          <li>Manage news categories and priorities</li>
        </ul>
      </AlertDescription>
    </Alert>
  </CardContent>
</Card>
```

---

## 7. System Settings

### Settings Page Layout (Sections with Cards)

```tsx
<div className="space-y-8">
  <Section1_GlobalConfig />
  <Section2_AIConfig />
  <Section3_MaintenanceMode />
  <Section4_DatabaseActions />
  <Section5_AdminUsers />
</div>
```

### Section 1: Global Configuration

```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <CardTitle>Chat Limits by Tier</CardTitle>
    <CardDescription>
      Set daily chat message limits for each subscription tier
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Free Tier - Daily Limit</Label>
        <Input
          type="number"
          value={limits.free}
          onChange={e => setLimits({...limits, free: parseInt(e.target.value)})}
        />
      </div>
      <div>
        <Label>Pro Tier - Daily Limit</Label>
        <Input
          type="number"
          value={limits.pro}
          onChange={e => setLimits({...limits, pro: parseInt(e.target.value)})}
        />
      </div>
      <div>
        <Label>Whale Tier - Daily Limit</Label>
        <Input
          type="number"
          value={limits.whale}
          onChange={e => setLimits({...limits, whale: parseInt(e.target.value)})}
        />
      </div>
      <div>
        <Label>Admin Tier - Daily Limit</Label>
        <Input
          type="number"
          value={limits.admin}
          onChange={e => setLimits({...limits, admin: parseInt(e.target.value)})}
          disabled
        />
        <p className="text-xs text-muted-foreground mt-1">
          Admin always unlimited
        </p>
      </div>
    </div>

    <Button
      className="border-brutal shadow-brutal-sm"
      onClick={saveLimits}
    >
      Save Limits
    </Button>
  </CardContent>
</Card>

<Card className="border-brutal shadow-brutal mt-6">
  <CardHeader>
    <CardTitle>Feature Flags</CardTitle>
    <CardDescription>
      Toggle features on/off globally (affects all users)
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <Label>Morning Briefing</Label>
        <p className="text-sm text-muted-foreground">
          Auto-generate daily market briefings
        </p>
      </div>
      <Switch
        checked={features.morningBriefing}
        onCheckedChange={val => setFeatures({...features, morningBriefing: val})}
      />
    </div>

    <Separator />

    <div className="flex items-center justify-between">
      <div>
        <Label>Stock Screener</Label>
        <p className="text-sm text-muted-foreground">
          AI-powered natural language stock filtering
        </p>
      </div>
      <Switch
        checked={features.stockScreener}
        onCheckedChange={val => setFeatures({...features, stockScreener: val})}
      />
    </div>

    <Separator />

    <div className="flex items-center justify-between">
      <div>
        <Label>Watchlist Alerts</Label>
        <p className="text-sm text-muted-foreground">
          Price alerts and notifications
        </p>
      </div>
      <Switch
        checked={features.watchlistAlerts}
        onCheckedChange={val => setFeatures({...features, watchlistAlerts: val})}
      />
    </div>

    <Separator />

    <div className="flex items-center justify-between opacity-50">
      <div>
        <Label>Dark Mode Toggle</Label>
        <p className="text-sm text-muted-foreground">
          User-selectable dark/light theme
        </p>
      </div>
      <Switch disabled />
      <Badge variant="secondary">Coming Soon</Badge>
    </div>

    <Button
      className="border-brutal shadow-brutal-sm mt-4"
      onClick={saveFeatureFlags}
    >
      Save Settings
    </Button>
  </CardContent>
</Card>
```

**Storage:**
```typescript
// Store in database settings table or env variables
interface SystemSettings {
  chat_limits: {
    free: number
    pro: number
    whale: number
    admin: number
  }
  feature_flags: {
    morning_briefing: boolean
    stock_screener: boolean
    watchlist_alerts: boolean
    dark_mode: boolean
    api_access: boolean
  }
}
```

### Section 2: AI Configuration

```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <CardTitle>Default AI Settings</CardTitle>
    <CardDescription>
      Global defaults for AI chat behavior
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Default Temperature</Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="2"
          value={aiConfig.temperature}
          onChange={e => setAiConfig({...aiConfig, temperature: parseFloat(e.target.value)})}
        />
        <p className="text-xs text-muted-foreground mt-1">
          0 = deterministic, 2 = creative
        </p>
      </div>

      <div>
        <Label>Default Max Tokens</Label>
        <Input
          type="number"
          value={aiConfig.maxTokens}
          onChange={e => setAiConfig({...aiConfig, maxTokens: parseInt(e.target.value)})}
        />
      </div>
    </div>

    <div>
      <Label>Chat Context Window</Label>
      <Input
        type="number"
        min="5"
        max="50"
        value={aiConfig.contextWindow}
        onChange={e => setAiConfig({...aiConfig, contextWindow: parseInt(e.target.value)})}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Number of previous messages to include in AI context
      </p>
    </div>

    <div className="flex items-center gap-2">
      <Switch
        checked={aiConfig.streamingEnabled}
        onCheckedChange={val => setAiConfig({...aiConfig, streamingEnabled: val})}
      />
      <Label>Streaming Enabled</Label>
    </div>

    <Separator />

    <div>
      <Label>System Prompt</Label>
      <Textarea
        value={aiConfig.systemPrompt}
        onChange={e => setAiConfig({...aiConfig, systemPrompt: e.target.value})}
        rows={10}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground mt-1">
        Default system instruction sent to AI for all chats
      </p>
    </div>

    <Button
      className="border-brutal shadow-brutal-sm"
      onClick={saveAiConfig}
    >
      Save AI Configuration
    </Button>
  </CardContent>
</Card>
```

### Section 3: Maintenance Mode

```tsx
<Card className="border-brutal border-warning shadow-brutal">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <AlertTriangle className="h-5 w-5 text-warning" />
      Maintenance Mode
    </CardTitle>
    <CardDescription>
      Enable to show maintenance page to all non-admin users
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Alert className="border-brutal">
      <Info className="h-4 w-4" />
      <AlertTitle>Current Status</AlertTitle>
      <AlertDescription>
        {maintenanceMode.enabled
          ? '🔴 Maintenance mode is ACTIVE - Users see maintenance page'
          : '🟢 Application is ACTIVE - Users have normal access'
        }
      </AlertDescription>
    </Alert>

    <div className="flex items-center gap-3">
      <Switch
        checked={maintenanceMode.enabled}
        onCheckedChange={val => setMaintenanceMode({...maintenanceMode, enabled: val})}
      />
      <Label>Enable Maintenance Mode</Label>
    </div>

    <div>
      <Label>Maintenance Message</Label>
      <Textarea
        value={maintenanceMode.message}
        onChange={e => setMaintenanceMode({...maintenanceMode, message: e.target.value})}
        rows={4}
        placeholder="We're currently performing system maintenance. We'll be back shortly!"
      />
      <p className="text-xs text-muted-foreground mt-1">
        This message will be shown to users during maintenance
      </p>
    </div>

    <Button
      variant={maintenanceMode.enabled ? 'destructive' : 'default'}
      className="border-brutal shadow-brutal-sm"
      onClick={saveMaintenanceMode}
    >
      {maintenanceMode.enabled ? 'Disable' : 'Enable'} Maintenance Mode
    </Button>
  </CardContent>
</Card>
```

**Middleware Check:**
```typescript
// In middleware.ts
export async function middleware(request: NextRequest) {
  const maintenanceMode = await getMaintenanceMode()
  const user = await getCurrentUser()

  if (maintenanceMode.enabled && user?.subscription_tier !== 'admin') {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}
```

### Section 4: Database & Logs

```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <CardTitle>Database Management</CardTitle>
    <CardDescription>
      Quick actions for database maintenance
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="outline"
        className="border-brutal"
        onClick={clearOldChatSessions}
      >
        <Trash className="h-4 w-4 mr-2" />
        Clear Old Chat Sessions
      </Button>

      <Button
        variant="outline"
        className="border-brutal"
        onClick={resetDailyChatCounts}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset Daily Chat Counts
      </Button>

      <Button
        variant="outline"
        className="border-brutal"
        onClick={vacuumDatabase}
      >
        <Database className="h-4 w-4 mr-2" />
        Vacuum Database
      </Button>

      <Button
        variant="outline"
        className="border-brutal"
        onClick={downloadErrorLogs}
      >
        <Download className="h-4 w-4 mr-2" />
        Download Error Logs
      </Button>
    </div>

    <Separator />

    <div>
      <h4 className="font-semibold mb-3">Database Statistics</h4>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Total Users</dt>
          <dd className="font-medium text-lg">{dbStats.users}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Chat Sessions</dt>
          <dd className="font-medium text-lg">{dbStats.sessions}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Chat Messages</dt>
          <dd className="font-medium text-lg">{dbStats.messages}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Glossary Terms</dt>
          <dd className="font-medium text-lg">{dbStats.glossary}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Watchlist Items</dt>
          <dd className="font-medium text-lg">{dbStats.watchlist}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Database Size</dt>
          <dd className="font-medium text-lg">{dbStats.size} MB</dd>
        </div>
      </dl>

      <p className="text-xs text-muted-foreground mt-4">
        Last backup: {dbStats.lastBackup}
      </p>
    </div>
  </CardContent>
</Card>
```

**Clear Old Chat Sessions Function:**
```typescript
async function clearOldChatSessions() {
  const confirmed = await confirm({
    title: "Clear Old Chat Sessions?",
    description: "This will permanently delete chat sessions older than 90 days. This action cannot be undone.",
    variant: "destructive"
  })

  if (!confirmed) return

  const { count } = await supabase
    .from('chat_sessions')
    .delete()
    .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

  toast({
    title: "Success",
    description: `Deleted ${count} old chat sessions`
  })

  refreshDbStats()
}
```

### Section 5: Admin Users

```tsx
<Card className="border-brutal shadow-brutal">
  <CardHeader>
    <CardTitle>Admin Users</CardTitle>
    <CardDescription>
      Manage users with admin panel access
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {adminUsers.map(admin => (
          <TableRow key={admin.id}>
            <TableCell className="font-medium">{admin.email}</TableCell>
            <TableCell>{admin.full_name}</TableCell>
            <TableCell className="text-muted-foreground">
              {relativeTime(admin.last_sign_in_at)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="destructive"
                className="border-brutal"
                onClick={() => revokeAdminAccess(admin.id)}
                disabled={admin.id === currentUser.id}
              >
                Revoke
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    <Button
      className="border-brutal shadow-brutal-sm mt-4"
      onClick={() => setPromoteDialogOpen(true)}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      Promote User to Admin
    </Button>
  </CardContent>
</Card>

{/* Promote User Dialog */}
<Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
  <DialogContent className="border-brutal shadow-brutal">
    <DialogHeader>
      <DialogTitle>Promote User to Admin</DialogTitle>
      <DialogDescription>
        Search for a user to grant admin panel access
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <Label>Search by Email</Label>
        <Input
          type="email"
          placeholder="user@example.com"
          value={promoteEmail}
          onChange={e => setPromoteEmail(e.target.value)}
        />
      </div>

      {selectedUserToPromote && (
        <Alert className="border-brutal border-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Confirm Promotion</AlertTitle>
          <AlertDescription>
            You are about to grant admin access to:
            <div className="font-semibold mt-2">
              {selectedUserToPromote.full_name} ({selectedUserToPromote.email})
            </div>
            <p className="mt-2 text-sm">
              This user will have full access to the admin panel including
              user management, AI provider configuration, and system settings.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setPromoteDialogOpen(false)}
      >
        Cancel
      </Button>
      <Button
        className="border-brutal shadow-brutal-sm"
        onClick={confirmPromoteUser}
        disabled={!selectedUserToPromote}
      >
        Promote to Admin
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Promote User Function:**
```typescript
async function confirmPromoteUser() {
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: 'admin' })
    .eq('id', selectedUserToPromote.id)

  if (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    })
    return
  }

  // Send email notification
  await fetch('/api/admin/send-promotion-email', {
    method: 'POST',
    body: JSON.stringify({ userId: selectedUserToPromote.id })
  })

  toast({
    title: "Success",
    description: `${selectedUserToPromote.full_name} has been promoted to admin`
  })

  setPromoteDialogOpen(false)
  refreshAdminUsers()
}
```

---

## 8. Technical Implementation Details

### Route Protection Middleware

```typescript
// app/(admin)/layout.tsx
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

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader user={user} profile={profile} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Supabase RLS Policies

```sql
-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );

-- Allow admins to update user tiers
CREATE POLICY "Admins can update user subscription tiers"
  ON profiles FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );

-- Allow admins to manage AI providers
CREATE POLICY "Admins can manage AI providers"
  ON ai_providers FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );

-- Allow admins to read all chat data
CREATE POLICY "Admins can read all chats"
  ON chat_messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE subscription_tier = 'admin'
    )
  );
```

### API Routes for Admin Actions

```typescript
// app/api/admin/users/[id]/tier/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_tier !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update user tier
  const { tier } = await request.json()

  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

### Chart Library Setup

```bash
npm install recharts
```

```typescript
// components/admin/charts/user-growth-chart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface UserGrowthChartProps {
  data: Array<{ date: string; count: number }>
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '3px solid hsl(var(--border))',
            borderRadius: 0,
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Component Structure

```
app/
├── (admin)/
│   └── admin/
│       ├── layout.tsx                 # Admin layout with sidebar
│       ├── page.tsx                   # Dashboard
│       ├── users/
│       │   ├── page.tsx               # Users list
│       │   └── [id]/
│       │       └── page.tsx           # User detail
│       ├── ai-providers/
│       │   └── page.tsx
│       ├── analytics/
│       │   └── page.tsx
│       ├── content/
│       │   └── page.tsx
│       └── settings/
│           └── page.tsx
│
components/
├── admin/
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── stats-card.tsx
│   ├── charts/
│   │   ├── user-growth-chart.tsx
│   │   ├── chat-volume-chart.tsx
│   │   └── tier-distribution-chart.tsx
│   ├── users/
│   │   ├── users-table.tsx
│   │   ├── user-detail-card.tsx
│   │   └── promote-user-dialog.tsx
│   ├── ai-providers/
│   │   ├── provider-card.tsx
│   │   └── provider-form-dialog.tsx
│   └── content/
│       ├── glossary-table.tsx
│       ├── glossary-form-dialog.tsx
│       ├── briefing-card.tsx
│       └── briefing-view-dialog.tsx
│
lib/
├── admin/
│   ├── analytics.ts              # Analytics data fetching
│   ├── users.ts                  # User management functions
│   └── providers.ts              # AI provider management
│
app/api/admin/
├── users/
│   ├── route.ts                  # GET all users
│   └── [id]/
│       ├── route.ts              # GET/DELETE user
│       └── tier/
│           └── route.ts          # PATCH user tier
├── ai-providers/
│   ├── route.ts                  # GET/POST providers
│   ├── [id]/
│   │   └── route.ts              # GET/PATCH/DELETE provider
│   └── test/
│       └── route.ts              # POST test provider
├── analytics/
│   └── route.ts                  # GET analytics data
├── glossary/
│   └── route.ts                  # GET/POST/PATCH/DELETE terms
└── settings/
    └── route.ts                  # GET/PATCH system settings
```

---

## 9. Testing Strategy

### Manual Testing Checklist

**Authentication & Authorization:**
- [ ] Non-logged-in user redirected to sign-in
- [ ] Non-admin user blocked from /admin routes
- [ ] Admin user can access all admin pages
- [ ] Logout works properly

**User Management:**
- [ ] Users list loads with pagination
- [ ] Search filters users correctly
- [ ] Tier filter works
- [ ] User detail page shows correct data
- [ ] Tier update saves successfully
- [ ] Delete user confirmation works
- [ ] Delete user cascades to related data

**AI Providers:**
- [ ] Provider list displays correctly
- [ ] Add provider saves to database
- [ ] Edit provider updates fields
- [ ] Toggle active/inactive works
- [ ] Test provider shows response
- [ ] Priority ordering affects chat routing

**Analytics:**
- [ ] Stats cards show correct counts
- [ ] Charts render without errors
- [ ] Time range selector updates data
- [ ] Provider performance table accurate

**Content Management:**
- [ ] Glossary terms load and paginate
- [ ] Add/edit/delete term works
- [ ] Briefing list shows last 30 days
- [ ] View briefing shows all data
- [ ] Edit briefing saves changes
- [ ] Regenerate briefing creates new data

**System Settings:**
- [ ] Chat limits update saves
- [ ] Feature flags toggle correctly
- [ ] AI config saves properly
- [ ] Maintenance mode blocks non-admin users
- [ ] Database actions execute without errors
- [ ] Admin promotion works
- [ ] Admin revoke works

### Performance Considerations

**Pagination:**
- All lists paginated at 50 items max
- Server-side pagination for database efficiency

**Caching:**
- Analytics cached for 5 minutes
- Database stats cached for 10 minutes
- Use Redis or Next.js unstable_cache

**Query Optimization:**
- Use `.select()` to fetch only needed columns
- Proper indexes on frequently queried columns
- Use `.count()` for count queries, not fetching all data

**Component Optimization:**
- Charts use React.memo to prevent re-renders
- Forms use controlled components with debounced inputs
- Large tables use virtualization if >1000 rows (future)

---

## 10. Future Enhancements (Post-MVP)

**User Management:**
- Bulk actions (bulk tier upgrade, bulk delete)
- User activity timeline
- Export users to CSV
- User impersonation for debugging

**Analytics:**
- Real-time dashboard with WebSocket updates
- Revenue projection based on subscription tiers
- Cohort analysis (user retention by signup month)
- Export analytics reports to PDF

**AI Providers:**
- Provider cost tracking (total spend per provider)
- Automatic failover testing (scheduled health checks)
- Provider usage analytics (which provider handles most requests)

**Content Management:**
- News source manager (add/edit RSS feeds)
- Bulk import glossary from CSV
- Content moderation queue (flag inappropriate chat messages)

**System Settings:**
- Email template editor (for notifications)
- Webhook configuration (send events to external systems)
- Rate limiting rules per tier
- Audit log viewer (track all admin actions)

**Security:**
- Two-factor authentication for admin login
- IP whitelist for admin panel access
- Session timeout configuration
- Admin action audit trail

---

## 11. Summary

This admin panel design provides a comprehensive full-featured suite for managing IndoStock AI platform with:

✅ **Complete user management** - view, edit, delete, promote users
✅ **AI provider configuration** - add, edit, test, activate/deactivate providers
✅ **Analytics dashboard** - user growth, engagement, tier distribution, system health
✅ **Content management** - glossary editor, morning briefing override
✅ **System settings** - chat limits, feature flags, AI config, maintenance mode, admin users

**Design Principles:**
- Neo-brutalist UI matching main app aesthetic
- Role-based access control (subscription_tier = 'admin')
- Server-side pagination for performance
- Responsive design (mobile-friendly)
- Clear feedback via toasts and confirmations

**Tech Stack:**
- Next.js 16 App Router (Server Components + Client Components)
- Supabase for database & auth with RLS policies
- Recharts for analytics visualization
- shadcn/ui components with brutalist customization
- Tailwind CSS for styling

**Estimated Implementation:** 7-10 days for full-featured MVP

Ready to proceed with implementation planning?
