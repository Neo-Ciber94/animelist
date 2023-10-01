<script lang="ts">
	import { session, signIn, signOut } from '@animelist/auth-sveltekit/client';
</script>

<header class="bg-black">
	<div class="w-full flex flex-row mx-auto container p-4 justify-between items-center h-16">
		{#if $session.user}
			<span class="text-white font-semibold text-lg cursor-pointer">
				Welcome {$session.user.name}!
			</span>
		{:else}
			<span class="text-white font-semibold text-lg cursor-pointer"> MyAnimeList - Svelte </span>
		{/if}

		<div class="ml-auto">
			{#if $session.loading}
				<p class="text-white italic animate-pulse">Loading...</p>
			{:else if $session.user}
				<button
					on:click={signOut}
					class="rounded-md p-2 min-w-[100px] text-white shadow-md font-semibold bg-indigo-500 hover:bg-indigo-600"
				>
					Sign Out
				</button>
			{:else}
				<button
					on:click={signIn}
					class="rounded-md p-2 min-w-[100px] text-white shadow-md font-semibold bg-indigo-500 hover:bg-indigo-600"
				>
					Sign In
				</button>
			{/if}
		</div>
	</div>
</header>
