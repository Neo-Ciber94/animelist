<script lang="ts">
	import { browser } from '$app/environment';
	import { session } from '@animelist/auth-sveltekit/client';
	import { MALClient, type AnimeObject } from '@animelist/client';
	import { writable } from 'svelte/store';

	const animeList = writable({
		isLoading: false,
		data: [] as AnimeObject[]
	});

	// We fetch the anime list on the client.
	// This also can be moved to a server `load` function, that we don't need to use the `proxyUrl`
	$: (async function () {
		if ($session.accessToken == null || !browser) {
			return;
		}

		animeList.update((x) => ({ ...x, isLoading: true }));

		try {
			const client = new MALClient({
				// we cannot make request directly to the `MyAnimeList` server, so we proxy
				// the request to our backend
				proxyUrl: '/api/myanimelist',
				accessToken: $session.accessToken
			});
			const result = await client.getSuggestedAnime({ limit: 10 });
			animeList.set({ data: result.data, isLoading: false });
		} finally {
			animeList.update((x) => ({ ...x, isLoading: false }));
		}
	})();
</script>

{#if $session.loading || $animeList.isLoading}
	<p class="mx-auto w-full text-2xl text-center p-10 text-black font-bold animate-pulse">
		Loading...
	</p>
{:else if $session.accessToken == null}
	<p class="mx-auto w-full text-2xl text-center p-10 text-black font-bold">
		Sign-In to see an anime suggestion
	</p>
{:else}
	<h1 class="font-bold text-3xl mb-4">Anime Suggestions</h1>

	<div class="flex flex-row flex-wrap justify-center w-full h-full gap-2">
		{#each $animeList.data as anime (anime.node.id)}
			<div
				class="shadow-md p-2 flex flex-col items-center gap-2 w-[200px] bg-black rounded-lg"
				title={anime.node.title}
			>
				<img
					alt={anime.node.title}
					src={anime.node.main_picture.medium}
					width="200px"
					height="200px"
					class="object-cover aspect-square"
				/>

				<p class="font-semibold italic text-center text-white">{anime.node.title}</p>
			</div>
		{/each}
	</div>
{/if}
