<script lang="ts">
	import { session, signIn, signOut } from '@animelist/auth-sveltekit/client';
	import { MALClient, type AnimeObject } from '@animelist/client';
	import { writable } from 'svelte/store';
	import Auth from './Auth.svelte';
	import AnimeListSuggestion from './AnimeListSuggestion.svelte';

	const animeList = writable<AnimeObject[]>([]);

	$: (async function () {
		if ($session.accessToken) {
			const client = new MALClient({
				accessToken: $session.accessToken,
				proxyUrl: '/api/myanimelist'
			});
			const result = await client.getSuggestedAnime();
			animeList.set(result.data);
		}
	})();
</script>

<Auth />
<main class="container mx-auto p-4">
	<AnimeListSuggestion />
</main>
