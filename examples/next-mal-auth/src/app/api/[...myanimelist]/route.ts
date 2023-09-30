import { createMyAnimeListHandler } from '@animelist/auth-next/dist/server'

const handler = createMyAnimeListHandler();

export {
    handler as GET,
    handler as POST,
    handler as PATCH,
    handler as DELETE
}