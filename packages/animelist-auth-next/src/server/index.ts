// We just reexports here
export { createMyAnimeListFetchHandler } from "@animelist/auth/server";

export { type UserSession, type Cookies } from "@animelist/auth/common";

import {
  getServerSession as getAuthServerSession,
  getRequiredServerSession as getAuthRequiredServerSession,
} from "@animelist/auth/common";
import { type GetMyUserInfoOptions, MALClient } from "@animelist/client";
import { type RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

// We adapt the `getServerSession` functions to use the NextJS cookies.

type NextCookies = Pick<RequestCookies, "get" | "getAll" | "has">;

/**
 * Verify the session and return the MyAnimeList refresh token and user id.
 * @param cookies The cookies to extract the user token.
 * @returns The user refresh token and user id.
 */
export async function getServerSession(cookies: NextCookies) {
  return await getAuthServerSession({
    get: (name) => cookies.get(name)?.value,
  });
}

/**
 * Verify the session and returns the user id and refresh token, if the user is not authenticated throws 401.
 * @param cookies The cookies to extract the user token.
 * @param message The error message to show when the user is not authenticated. Defaults to `"unable to get user session"`.
 * @returns The user refresh token and id.
 */
export async function getRequiredServerSession(cookies: NextCookies) {
  return await getAuthRequiredServerSession({
    get: (name) => cookies.get(name)?.value,
  });
}

/**
 * Fetches the user using the token in the session cookies.
 *
 * @remarks This function will make a request each time to fetch the user,
 * if you want to check if the user is logged prefer to use `getServerSession` or `getRequiredServerSession` instead.
 *
 * @param cookies The cookies to extract the user token.
 * @param options Additional options to pass to retrieve the user.
 * @returns The current user if found.
 */
export async function getUser(
  cookies: NextCookies,
  options?: GetMyUserInfoOptions
) {
  const session = await getServerSession(cookies);

  if (session == null) {
    return undefined;
  }

  const client = new MALClient({ accessToken: session.accessToken });
  const user = await client.getMyUserInfo(options);

  return {
    user,
    accessToken: session.accessToken,
  };
}
