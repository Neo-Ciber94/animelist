import dotenv from 'dotenv';
import { MALClient } from "@animelist/client";

dotenv.config();

const client = new MALClient({
    clientId: process.env.MY_ANIME_LIST_CLIENT_ID,
});

const animeList = await client.getSeasonalAnime({
    season: 'summer',
    year: new Date().getFullYear(),
    limit: 10
});

console.log(JSON.stringify(animeList, null, 2));