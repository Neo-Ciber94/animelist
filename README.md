# @animelist

This repository provide a `Javascript`/`Typescript` library for interacting with the `MyAnimeList` API,
both authorization and anime api.

> <https://myanimelist.net/apiconfig/references/api/v2>

Currently the client is only implementing the `anime` related interface.

## Why?

This library is born from one of my projects: https://myanimestats.pages.dev/

Where I required an abstraction layer to comunicate with *MyAnimeList*. `MyAnimeStats` was built with `SvelteKit` but
I decide to extract the logic to be able to implement it in any technology that use the web standard `Request`/`Response`.

## Contents

- `@animelist/core` Core functionality and types shared across libraries.
  - [Learn More](https://github.com/Neo-Ciber94/mal/tree/main/packages/animelist-core)
- `@animelist/auth` Provides a way to authenticate with `MyAnimeList` using `OAuth2`.
  - [Learn More](https://github.com/Neo-Ciber94/mal/tree/main/packages/animelist-auth)
- `@animelist/client` Provides a client to interact with the `MyAnimeList` API.
  - Currently this only implements the `anime` API.
  - [Learn More](https://github.com/Neo-Ciber94/mal/tree/main/packages/animelist-client)
- `@animelist/auth-next` An implementation of the `auth` for `NextJS`.
  - [Learn More](https://github.com/Neo-Ciber94/mal/tree/main/packages/animelist-auth-next)
- `@animelist/auth-sveltekit` An implementation of the `auth` for `SvelteKit`.
  - [Learn More](https://github.com/Neo-Ciber94/mal/tree/main/packages/animelist-auth-sveltekit)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
