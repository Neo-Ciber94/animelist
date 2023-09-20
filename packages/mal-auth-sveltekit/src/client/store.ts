import { dev } from "$app/environment";
import { type User } from "@mal/core";
import { getSession } from "@mal/auth/client";
import { get, writable } from "svelte/store";

let initialized = false;

export type SessionState = {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
}

const sessionStore = writable<SessionState>({
    user: null,
    accessToken: null,
    loading: false
});

type InitializeSession = Omit<SessionState, 'loading'>;

function setUserSession(session: InitializeSession | null) {
    if (session) {
        initialized = true;
        sessionStore.set({
            loading: false,
            accessToken: session.accessToken,
            user: session.user
        })
    } else {
        initialized = false;
        sessionStore.set({
            loading: false,
            accessToken: null,
            user: null
        });
    }
}

async function fetchUserSession() {
    if (typeof window === 'undefined') {
        return;
    }

    initialized = true;

    try {
        // Set state to loading
        const currentSession = get(sessionStore);
        sessionStore.set({
            loading: true,
            accessToken: currentSession.accessToken,
            user: currentSession.user
        });

        // fetch the current user session
        const session = await getSession();

        if (session == null) {
            return sessionStore.set({ loading: false, accessToken: null, user: null });
        }

        if (dev) {
            console.log("🍥 User session loaded: ", JSON.stringify(session, null, 2));
        }

        // Currently the expiration of the access token is 31 days, which is really long,
        // so we don't have reason to refresh it, each time the user log in a new token will be created.
        const { accessToken, user } = session;
        sessionStore.set({ user, accessToken, loading: false })
    }
    catch (err) {
        console.error(err);
        initialized = false;
        sessionStore.set({ user: null, accessToken: null, loading: false })
    }
}

async function initialize(session?: InitializeSession | null) {
    if (session && initialized) {
        return;
    }

    if (session !== undefined) {
        setUserSession(session);
    }
    else {
        await fetchUserSession();
    }
}

function destroy() {
    sessionStore.set({
        accessToken: null,
        loading: false,
        user: null,
    })
}

export default {
    initialize,
    destroy,
    subscribe: sessionStore.subscribe,
    get current() {
        return get(sessionStore);
    }
}
