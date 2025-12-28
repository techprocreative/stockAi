# Admin Panel User Guide

## Overview

The IndoStock AI Admin Panel provides comprehensive tools for managing users, AI providers, analytics, content, and system settings. This guide covers all features and their usage.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Dashboard](#dashboard)
3. [User Management](#user-management)
4. [AI Providers Management](#ai-providers-management)
5. [Analytics](#analytics)
6. [Content Management](#content-management)
7. [System Settings](#system-settings)
8. [Mobile Usage](#mobile-usage)

---

## Authentication & Authorization

### Access Requirements
- Admin panel requires `subscription_tier='admin'` in user profile
- Non-admin users are redirected to dashboard with error message
- Location: `app/(admin)/layout.tsx:15-27`

### Security
- Row Level Security (RLS) policies enforce admin-only access
- All admin API routes verify subscription tier
- Middleware checks auth status on every request

---

## Dashboard

**Path**: `/admin`

### Features

**8 Real-Time Metrics Cards**:
1. **Total Users** - All registered users
2. **Active Today** - Users active in last 24h
3. **New This Week** - Users joined in last 7 days
4. **Admin Users** - Users with admin tier
5. **Total Sessions** - All chat sessions
6. **Chats Today** - Messages sent today
7. **Active Providers** - Enabled AI providers
8. **Avg Response** - Average AI response time

**Quick Actions**:
- Add New User
- Configure Providers
- View Reports
- System Settings

### Implementation
- Server Component with Supabase queries
- Stats fetched via `lib/admin/analytics.ts:getDashboardStats()`
- Real-time data on each page load
- Brutalist design with `StatsCard` component

---

## User Management

**Path**: `/admin/users`

### User List

**Features**:
- Paginated table (10 users per page)
- Real-time search by name/email/username
- Filter by subscription tier (All, Free, Pro, Whale, Admin)
- Sortable columns
- View user details

**Filters**: `components/admin/users/users-filters.tsx`
- Search input with debounced query
- Tier dropdown filter
- Updates URL params for shareable filters

**Pagination**: `components/admin/users/users-pagination.tsx`
- Previous/Next buttons
- Page number display
- Maintains filter state across pages

### User Detail Page

**Path**: `/admin/users/[id]`

**Sections**:
1. **Profile Information**
   - Full name, username, email
   - Avatar
   - Subscription tier badge
   - Join date

2. **Statistics**
   - Total chat sessions
   - Total messages
   - Last active timestamp

3. **Recent Activity**
   - Last 10 chat sessions
   - Session titles and timestamps

**Actions**:
- Edit subscription tier
- Delete user account

### Edit User Tier

**Component**: `components/admin/users/edit-tier-dialog.tsx`

**Workflow**:
1. Click "Edit Tier" button
2. Select new tier from dropdown (Free, Pro, Whale, Admin)
3. Confirm changes
4. Optimistic UI update
5. API call to `PATCH /api/admin/users/[id]/tier`
6. Toast notification on success/error

**Tiers Available**:
- `free` - Basic access
- `pro` - Enhanced features
- `whale` - Premium features
- `admin` - Full admin access

### Delete User

**Component**: `components/admin/users/delete-user-dialog.tsx`

**Workflow**:
1. Click "Delete User" button
2. AlertDialog with confirmation
3. Warning about permanent deletion
4. Type username to confirm
5. API call to `DELETE /api/admin/users/[id]`
6. Redirect to users list on success

**Safety Features**:
- Cannot delete yourself (self-deletion prevention)
- Confirmation dialog with username verification
- Cascading deletion warning

---

## AI Providers Management

**Path**: `/admin/ai-providers`

### Provider List

**Card Grid Display**:
- Provider name and type
- Model name
- Enabled/disabled status badge
- Priority level
- Response time average
- View/Edit/Delete actions

**Provider Types**:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Groq (Mixtral, Llama)
- Ollama (Local models)

### Add/Edit Provider

**Component**: `components/admin/providers/provider-form-dialog.tsx`

**Basic Settings**:
- Provider Name (e.g., "OpenAI GPT-4")
- Provider Type (dropdown)
- Model Name (e.g., "gpt-4-turbo")
- API Key (masked input)
- Base URL (optional, for custom endpoints)

**Advanced Settings**:
- Priority (1-10, higher = preferred)
- Max Tokens (default: 4096)
- Temperature (0-2, default: 0.7)
- Enabled toggle (activate/deactivate)

**API Routes**:
- `POST /api/admin/ai-providers` - Create new provider
- `GET /api/admin/ai-providers/[id]` - Get provider details
- `PATCH /api/admin/ai-providers/[id]` - Update provider
- `DELETE /api/admin/ai-providers/[id]` - Delete provider

### Test Provider

**Component**: `components/admin/providers/test-provider-dialog.tsx`

**Workflow**:
1. Click "Test" button on provider card
2. Dialog shows testing animation
3. Simulated API call with test prompt
4. Results display:
   - Success/failure status
   - Response time (ms)
   - Model response preview

**API**: `POST /api/admin/ai-providers/test`

---

## Analytics

**Path**: `/admin/analytics`

### Charts & Visualizations

**1. User Growth Chart** (`components/admin/analytics/user-growth-chart.tsx`)
- Line chart showing cumulative user growth
- Last 30 days of data
- X-axis: Dates (MMM DD format)
- Y-axis: Total users
- Built with Recharts

**2. Chat Volume Chart** (`components/admin/analytics/chat-volume-chart.tsx`)
- Bar chart showing daily message counts
- Last 30 days of data
- X-axis: Dates
- Y-axis: Message count
- Hover tooltips

**3. Tier Distribution** (`components/admin/analytics/tier-distribution-chart.tsx`)
- Pie chart of subscription tier breakdown
- Color-coded segments:
  - Free: Blue
  - Pro: Green
  - Whale: Purple
  - Admin: Orange
- Percentage labels

### Provider Performance Table

**Metrics per Provider**:
- Total requests
- Success rate (%)
- Average response time (ms)
- Last used timestamp

**Data Source**: `lib/admin/analytics.ts:getProviderPerformance()`

---

## Content Management

**Path**: `/admin/content`

### Tabbed Interface

**Tab 1: Glossary Terms**
- Search glossary terms
- View term/definition pairs
- Delete terms
- Add new terms (future)

**Component**: `components/admin/content/glossary-table.tsx`

**API Routes**:
- `GET /api/admin/glossary` - List all terms
- `POST /api/admin/glossary` - Create new term
- `DELETE /api/admin/glossary?id=[id]` - Delete term

**Features**:
- Real-time search filtering
- Brutalist table design
- Confirmation dialog for deletion

**Tab 2: Morning Briefings** (Planned)
- View past briefings
- Create new briefings
- Schedule future briefings

**Tab 3: News Sources** (Planned)
- Manage RSS feeds
- Configure news sources
- Preview news items

---

## System Settings

**Path**: `/admin/settings`

### Chat Limits Configuration

**Component**: `components/admin/settings/chat-limits-config.tsx`

**Settings**:
- Free Tier: 10 chats/day (default)
- Pro Tier: 50 chats/day (default)
- Whale Tier: 200 chats/day (default)
- Admin Tier: 999,999 chats/day (default)

**Workflow**:
1. Page loads current limits from API
2. Admin edits values in number inputs
3. Click "Save Changes"
4. API call to `POST /api/admin/settings`
5. Toast notification on success

**API**: `/api/admin/settings` (GET/POST)

### Feature Flags

**Component**: `components/admin/settings/feature-flags.tsx`

**Global Feature Toggles**:
- ✓ AI Chat
- ✓ Watchlist
- ✓ Price Alerts
- ✓ Glossary
- ✓ Morning Briefing
- ✗ News Feeds (disabled by default)

**Workflow**:
1. Toggle switches to enable/disable features
2. Click "Save Changes"
3. Settings stored in-memory (production: database)
4. Toast notification

### Admin Users

**Component**: `components/admin/settings/admin-users.tsx`

**Features**:
- Table of all admin users
- User info: name, username, avatar
- Admin since date
- Revoke admin access action

**Note**: To promote users to admin, edit their tier in User Management section.

### Maintenance Mode

**Component**: `components/admin/settings/maintenance-mode.tsx`

**Features**:
1. **Enable/Disable Toggle**
   - Activates site-wide maintenance mode
   - Shows warning banner when active

2. **Custom Message**
   - Textarea for maintenance message
   - Displayed on `/maintenance` page
   - Default: "We are currently performing scheduled maintenance. We will be back shortly!"

3. **Save Changes**
   - Updates API settings
   - Syncs with middleware
   - Toast notification

**How It Works**:
- When enabled, middleware blocks all non-admin users
- Admin users can still access the site
- Non-admins redirected to `/maintenance` page
- Custom message displayed on maintenance page
- Real-time enforcement via `lib/supabase/middleware.ts:76-99`

**Use Cases**:
- Database migrations
- System updates
- Emergency fixes
- Scheduled maintenance windows

**API**: `POST /api/admin/settings` with `maintenanceMode` object

---

## Mobile Usage

### Responsive Design

**Sidebar Navigation**:
- Hidden by default on mobile (<lg breakpoint)
- Hamburger menu button (top-left)
- Slide-in sidebar with overlay
- Click outside to close
- Auto-closes on navigation

**Header**:
- Compact layout on mobile
- Avatar only (no user details)
- Icon-only logout button
- Responsive padding

**Content**:
- Reduced padding on small screens
- Tables scroll horizontally
- Cards stack vertically
- Forms adapt to narrow viewports

**Breakpoints**:
- Mobile: < 1024px (Tailwind `lg:`)
- Tablet: 768px - 1024px (`md:` - `lg:`)
- Desktop: ≥ 1024px (`lg:`)

### Touch Interactions

- Large tap targets (44px minimum)
- Swipe to close sidebar
- Accessible hamburger menu
- No hover-dependent features

---

## Technical Architecture

### Stack
- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18+, TypeScript
- **Database**: Supabase (PostgreSQL + RLS)
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Design**: Brutalist theme

### Key Files

**Layouts**:
- `app/(admin)/layout.tsx` - Admin layout with auth
- `components/admin/sidebar.tsx` - Navigation sidebar
- `components/admin/header.tsx` - Header with logout

**Pages**:
- `app/(admin)/admin/page.tsx` - Dashboard
- `app/(admin)/admin/users/page.tsx` - Users list
- `app/(admin)/admin/users/[id]/page.tsx` - User detail
- `app/(admin)/admin/ai-providers/page.tsx` - Providers
- `app/(admin)/admin/analytics/page.tsx` - Analytics
- `app/(admin)/admin/content/page.tsx` - Content
- `app/(admin)/admin/settings/page.tsx` - Settings
- `app/maintenance/page.tsx` - Maintenance page

**API Routes**:
- `app/api/admin/users/[id]/route.ts` - User CRUD
- `app/api/admin/users/[id]/tier/route.ts` - Tier updates
- `app/api/admin/ai-providers/route.ts` - Provider list/create
- `app/api/admin/ai-providers/[id]/route.ts` - Provider CRUD
- `app/api/admin/ai-providers/test/route.ts` - Provider testing
- `app/api/admin/glossary/route.ts` - Glossary CRUD
- `app/api/admin/settings/route.ts` - Settings management

**Libraries**:
- `lib/admin/users.ts` - User queries
- `lib/admin/providers.ts` - Provider queries
- `lib/admin/analytics.ts` - Analytics aggregations

**Middleware**:
- `middleware.ts` - Route protection
- `lib/supabase/middleware.ts` - Session & maintenance mode

### Security

**RLS Policies** (`supabase/migrations/20251229000004_admin_rls_policies.sql`):
- Admin-only SELECT/INSERT/UPDATE/DELETE on all tables
- Policies check `subscription_tier='admin'`
- Applied to: profiles, chat_sessions, chat_messages, watchlists, glossary_terms, morning_briefings

**API Authorization**:
- All admin API routes verify user authentication
- Check subscription tier = 'admin'
- Return 401 (unauthorized) or 403 (forbidden) on failure

**Middleware Protection**:
- Session validation on every request
- Maintenance mode enforcement
- Admin bypass during maintenance

---

## Troubleshooting

### Common Issues

**1. Cannot Access Admin Panel**
- Verify user has `subscription_tier='admin'` in profiles table
- Check database RLS policies are active
- Ensure user is signed in
- Clear browser cache and cookies

**2. Stats Not Loading**
- Check Supabase connection
- Verify RLS policies allow admin access
- Check browser console for errors
- Ensure tables exist and have data

**3. Provider Test Fails**
- Verify API key is correct
- Check base URL is valid
- Ensure provider is enabled
- Check network connectivity
- Review API rate limits

**4. Mobile Sidebar Won't Close**
- Clear browser cache
- Check JavaScript is enabled
- Try tapping overlay instead of X button
- Refresh page

**5. Maintenance Mode Not Working**
- Check middleware is properly configured
- Verify settings API is saving correctly
- Ensure user is not admin (admins bypass maintenance)
- Check `/maintenance` page exists

### Debug Mode

**Enable Debug Logging**:
```typescript
// In middleware.ts
console.log('Maintenance mode:', maintenanceMode)
console.log('Current user:', user)
console.log('User tier:', profile?.subscription_tier)
```

**Check Database**:
```sql
-- Verify admin users
SELECT id, email, subscription_tier FROM profiles WHERE subscription_tier = 'admin';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'chat_sessions', 'chat_messages');

-- View recent activity
SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 10;
```

---

## Best Practices

### User Management
- Regularly audit admin user list
- Remove admin access from inactive users
- Use Pro/Whale tiers for power users, Admin only for true admins
- Monitor user growth trends

### AI Providers
- Test providers before enabling
- Set priority based on performance
- Monitor success rates and response times
- Disable underperforming providers
- Keep API keys secure (never commit to git)

### Content Management
- Review glossary terms for accuracy
- Update terms as market language evolves
- Archive outdated briefings
- Curate quality news sources

### System Settings
- Adjust chat limits based on usage patterns
- Use feature flags for gradual rollouts
- Schedule maintenance during low-traffic hours
- Test maintenance mode before production use

### Analytics
- Review daily for anomalies
- Track user growth trends
- Monitor provider performance weekly
- Use data to inform product decisions

---

## Future Enhancements

**Planned Features**:
- [ ] Bulk user operations
- [ ] Advanced user search filters
- [ ] Provider auto-failover
- [ ] Real-time analytics dashboard
- [ ] Email notifications for admin events
- [ ] Audit log for all admin actions
- [ ] CSV export for all data tables
- [ ] Scheduled maintenance mode
- [ ] Custom role-based permissions
- [ ] Two-factor authentication for admins

**Performance Optimizations**:
- [ ] Redis caching for settings
- [ ] Database query optimization
- [ ] Lazy loading for large tables
- [ ] Virtualized scrolling for long lists
- [ ] Background job processing for bulk operations

---

## Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Check application logs
4. Contact development team

**Development Team**:
- Built with Claude Code
- Implementation based on design doc: `docs/plans/2025-12-29-admin-panel-design.md`
- Implementation plan: `docs/plans/2025-12-29-admin-panel-implementation.md`

---

*Last Updated: 2025-12-29*
*Version: 1.0.0*
