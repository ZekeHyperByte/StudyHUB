"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogIn, LogOut } from "lucide-react";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-sm">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-sm truncate">{session.user?.email}</p>
        <Button variant="outline" size="icon" onClick={() => signOut()}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn("google")}>
      <LogIn className="w-4 h-4 mr-2" />
      Sign In
    </Button>
  );
}
