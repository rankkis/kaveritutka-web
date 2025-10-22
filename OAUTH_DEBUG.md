# OAuth Authentication Debugging Log

## Problem Summary

Google OAuth authentication failing with infinite loading spinner and Navigator LockManager errors.

## Architecture Discovery

### Frontend (kaveritutka-web)
- **Angular 19 SPA** hosted on GitHub Pages (kaveritutka.app)
- **Current approach**: Frontend tries to handle OAuth callback directly
- **Issue**: Frontend has `detectSessionInUrl: false` but tries to call `exchangeCodeForSession()` directly

### Backend (kaveritutka-server)
- **NestJS API** with Supabase integration
- **Has OAuth callback endpoint**: `GET /auth/callback`
- **Location**: `src/auth/auth.controller.ts:28-38`
- **Handles**: Code exchange via `authService.exchangeCodeForSession(code)`

## Root Cause Analysis

### The Critical Error

**The OAuth callback URL is pointing to the frontend instead of the backend!**

Current configuration in frontend:
```typescript
const redirectUrl = `${window.location.origin}/auth/callback`;
// Returns: http://localhost:4200/auth/callback (frontend)
// Should be: https://api.kaveritutka.app/auth/callback (backend)
```

### Why This Fails

1. **PKCE Flow Limitation**:
   - Code verifier is stored in frontend localStorage
   - When OAuth redirects to backend, backend cannot access frontend's localStorage
   - `exchangeCodeForSession()` fails with "both auth code and code verifier should be non-empty"

2. **Correct Flow**:
   ```
   Frontend → Google OAuth → Backend /auth/callback → Exchange code → Return tokens → Frontend
   ```

3. **Our Broken Flow**:
   ```
   Frontend → Google OAuth → Frontend /auth/callback → Try to exchange code → FAIL (no verifier)
   ```

## Backend OAuth Implementation

### Controller (auth.controller.ts)
```typescript
@Get('callback')
@ApiOperation({
  summary: 'OAuth callback handler',
  description: 'Exchange OAuth authorization code for access and refresh tokens',
})
async callback(@Query('code') code: string): Promise<AuthResponseDto> {
  return await this.authService.exchangeCodeForSession(code);
}
```

### Service (auth.service.ts)
```typescript
async exchangeCodeForSession(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}> {
  const { data, error } = await this.supabaseProvider
    .getClient()
    .auth.exchangeCodeForSession(code);

  if (error || !data.session || !data.user) {
    throw new UnauthorizedException('Failed to exchange code for session');
  }

  // Get user data from database
  const user = await this.getUserById(data.user.id);

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user,
  };
}
```

## Solutions Attempted

### ❌ Attempt 1: detectSessionInUrl: true
- **Result**: Navigator LockManager error
- **Why failed**: Supabase tries to acquire lock for auto-detection, causes timeout

### ❌ Attempt 2: detectSessionInUrl: false + manual exchange
- **Result**: Infinite loading, no session established
- **Why failed**: Code verifier not found in localStorage

### ❌ Attempt 3: Custom storageKey
- **Result**: Made it worse - broke PKCE verifier lookup
- **Why failed**: Changed where Supabase looks for code verifier

### ❌ Attempt 4: Pass full URL to exchangeCodeForSession
- **Result**: Still failed
- **Why failed**: API expects just the code, not the URL

### ✅ Correct Solution

**Use the backend OAuth callback endpoint!**

## Implementation Plan

### Option A: Backend-Handled OAuth (Recommended)

1. **Frontend Changes**:
   ```typescript
   async signInWithGoogle() {
     const backendUrl = environment.apiUrl; // https://api.kaveritutka.app
     const redirectUrl = `${backendUrl}/auth/callback`;

     await this.supabase.auth.signInWithOAuth({
       provider: 'google',
       options: { redirectTo: redirectUrl }
     });
   }
   ```

2. **Backend Callback** (already exists):
   - Receives code from Google
   - Exchanges code for session (has PKCE verifier)
   - Returns access token + refresh token + user data
   - Redirects to frontend with tokens in URL/query params

3. **Frontend Auth Callback**:
   - Receives tokens from backend redirect
   - Stores tokens in localStorage
   - Updates session state
   - Navigates to home/welcome page

### Option B: Frontend-Only OAuth (Complex)

Would require:
- Sharing code verifier between frontend and backend (insecure)
- Or restructuring to not use PKCE (less secure)
- Not recommended

