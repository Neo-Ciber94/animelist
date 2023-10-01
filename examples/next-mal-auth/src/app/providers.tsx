"use client";

import { SessionProvider } from "@animelist/auth-next/client";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
