import { describe, test, expect } from "vitest";
import { COOKIE_AUTH_ACCESS_TOKEN, COOKIE_AUTH_SESSION, generateJwt, getServerSession } from "./utils";
import { Cookies } from "./types";

describe("Jwt authentication", () => {
  test("Get user from getServerSession()", async () => {
    const token = await generateJwt(1, "s29U2HABBGRjevx2y9I=");
    const cookies: Cookies = {
      set() {},
      delete() {},
      get(name) {
        const obj = {
          [COOKIE_AUTH_SESSION]: token,
          [COOKIE_AUTH_ACCESS_TOKEN]: "4TJ675FMrnkbC+5xeio=",
        };

        return obj[name];
      },
    };

    const session = await getServerSession(cookies);
    expect(session).toBeTruthy();
    expect(session?.userId).toStrictEqual(1);
    expect(session?.refreshToken).toStrictEqual("s29U2HABBGRjevx2y9I=");
    expect(session?.accessToken).toStrictEqual("4TJ675FMrnkbC+5xeio=");
  });
});
