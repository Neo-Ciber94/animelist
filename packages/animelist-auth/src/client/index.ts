import { z } from "zod";
import type { User } from "@animelist/core";
import { getApiUrl } from "../common/getApiUrl";

const userTokenSchema = z.object({
    accessToken: z.string(),
    expiresAt: z.string().pipe(z.coerce.date())
});

/**
 * The user token.
 */
export type UserToken = z.infer<typeof userTokenSchema>;

/**
 * Redirects to the sign-in page.
 */
export function signIn() {
    window.location.href = `${window.location.origin}${getApiUrl()}/auth/sign-in`
}

/**
 * Redirects to the sign-out page.
 */
export function signOut() {
    window.location.href = `${window.location.origin}${getApiUrl()}/auth/sign-out`
}

/**
 * Gets the current user access token.
 * @param opts Additional options.
 */
export async function getUserToken(opts?: {
    /**
     * Whether if skip the returned json validation, this is in case
     * contract is broken, we should never happen.
     */
    skipValidation?: boolean
}): Promise<UserToken | null> {
    const res = await fetch(`${getApiUrl()}/auth/token`);

    if (!res.ok) {
        const msg = await res.text();
        console.error(msg);
        return null;
    }

    // I'm just paranoid, but this never should be necessary
    if (opts?.skipValidation === true) {
        return await res.json() as UserToken;
    }

    const userToken = userTokenSchema.parse(await res.json());
    return userToken;
}

/**
 * The user session.
 */
export type Session = UserToken & {
    /**
     * The current user.
     */
    user: User
}

/**
 * Options for fetching the session.
 */
export type GetSessionOptions = {
    /**
     * An abort signal to cancel this request.
     */
    signal?: AbortSignal,

    /**
     * Loads the statistics of the user.
     * @default true
     */
    includeStatistics?: boolean;
}

/**
 * Gets the current user session.
 */
export async function getSession(opts?: GetSessionOptions) {
    const { signal, includeStatistics = true } = opts || {};
    const url = `${getApiUrl()}/auth/session`;
    const searchParams = includeStatistics ? '?include_anime_statistics=true' : '';
    const res = await fetch(`${url}${searchParams}`, {
        signal,
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }

    return await res.json() as Session
}