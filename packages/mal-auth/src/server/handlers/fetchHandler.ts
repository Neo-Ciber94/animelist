import { MALClient } from "@mal/client/dist/mal-client/src";
import { COOKIE_AUTH_CSRF, COOKIE_AUTH_CODE_CHALLENGE, COOKIE_AUTH_SESSION, COOKIE_AUTH_ACCESS_TOKEN, generateJwt, getServerSession } from "../../common/utils";
import { Auth } from "../server";
import { HttpError, error, redirect } from "../../common/httpError";
import type { RequestEvent } from "../../common/types";
import type { HandleAuthOptions } from "./types";

const ALLOWED_FORWARD_HEADERS = [
    "Authorization",
    "X-MAL-CLIENT-ID",
    "Content-Type"
]

export const MY_ANIME_LIST_API_URL = "https://api.myanimelist.net/v2";
export const DEFAULT_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days;

/**
 * Handle an authentication request.
 * @param event The request event.
 * @param options The authentication options.
 * @returns The response object.
 */
export async function handleAuthFetchRequest(event: RequestEvent, options: HandleAuthOptions) {
    try {
        // FIXME: eslint is not warning about forgetting the await
        return await handleAuth(event, options);
    }
    catch (err) {
        if (err instanceof HttpError) {
            return err.toResponse();
        }

        throw err;
    }
}

async function handleAuth(event: RequestEvent, options: HandleAuthOptions) {
    const {
        apiUrl,
        sessionDurationSeconds = DEFAULT_SESSION_DURATION_SECONDS,
        dev = true
    } = options;

    const url = new URL(event.request.url);
    const action = getAuthAction(url.pathname);
    const originUrl = `${url.origin}${apiUrl}/auth`;

    switch (action) {
        case '/sign-in': {
            const redirectTo = `${originUrl}/callback`;
            const { url: authenticationUrl, state, codeChallenge } = Auth.getAuthenticationUrl({ redirectTo });

            event.cookies.set(COOKIE_AUTH_CSRF, state, {
                path: "/",
                httpOnly: true,
                sameSite: 'lax',
                secure: dev === false,
                maxAge: sessionDurationSeconds
            });

            event.cookies.set(COOKIE_AUTH_CODE_CHALLENGE, codeChallenge, {
                path: "/",
                httpOnly: true,
                sameSite: 'lax',
                secure: dev === false,
                maxAge: 60 * 15, // 15min
            });

            // sign-in callback
            options.callbacks?.onSignIn?.(event);

            throw redirect(307, authenticationUrl);
        }
        case '/sign-out': {
            event.cookies.delete(COOKIE_AUTH_SESSION, { path: "/" })
            event.cookies.delete(COOKIE_AUTH_CODE_CHALLENGE, { path: "/" });
            event.cookies.delete(COOKIE_AUTH_ACCESS_TOKEN, { path: "/" });
            event.cookies.delete(COOKIE_AUTH_CSRF, { path: "/" });

            // sign-out callback
            options.callbacks?.onSignOut?.(event);

            // Redirect
            throw redirect(307, options.redirectAfterSignInUrl ?? '/');
        }
        case '/callback': {
            const searchParams = url.searchParams;
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const codeChallenge = event.cookies.get(COOKIE_AUTH_CODE_CHALLENGE);

            if (code == null) {
                throw error(401, "No oauth2 code was received");
            }

            if (codeChallenge == null) {
                throw error(401, "No oauth2 code challenge was received");
            }

            const csrf = event.cookies.get(COOKIE_AUTH_CSRF);

            if (state == null || state != csrf) {
                throw error(401, "Invalid auth state");
            }

            const tokens = await Auth.getToken({
                code,
                codeVerifier: codeChallenge,
                redirectTo: `${originUrl}/callback`
            });

            const userId = Auth.getUserIdFromToken(tokens.access_token);

            if (userId == null) {
                throw error(401, "User id not found");
            }

            const sessionToken = await generateJwt(userId, tokens.refresh_token);

            event.cookies.set(COOKIE_AUTH_SESSION, sessionToken, {
                path: "/",
                httpOnly: true,
                secure: dev === false,
                sameSite: 'lax',
                maxAge: sessionDurationSeconds,
            });

            const { access_token: accessToken, expires_in } = await Auth.refreshToken({ refreshToken: tokens.refresh_token });

            event.cookies.set(COOKIE_AUTH_ACCESS_TOKEN, accessToken, {
                path: "/",
                httpOnly: true,
                secure: dev === false,
                sameSite: 'lax',
                maxAge: expires_in,
            });

            // remove the auth code challenge cookie
            event.cookies.delete(COOKIE_AUTH_CODE_CHALLENGE);

            // auth callback
            options.callbacks?.onCallback?.(event);

            // Redirect
            throw redirect(307, options.redirectAfterSignOutUrl ?? '/');
        }
        case '/token': {
            const { accessToken, expiresAt } = await getMyAnimeListAuthToken(event);

            // token callback
            options.callbacks?.onToken?.(event);

            return json({ accessToken, expiresAt })
        }
        case '/session': {
            const { accessToken, expiresAt } = await getMyAnimeListAuthToken(event);
            const includeStatistics = url.searchParams.get('include_anime_statistics') === "true";

            const malClient = new MALClient({ accessToken });
            const user = await malClient.getMyUserInfo({
                fields: includeStatistics ? ['anime_statistics'] : []
            });

            event.cookies.set(COOKIE_AUTH_ACCESS_TOKEN, accessToken, {
                path: "/",
                maxAge: sessionDurationSeconds,
                httpOnly: true,
                sameSite: 'strict'
            });

            // session callback
            options.callbacks?.onSession?.({ user, accessToken, expiresAt }, event);

            return json({
                user,
                accessToken,
                expiresAt
            })
        }
        default: {
            console.error(`❌ Invalid auth action: ${action}`);
            throw error(404)
        }
    }
}

