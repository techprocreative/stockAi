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
