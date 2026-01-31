import { requireAuth } from "@/lib/auth/helpers";
import { ensureTeacherExists } from "@/lib/auth/teacher-sync";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import Link from "next/link";
import { Navigation } from "@/components/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, teacher } = await requireAuth();

  // Safety net: if Teacher record doesn't exist, create it
  if (!teacher) {
    await ensureTeacherExists(user);
  }

  const displayName = teacher?.name || user.email;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              Shala
            </Link>
            <Navigation />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {displayName}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
