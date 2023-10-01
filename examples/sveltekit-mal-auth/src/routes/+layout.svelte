<script lang="ts">
	import '../app.css';
	import { session } from '@animelist/auth-sveltekit/client';

	// import type { LayoutServerData } from './$types';
	// export let data: LayoutServerData;

	/**
	 * Initialize the session, you can replace this for `session.initialize(data.session)`
	 * by uncommenting the above, to load the user server-side and avoid loading it from the client.
	 */
	session.initialize().catch(console.error);
</script>

<svelte:head>
	<title>MyAnimeList - SvelteKit</title>
</svelte:head>

<slot />
