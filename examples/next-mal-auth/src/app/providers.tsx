"use client";

import { SessionProvider } from "@animelist/auth-next";

console.log({ SessionProvider });
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
