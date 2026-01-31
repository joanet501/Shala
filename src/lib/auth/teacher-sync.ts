import { prisma } from "@/lib/db/prisma";
import type { Teacher } from "@/generated/prisma/client";

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export async function ensureTeacherExists(
  user: AuthUser
): Promise<{ teacher: Teacher; isNew: boolean }> {
  // Check by Supabase user ID first
  const existingById = await prisma.teacher.findUnique({
    where: { id: user.id },
  });

  if (existingById) {
    return { teacher: existingById, isNew: false };
  }

  const email = user.email!;

  // Check if a teacher record exists with this email but a different ID
  // (e.g., user re-registered or switched auth providers)
  const existingByEmail = await prisma.teacher.findUnique({
    where: { email },
  });

  if (existingByEmail) {
    // Re-link the existing teacher record to the new auth user
    const teacher = await prisma.teacher.update({
      where: { email },
      data: { id: user.id },
    });
    return { teacher, isNew: false };
  }

  const name =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    email.split("@")[0] ||
    "Teacher";

  // Generate a unique slug from the name
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let counter = 1;
  while (await prisma.teacher.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  try {
    const teacher = await prisma.teacher.create({
      data: {
        id: user.id,
        email,
        name,
        slug,
        photoUrl: user.user_metadata?.avatar_url || null,
        onboardingCompleted: false,
      },
    });

    return { teacher, isNew: true };
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      // Race condition — another request may have created the record
      const raceResult = await prisma.teacher.findUnique({
        where: { id: user.id },
      });
      if (raceResult) {
        return { teacher: raceResult, isNew: false };
      }

      // Email race condition — another request linked the email
      const emailResult = await prisma.teacher.findUnique({
        where: { email },
      });
      if (emailResult) {
        const teacher = await prisma.teacher.update({
          where: { email },
          data: { id: user.id },
        });
        return { teacher, isNew: false };
      }

      // Slug collision — retry with timestamp suffix
      const retrySlug = `${baseSlug}-${Date.now()}`;
      const teacher = await prisma.teacher.create({
        data: {
          id: user.id,
          email,
          name,
          slug: retrySlug,
          photoUrl: user.user_metadata?.avatar_url || null,
          onboardingCompleted: false,
        },
      });
      return { teacher, isNew: true };
    }
    throw error;
  }
}
