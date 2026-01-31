import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = {
  title: "Get started — Shala",
};

export default async function OnboardingPage() {
  const { teacher } = await requireAuth();

  if (!teacher) {
    redirect("/login");
  }

  if (teacher.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <OnboardingForm
      teacher={{
        id: teacher.id,
        name: teacher.name,
        slug: teacher.slug,
        city: teacher.city ?? "",
        country: teacher.country ?? "",
        languages: teacher.languages,
        photoUrl: teacher.photoUrl,
        bio: teacher.bio ?? "",
      }}
    />
  );
}
