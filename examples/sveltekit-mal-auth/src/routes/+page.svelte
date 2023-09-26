<script>
	import { signIn, signOut } from '@animelist/auth/client';
	import { session } from '@animelist/auth-sveltekit/client';
	import { onMount } from 'svelte';

	onMount(async () => {
		await session.initialize();
	});
</script>

{#if $session.loading}
	<p>Loading...</p>
{:else if $session.user}
	<p>Welcome {$session.user.name}</p>
	<button on:click={signOut}>Sign Out</button>
{:else}
	<button on:click={signIn}>Sign In</button>
{/if}
