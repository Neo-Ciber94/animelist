import { describe, expect, test } from 'vitest';
import { handleAuthFetchRequest } from './fetchHandler';
import cookie from 'cookie';
import { COOKIE_AUTH_CODE_CHALLENGE, COOKIE_AUTH_CSRF } from '../../common/utils';

describe("Handle fetch authentication requests", () => {
    test("Should return redirect to myanimelist for sign-in", async () => {
        const req = new Request("http://localhost:5600/api/myanimelist/auth/sign-in", {});
        const res = await handleAuthFetchRequest(req, {
            apiUrl: "/api/myanimelist"
        });

        expect(res.status).toStrictEqual(307);
        expect(res.headers.get("location")).contain("myanimelist");

        const cookies = cookie.parse(res.headers.get("set-cookie")!);
        expect(cookies[COOKIE_AUTH_CSRF]).toBeTruthy();
        expect(cookies[COOKIE_AUTH_CODE_CHALLENGE]).toBeTruthy();
    })

    test("Should remove cookies on sign-out", async () => {
        const req = new Request("http://localhost:5600/api/myanimelist/auth/sign-out", {});
        const res = await handleAuthFetchRequest(req, {
            apiUrl: "/api/myanimelist"
        });

        expect(res.status).toStrictEqual(307);
    });

    test("Should remove cookies on sign-out", async () => {
        const req = new Request("http://localhost:5600/api/myanimelist/auth/sign-out", {});
        const res = await handleAuthFetchRequest(req, {
            apiUrl: "/api/myanimelist"
        });

        expect(res.status).toStrictEqual(307);
    })
});

