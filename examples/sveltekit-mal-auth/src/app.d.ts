// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			session?: {
				user: User,
				accessToken: string;
			} | null;
		}

		// interface Error {}
		// interface PageData {}
		// interface Platform {}
	}
}

export { };
