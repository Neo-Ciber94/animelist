"use client";

import { useSession } from "@animelist/auth-next/session";
import { signIn, signOut } from "@animelist/auth/client";

export default function Home() {
  const { user, isLoading } = useSession();

  return (
    <div className="p-4 text-2xl container mx-auto">
      {isLoading && <p>Loading...</p>}
      {!isLoading && user == null && <button onClick={signIn}>Login</button>}
      {!isLoading && user != null && <button onClick={signOut}>Logout</button>}
      {user && <p>{`Welcome ${user.name}`}</p>}
    </div>
  );
}
