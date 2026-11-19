# Gmail API setup (free)

1. Go to https://console.cloud.google.com and create a project (for example "job-inbox").
2. **APIs & Services -> Library**: enable the **Gmail API**.
3. **APIs & Services -> OAuth consent screen**: choose *External*, fill the app
   name and your email, and add **your own Gmail address as a Test user**.
4. **APIs & Services -> Credentials -> Create credentials -> OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URI: `http://localhost:4000/api/auth/google/callback`
5. Copy the client ID and secret into `server/.env`:

   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
   ```

6. Run `npm run dev`, open the app, click **Connect Gmail** and approve.

## Good to know

- Scope used: `gmail.readonly`. The app can read mail but never send or delete.
- While the OAuth app is in **Testing** mode, Google expires the login every
  7 days. Just click **Connect Gmail** again.
- Google shows an "unverified app" warning for your own project. That is normal
  for a personal app: Advanced -> Go to job-inbox.
- Revoke access any time at https://myaccount.google.com/permissions.

## Sync limits

The app reads at most 10 job-alert emails per sync and allows one sync per minute.
These defaults can be adjusted in `server/.env`:

```
GMAIL_EMAIL_LIMIT=10
SYNC_COOLDOWN_MS=60000
```

The email limit is always capped at 10. If Google returns a quota/rate-limit response,
the app retries briefly with backoff and then asks you to wait before syncing again.
