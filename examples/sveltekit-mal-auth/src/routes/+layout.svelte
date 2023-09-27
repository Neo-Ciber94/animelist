<script lang="ts">
	import { session } from '@animelist/auth-sveltekit/client';

	// Uncomment this and invoke `session.initialize(data.session)` to load the user in SSR
	// import type { LayoutServerData } from './$types';
	// export let data: LayoutServerData;

	// This initializes the store and fetches the user
	session.initialize().catch(console.error);
</script>

<slot />