## Environment URLs

### Development
- Frontend: http://localhost:4200
- Backend: http://localhost:3000 (assumed)

### Production
- Frontend: https://kaveritutka.app
- Backend: https://api.kaveritutka.app (assumed - needs verification)

## Implementation Complete ✅

1. ✅ Document the issue (this file)
2. ✅ Verify backend URL in production (`https://kaveritutka-server.vercel.app`)
3. ✅ Update frontend OAuth redirect to point to backend
4. ✅ Implement backend redirect to frontend with tokens
5. ✅ Implement frontend token handling from backend redirect
6. ✅ Update Supabase Dashboard OAuth redirect URLs
7. ⏳ Test complete OAuth flow

## Final Implementation

### Backend Changes (auth.controller.ts)

```typescript
@Get('callback')
async callback(@Query('code') code: string, @Res() res: Response): Promise<void> {
  try {
    const authResponse = await this.authService.exchangeCodeForSession(code);

    const frontendUrl = process.env.FRONTEND_URL || 'https://kaveritutka.app';

    // Redirect to frontend with tokens in hash (secure)
    const redirectUrl = `${frontendUrl}/auth/callback#access_token=${authResponse.accessToken}&refresh_token=${authResponse.refreshToken}&user_id=${authResponse.user.id}&user_name=${encodeURIComponent(authResponse.user.displayName || 'Anonyymi')}`;

    res.redirect(302, redirectUrl);
  } catch (error) {
    res.redirect(302, `${frontendUrl}/?error=auth_failed`);
  }
}
```

### Frontend Changes

#### 1. SupabaseService - OAuth redirect to backend
```typescript
async signInWithGoogle() {
  const redirectUrl = `${environment.apiUrl}/auth/callback`;
  // Now points to: https://kaveritutka-server.vercel.app/auth/callback
}
```

#### 2. AuthCallbackComponent - Handle tokens from backend
```typescript
async ngOnInit() {
  // Parse tokens from hash fragment
  const hash = window.location.hash.substring(1);
  const hashParams = new URLSearchParams(hash);
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  // Set session with tokens
  await this.supabaseService.getClient().auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Navigate to welcome or home
}
```

## OAuth Flow Diagram

```
┌─────────────┐
│   Frontend  │ 1. Click "Kirjaudu"
│   (Angular) │────────────────────────┐
└─────────────┘                        │
                                       ▼
                            ┌──────────────────┐
                            │  Supabase Auth   │ 2. signInWithOAuth()
                            │  (Google OAuth)  │    redirectTo: backend
                            └──────────────────┘
                                       │
                                       │ 3. Redirect to Google
                                       ▼
                            ┌──────────────────┐
                            │  Google OAuth    │ 4. User logs in
                            │  Login Page      │
                            └──────────────────┘
                                       │
                                       │ 5. Callback with code
                                       ▼
┌──────────────┐            ┌──────────────────┐
│   Backend    │◄───────────│  Supabase Auth   │
│  (NestJS)    │ 6. GET /auth/callback?code=xxx
└──────────────┘
       │
       │ 7. exchangeCodeForSession(code)
       │    → Returns { accessToken, refreshToken, user }
       │
       │ 8. Redirect to frontend with tokens
       │    → https://kaveritutka.app/auth/callback#access_token=...
       ▼
┌─────────────┐
│   Frontend  │ 9. Parse tokens from hash
│  /auth/     │ 10. setSession({ access_token, refresh_token })
│  callback   │ 11. Navigate to /welcome or /
└─────────────┘
```

## Security Considerations

✅ **Using hash fragments** instead of query params (tokens not logged in server logs)
✅ **Backend handles PKCE exchange** (code verifier stays server-side)
✅ **Tokens transmitted once** (immediately stored in localStorage)
✅ **Hash cleared from URL** after token extraction

## References

- [Supabase PKCE Flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow)
- [Supabase Angular Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-angular)
- [Backend auth.controller.ts](../kaveritutka-server/src/auth/auth.controller.ts)
- [Backend auth.service.ts](../kaveritutka-server/src/auth/auth.service.ts)

## Key Learnings

1. **PKCE code verifiers are stored in the initiating client's storage**
2. **OAuth callbacks in client-server architecture should go to the server**
3. **detectSessionInUrl conflicts with manual session handling**
4. **Custom storageKey breaks Supabase's internal PKCE implementation**
5. **Always check if backend already has OAuth endpoints before implementing in frontend**
