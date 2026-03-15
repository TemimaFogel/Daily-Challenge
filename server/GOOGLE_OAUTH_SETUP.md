# Google OAuth setup for DailyChallenge

## 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
4. If prompted, configure the **OAuth consent screen**:
   - User type: **External** (for real users) or **Internal** (for workspace-only).
   - App name: e.g. **DailyChallenge**.
   - Support email: your email.
   - Scopes: add **email**, **profile** (or they are added by default).
5. Create the OAuth client:
   - Application type: **Web application**.
   - Name: e.g. **DailyChallenge Web**.

## 2. Authorized redirect URIs

Add the backend callback URL(s). The backend receives the OAuth code here.

**Local:**
```
http://localhost:8080/login/oauth2/code/google
```

**Production (example):**
```
https://api.yourdomain.com/login/oauth2/code/google
```

Use your actual backend base URL (no trailing slash) + `/login/oauth2/code/google`.

## 3. Authorized JavaScript origins (optional)

Only needed if you use the Google JS library from the frontend. For this app we use **backend-only** OAuth (redirect to backend, then redirect to frontend with token). You can add for consistency:

**Local:**
```
http://localhost:5173
```

**Production:**
```
https://yourdomain.com
```

## 4. Environment variables

Set on the **backend** (server):

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID (from Google Console). |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client secret. |

Optional (already have defaults):

| Variable | Description |
|----------|-------------|
| `app.frontend.base-url` | Frontend base URL for post-login redirect (default `http://localhost:5173`). |

## 5. Scopes

The app requests:

- **email** – user’s email address.
- **profile** – name and picture.

Configured in `application.yml` under `spring.security.oauth2.client.registration.google.scope`.

## 6. Callback URL the backend uses

Spring Security OAuth2 Client uses:

- **Redirect URI template:** `{baseUrl}/login/oauth2/code/{registrationId}`
- So for Google: `{baseUrl}/login/oauth2/code/google`
- With backend at `http://localhost:8080`: **`http://localhost:8080/login/oauth2/code/google`**

This exact URL must be added in Google Console under **Authorized redirect URIs**.

## 7. Flow summary

1. User clicks “Continue with Google” on login/register.
2. Browser goes to backend: `GET /oauth2/authorization/google`.
3. Backend redirects to Google.
4. User signs in with Google; Google redirects to backend: `GET /login/oauth2/code/google?code=...`.
5. Backend exchanges code for tokens, loads profile, finds or creates user, issues app JWT.
6. Backend redirects to frontend: `{frontendBaseUrl}/oauth-success?token={jwt}`.
7. Frontend stores token, fetches user, redirects to app.
