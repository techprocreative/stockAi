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
