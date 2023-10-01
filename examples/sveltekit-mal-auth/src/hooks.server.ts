import type { Handle } from "@sveltejs/kit";
import { createMyAnimeListFetchHandler, getUser } from "@animelist/auth-sveltekit/server";

const handler = createMyAnimeListFetchHandler();

export const handle: Handle = async ({ event, resolve }) => {
    try {
        event.locals.session = await getUser(event.cookies);
    } catch (err) {
        console.error(err);
    }

    if (event.url.pathname.startsWith("/api/myanimelist")) {
        return handler(event.request);
    }

    return resolve(event);
}