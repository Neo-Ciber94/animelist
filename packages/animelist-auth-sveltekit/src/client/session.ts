import { type User } from "@animelist/core";
import { getSession } from "@animelist/auth/client";
import { get, writable, derived } from "svelte/store";

export type Session = { user: User; accessToken: string };

const DAY_MILLIS = 1000 * 60 * 60 * 24;

export type SessionState = {
  /**
   * The current session.
   */
  readonly session: Session | null;

  /**
   * Whether if the session is loading.
   */
  readonly loading: boolean;
};

function createSession() {
  const baseSessionStore = writable<SessionState>({
    session: null,
    loading: false,
  });

  async function fetchUserSession() {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      // fetch the current user session
      const session = await getSession();

      if (session == null) {
        baseSessionStore.set({ loading: false, session });
        return null;
      }

      baseSessionStore.set({ session, loading: false });

      // We use 1 day as a threshold because we don't expect an user to stay 24 hours
      // without any interaction. in most cases this is not reached because the default session is 7 days
      const expiresAt = new Date(session.expiresAt);

      if (expiresAt.getTime() < DAY_MILLIS) {
        window.setTimeout(fetchUserSession, expiresAt.getTime());
      }

      return session;
    } catch (err) {
      console.error(err);
      baseSessionStore.set({ session: null, loading: false });
    }

    return null;
  }

  /**
   * Initialize the session store.
   *
   * This should be called before accessing the score, in the root layout.
   * @param session The initial session.
   */
  async function initialize(session?: Session | null) {
    if (session === undefined) {
      // Set state to loading
      baseSessionStore.update((s) => ({ ...s, loading: true }));

      // Fetch the current session
      await fetchUserSession();
    } else {
      baseSessionStore.set({
        session,
        loading: false,
      });
    }
  }

  const sessionStore = derived(baseSessionStore, ($store) => {
    return {
      /**
       * Returns the current user.
       */
      get user() {
        return $store?.session?.user || null;
      },

      /**
       * Returns the current user access token.
       */
      get accessToken() {
        return $store?.session?.accessToken || null;
      },

      ...$store,
    };
  });

  return {
    subscribe: sessionStore.subscribe,
    initialize,

    /**
     * Returns `true` if the user is authenticated.
     */
    get isAuthenticated() {
      return get(baseSessionStore).session != null;
    },
  };
}

export const session = createSession();
