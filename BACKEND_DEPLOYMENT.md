# Backend Deployment Instructions

## Changes Required for OAuth

The backend code in `kaveritutka-server` has been updated to handle OAuth callbacks and redirect to the frontend with tokens.

### Modified File

**`src/auth/auth.controller.ts`**

The `/auth/callback` endpoint now:
1. Receives OAuth code from Google
2. Exchanges code for session tokens via Supabase
3. Redirects to frontend with tokens in URL hash

### Deployment Steps

#### Option 1: Deploy to Vercel (Current)

If your backend is already on Vercel at `https://kaveritutka-server.vercel.app`:

1. **Navigate to backend directory**:
   ```bash
   cd ../kaveritutka-server
   ```

2. **Commit the changes**:
   ```bash
   git add src/auth/auth.controller.ts
   git commit -m "Update OAuth callback to redirect to frontend with tokens"
   git push
   ```

3. **Vercel auto-deploys** from your main branch (if configured)

4. **Set environment variable** (optional):
   ```bash
   vercel env add FRONTEND_URL
   # Enter: https://kaveritutka.app
   ```

#### Option 2: Manual Deployment

1. **Navigate to backend directory**:
   ```bash
   cd ../kaveritutka-server
   ```

2. **Install dependencies** (if not already):
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Deploy using your preferred method**:
   - Vercel: `vercel --prod`
   - Other platforms: Follow their deployment guide

### Environment Variables

The backend needs the following environment variable (optional):

| Variable | Value | Description |
|----------|-------|-------------|
| `FRONTEND_URL` | `https://kaveritutka.app` | Frontend URL for OAuth redirects (defaults to `https://kaveritutka.app` in production) |

For local development:
```bash
FRONTEND_URL=http://localhost:4200
```

### Verification

After deployment, verify the OAuth callback endpoint:

```bash
# Check if endpoint exists (should return 401 without code)
curl https://kaveritutka-server.vercel.app/auth/callback
```

Expected response: 401 Unauthorized (because no code parameter)

### Testing OAuth Flow

1. **Frontend**: Go to https://kaveritutka.app
2. **Click**: "Kirjaudu" button
3. **Observe flow**:
   - Redirects to Google OAuth
   - After login, redirects to backend: `https://kaveritutka-server.vercel.app/auth/callback?code=xxx`
   - Backend exchanges code for tokens
   - Redirects back to frontend: `https://kaveritutka.app/auth/callback#access_token=xxx&refresh_token=yyy`
   - Frontend extracts tokens and establishes session

### Troubleshooting

#### Issue: "Failed to exchange code for session"

**Cause**: Backend can't reach Supabase or code is invalid/expired

**Solution**:
- Check Supabase credentials in backend `.env`
- Verify OAuth code hasn't expired (5-minute validity)
- Check backend logs for detailed error

#### Issue: Redirect loop

**Cause**: Frontend URL mismatch

**Solution**:
- Verify `FRONTEND_URL` environment variable
- Check if production uses `https://kaveritutka.app`
- Ensure no trailing slash in URL

#### Issue: CORS errors

**Cause**: Backend not allowing frontend origin

**Solution**:
- Update CORS configuration in backend to allow `https://kaveritutka.app`
- For development, allow `http://localhost:4200`

### Code Changes Summary

```typescript
// Before: Returned JSON
async callback(@Query('code') code: string): Promise<AuthResponseDto> {
  return await this.authService.exchangeCodeForSession(code);
}

// After: Redirects to frontend
async callback(@Query('code') code: string, @Res() res: Response): Promise<void> {
  const authResponse = await this.authService.exchangeCodeForSession(code);
  const frontendUrl = process.env.FRONTEND_URL || 'https://kaveritutka.app';
  const redirectUrl = `${frontendUrl}/auth/callback#access_token=${authResponse.accessToken}...`;
  res.redirect(302, redirectUrl);
}
```

### Next Steps

After deployment:
1. ✅ Verify backend is accessible
2. ✅ Test OAuth flow from frontend
3. ✅ Check browser console for any errors
4. ✅ Verify session is established correctly

### Rollback Plan

If OAuth doesn't work:

1. **Revert backend changes**:
   ```bash
   git revert HEAD
   git push
   ```

2. **Revert frontend changes**:
   ```bash
   cd ../kaveritutka-web
   git revert HEAD
   git push
   npm run gh-deploy
   ```

3. **Check Supabase Dashboard**:
   - Verify redirect URLs are correct
   - Ensure Google OAuth is enabled
