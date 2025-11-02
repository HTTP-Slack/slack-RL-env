# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Slack clone application.

## Prerequisites
- Google account
- Backend server running on `http://localhost:5000`
- Frontend app running on `http://localhost:5173`

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Slack Clone")
5. Click "Create"

## Step 2: Enable Google+ API

1. In your Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for testing)
   - App name: **Slack Clone** (or your preferred name)
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Skip Scopes (click "Save and Continue")
   - Add test users (your email) under Test users
   - Click "Save and Continue"

4. Back to Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Slack Clone Web Client**
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:5000`
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
   - Click "Create"

## Step 4: Copy Credentials to .env

1. After creating, you'll see a modal with your Client ID and Client Secret
2. Copy these values
3. Open `backend/.env` file
4. Replace the placeholder values:

```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

## Step 5: Restart Backend Server

After updating the `.env` file:

```bash
cd backend
# Stop the current server (Ctrl+C)
npm start
```

## Step 6: Test Google OAuth

1. Open your frontend: `http://localhost:5173`
2. Go to Sign In page
3. Click the "Google" button
4. You should be redirected to Google's OAuth consent screen
5. Sign in with your Google account
6. After successful authentication, you'll be redirected back to your app's home page

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:5000/api/auth/google/callback`
- Check for trailing slashes - they must match exactly

### Error: "Access blocked: This app's request is invalid"
- Make sure you've added your email as a test user in the OAuth consent screen
- Verify that Google+ API is enabled

### Not redirecting after sign in
- Check browser console for errors
- Verify `CLIENT_URL` in backend `.env` is set to `http://localhost:5173`
- Make sure backend server restarted after updating `.env`

### User created but not signed in
- Check if JWT token is being set in cookies
- Verify cookie settings in browser (should accept httpOnly cookies from localhost)

## Security Notes

⚠️ **Important for Production:**
- Generate a strong `SESSION_SECRET` (not the default one)
- Update `GOOGLE_CALLBACK_URL` to your production domain
- Add your production domain to Google Cloud Console authorized URIs
- Set `NODE_ENV=production` in production environment
- Use HTTPS in production (required by Google OAuth)

## How It Works

1. User clicks "Sign in with Google" button
2. Frontend redirects to: `http://localhost:5000/api/auth/google`
3. Backend redirects to Google OAuth consent screen
4. User authorizes the app
5. Google redirects back to: `http://localhost:5000/api/auth/google/callback`
6. Backend verifies the OAuth response with Google
7. Backend creates or finds user in database
8. Backend generates JWT token and sets it as httpOnly cookie
9. Backend redirects to: `http://localhost:5173/home`
10. Frontend uses the JWT cookie for authenticated requests

## Additional Features

The OAuth implementation includes:
- Automatic user creation on first sign-in
- Profile picture sync from Google account
- Email verification (Google accounts are pre-verified)
- Secure session management
- JWT token authentication after OAuth
