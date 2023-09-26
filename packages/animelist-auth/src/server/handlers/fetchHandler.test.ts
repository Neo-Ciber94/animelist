import { describe, expect, test } from 'vitest';
import { handleAuthFetchRequest } from './fetchHandler';
import cookie from 'cookie';

describe("Handle fetch authentication requests", () => {
    test("Should return redirect to myanimelist for sign-in", async () => {
        const req = new Request("http://localhost:5600/api/myanimelist/auth/sign-in", {});
        const res = await handleAuthFetchRequest(req, {
            apiUrl: "/api/myanimelist"
        });

        expect(res.status).toStrictEqual(307);
        expect(res.headers.get("location")).contain("myanimelist");

        const cookies = cookie.parse(res.headers.get("set-cookie")!);
        expect(Object.keys(cookies).length).greaterThan(1);
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

