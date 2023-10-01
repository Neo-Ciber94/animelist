"use client";

import { SessionProvider } from "@animelist/auth-next/client";

export function MyAnimeListAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
