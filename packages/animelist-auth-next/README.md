# @animelist/auth-next

Implementation of the `@animelist/auth` for `NextJS`.

You can checkout this [Example](https://github.com/Neo-Ciber94/animelist/tree/main/examples/next-mal-auth).

## Setup

In your `NextJS` project install the packages:

*npm*

```bash
npm install @animelist/auth-next @animelist/client
```

*yarn*

```bash
yarn add @animelist/auth-next @animelist/client
```

*pnpm*

```bash
pnpm install @animelist/auth-next @animelist/client
```

1. Create an `.env.local` with the environment variables:

    ```bash
    MAL_CLIENT_ID = <client_id>
    MAL_CLIENT_SECRET = <client_secret>
    MAL_REQUEST_DEBUG = true # optional
    ```

    To get the **client id** and **client secret** you need to log into your <https://myanimelist.net/>:

     - Go to `Preferences > API` and create a new client.
     - On the `App Redirect URL` use `<url>/api/myanimelist/auth/callback`.
       - For example `http://localhost:3000/api/myanimelist/auth/callback` if your app is running on `localhost:3000`.

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

4. Add an `app/api/[...myanimelist]/route.ts` to handle all the *MyAnimeList* requests:

```ts
import { createMyAnimeListFetchHandler } from "@animelist/auth-next/server";

const handler = createMyAnimeListFetchHandler();

export { 
  handler as GET, 
  handler as POST, 
  handler as PATCH, 
  handler as DELETE 
};
```

5. You are ready! In your `app/page.tsx` you can start using the api

```tsx
"use client";
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

> Finally, `npm run dev` make sure to run in the same port that your redirection url, otherwise you will receive an error when trying to login.

6. The `useSession` also returns an `accessToken` that can use used with the client to make requests.

```ts
 // import { MALClient } from "@animelist/client";

 const { user, isLoading, accessToken } = useSession();

 useEffect(() => {
  if (!accessToken) {
    return;
  }

  // We need the 'proxyUrl' because we are running on the client
  const client = new MALClient({ 
    proxyUrl: "/api/myanimelist",
    accessToken, 
  });

  client.getSuggestedAnime()
    .then(console.log)
    .catch(console.error);
 }, [accessToken])
```

---

You may also notice you are receiving this warning:

> ⚠️ 'process.env.MAL_SECRET_KEY' was not set, using a default secret key

To fix that add other environment variable `MAL_SECRET_KEY`, to generate a secret key you can use:

```bash
openssl rand --base64 32
```

Or this beauty:

```bash
echo "console.log(require('crypto').randomBytes(32).toString('base64'))" | node
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
