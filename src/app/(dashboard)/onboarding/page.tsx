import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started — Shala",
};

export default function OnboardingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to Shala</h1>
      <p className="mt-2 text-muted-foreground">
        Let&apos;s set up your teaching profile. Onboarding wizard coming soon.
      </p>
    </div>
  );
}
