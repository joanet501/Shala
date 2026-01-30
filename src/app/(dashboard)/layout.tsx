import { requireAuth } from "@/lib/auth/helpers";
import { ensureTeacherExists } from "@/lib/auth/teacher-sync";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

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
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-6">
          <span className="text-lg font-semibold">Shala</span>
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
