import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProgramActions } from "@/components/programs/program-actions";
import { BookingActions } from "@/components/programs/booking-actions";

export const metadata: Metadata = {
  title: "Program Details — Shala",
};

export default async function ProgramPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { teacher } = await requireAuth();

  if (!teacher || !teacher.onboardingCompleted) {
    redirect("/onboarding");
  }

  const t = await getTranslations("programDetail");

  const program = await prisma.program.findUnique({
    where: { id: params.id },
    include: {
      venue: true,
      template: true,
      bookings: {
        include: {
          student: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!program) notFound();
  if (program.teacherId !== teacher.id) notFound();

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/t/${teacher.slug}/register/${program.slug}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/programs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 size-4" />
              {t("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{program.name}</h1>
            <p className="text-muted-foreground">/{program.slug}</p>
          </div>
        </div>
        <Badge variant={program.status === "PUBLISHED" ? "default" : "secondary"}>
          {program.status}
        </Badge>
      </div>

      <ProgramActions
        teacherId={teacher.id}
        programId={program.id}
        status={program.status}
        programName={program.name}
        hasBookings={program._count.bookings > 0}
      />

      {program.status === "PUBLISHED" && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium">{t("publicLink")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("publicLinkDesc")}</p>
                <code className="mt-2 block rounded bg-muted px-2 py-1 text-xs">{publicUrl}</code>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 size-4" />
                    {t("view")}
                  </a>
                </Button>
                <CopyButton text={publicUrl} variant="default" showText />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {program.description && (
            <DetailRow label={t("description")} value={program.description} />
          )}
          <DetailRow label={t("venueType")} value={program.venueType} />
          {program.venue && (
            <DetailRow label={t("venue")} value={`${program.venue.name}, ${program.venue.city}, ${program.venue.country}`} />
          )}
          {program.onlineMeetingUrl && (
            <DetailRow label={t("meetingUrl")} value={program.onlineMeetingUrl} />
          )}

          <div>
            <p className="text-sm font-medium">{t("sessions")}</p>
            <div className="mt-2 space-y-2">
              {(program.sessions as Array<{ date: string; startTime: string; endTime: string; title: string }>).map((session, i) => (
                <div key={i} className="rounded border p-2 text-sm">
                  <div className="font-medium">{session.title}</div>
                  <div className="text-muted-foreground">
                    {new Date(session.date).toLocaleDateString()} — {session.startTime} to {session.endTime}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DetailRow
            label={t("pricing")}
            value={program.isFree ? t("free") : `${program.priceAmount?.toString()} ${program.priceCurrency}`}
          />
          {program.capacity && <DetailRow label={t("capacity")} value={program.capacity.toString()} />}
          {program.notes && <DetailRow label={t("notes")} value={program.notes} />}
          {program.whatToBring && <DetailRow label={t("whatToBring")} value={program.whatToBring} />}
          {program.preparationInstructions && <DetailRow label={t("preparation")} value={program.preparationInstructions} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("registrations")} ({program._count.bookings}
            {program.capacity ? `/${program.capacity}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {program.bookings.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("noRegistrations")}
            </div>
          ) : (
            <div className="space-y-2">
              {program.bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="font-medium">{booking.student.firstName} {booking.student.lastName}</p>
                    <p className="text-sm text-muted-foreground">{booking.student.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={
                        booking.status === "CONFIRMED" ? "default"
                          : booking.status === "CANCELLATION_REQUESTED" ? "destructive"
                          : booking.status === "WAITLISTED" ? "outline"
                          : "secondary"
                      }
                    >
                      {booking.status.replace(/_/g, " ")}
                    </Badge>
                    <BookingActions
                      teacherId={teacher.id}
                      booking={{
                        id: booking.id,
                        status: booking.status,
                        paymentStatus: booking.paymentStatus,
                        cancelledReason: booking.cancelledReason,
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
