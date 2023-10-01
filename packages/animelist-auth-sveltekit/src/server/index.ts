import { getServerSession, type Cookies } from "@animelist/auth/common";
import { type GetMyUserInfoOptions, MALClient } from "@animelist/client";

// We just reexports here
export { createMyAnimeListFetchHandler } from "@animelist/auth/server";
export {
    getServerSession,
    getRequiredServerSession,
    type UserSession,
    type Cookies
} from "@animelist/auth/common";

/**
 * Fetches the user using the token in the session cookies.
 * 
 * @remarks This function will make a request each time to fetch the user,
 * if you want to check if the user is logged prefer to use `getServerSession` or `getRequiredServerSession` instead,
 * or add a caching logic on top of this function.
 * 
 * @param cookies The cookies to extract the user token.
 * @param options Additional options to pass to retrieve the user.
 * @returns The current user if found.
 */
export async function getUser(cookies: Cookies, options?: GetMyUserInfoOptions) {
    const session = await getServerSession(cookies);

    if (session == null) {
        return undefined;
    }

    const client = new MALClient({ accessToken: session.accessToken });
    const user = await client.getMyUserInfo(options);

    return {
        user,
        accessToken: session.accessToken,
    }
}