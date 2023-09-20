import { describe, expect, test, vi } from 'vitest';
import { handleAuthFetchRequest } from './fetchHandler';
import { type Cookies } from '../common/types';

function getFakeCookies(): Cookies {
    return {
        set: () => { },
        get: () => null,
        delete: () => null,
        has: () => false
    }
}

describe("Handle fetch authentication requests", () => {
    test("Should return redirect to myanimelist for sign-in", async () => {
        const cookies = getFakeCookies();
        const event = {
            cookies,
            request: new Request("http://localhost:5600/api/myanimelist/auth/sign-in", {})
        };

        const setCookieSpy = vi.fn();
        cookies.set = setCookieSpy;

        const res = await handleAuthFetchRequest(event, {
            apiUrl: "/api/myanimelist"
        });

        expect(res.status).toStrictEqual(307);
        expect(res.headers.get("location")).contain("myanimelist");
        expect(setCookieSpy).toHaveBeenCalled();
    })

    test("Should remove cookies on sign-out", async () => {
        const cookies = getFakeCookies();
        const event = {
            cookies,
            request: new Request("http://localhost:5600/api/myanimelist/auth/sign-out", {})
        };

        const removeCookieSpy = vi.fn();
        cookies.delete = removeCookieSpy;

        const res = await handleAuthFetchRequest(event, {
            apiUrl: "/api/myanimelist"
        });

        expect(res.status).toStrictEqual(307);
        expect(removeCookieSpy).toHaveBeenCalled();
    });

    test("Should remove cookies on sign-out", async () => {
        const cookies = getFakeCookies();
        const event = {
            cookies,
            request: new Request("http://localhost:5600/api/myanimelist/auth/sign-out", {})
        };

        const removeCookieSpy = vi.fn();
        cookies.delete = removeCookieSpy;

        const res = await handleAuthFetchRequest(event, {
            apiUrl: "/api/myanimelist"
        });

        expect(res.status).toStrictEqual(307);
        expect(removeCookieSpy).toHaveBeenCalled();
    })
});

