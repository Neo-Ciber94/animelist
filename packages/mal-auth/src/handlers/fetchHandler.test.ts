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

describe("Handle fetch authentication sign-in requests", () => {
    test("Should return redirection response", async () => {
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
        expect(setCookieSpy).toHaveBeenCalled();
    })
})