"use server";

import { prisma } from "@/lib/db/prisma";
import { createVenueSchema } from "@/lib/validations/venues";

export async function createVenue(
  teacherId: string,
  venueData: {
    name: string;
    address: string;
    city: string;
    country: string;
    saveForReuse: boolean;
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
      },
    });

    return { venueId: venue.id };
  } catch (error) {
    console.error("Error creating venue:", error);
    return { error: "Failed to create venue" };
  }
}
