import { requireAuth } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";

export default async function DashboardContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { teacher } = await requireAuth();

  if (!teacher?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
