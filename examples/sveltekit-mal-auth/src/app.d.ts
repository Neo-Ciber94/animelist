// See https://kit.svelte.dev/docs/types#app

import type { Session } from '@animelist/auth-sveltekit/client';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			session?: Session | null;
		}

		// interface Error {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
