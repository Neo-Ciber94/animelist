# @animelist/auth-next

Implementation of the `@animelist/auth` for `SvelteKit`.

You can checkout this [Example](https://github.com/Neo-Ciber94/animelist/tree/main/examples/sveltekit-mal-auth).

## Table of Contents

1. [Setup](#setup)
2. [Get Current User](#get-current-user)
3. [Load user from server](#load-user-from-server)
4. [License](#license)


## Setup

In your `Sveltekit` project install the packages:

_npm_

```bash
npm install @animelist/auth-sveltekit @animelist/client
```

_yarn_

```bash
yarn add @animelist/auth-sveltekit @animelist/client
```

_pnpm_

```bash
pnpm install @animelist/auth-sveltekit @animelist/client
```

1.  This package reads environment variables from `process.env` so you need to define them in your `vite.config.ts`.

You can define them directly, `dotenv` or any other plugin that do the job.

This is an example on how can be done:


  ```ts
    import { sveltekit } from "@sveltejs/kit/vite";
    import { defineConfig } from "vite";
    import dotenv from "dotenv"; // npm install -D dotenv
    dotenv.config();

    const defineProcessEnv = () => {
      const definedEnvs = Object.fromEntries(
        Object.entries(process.env || {}).map(([key, value]) => [
          `process.env.${key}`,
          JSON.stringify(value),
        ])
      );

      return definedEnvs;
    };

    export default defineConfig({
      plugins: [sveltekit()],
      define: defineProcessEnv(),
    });
  ```

2.  You need to provide the following environment variables:

    ```bash
    MAL_CLIENT_ID = <client_id>
    MAL_CLIENT_SECRET = <client_secret>
    MAL_REQUEST_DEBUG = true # optional
    ```

    To get the **client id** and **client secret** you need to log into your <https://myanimelist.net/>:

    - Go to `Preferences > API` and create a new client.
    - On the `App Redirect URL` use `<url>/api/myanimelist/auth/callback`.
      - For example `http://localhost:3000/api/myanimelist/auth/callback` if your app is running on `localhost:3000`.

    If you used the example `vite.config.ts` you can just create a `.env` file and the `dotenv` will load the variables.

3.  Create a `hooks.server.ts` with the contents:

```ts
import type { Handle } from "@sveltejs/kit";
import {
  createMyAnimeListFetchHandler,
  getUser,
} from "@animelist/auth-sveltekit/server";

const handler = createMyAnimeListFetchHandler();

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.session = await getUser(event.cookies);

  if (event.url.pathname.startsWith("/api/myanimelist")) {
    return handler(event.request);
  }

  return resolve(event);
};
```

Also may need to modify your `app.d.ts`

```ts
import type { Session } from "@animelist/auth-sveltekit/client";

declare global {
  namespace App {
    interface Locals {
      session?: Session | null;
    }
  }
}
```

4. In your `src/routes/+layout.svelte` initializes the session

```svelte
<script lang="ts">
  import { session } from "@animelist/auth-sveltekit/client";
  session.initialize().catch(console.error);
</script>

<slot />
```

5. You are ready! in a `src/routes/+page.svelte` you can add this:

```svelte
<script lang="ts">
  import { signIn, signOut, session } from "@animelist/auth-sveltekit/client";
</script>

{#if $session.loading}
  <p>Loading...</p>
{:else if $session.user == null}
  <button on:click="{signIn}">Sign In</button>
{:else if $session.user}
  <p>Hello {$session.user.name}</p>
  <button on:click="{signOut}">Sign Out</button>
{/if}
```

6. `$session` also returns an `accessToken` that can be used to make requests.

```svelte
<script lang="ts">
  import { signIn, signOut, session } from "@animelist/auth-sveltekit/client";
  import { MALClient } from "@animelist/client";

$: (async function(){
    if (!$session.accessToken) {
      return;
    }

    // We need the 'proxyUrl' because we are running on the client
    const client = new MALClient({
      proxyUrl: "/api/myanimelist",
      accessToken: $session.accessToken,
    });

    const result = await client.getSuggestedAnime();
    console.log(result);
})()
</script>
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

## Load user from server

Each time we load a page `session.initialize` will fetch the user from the client side,
so you may need to show a spinner while the user is loading.
To prevent this we can fetch the user from the server side.

Following our **setup** example, we can add a `+layout.server.ts` to load the user to all our pages.

```ts
import type { LayoutServerLoad } from './$types';

// `hooks.server.ts` already set the session
export const load: LayoutServerLoad = async ({ locals }) => {
  return { session: locals.session };
};

```

```svelte
<script lang="ts">
  import { session } from "@animelist/auth-sveltekit/client";
  import type { LayoutServerData } from './$types';

  export let data: LayoutServerData;

  session.initialize(data.session).catch(console.error);
</script>

<slot />
```

Alternatively you can drop the usage of `$session` and just access the `$page.data.session`.

```svelte
<script lang="ts">
import { page } from '$app/stores';
</script>

<div>{$page.data.session?.user.name}</div>
```

Remember to also update your `app.d.ts` for type safety.

```ts
// app.d.ts
import type { Session } from '@animelist/auth-sveltekit/client';

declare global {
  namespace App {
    interface Locals {
      session?: Session | null;
    }

    interface PageData {
      session?: Session | null;
    }
    
    // interface Error {}
    // interface Platform {}
  }
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
