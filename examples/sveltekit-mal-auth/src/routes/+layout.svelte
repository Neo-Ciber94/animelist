<script lang="ts">
	import { session } from '@animelist/auth-sveltekit/client';
	import type { LayoutServerData } from './$types';

	export let data: LayoutServerData;

	session.initialize(data.session);
</script>

<slot />
