# @animelist/auth-next

Implementation of the `@animelist/auth` for `NextJS`.

You can checkout this [Example](https://github.com/Neo-Ciber94/animelist/tree/main/examples/next-mal-auth).

## Table of Contents

1. [Setup](#setup)
2. [Get Current User](#get-current-user)
3. [Middleware](#middleware)
4. [Load user from server](#load-user-from-server)
5. [License](#license)

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

## Get Current User

After the user is logged you can get the current user information using `getServerSession`.

Which returns `null` if the user is not logged or `UserSession`:

```ts
type UserSession = {
  userId: number;
  refreshToken: string;
  accessToken: string;
};
```

```ts
import { getServerSession } from "@animelist/auth-next/server";

const session = await getServerSession(cookies);

if (session) {
  console.log("User is logged in");
}
```

You can also use `getRequiredServerSession(cookies)` which throws an error if the user is not logged in.

> If you want to get the user information you can use the `getUser`, keep in mind this fetches the user,
instead of just retrieve the information from the cookie.

```ts
import { getUser } from "@animelist/auth-next/server";

const user = await getUser(cookies);

if (user) {
  console.log("User is logged in");
}
```

## Middleware

Using the `getServerSession` you can define a middleware for redirect users.

```ts
import { getServerSession } from "@animelist/auth-next/server";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const session = getServerSession(req.cookies);

  if (!session) {
    return NextResponse.redirect("/login");
  }

  return NextResponse.next();
}

```

## Load user from server

Each time we load a page we will fetch the user from the client side,
so you may need to show a spinner while the user is loading.
To prevent this we can fetch the user from the server side.

Following our **setup** example we can do this:

```ts
import { cookies } from "next/headers";
import { getUser } from "@animelist/auth-next/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await getUser(cookies());

  return (
    <html lang="en">
      <body>
        <MyAnimeListAuthProvider session={session}>
          {children}
        </MyAnimeListAuthProvider>
      </body>
    </html>
  );
}
```

---

## Good to know

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
