<script lang="ts">
	import { session } from '@animelist/auth-sveltekit/client';
	// import type { LayoutServerData } from './$types';

    session.initialize();
</script>


<slot />