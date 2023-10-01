"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import type { User } from "@animelist/core";
import { getSession } from "@animelist/auth/client";

// Re-export client related stuff
export {
  signIn,
  signOut,
  getSession,
  getUserToken,
  type GetSessionOptions,
} from "@animelist/auth/client";

const DAY_MILLIS = 1000 * 60 * 60 * 24;

export type UserSession = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
};

const SessionContext = createContext<UserSession | null>(null);

export type Session = { user: User; accessToken: string };

export type SessionProviderProps = {
  children: React.ReactNode;

  /**
   * An initial session to use, if this is set to `null` or a session, the session will
   * not be loaded from the server.
   */
  session?: Session | null;
};

/**
 * Provides a session for your application.
 */
export function SessionProvider({ session, children }: SessionProviderProps) {
  const [isLoading, setIsLoading] = useState(session === undefined);
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
        const expiresAt = new Date(session.expiresAt);
        if (!isNaN(expiresAt.getTime()) && expiresAt.getTime() < DAY_MILLIS) {
          timeout = window.setTimeout(fetchSession, expiresAt.getTime());
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
      `'useSession' cannot be called in a Server Component or without a <SessionProvider> in the react tree`
    );
  }

  return ctx;
}
