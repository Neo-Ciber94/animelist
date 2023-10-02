"use client";

import { SessionProvider, type Session } from "@animelist/auth-next/client";

type MyAnimeListAuthProviderProps = {
  children: React.ReactNode;
  session?: Session | null;
};

// <SessionProvider> cannot be used as a server component, so we wrap it.
export function MyAnimeListAuthProvider({
  children,
  session,
}: MyAnimeListAuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
