"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureTeacherExists } from "@/lib/auth/teacher-sync";
import { getPostAuthRedirect } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function getBaseUrl() {
  // In server actions, we can read the host from request headers
  // to build absolute URLs for Supabase redirects
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
      data: { name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is disabled, user is immediately authenticated.
  // Create teacher record and redirect.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { teacher } = await ensureTeacherExists(user);
    const redirectTo = getPostAuthRedirect(teacher);
    revalidatePath("/", "layout");
    redirect(redirectTo);
  }

  // If email confirmation is enabled, return success so client shows message
  return { error: null };
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { teacher } = await ensureTeacherExists(user);
    const redirectTo = getPostAuthRedirect(teacher);
    revalidatePath("/", "layout");
    redirect(redirectTo);
  }

  return { error: "An unexpected error occurred" };
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message, url: null };
  }

  return { error: null, url: data.url };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
