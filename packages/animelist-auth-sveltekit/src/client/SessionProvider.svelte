<script lang="ts">
  import { Session } from "@animelist/auth/client";
  import { session as sessionStore, INITIALIZE_SESSION } from "./session";

  export let session: Session | null | undefined = undefined;

  // Initialize the session store
  sessionStore[INITIALIZE_SESSION](session).catch(console.error);
</script>

<slot {session} />
