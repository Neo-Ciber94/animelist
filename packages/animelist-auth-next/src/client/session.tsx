"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import type { User } from "@animelist/core";
import { getSession } from "@animelist/auth/client";

const DAY_MILLIS = 1000 * 60 * 60 * 24;

type UseSession = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
};

const SessionContext = createContext<UseSession | null>(null);

type InitialSession = { user: User; accessToken: string };

type SessionProviderProps = {
  children: React.ReactNode;
  session?: InitialSession | null;
};

export function SessionProvider({ session, children }: SessionProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(session?.user ?? null);
  const [accessToken, setAccessToken] = useState<string | null>(
    session?.accessToken ?? null
  );

  useEffect(() => {
    if (session !== undefined) {
      return;
    }

    let timeout: number | null = null;

    const fetchSession = async () => {
      try {
        const session = await getSession();
        setUser(session.user);
        setAccessToken(session.accessToken);

        // We use 1 day as a threshold because we don't expect an user to stay 24 hours
        // without any interaction. in most cases this is not reached because the default session is 7 days
        if (session.expiresAt.getTime() < DAY_MILLIS) {
          timeout = window.setTimeout(
            fetchSession,
            session.expiresAt.getTime()
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    void fetchSession();
    return () => {
      if (timeout) {
        window.clearInterval(timeout);
      }
    };
  }, [session]);

  return (
    <SessionContext.Provider
      value={{
        accessToken,
        isLoading,
        user,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);

  if (ctx == null) {
    throw new Error(
      `'useSession' cannot be called without a <SessionProvider> in the react tree`
    );
  }

  return ctx;
}
