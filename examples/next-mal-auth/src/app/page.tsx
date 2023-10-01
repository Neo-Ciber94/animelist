"use client";

import {
  useSession,
  signIn,
  signOut,
  type AnimeObject,
} from "@animelist/auth-next";
//import { signIn, signOut } from "@animelist/auth-next/client";
import { useEffect, useState } from "react";
import { MALClient } from "@animelist/client";

export default function HomePage() {
  const { user, accessToken, isLoading } = useSession();
  const [animeList, setAnimeList] = useState<AnimeObject[]>([]);

  useEffect(() => {
    if (accessToken == null) {
      return;
    }

    const run = async () => {
      const client = new MALClient({
        accessToken,
        proxyUrl: "/api/myanimelist",
      });

      const result = await client.getSuggestedAnime({ limit: 10 });
      setAnimeList(result.data);
    };

    run().catch(console.error);
  }, [accessToken]);

  return (
    <div className="p-4 text-2xl container mx-auto">
      {isLoading && <p>Loading...</p>}
      {!isLoading && user == null && <button onClick={signIn}>Login</button>}
      {!isLoading && user != null && <button onClick={signOut}>Logout</button>}
      {user && <p>{`Welcome ${user.name}`}</p>}

      {animeList && animeList.length > 0 && (
        <pre>{JSON.stringify(animeList, null, 2)}</pre>
      )}
    </div>
  );
}
