# @animelist/client example

An example about how to use the `MALClient` to fetch
data using `nodeJS`.

## How to run

After installing all the dependencies.

- 1. Define a `.env` file with the contents:
  - `MAL_CLIENT_ID=<your mal client id>`

To get the **client id** you need to log into your <https://myanimelist.net/> and go to `Preferences > API` and create a new client. We are not gonna use the redirection url, but you can set it to `http://localhost:3000/api/myanimelist/auth/callback` which is used in other examples.

- 2. Run your app

```bash
npm run dev
yarn dev
pnpm dev
```
