import * as jose from 'jose';
import { DEFAULT_SESSION_DURATION_SECONDS } from '../server/handlers/fetchHandler';
import type { Cookies } from './types';
import { error } from './httpError';

const SECRET_KEY = process.env.MAL_SECRET_KEY || getDefaultSecretKey();

function getDefaultSecretKey() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error("You must generate a secret key and set it to 'process.env.MAL_SECRET_KEY'");
    }

    console.warn(`⚠️ 'process.env.MAL_SECRET_KEY' was not set, using a default secret key`)
    return "nsuI9j2wnlH2dQ4I23g/0Ou/kCAwS8jhWh/lNcU7Yd1DS4wdNCQ5Nso+P/zukcIelBsZ9gomJhqichVYvKasaA==";
}

/**
 * Name of the `session` cookie.
 */
export const COOKIE_AUTH_SESSION = 'mal.session';

/**
 * Name of the `csrf token` cookie.
 */
export const COOKIE_AUTH_CSRF = 'mal.csrf';

/**
 * Name of the short lived `code challenge` cookie.
 */
export const COOKIE_AUTH_CODE_CHALLENGE = 'mal.code_challenge';

/**
 * Name of the `access token` cookie.
 */
export const COOKIE_AUTH_ACCESS_TOKEN = 'mal.access_token';

const JWT_AUDIENCE = "mal.audience";
const JWT_ISSUER = "mal.issuer";

/**
 * Authenticated user information.
 */
export type UserSession = {
    /**
     * The `MyAnimeList` user id.
     */
    userId: number;

    /**
     * The refresh token.
     */
    refreshToken: string;

    /**
     * The access token.
     */
    accessToken: string;
}

function getSecretKey() {
    const encoder = new TextEncoder();
    const key = encoder.encode(SECRET_KEY);
    return key;
}

/**
 * Generate a jwt from the refreshToken returned from MyAnimeList to validate in our server.
 * 
 * @param userId the `MyAnimeList` user id.
 * @param refreshToken The MyAnimeList refresh token.
 * @returns A jwt token with the refresh token and user id.
 */
export async function generateJwt(userId: number, refreshToken: string): Promise<string> {
    const signJwt = new jose.SignJWT({ refreshToken, sub: String(userId) })
        .setExpirationTime(Date.now() + DEFAULT_SESSION_DURATION_SECONDS)
        .setAudience(JWT_AUDIENCE)
        .setIssuer(JWT_ISSUER)
        .setProtectedHeader({ alg: 'HS256' })

    const key = getSecretKey();
    const jwt = await signJwt.sign(key);
    return jwt;
}

/**
 * Verify the session and return the MyAnimeList refresh token and user id.
 * @param cookies The cookies to extract the user token.
 * @returns The user refresh token and user id.
 */
export async function getServerSession(cookies: Cookies): Promise<UserSession | null> {
    const key = getSecretKey();

    const sessionToken = cookies.get(COOKIE_AUTH_SESSION);
    const accessToken = cookies.get(COOKIE_AUTH_ACCESS_TOKEN);

    if (sessionToken == null) {
        console.warn("⚠️  session token is null");
        return null;
    }

    if (accessToken == null) {
        console.warn("⚠️  access token is null");
        return null;
    }

    try {
        const result = await jose.jwtVerify(sessionToken, key, {
            audience: JWT_AUDIENCE,
            issuer: JWT_ISSUER
        });

        const { payload: { refreshToken, sub } } = result;
        const userId = Number(sub)

        if (typeof refreshToken !== 'string') {
            console.error(`invalid refresh token: '${refreshToken}'`);
            return null;
        }

        if (Number.isNaN(userId)) {
            console.error(`Invalid user id: '${userId}'`);
            return null;
        }

        return { refreshToken, userId, accessToken }
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

/**
 * Verify the session and returns the user id and refresh token, if the user is not authenticated throws 401.
 * @param cookies The cookies to extract the user token.
 * @param message The error message to show when the user is not authenticated. Defaults to `"unable to get user session"`.
 * @returns The user refresh token and id.
 */
export async function getRequiredServerSession(cookies: Cookies, message = "unable to get user session"): Promise<UserSession> {
    const session = await getServerSession(cookies);

    if (session == null) {
        throw error(401, message);
    }

    return session;
}