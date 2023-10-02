/* eslint-disable @typescript-eslint/no-unused-vars */
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MyAnimeListAuthProvider } from "./providers";
import { getUser } from "@animelist/auth-next/server";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyAnimeList - NextJS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * To load the session entirely server side uncomment this line,
   * make this component async and pass the session to the auth provider.
   */
  // const session = await getUser(cookies());

  return (
    <html lang="en">
      <body className={inter.className}>
        <MyAnimeListAuthProvider /* session={session} */>
          {children}
        </MyAnimeListAuthProvider>
      </body>
    </html>
  );
}
