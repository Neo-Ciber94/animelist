"use client";
import React, { useEffect, useState } from "react";
import { type AnimeObject, MALClient } from "@animelist/client";
import { useSession } from "@animelist/auth-next/client";
import Image from "next/image";

export default function AnimeSuggestions() {
  const { isLoading, accessToken } = useSession();
  const [animeList, setAnimeList] = useState({
    isLoading: false,
    data: [] as AnimeObject[],
  });

  useEffect(() => {
    if (!accessToken || isLoading) {
      return;
    }

    setAnimeList((x) => ({ ...x, isLoading: true }));

    const fetchData = async () => {
      try {
        const client = new MALClient({
          proxyUrl: "/api/myanimelist",
          accessToken,
        });
        const result = await client.getSuggestedAnime({ limit: 10 });
        setAnimeList({ data: result.data, isLoading: false });
      } finally {
        setAnimeList((x) => ({ ...x, isLoading: false }));
      }
    };

    void fetchData();
  }, [accessToken, isLoading]);

  if (isLoading || animeList.isLoading) {
    return <p className="mx-auto w-full text-2xl text-center p-10 text-black font-bold animate-pulse">Loading...</p>;
  } else if (!accessToken) {
    return (
      <p className="mx-auto w-full text-2xl text-center p-10 text-black font-bold">
        Sign-In to see an anime suggestion
      </p>
    );
  } else {
    return (
      <div>
        <h1 className="font-bold text-3xl mb-4">Anime Suggestions</h1>
        <div className="flex flex-row flex-wrap justify-center w-full h-full gap-2">
          {animeList.data.map((anime) => (
            <div
              key={anime.node.id}
              className="shadow-md p-2 flex flex-col items-center gap-2 w-[200px] bg-black rounded-lg"
              title={anime.node.title}
            >
              <Image
                alt={anime.node.title}
                src={anime.node.main_picture.medium}
                width="200"
                height="200"
                className="object-cover aspect-square"
              />
              <p className="font-semibold italic text-center text-white">{anime.node.title}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
