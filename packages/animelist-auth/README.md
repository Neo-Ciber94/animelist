# @animelist/auth

## Contents

Provides an interface to authenticate users with `MyAnimeList` oauth2 provider.

You may want to use one of the implementations of this package instead:

- [NextJS](https://github.com/Neo-Ciber94/animelist/tree/main/packages/animelist-auth-next)
- [SvelteKit](https://github.com/Neo-Ciber94/animelist/tree/main/packages/animelist-auth-sveltekit)

If you want to use other framework or want to implement your own, we also provide a handler that uses the web standard `Request`/`Response` [createMyAnimeListFetchHandler](https://github.com/Neo-Ciber94/animelist/blob/main/packages/animelist-auth/src/server/handlers/fetchHandler.ts) the same handler is just reexported from the `nextjs` and `sveltekit` implementations.

## Install

In case you want to use this package directly, install it with your favorite package manager:

*npm*

```bash
npm install @animelist/auth
```

*yarn*

```bash
yarn add @animelist/auth
```

*pnpm*

```bash
pnpm install @animelist/auth
```

## Environment variables

These are the environment variables are used by the `@animelist/auth`

- `MAL_CLIENT_ID` The id of your **MyAnimeList** client.
- `MAL_CLIENT_SECRET` The secret key of your **MyAnimeList** client.
- `MAL_REQUEST_DEBUG` Enable logging for the request going to **MyAnimeList**.
  - This also reads the `NODE_ENV` to only show logs when not in *production*.
- `MAL_SECRET_KEY` The secret key used for encode/decode the user session.
- `PUBLIC_MAL_API_URL` The url of the endpoint that handlers the requests, by default is `/api/myanimelist` 
  
____

If the `MAL_SECRET_KEY` is not set you will receive this warning: 
> ⚠️ 'process.env.MAL_SECRET_KEY' was not set, using a default secret key

You can generate a secret key using:

```bash
openssl rand --base64 32
```

Or this beauty:

```bash
echo "console.log(require('crypto').randomBytes(32).toString('base64'))" | node
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
