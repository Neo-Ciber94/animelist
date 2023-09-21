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
 * Gets the current user session.
 */
export async function getSession() {
    const url = `${getApiUrl()}/auth/session`;
    const res = await fetch(`${url}?include_anime_statistics=true`);

    if (!res.ok) {
        const msg = await res.text();
        console.error(msg);
        throw new Error(msg);
    }

    return await res.json() as Session
}