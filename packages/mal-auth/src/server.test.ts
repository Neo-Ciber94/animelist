import { describe, expect, test } from "vitest";
import { Auth } from "./server";
import crypto from 'node:crypto';

Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: crypto.randomUUID },
})

describe('Check getAuthenticationUrl', () => {
    test('should return valid authentication url', async () => {
        const { url } = Auth.getAuthenticationUrl({
            redirectTo: 'http://localhost:5175/api/myanimelist/auth/callback'
        });

        const res = await fetch(url);
        expect(res.ok, await res.text()).toBeTruthy();
    });
});