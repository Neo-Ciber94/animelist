import { type Metadata } from "next";
import AnimeListSuggestion from "./AnimeListSuggestion";
import Auth from "./Auth";

export const metadata: Metadata = {
  title: "MyAnimeList - NextJS",
};

export default function HomePage() {
  return (
    <>
      <Auth />
      <main className="container mx-auto p-4">
        <AnimeListSuggestion />
      </main>
    </>
  );
}
