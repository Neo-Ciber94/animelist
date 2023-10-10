"use client";
import { signIn, signOut, useSession } from "@animelist/auth-next/client";

export default function Auth() {
  const { user, isLoading } = useSession();

  return (
    <header className="bg-black">
      <div className="w-full flex flex-row mx-auto container p-4 justify-between items-center h-16">
        {user ? (
          <span className="text-white font-semibold text-lg cursor-pointer">Welcome {user.name}!</span>
        ) : (
          <span className="text-white font-semibold text-lg cursor-pointer">MyAnimeList - NextJS</span>
        )}

        <div className="ml-auto">
          {isLoading ? (
            <p className="text-white italic animate-pulse">Loading...</p>
          ) : user ? (
            <button
              onClick={signOut}
              className="rounded-md p-2 min-w-[100px] text-white shadow-md font-semibold bg-indigo-500 hover:bg-indigo-600"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={signIn}
              className="rounded-md p-2 min-w-[100px] text-white shadow-md font-semibold bg-indigo-500 hover:bg-indigo-600"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
