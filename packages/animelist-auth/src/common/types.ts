import type { CookieSerializeOptions } from 'cookie';

/**
 * Request cookies.
 */
export type Cookies = {
    /**
     * Gets the value for the cookie with the given name.
     * 
     * @param name The name of the cookie to get.
     */
    get(name: string): string | null | undefined;

    /**
     * Sets the value for a cookie.
     * @param name The name of the cookie to set.
     * @param value The value of the cookie.
     * @param options The options to set the cookie.
     */
    set(name: string, value: string, options?: CookieSerializeOptions): void;

    /**
     * Deletes the cookie with the given name.
     * @param name The name of the cookie to delete.
     * @param options The options to delete the cookie.
     */
    delete(name: string, options?: CookieSerializeOptions): void;
}

/**
 * The incoming request.
 */
export type RequestEvent = {
    /**
     * The current request.
     */
    request: Request,

    /**
     * Get or set cookies related to the current request
     */
    cookies: Cookies
}