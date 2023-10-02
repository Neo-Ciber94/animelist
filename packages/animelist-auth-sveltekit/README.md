# @animelist/auth-next

Implementation of the `@animelist/auth` for `SvelteKit`.

You can checkout this [Example](https://github.com/Neo-Ciber94/animelist/tree/main/examples/sveltekit-mal-auth).

## Setup

In your `Sveltekit` project install the packages:

```bash
npm install @animelist/auth-sveltekit
npm install @animelist/client
```

1.  This package reads environment variables from `process.env` so you need to define them in your `vite.config.ts`.

    <details>
    <summary>Example vite.config.ts</summary>

    ```ts
    import { sveltekit } from "@sveltejs/kit/vite";
    import { defineConfig } from "vitest/config";
    import dotenv from "dotenv"; // install dotenv
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
      test: {
        include: ["src/**/*.{test,spec}.{js,ts}"],
      },
      define: defineProcessEnv(),
    });
    ```

    </details>

2.  You need to provide the following environment variables:

    - `MAL_CLIENT_ID=<client_id>`
    - `MAL_CLIENT_SECRET=<client_secret>`
    - `MAL_REQUEST_DEBUG=true` (optional)

    To get the **client id** and **client secret** you need to log into your <https://myanimelist.net/> go to `Preferences > API` and create a new client. When adding the `App Redirect URL` add the same url where your app will run, for example `http://localhost:3000`.

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

```html
<script lang="ts">
	import { session } from '@animelist/auth-sveltekit/client';
    session.initialize().catch(console.error);
</script>
</slot>
```

5. Then you can create a `src/routes/+page.svelte`

```html
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
