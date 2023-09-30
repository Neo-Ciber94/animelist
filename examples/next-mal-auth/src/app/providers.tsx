"use client";

import { SessionProvider } from "@animelist/auth-next";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
