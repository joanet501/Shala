import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings — Shala",
};

export default async function SettingsPage() {
  const { teacher } = await requireAuth();

  if (!teacher || !teacher.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <SettingsIcon className="mb-4 size-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Settings and preferences are under development
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
