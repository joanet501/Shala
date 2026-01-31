import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ProgramForm } from "./program-form";

export const metadata: Metadata = {
  title: "Create Program — Shala",
};

export default async function NewProgramPage() {
  const { teacher } = await requireAuth();

  if (!teacher || !teacher.onboardingCompleted) {
    redirect("/onboarding");
  }

  const [templatesRaw, venuesRaw] = await Promise.all([
    prisma.scheduleTemplate.findMany({
      where: { isPlatformTemplate: true },
      orderBy: { name: "asc" },
    }),
    prisma.venue.findMany({
      where: { teacherId: teacher.id },
      orderBy: { name: "asc" },
    }),
  ]);

  // Transform to match expected types - ensure all values are serializable
  const templates = templatesRaw.map((t) => ({
    id: t.id,
    name: t.name,
    formatType: t.formatType,
    defaultSessions: t.defaultSessions as Array<{
      dayOffset: number;
      startTime: string;
      endTime: string;
      label: string;
    }>,
    defaultCapacity: t.defaultCapacity ?? null,
    defaultNotes: t.defaultNotes ?? null,
    defaultWhatToBring: t.defaultWhatToBring ?? null,
    defaultPreparation: t.defaultPreparation ?? null,
  }));

  const venues = venuesRaw.map((v) => ({
    id: v.id,
    name: v.name,
    address: v.address,
    city: v.city,
    country: v.country,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Create a new program</h1>
        <p className="text-muted-foreground">
          Choose a template and configure your program details
        </p>
      </div>
      <ProgramForm
        teacherId={teacher.id}
        templates={templates}
        venues={venues}
      />
    </div>
  );
}
