"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { createVenueSchema } from "@/lib/validations/venues";

// =============================================================================
// CREATE VENUE
// =============================================================================

export async function createVenue(
  teacherId: string,
  venueData: {
    name: string;
    address: string;
    city: string;
    country: string;
    capacity?: number;
    notes?: string;
    isShared?: boolean;
    saveForReuse?: boolean;
  }
) {
  const result = createVenueSchema.safeParse({
    teacherId,
    ...venueData,
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const data = result.data;

  try {
    const venue = await prisma.venue.create({
      data: {
        teacherId: data.teacherId,
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        capacity: data.capacity ?? null,
        notes: data.notes ?? null,
        isShared: data.isShared ?? false,
      },
    });

    revalidatePath("/dashboard/venues");
    return { venueId: venue.id };
  } catch (error) {
    console.error("Error creating venue:", error);
    return { error: "Failed to create venue" };
  }
}

// =============================================================================
// GET VENUES
// =============================================================================

export async function getVenues(teacherId: string) {
  const venues = await prisma.venue.findMany({
    where: { teacherId },
    include: {
      _count: { select: { programs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return venues;
}

// =============================================================================
// GET VENUE BY ID
// =============================================================================

export async function getVenueById(teacherId: string, venueId: string) {
  return prisma.venue.findFirst({
    where: { id: venueId, teacherId },
    include: {
      programs: {
        select: { id: true, name: true, status: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// =============================================================================
// UPDATE VENUE
// =============================================================================

export async function updateVenue(
  teacherId: string,
  venueId: string,
  data: {
    name: string;
    address: string;
    city: string;
    country: string;
    capacity?: number | null;
    notes?: string | null;
    isShared?: boolean;
  }
) {
  const existing = await prisma.venue.findFirst({
    where: { id: venueId, teacherId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Venue not found" };
  }

  try {
    await prisma.venue.update({
      where: { id: venueId },
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        capacity: data.capacity ?? null,
        notes: data.notes ?? null,
        isShared: data.isShared ?? false,
      },
    });

    revalidatePath("/dashboard/venues");
    revalidatePath(`/dashboard/venues/${venueId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating venue:", error);
    return { error: "Failed to update venue" };
  }
}

// =============================================================================
// DELETE VENUE
// =============================================================================

export async function deleteVenue(teacherId: string, venueId: string) {
  const venue = await prisma.venue.findFirst({
    where: { id: venueId, teacherId },
    include: {
      programs: {
        where: { status: { in: ["DRAFT", "PUBLISHED"] } },
        select: { id: true },
      },
    },
  });

  if (!venue) {
    return { error: "Venue not found" };
  }

  if (venue.programs.length > 0) {
    return { error: "Cannot delete a venue with active programs" };
  }

  try {
    await prisma.venue.delete({ where: { id: venueId } });
    revalidatePath("/dashboard/venues");
    return { success: true };
  } catch (error) {
    console.error("Error deleting venue:", error);
    return { error: "Failed to delete venue" };
  }
}