async function getMyAnimeListAuthToken(event: RequestEvent) {
    const token = event.cookies.get(COOKIE_AUTH_SESSION);

    if (token == null) {
        throw error(401);
    }

    const authenticated = await getServerSession(event.cookies);

    if (authenticated == null) {
        throw error(401);
    }

    const { refreshToken, userId } = authenticated;
    const { access_token: accessToken, expires_in } = await Auth.refreshToken({ refreshToken });

    // OAuth2 `expires_in` is in seconds
    // https://www.rfc-editor.org/rfc/rfc6749#section-5.1
    const accessTokenExpiresMs = expires_in * 1000;

    // Keep in mind some delay could exists in the time, so we should consider the token
    // will expire before the actual expiration date.
    const expiresAt = new Date(accessTokenExpiresMs + Date.now());

    return { accessToken, expiresAt, userId }
}

function getAuthAction(pathname: string) {
    const lastSegment = pathname.lastIndexOf("/");
    return lastSegment < 0 ? pathname : pathname.slice(lastSegment);
}

/**
 * Forwards a request to `MyAnimeList`.
 * @param apiUrl The path to the current API endpoint. `/api/myanimelist`
 * @param event The current request event.
 */
export async function proxyFetchRequestToMyAnimeList(apiUrl: string, event: RequestEvent) {
    const forwardHeaders: Record<string, string> = {};

    for (const [key, value] of event.request.headers.entries()) {
        if (ALLOWED_FORWARD_HEADERS.some(x => x.toLowerCase() === key.toLowerCase())) {
            forwardHeaders[key] = value;
        }
    }

    const url = new URL(event.request.url);
    const path = url.pathname.slice(apiUrl.length);
    const search = url.search;
    const myAnimeListApiUrl = `${MY_ANIME_LIST_API_URL}${path}${search}`

    // 🍥 GET: https://api.example.com/users
    console.log(`🍥 ${event.request.method}: ${myAnimeListApiUrl}`)

    const res = await fetch(myAnimeListApiUrl, {
        method: event.request.method,
        body: event.request.body,
        headers: forwardHeaders,
        signal: event.request.signal,
        cache: event.request.cache,
        credentials: event.request.credentials,
        integrity: event.request.integrity,
        keepalive: event.request.keepalive,
        mode: event.request.mode,
        redirect: event.request.redirect,
        referrer: event.request.referrer,
        referrerPolicy: event.request.referrerPolicy,

        // @ts-expect-error This property is required to send a body
        // https://github.com/nodejs/node/issues/46221#issuecomment-1482439958
        duplex: 'half'
    });

    if (!res.ok) {
        // ❌ GET (404) Not Found: https://api.example.com/users
        console.error(`❌ ${event.request.method} (${res.status}) ${res.statusText}: ${myAnimeListApiUrl}`)
    }

    return res;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function json(data: any) {
    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}