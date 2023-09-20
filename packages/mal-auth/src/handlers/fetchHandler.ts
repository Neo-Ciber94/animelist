import { User } from "@mal/core";
import { MALClient } from "@mal/client";
import { COOKIE_AUTH_CSRF, COOKIE_AUTH_CODE_CHALLENGE, COOKIE_AUTH_SESSION, COOKIE_AUTH_ACCESS_TOKEN, generateJwt, getServerSession } from "../common/utils";
import { Auth } from "../server";
import { RequestEvent } from "../common/types";
import { HttpError, error, redirect } from "../common/httpError";

// export const MY_ANIME_LIST_API_URL = "https://api.myanimelist.net/v2";
export const DEFAULT_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days;

type OnSessionData = {
    /**
     * The `MyAnimeList` user.
     */
    user: User,

    /**
     * The `MyAnimeList` access token of the user.
     */
    accessToken: string,

    /**
     * Expiration date of the session.
     */
    expiresAt: Date
}

/**
 * Auth callbacks.
 */
export type AuthCallbacks = {
    /**
     * Called after sign-in.
     */
    onSignIn?: (event: RequestEvent) => void,

    /**
     * Called after sign-out.
     */
    onSignOut?: (event: RequestEvent) => void,

    /**
     * Called after the auth callback.
     */
    onCallback?: (event: RequestEvent) => void,

    /**
     * Called after generating a session token.
     */
    onToken?: (event: RequestEvent) => void,

    /**
     * Called after generating an user session.
     */
    onSession?: (session: OnSessionData, event: RequestEvent) => void,

    /**
     * Called before a proxy request.
     * @param event The current request.
     * @param next The proxy request.
     * @returns The response of the request.
     */
    onProxyRequest?: (event: RequestEvent, next: (event: RequestEvent) => Promise<Response>) => Promise<Response>,
}

/**
 * Options for the auth handler.
 */
export interface MyAnimeListHandlerOptions {
    /**
     * Duration per session, defaults to 7 days.
     */
    sessionDurationSeconds?: number;

    /**
     * Url to redirect after sign-in.
     */
    redirectAfterSignInUrl?: string;

    /**
     * Url to redirect after sign-out.
     */
    redirectAfterSignOutUrl?: string;

    /**
     * Callbacks.
     */
    callbacks?: AuthCallbacks
}

export type HandleAuthOptions = MyAnimeListHandlerOptions & {
    /**
     * The base path for the api.
     * 
     * @example `/api/myanimelist`
     */
    apiUrl: string,

    /**
     * Duration of a session.
     */
    sessionDurationSeconds?: number,

    /**
     * If the app is running in development mode.
     */
    dev?: boolean
}

/**
 * Handle an authentication request.
 * @param event The request event.
 * @param options The authentication options.
 * @returns The response object.
 */
export async function handleAuthFetchRequest(event: RequestEvent, options: HandleAuthOptions) {
    try {
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

            return Response.json({ accessToken, expiresAt })
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

            return Response.json({
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
