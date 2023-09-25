import dotenv from 'dotenv';
import { MALClient } from "@animelist/client";
import type { AnimeSeason } from "@animelist/core"

dotenv.config();

const client = new MALClient({
    clientId: process.env.MY_ANIME_LIST_CLIENT_ID,
});

function getCurrentSeason(): AnimeSeason {
    const currentMonth = new Date().getMonth();
    const seasons = ["winter", "spring", "summer", "fall"] as const;
    return seasons[Math.floor(currentMonth / 3)];
}

const animeList = await client.getSeasonalAnime({
    season: getCurrentSeason(),
    year: new Date().getFullYear(),
    limit: 10
});

console.log(JSON.stringify(animeList, null, 2));