import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const teacherId = searchParams.get("teacherId");

  if (!slug || !teacherId) {
    return NextResponse.json(
      { error: "Missing slug or teacherId" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.program.findUnique({
      where: {
        teacherId_slug: {
          teacherId,
          slug,
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ available: !existing });
  } catch (error) {
    console.error("Error checking slug:", error);
    return NextResponse.json(
      { error: "Failed to check slug availability" },
      { status: 500 }
    );
  }
}
