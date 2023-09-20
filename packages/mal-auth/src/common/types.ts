
export type Cookies = {
    get(name: string): string;
    set(name: string, value: string, options?: unknown): void;
    delete(name: string, options?: unknown): void;
}

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