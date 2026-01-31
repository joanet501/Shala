"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createProgramSchema,
  RESERVED_PROGRAM_SLUGS,
} from "@/lib/validations/programs";
import { createVenue } from "./venues";
import { Decimal } from "decimal.js";

export async function createProgram(formData: FormData) {
  // 1. Auth check
  const { user, teacher } = await requireAuth();

  if (!teacher) {
    return { error: "Teacher profile not found" };
  }

  // 2. Parse FormData
  const raw = {
    teacherId: user.id,
    templateId: formData.get("templateId") as string,
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || undefined,

    venueType: formData.get("venueType") as string,
    venueId: (formData.get("venueId") as string) || undefined,
    newVenue: formData.get("newVenue")
      ? JSON.parse(formData.get("newVenue") as string)
      : undefined,

    onlineMeetingProvider: (formData.get("onlineMeetingProvider") as string) ||
      undefined,
    onlineMeetingUrl: (formData.get("onlineMeetingUrl") as string) || undefined,

    sessions: JSON.parse(formData.get("sessions") as string),
    registrationDeadline: (formData.get("registrationDeadline") as string) ||
      undefined,

    capacity: formData.get("capacity")
      ? Number(formData.get("capacity"))
      : undefined,
    isFree: formData.get("isFree") === "true",
    priceAmount: formData.get("priceAmount")
      ? Number(formData.get("priceAmount"))
      : undefined,
    priceCurrency: (formData.get("priceCurrency") as string) || "USD",
    allowPayAtVenue: formData.get("allowPayAtVenue") === "true",

    notes: (formData.get("notes") as string) || undefined,
    whatToBring: (formData.get("whatToBring") as string) || undefined,
    preparationInstructions:
      (formData.get("preparationInstructions") as string) || undefined,
    requiresHealthForm: formData.get("requiresHealthForm") === "true",

    status: (formData.get("status") as "DRAFT" | "PUBLISHED") || "DRAFT",
  };

  // 3. Validate with Zod
  const result = createProgramSchema.safeParse(raw);
  if (!result.success) {
    console.error("Validation error:", result.error.issues);
    return { error: result.error.issues[0].message };
  }

  const data = result.data;

  // 4. Check slug uniqueness
  if (RESERVED_PROGRAM_SLUGS.includes(data.slug)) {
    return { error: "This slug is reserved. Please choose a different one." };
  }

  const existingSlug = await prisma.program.findUnique({
    where: {
      teacherId_slug: {
        teacherId: user.id,
        slug: data.slug,
      },
    },
    select: { id: true },
  });

  if (existingSlug) {
    return { error: "You already have a program with this slug" };
  }

  // 5. Create venue if needed
  let venueId = data.venueId;
  if (data.newVenue) {
    const venueResult = await createVenue(user.id, data.newVenue);
    if (venueResult.error) {
      return { error: venueResult.error };
    }
    venueId = venueResult.venueId;
  }

  // 6. Create program
  try {
    const program = await prisma.program.create({
      data: {
        teacherId: user.id,
        templateId: data.templateId,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        status: data.status,

        venueType: data.venueType as "IN_PERSON" | "ONLINE" | "HYBRID",
        venueId: venueId || null,
        onlineMeetingUrl: data.onlineMeetingUrl || null,
        onlineMeetingProvider: data.onlineMeetingProvider
          ? (data.onlineMeetingProvider as "ZOOM" | "GOOGLE_MEET" | "CUSTOM")
          : null,

        sessions: data.sessions,
        registrationDeadline: data.registrationDeadline
          ? new Date(data.registrationDeadline)
          : null,

        capacity: data.capacity || null,
        isFree: data.isFree,
        priceAmount: data.priceAmount
          ? new Decimal(data.priceAmount)
          : null,
        priceCurrency: data.priceCurrency,
        allowPayAtVenue: data.allowPayAtVenue,

        notes: data.notes || null,
        whatToBring: data.whatToBring || null,
        preparationInstructions: data.preparationInstructions || null,
        requiresHealthForm: data.requiresHealthForm,
      },
    });

    // 7. Revalidate & redirect
    revalidatePath("/dashboard");
    redirect(`/dashboard/programs/${program.id}`);
  } catch (error) {
    // Re-throw Next.js internal errors (redirect, notFound, etc.)
    if (
      error instanceof Error &&
      (error.message === "NEXT_REDIRECT" || error.message === "NEXT_NOT_FOUND")
    ) {
      throw error;
    }

    console.error("Error creating program:", error);
    if (error instanceof Error) {
      return { error: `Failed to create program: ${error.message}` };
    }
    return { error: "Failed to create program" };
  }
}
