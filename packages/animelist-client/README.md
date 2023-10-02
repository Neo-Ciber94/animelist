# @animelist/client

## Contents

Provides an interface for interact with `MyAnimeList` API:

<https://myanimelist.net/apiconfig/references/api/v2#section/Authentication>

> Currently this library only implements the related `anime` api.

## Setup

1. Set the environment variable `MAL_CLIENT_ID=<client_id>` or use a package like `dotenv` with a `.env` file.

   To get the **client id** you need to log into your <https://myanimelist.net/> and go to `Preferences > API` and create a new client.

2. After that just import and make requests.

```ts
import { MALClient } from "@animelist/client";

const client = new MALClient({
  clientId: process.env.MAL_CLIENT_ID!,
});

const result = await client.getAnimeRanking({
  ranking_type: "tv",
});

console.log(result);
```

> `MyAnimeList` throttle the request, if your make multiples request in a short period of time you may receive a `403` error.

Checkout <https://github.com/Neo-Ciber94/animelist/tree/main/examples/client-sample>

## License

This project is licensed under the MIT License - see the LICENSE file for details.
