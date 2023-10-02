# @animelist/auth-next

Implementation of the `@animelist/auth` for `NextJS`.

You can checkout this [Example](https://github.com/Neo-Ciber94/animelist/tree/main/examples/next-mal-auth).

## Setup

In your `NextJS` project install the packages:

```bash
npm install @animelist/auth-next
npm install @animelist/client
```

1. Create an `.env.local` with the environment variables:

   - `MAL_CLIENT_ID=<client_id>`
   - `MAL_CLIENT_SECRET=<client_secret>`
   - `MAL_REQUEST_DEBUG=true` (optional)

   To get the **client id** and **client secret** you need to log into your <https://myanimelist.net/> go to `Preferences > API` and create a new client. When adding the `App Redirect URL` add the same url where your app will run, for example `http://localhost:3000`.

2. Create a component `MyAnimeListAuthProvider` to wrap the `SessionProvider`, this is required because the session provider cannot run as a server component.

```tsx
"use client";

import { SessionProvider, type Session } from "@animelist/auth-next/client";

type MyAnimeListAuthProviderProps = {
  children: React.ReactNode;
  session?: Session | null;
};

// <SessionProvider> cannot be used as a server component, so we wrap it.
export function MyAnimeListAuthProvider({
  children,
  session,
}: MyAnimeListAuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
```

3. Modify your root layout `app/layout.tsx` and add the provider

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MyAnimeListAuthProvider>
          {children}
        </MyAnimeListAuthProvider>
      </body>
    </html>
  );
}
```

4. Add an `app/api/[...myanimelist]/route.ts` to handle all the _MyAnimeList_ requests:

```ts
import { createMyAnimeListFetchHandler } from "@animelist/auth-next/server";

const handler = createMyAnimeListFetchHandler();

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
```

5. Then in your `app/page.tsx` you can start using the api

```tsx
import { signIn, signOut, useSession } from "@animelist/auth-next/client";

export default function HomePage() {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {user ? (
        <div>
          <p>{`Hello ${user.name}`}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={signIn}>Sign In</button>
      )}
    </div>
  );
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
