import type { Handle } from "@sveltejs/kit";
import { createMyAnimeListHandler } from "@animelist/auth-sveltekit/server";
import { getServerSession } from "@animelist/auth/common";
import { MALClient } from "@animelist/client";

const handler = createMyAnimeListHandler();

export const handle: Handle = async ({ event, resolve }) => {
    const session = await getServerSession(event.cookies);

    if (session) {
        const { accessToken, } = session;
        const client = new MALClient({ accessToken });

        try {
            const user = await client.getMyUserInfo({});
            event.locals.session = { user, accessToken };
        } catch (err) {
            console.error(err);
        }
    }

    if (event.url.pathname.startsWith("/api/myanimelist")) {
        return handler({ event, resolve });
    }

    return resolve(event);
}