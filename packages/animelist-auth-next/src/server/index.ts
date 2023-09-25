import type { Cookies, RequestEvent } from "@animelist/auth/common/types";
import { DEFAULT_SESSION_DURATION_SECONDS, handleAuthFetchRequest, proxyFetchRequestToMyAnimeList } from "@animelist/auth/server";
import { type MyAnimeListHandlerOptions } from "@animelist/auth";
import { getApiUrl } from "@animelist/auth/common";
import { cookies } from 'next/headers';

type RequestHandler = (req: Request) => Promise<Response>

/**
 * Creates a sveltekit `Handler` for `MyAnimeList` requests.
 * @param options The options for the handler.
 */
export function createMyAnimeListHandler(options: MyAnimeListHandlerOptions = {}): RequestHandler {
    const { sessionDurationSeconds = DEFAULT_SESSION_DURATION_SECONDS } = options;

    if (sessionDurationSeconds <= 0) {
        throw new Error(`Session duration must be greater than zero but was: ${sessionDurationSeconds}`);
    }

    const apiUrl = getApiUrl();
    const authPath = `${apiUrl}/auth`;

    if (apiUrl.endsWith("/")) {
        throw new Error(`api url cannot end with '/'`);
    }

    return async (request) => {
        const pathname = new URL(request.url).pathname;
        const nextCookies = cookies();
        const event = {
            request,
            cookies: {
                get(name) {
                    return nextCookies.get(name)?.value;
                },
                set(name, value, opts) {
                    nextCookies.set(name, value, opts);
                },
                delete(name) {
                    nextCookies.delete(name)
                }
            } satisfies Cookies
        }

        if (!startsWithPathSegment(pathname, apiUrl)) {
            return new Response(null, { status: 404 });
        }

        if (startsWithPathSegment(pathname, authPath)) {
            return handleAuthFetchRequest(event, {
                ...options,
                apiUrl,
                sessionDurationSeconds,
            });
        }

        if (options.callbacks?.onProxyRequest) {
            const next = (event: RequestEvent) => proxyFetchRequestToMyAnimeList(apiUrl, event);
            return options.callbacks.onProxyRequest(event, next);
        }

        return proxyFetchRequestToMyAnimeList(apiUrl, event);
    }
}

function startsWithPathSegment(pathname: string, other: string) {
    const a = pathname.split("/").filter(x => x.length > 0);
    const b = other.split("/").filter(x => x.length > 0);

    if (a.length < b.length) {
        return false;
    }

    for (let i = 0; i < b.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}