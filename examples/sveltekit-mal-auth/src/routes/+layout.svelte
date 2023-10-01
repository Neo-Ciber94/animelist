<script lang="ts">
	import "../app.css";
	import { session } from '@animelist/auth-sveltekit/client';

	// Uncomment this and invoke `session.initialize(data.session)` to load the user in SSR
	// import type { LayoutServerData } from './$types';
	// export let data: LayoutServerData;

	// This initializes the user store
	session.initialize().catch(console.error);
</script>

<svelte:head>
	<title>MyAnimeList - SvelteKit</title>
</svelte:head>

<slot />
