import dotenv from "dotenv";
import { MALClient, type AnimeSeason } from "@animelist/client";

// Setup the environment variables
dotenv.config();

function getCurrentSeason(): AnimeSeason {
  const currentMonth = new Date().getMonth();
  const seasons = ["winter", "spring", "summer", "fall"] as const;
  return seasons[Math.floor(currentMonth / 3)];
}

// Gets a list of 10 anime that are available for this season.
// Keep in mind this return any anime that still on emission this season like One Piece.

const client = new MALClient({
  clientId: process.env.MAL_CLIENT_ID!,
});

const animeList = await client.getSeasonalAnime({
  season: getCurrentSeason(),
  year: new Date().getFullYear(),
  limit: 10,
});

console.log(JSON.stringify(animeList, null, 2));
