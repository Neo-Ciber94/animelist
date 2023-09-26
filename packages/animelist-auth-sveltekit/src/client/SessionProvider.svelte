<!-- 
  When exported and added to the package.json `export`, this fails with:

  Error [ERR_REQUIRE_ESM]: require() of ES Module ..\.pnpm\crypto-es@2.0.4\node_modules\crypto-es\lib\index.js 
  from ..\packages\animelist-auth\dist\server\server.js not supported.
-->

<script lang="ts">
  import { Session } from "@animelist/auth/client";
  import { session as sessionStore } from "./session";

  export let session: Session | null | undefined = undefined;

  // Initialize the session store
  sessionStore.initialize(session).catch(console.error);
</script>

<slot {session} />
