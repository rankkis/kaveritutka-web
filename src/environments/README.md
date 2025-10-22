# Environment Configuration

## Setup Instructions

### For Developers

1. **Copy the example file to create your local api-keys file:**
   ```bash
   cp src/environments/api-keys.example.ts src/environments/api-keys.ts
   ```

2. **Add your actual API keys to `api-keys.ts`:**
   - Get your Supabase URL and anon key from [Supabase Dashboard](https://app.supabase.com)
   - Navigate to: Settings → API
   - Copy the `URL` and `anon public` key (NOT the service_role key!)

3. **Never commit `api-keys.ts`:**
   - This file is gitignored and should never be committed
   - Always use `api-keys.example.ts` as a template for new keys

## File Structure

- **`environment.ts`** - Development environment config (safe to commit)
- **`environment.prod.ts`** - Production environment config (safe to commit)
- **`api-keys.ts`** - **GITIGNORED** - Contains actual API keys (DO NOT COMMIT)
- **`api-keys.example.ts`** - Template for api-keys.ts (safe to commit)

## Security Notes

### ✅ Safe to Commit
- Supabase **anon/public key** - This is designed to be public
- Supabase URL
- API endpoints
- Environment structure files

### ❌ NEVER Commit
- Supabase **service_role key** - Has full admin access
- Any private/secret keys
- Passwords or tokens

### Why is the anon key safe?
The Supabase `anon` key is meant to be exposed in client-side code. Your data is protected by:
- Row Level Security (RLS) policies on your Supabase database
- Limited permissions on the anon key
- Server-side validation

## For CI/CD

When deploying, ensure your build environment has access to `api-keys.ts` by either:
1. Setting environment variables and generating the file during build
2. Using secrets management in your CI/CD platform (GitHub Secrets, Vercel env vars, etc.)
3. Creating the file from a secure secret store before build
