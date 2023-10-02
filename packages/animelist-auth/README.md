# @animelist/auth

## Contents

Provides an interface to authenticate users with `MyAnimeList` oauth2 provider.

You may want to use one of the implementations of this package instead:

- [NextJS](https://github.com/Neo-Ciber94/animelist/tree/main/packages/animelist-auth-next)
- [SvelteKit](https://github.com/Neo-Ciber94/animelist/tree/main/packages/animelist-auth-sveltekit)

If you want to use other framework or want to implement your own, we also provide a handler that uses the web standard `Request`/`Response` [createMyAnimeListFetchHandler](https://github.com/Neo-Ciber94/animelist/blob/main/packages/animelist-auth/src/server/handlers/fetchHandler.ts) the same handler is just reexported from the `nextjs` and `sveltekit` implementations.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
