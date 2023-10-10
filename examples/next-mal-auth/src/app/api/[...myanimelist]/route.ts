import { createMyAnimeListFetchHandler } from "@animelist/auth-next/server";

const handler = createMyAnimeListFetchHandler();

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
