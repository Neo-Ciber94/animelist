import AnimeListSuggestion from "./AnimeListSuggestion";
import Auth from "./Auth";

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
