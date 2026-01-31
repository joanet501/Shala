import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Users, BookOpen, Plus, ExternalLink, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";

export const metadata: Metadata = {
  title: "Dashboard — Shala",
};

export default async function DashboardPage() {
  const { teacher } = await requireAuth();

  if (!teacher || !teacher.onboardingCompleted) {
    redirect("/onboarding");
  }

  const [programCount, studentCount, upcomingPrograms] = await Promise.all([
    prisma.program.count({ where: { teacherId: teacher.id } }),
    prisma.student.count({ where: { teacherId: teacher.id } }),
    prisma.program.findMany({
      where: {
        teacherId: teacher.id,
        status: "PUBLISHED",
      },
      include: {
        venue: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/t/${teacher.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {teacher.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your teaching practice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="size-4" />
              View Public Page
            </a>
          </Button>
          <CopyButton text={publicUrl} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingPrograms.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming programs</CardTitle>
              <CardDescription>Your published programs</CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/programs/new">
                <Plus className="mr-2 size-4" />
                Create Program
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingPrograms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No published programs yet
              </p>
              <p className="mt-1 mb-4 text-xs text-muted-foreground">
                Create and publish a program to start accepting registrations
              </p>
              <Button asChild>
                <Link href="/dashboard/programs/new">
                  <Plus className="mr-2 size-4" />
                  Create your first program
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingPrograms.map((program) => {
                const sessions = program.sessions as Array<{
                  date: string;
                  startTime: string;
                  endTime: string;
                  title: string;
                }>;
                const firstSession = sessions[0];
                const publicProgramUrl = `${publicUrl}/register/${program.slug}`;

                return (
                  <div
                    key={program.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/programs/${program.id}`}
                          className="font-semibold hover:underline"
                        >
                          {program.name}
                        </Link>
                        <Badge variant="default">Published</Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {firstSession && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-4" />
                            <span>
                              {new Date(firstSession.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        )}

                        {program.venue && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-4" />
                            <span>{program.venue.name}</span>
                          </div>
                        )}

                        {program.capacity && (
                          <div className="flex items-center gap-1.5">
                            <Users className="size-4" />
                            <span>
                              {program._count.bookings}/{program.capacity}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 text-xs"
                        >
                          <a
                            href={publicProgramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-1.5 size-3" />
                            View Public Page
                          </a>
                        </Button>
                        <CopyButton
                          text={publicProgramUrl}
                          className="h-8 text-xs"
                          showText
                        />
                      </div>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/programs/${program.id}`}>
                        Manage
                      </Link>
                    </Button>
                  </div>
                );
              })}

              {upcomingPrograms.length >= 5 && (
                <div className="pt-2 text-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/programs">View All Programs</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
