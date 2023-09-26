"use client";

import * as client from "@animelist/auth-next";

console.log({ client })
export default function Providers({ children }: { children: React.ReactNode }) {
  return <client.SessionProvider>{children}</client.SessionProvider>;
}

