import { useSession } from "@animelist/auth-next";
import { signIn, signOut } from "@animelist/auth";

export default function Home() {
  const { user, isLoading } = useSession();

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {!isLoading && user == null && <button onClick={signIn}>Login</button>}
      {!isLoading && user != null && <button onClick={signOut}>Logout</button>}
      {user && <p>{`Welcome ${user.username}`}</p>}
    </div>
  );
}