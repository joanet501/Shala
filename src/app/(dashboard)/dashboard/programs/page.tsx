import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Programs — Shala",
};

export default async function ProgramsPage() {
  const { teacher } = await requireAuth();

  if (!teacher || !teacher.onboardingCompleted) {
    redirect("/onboarding");
  }

  const t = await getTranslations("programList");

  const programs = await prisma.program.findMany({
    where: { teacherId: teacher.id },
    include: {
      venue: true,
      template: true,
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/programs/new">
            <Plus className="mr-2 size-4" />
            {t("newProgram")}
          </Link>
        </Button>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="mb-4 size-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">{t("empty")}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{t("createFirst")}</p>
            <Button asChild>
              <Link href="/dashboard/programs/new">
                <Plus className="mr-2 size-4" />
                {t("createFirst")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const sessions = program.sessions as Array<{
              date: string; startTime: string; endTime: string; title: string;
            }>;
            const firstSession = sessions[0];

            return (
              <Link key={program.id} href={`/dashboard/programs/${program.id}`}>
                <Card className="transition-all hover:border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="line-clamp-1">{program.name}</CardTitle>
                        <CardDescription className="mt-1">/{program.slug}</CardDescription>
                      </div>
                      <Badge variant={program.status === "PUBLISHED" ? "default" : "secondary"}>
                        {program.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {firstSession && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-4" />
                        <span>{new Date(firstSession.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {program.venue && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4" />
                        <span className="line-clamp-1">{program.venue.name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="size-4" />
                        <span>
                          {program._count.bookings}
                          {program.capacity ? `/${program.capacity}` : ""} {t("bookings")}
                        </span>
                      </div>
                      {program.isFree ? (
                        <Badge variant="outline">{t("free")}</Badge>
                      ) : (
                        <span className="font-medium">
                          {program.priceAmount?.toString()} {program.priceCurrency}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
