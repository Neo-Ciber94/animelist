import { type CookieSerializeOptions, parse as parseCookie, serialize as serializeCookie } from "cookie";

type CookieValue = { value: string, options?: CookieSerializeOptions };

export class CookieJar {
    private cookies = new Map<string, CookieValue>();

    constructor(cookieHeader?: string | undefined | null) {
        if (cookieHeader) {
            const cookies = new Map<string, CookieValue>();

            try {
                const obj = parseCookie(cookieHeader);
                for (const key in obj) {
                    const value = obj[key];
                    cookies.set(key, { value })
                }

                this.cookies = cookies;
            }
            catch (err) {
                console.error(err);
            }
        }
    }

    set(name: string, value: string, options?: CookieSerializeOptions) {
        this.cookies.set(name, { value, options });
    }

    get(name: string) {
        return this.cookies.get(name)?.value;
    }

    delete(name: string) {
        this.cookies.set(name, {
            value: '',
            options: {
                expires: new Date(0)
            }
        });
    }

    get size() {
        return this.cookies.size;
    }

    serialize() {
        const serializedCookies: string[] = [];

        for (const [name, cookieValue] of this.cookies.entries()) {
            const { value, options } = cookieValue;
            const serializedCookie = serializeCookie(name, value, options);
            serializedCookies.push(serializedCookie);
        }

        return serializedCookies.join("; ");
    }
}