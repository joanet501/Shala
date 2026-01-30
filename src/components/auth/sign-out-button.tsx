"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button variant="ghost" size="sm" type="submit">
        <LogOut className="size-4" />
        Sign out
      </Button>
    </form>
  );
}
