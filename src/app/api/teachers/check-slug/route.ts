import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SLUG_REGEX, RESERVED_SLUGS } from "@/lib/validations/onboarding";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  const teacherId = request.nextUrl.searchParams.get("teacherId");

  if (!slug || slug.length < 3 || !SLUG_REGEX.test(slug)) {
    return NextResponse.json({ available: false });
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return NextResponse.json({ available: false });
  }

  const existing = await prisma.teacher.findUnique({
    where: { slug },
    select: { id: true },
  });

  const available = !existing || existing.id === teacherId;
  return NextResponse.json({ available });
}
