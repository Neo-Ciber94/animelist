import { describe, expect, it } from "vitest";
import { MALClient } from "./index";

describe("MALClient requests", () => {
  it("Should get seasonal anime", async () => {
    const client = new MALClient({ clientId: process.env.MAL_CLIENT_ID! });
    const result = await client.getSeasonalAnime({ season: "summer", year: 2020 });

    expect(result).toBeTruthy();
    expect(result.data).toBeTruthy();
  });

  it("Should get anime by search", async () => {
    const client = new MALClient({ clientId: process.env.MAL_CLIENT_ID! });
    const result = await client.getAnimeList({ q: "kuro" });

    expect(result).toBeTruthy();
    expect(result.data).toBeTruthy();
  });

  it("Should get anime by id", async () => {
    const client = new MALClient({ clientId: process.env.MAL_CLIENT_ID! });
    const result = await client.getAnimeDetails(38524);

    expect(result).toBeTruthy();
    expect(result?.id).toStrictEqual(38524);
    expect(result?.title).toStrictEqual("Shingeki no Kyojin Season 3 Part 2");
  });
});
