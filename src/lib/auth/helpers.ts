import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import type { Teacher } from "@/generated/prisma";
import type { User } from "@supabase/supabase-js";

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth(): Promise<{
  user: User;
  teacher: Teacher | null;
}> {
  const user = await getUser();
  if (!user) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { id: user.id },
  });

  return { user, teacher };
}

export function getPostAuthRedirect(
  teacher: { onboardingCompleted: boolean } | null
): string {
  if (!teacher || !teacher.onboardingCompleted) {
    return "/onboarding";
  }
  return "/dashboard";
}
