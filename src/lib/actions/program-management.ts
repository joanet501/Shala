"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

// =============================================================================
// UPDATE PROGRAM STATUS
// =============================================================================

export async function updateProgramStatus(
  teacherId: string,
  programId: string,
  newStatus: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED"
) {
  const program = await prisma.program.findFirst({
    where: { id: programId, teacherId },
    select: { id: true, status: true },
  });

  if (!program) {
    return { error: "Program not found" };
  }

  // Validate transitions
  const allowed: Record<string, string[]> = {
    DRAFT: ["PUBLISHED"],
    PUBLISHED: ["CANCELLED", "COMPLETED"],
    CANCELLED: [],
    COMPLETED: [],
  };

  if (!allowed[program.status]?.includes(newStatus)) {
    return { error: `Cannot change from ${program.status} to ${newStatus}` };
  }

  try {
    await prisma.program.update({
      where: { id: programId },
      data: { status: newStatus },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");
    revalidatePath(`/dashboard/programs/${programId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating program status:", error);
    return { error: "Failed to update program status" };
  }
}

// =============================================================================
// DUPLICATE PROGRAM
// =============================================================================

export async function duplicateProgram(
  teacherId: string,
  programId: string
) {
  const program = await prisma.program.findFirst({
    where: { id: programId, teacherId },
  });

  if (!program) {
    return { error: "Program not found" };
  }

  // Generate unique slug
  let slug = `${program.slug}-copy`;
  let suffix = 1;
  while (true) {
    const existing = await prisma.program.findUnique({
      where: { teacherId_slug: { teacherId, slug } },
      select: { id: true },
    });
    if (!existing) break;
    slug = `${program.slug}-copy-${suffix++}`;
  }

  try {
    const duplicate = await prisma.program.create({
      data: {
        teacherId,
        templateId: program.templateId,
        name: `${program.name} (Copy)`,
        slug,
        description: program.description,
        descriptionTranslations: program.descriptionTranslations ?? undefined,
        nameTranslations: program.nameTranslations ?? undefined,
        status: "DRAFT",
        venueType: program.venueType,
        venueId: program.venueId,
        venueName: program.venueName,
        venueAddress: program.venueAddress,
        onlineMeetingUrl: program.onlineMeetingUrl,
        onlineMeetingProvider: program.onlineMeetingProvider,
        sessions: [], // Clear dates — teacher must set new ones
        capacity: program.capacity,
        isFree: program.isFree,
        priceAmount: program.priceAmount,
        priceCurrency: program.priceCurrency,
        allowPayAtVenue: program.allowPayAtVenue,
        notes: program.notes,
        notesTranslations: program.notesTranslations ?? undefined,
        whatToBring: program.whatToBring,
        whatToBringTranslations: program.whatToBringTranslations ?? undefined,
        preparationInstructions: program.preparationInstructions,
        preparationTranslations: program.preparationTranslations ?? undefined,
        cancellationPolicyText: program.cancellationPolicyText,
        requiresHealthForm: program.requiresHealthForm,
        isCorrection: program.isCorrection,
        parentProgramId: program.parentProgramId,
        prerequisiteProgramId: program.prerequisiteProgramId,
        prerequisiteType: program.prerequisiteType,
      },
    });

    revalidatePath("/dashboard/programs");
    return { success: true, programId: duplicate.id };
  } catch (error) {
    console.error("Error duplicating program:", error);
    return { error: "Failed to duplicate program" };
  }
}

// =============================================================================
// DELETE PROGRAM (draft only)
// =============================================================================

export async function deleteProgram(
  teacherId: string,
  programId: string
) {
  const program = await prisma.program.findFirst({
    where: { id: programId, teacherId },
    select: { id: true, status: true, _count: { select: { bookings: true } } },
  });

  if (!program) {
    return { error: "Program not found" };
  }

  if (program.status !== "DRAFT") {
    return { error: "Only draft programs can be deleted" };
  }

  if (program._count.bookings > 0) {
    return { error: "Cannot delete a program with bookings" };
  }

  try {
    await prisma.program.delete({ where: { id: programId } });
    revalidatePath("/dashboard/programs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting program:", error);
    return { error: "Failed to delete program" };
  }
}

// =============================================================================
// SAVE AS TEMPLATE
// =============================================================================

export async function saveAsTemplate(
  teacherId: string,
  programId: string,
  templateName: string
) {
  const program = await prisma.program.findFirst({
    where: { id: programId, teacherId },
    select: {
      sessions: true,
      capacity: true,
      priceAmount: true,
      priceCurrency: true,
      notes: true,
      whatToBring: true,
      preparationInstructions: true,
      template: { select: { formatType: true } },
    },
  });

  if (!program) {
    return { error: "Program not found" };
  }

  try {
    await prisma.scheduleTemplate.create({
      data: {
        teacherId,
        name: templateName,
        formatType: program.template?.formatType ?? "CUSTOM",
        defaultSessions: program.sessions ?? [],
        defaultCapacity: program.capacity,
        defaultPrice: program.priceAmount,
        defaultCurrency: program.priceCurrency,
        defaultNotes: program.notes,
        defaultWhatToBring: program.whatToBring,
        defaultPreparation: program.preparationInstructions,
        isPlatformTemplate: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving template:", error);
    return { error: "Failed to save template" };
  }
}
