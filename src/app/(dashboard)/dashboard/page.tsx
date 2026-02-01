import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  Users,
  BookOpen,
  Plus,
  ExternalLink,
  Calendar,
  MapPin,
  CreditCard,
  FileHeart,
  AlertCircle,
  Clock,
  Activity,
} from "lucide-react";
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

  const t = await getTranslations("dashboard");
  const now = new Date();

  // Fetch all data in parallel
  const [
    programCount,
    studentCount,
    nextProgram,
    recentBookings,
    programsByStatus,
  ] = await Promise.all([
    prisma.program.count({ where: { teacherId: teacher.id } }),
    prisma.student.count({ where: { teacherId: teacher.id } }),
    // Next upcoming published program (by earliest session date)
    prisma.program.findFirst({
      where: {
        teacherId: teacher.id,
        status: "PUBLISHED",
      },
      include: {
        venue: true,
        bookings: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            healthForm: { select: { id: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Recent activity: last 10 bookings
    prisma.booking.findMany({
      where: { teacherId: teacher.id },
      include: {
        student: { select: { firstName: true, lastName: true } },
        program: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Programs by status
    prisma.program.groupBy({
      by: ["status"],
      where: { teacherId: teacher.id },
      _count: { status: true },
    }),
  ]);

  // Compute next program stats
  const nextProgramStats = nextProgram
    ? {
        registered: nextProgram.bookings.filter(
          (b) => b.status !== "CANCELLED" && b.status !== "WAITLISTED"
        ).length,
        pendingPayments: nextProgram.bookings.filter(
          (b) => b.paymentStatus === "PENDING" && b.status !== "CANCELLED"
        ).length,
        healthFormsToReview: nextProgram.bookings.filter(
          (b) => b.status !== "CANCELLED" && !b.healthForm
        ).length,
        waitlisted: nextProgram.bookings.filter(
          (b) => b.status === "WAITLISTED"
        ).length,
        cancellationRequests: nextProgram.bookings.filter(
          (b) => b.status === "CANCELLATION_REQUESTED"
        ).length,
        spotsLeft: nextProgram.capacity
          ? nextProgram.capacity -
            nextProgram.bookings.filter(
              (b) => b.status !== "CANCELLED" && b.status !== "WAITLISTED"
            ).length
          : null,
      }
    : null;

  // Status counts
  const statusMap: Record<string, number> = {};
  for (const s of programsByStatus) {
    statusMap[s.status] = s._count.status;
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/t/${teacher.slug}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t("welcome", { name: teacher.name.split(" ")[0] })}
          </h1>
          <p className="text-muted-foreground">{t("overview")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4" />
              {t("viewPublicPage")}
            </a>
          </Button>
          <CopyButton text={publicUrl} />
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.programs")}
            </CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programCount}</div>
            <p className="text-xs text-muted-foreground">
              {statusMap["PUBLISHED"] ?? 0} {t("stats.published")} · {statusMap["DRAFT"] ?? 0} {t("stats.draft")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.students")}
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.completed")}
            </CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusMap["COMPLETED"] ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.upcoming")}
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusMap["PUBLISHED"] ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Program Focus */}
      {nextProgram && nextProgramStats ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>{t("nextProgram.label")}</CardDescription>
                <CardTitle className="text-xl">
                  <Link
                    href={`/dashboard/programs/${nextProgram.id}`}
                    className="hover:underline"
                  >
                    {nextProgram.name}
                  </Link>
                </CardTitle>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {nextProgram.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {nextProgram.venue.name}, {nextProgram.venue.city}
                    </span>
                  )}
                  {nextProgram.venueType === "ONLINE" && (
                    <Badge variant="secondary">{t("nextProgram.online")}</Badge>
                  )}
                </div>
              </div>
              <Button asChild>
                <Link href={`/dashboard/programs/${nextProgram.id}`}>
                  {t("nextProgram.manage")}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
                <Users className="size-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {nextProgramStats.registered}
                    {nextProgram.capacity && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /{nextProgram.capacity}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("nextProgram.registered")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
                <CreditCard className="size-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {nextProgramStats.pendingPayments}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("nextProgram.pendingPayments")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
                <FileHeart className="size-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {nextProgramStats.healthFormsToReview}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("nextProgram.healthForms")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
                <AlertCircle className="size-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {nextProgramStats.cancellationRequests}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("nextProgram.cancellations")}
                  </p>
                </div>
              </div>
            </div>
            {nextProgramStats.spotsLeft !== null && nextProgramStats.spotsLeft > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("nextProgram.spotsLeft", { count: nextProgramStats.spotsLeft })}
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("quickActions.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/programs/new">
                <Plus className="mr-2 size-4" />
                {t("quickActions.newProgram")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/students">
                <Users className="mr-2 size-4" />
                {t("quickActions.viewStudents")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/programs">
                <BookOpen className="mr-2 size-4" />
                {t("quickActions.allPrograms")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 size-4" />
                {t("quickActions.publicPage")}
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              {t("recentActivity.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t("recentActivity.empty")}
              </p>
            ) : (
              <div className="space-y-3">
                {recentBookings.slice(0, 6).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {booking.student.firstName} {booking.student.lastName}
                      </p>
                      <p className="truncate text-muted-foreground">
                        {booking.program.name}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "PENDING_PAYMENT"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {booking.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* No Programs State */}
      {programCount === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays className="mb-3 size-10 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-semibold">
              {t("empty.title")}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("empty.description")}
            </p>
            <Button asChild>
              <Link href="/dashboard/programs/new">
                <Plus className="mr-2 size-4" />
                {t("empty.cta")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
