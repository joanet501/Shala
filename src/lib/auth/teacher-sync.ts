import { prisma } from "@/lib/db/prisma";
import type { Teacher } from "@/generated/prisma";

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
  const existing = await prisma.teacher.findUnique({
    where: { id: user.id },
  });

  if (existing) {
    return { teacher: existing, isNew: false };
  }

  const name =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Teacher";

  const email = user.email!;

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
    // Handle race condition: if another request created the record concurrently
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      const teacher = await prisma.teacher.findUniqueOrThrow({
        where: { id: user.id },
      });
      return { teacher, isNew: false };
    }
    throw error;
  }
}
