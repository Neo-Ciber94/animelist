# @animelist/auth-next example

An example template on how to use `@animelist/auth-next`.

## How to run

1. Create a `.env.local` with the contents:
   - `MAL_CLIENT_ID=<client_id>`
   - `MAL_CLIENT_SECRET=<client_secret>`
   - `MAL_REQUEST_DEBUG=true` (optional)

    To get the **client id** and **client secret** you need to log into your <https://myanimelist.net/> and go to `Preferences > API` and create a new client. When adding the `App Redirect URL` add the same url where your app will run, in this case is `http://localhost:3000`.

2. Run your app.

```bash
npm run dev
yarn dev
pnpm dev
```

## Contents

- `src/app/api/[...myanimelist]/route.ts`
  - Defines the handler that manages all the **MyAnimeList** requests.
- `src/app/providers.tsx`
  - Defines a `<MyAnimeListAuthProvider>` that wraps the `SessionProvider`, this is required due the session provider cannot run in a ServerComponent.
- `src/app/Auth.tx`
  - A header which control the login/logout
- `src/app/AnimeListSuggestion.tsx`
  - Fetches a current user anime suggestion when the user is logged.
