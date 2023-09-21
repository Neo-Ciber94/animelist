import type { Handle } from "@sveltejs/kit";
import { createMyAnimeListHandler } from "@animelist/auth-sveltekit";

const handler = createMyAnimeListHandler({
    callbacks: {
        onSession(session) {
            console.log(session.user);
        }
    }
});

export const handle: Handle = ({ event, resolve }) => {
    if (event.url.pathname.startsWith("/api/myanimelist")) {
        return handler({ event, resolve });
    }

    return resolve(event);
}