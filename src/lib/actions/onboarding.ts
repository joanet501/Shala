"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { onboardingSchema, RESERVED_SLUGS } from "@/lib/validations/onboarding";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    city: formData.get("city") as string,
    country: formData.get("country") as string,
    languages: JSON.parse((formData.get("languages") as string) || "[]"),
    photoUrl: (formData.get("photoUrl") as string) || null,
    bio: (formData.get("bio") as string) || undefined,
  };

  const result = onboardingSchema.safeParse(raw);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError.message };
  }

  const data = result.data;

  if (RESERVED_SLUGS.includes(data.slug)) {
    return { error: "This URL is reserved. Please choose a different one." };
  }

  const existingSlug = await prisma.teacher.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (existingSlug && existingSlug.id !== user.id) {
    return {
      error: "This URL is already taken. Please choose a different one.",
    };
  }

  try {
    await prisma.teacher.update({
      where: { id: user.id },
      data: {
        name: data.name,
        slug: data.slug,
        city: data.city,
        country: data.country,
        languages: data.languages,
        photoUrl: data.photoUrl,
        bio: data.bio ?? null,
        onboardingCompleted: true,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return {
        error: "This URL is already taken. Please choose a different one.",
      };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
