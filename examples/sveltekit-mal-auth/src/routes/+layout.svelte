<script lang="ts">
	import { SessionProvider } from '@animelist/auth-sveltekit/client';
	// import type { LayoutServerData } from './$types';
</script>


<SessionProvider>
	<slot />
</SessionProvider>
