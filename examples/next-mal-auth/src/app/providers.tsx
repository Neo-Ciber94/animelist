"use client";

import { SessionProvider, type Session } from "@animelist/auth-next/client";

type MyAnimeListAuthProviderProps = {
  children: React.ReactNode;
  session?: Session;
};

export function MyAnimeListAuthProvider({
  children,
  session,
}: MyAnimeListAuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
