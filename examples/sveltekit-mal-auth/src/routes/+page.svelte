<script lang="ts">
	import { signIn, signOut } from '@animelist/auth/client';
	import { session } from '@animelist/auth-sveltekit/client';
	import { writable } from 'svelte/store';
	import type { AnimeObject } from '@animelist/core';
	import { MALClient } from '@animelist/client';

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

{#if $session.loading}
	<p>Loading...</p>
{:else if $session.user}
	<p>Welcome {$session.user.name}</p>
	<button on:click={signOut}>Sign Out</button>

	<div>
		<h1>Suggested Anime</h1>
		<pre>{JSON.stringify($animeList, null, 2)}</pre>
	</div>
{:else}
	<button on:click={signIn}>Sign In</button>
{/if}
