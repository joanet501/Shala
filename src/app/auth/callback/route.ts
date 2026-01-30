import { createClient } from "@/lib/supabase/server";
import { ensureTeacherExists } from "@/lib/auth/teacher-sync";
import { getPostAuthRedirect } from "@/lib/auth/helpers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Password reset flow — redirect to reset-password page
        if (next === "/reset-password") {
          return NextResponse.redirect(`${origin}/reset-password`);
        }

        // Normal auth flow — ensure Teacher record exists and redirect
        const { teacher } = await ensureTeacherExists(user);
        const redirectTo = getPostAuthRedirect(teacher);
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
    }
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
