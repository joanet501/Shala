import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
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

  if (!program) {
    notFound();
  }

  if (program.teacherId !== teacher.id) {
    notFound();
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/t/${teacher.slug}/register/${program.slug}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/programs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 size-4" />
              Back
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

      {/* Program Actions */}
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
                <p className="text-sm font-medium">Public Registration Link</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Share this link with students to register
                </p>
                <code className="mt-2 block rounded bg-muted px-2 py-1 text-xs">
                  {publicUrl}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 size-4" />
                    View
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
          <CardTitle>Program Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {program.description && (
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">
                {program.description}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium">Venue Type</p>
            <p className="text-sm text-muted-foreground">{program.venueType}</p>
          </div>

          {program.venue && (
            <div>
              <p className="text-sm font-medium">Venue</p>
              <p className="text-sm text-muted-foreground">
                {program.venue.name}, {program.venue.city}, {program.venue.country}
              </p>
            </div>
          )}

          {program.onlineMeetingUrl && (
            <div>
              <p className="text-sm font-medium">Meeting URL</p>
              <p className="text-sm text-muted-foreground">
                {program.onlineMeetingUrl}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium">Sessions</p>
            <div className="mt-2 space-y-2">
              {(program.sessions as any[]).map((session, i) => (
                <div key={i} className="rounded border p-2 text-sm">
                  <div className="font-medium">{session.title}</div>
                  <div className="text-muted-foreground">
                    {new Date(session.date).toLocaleDateString()} —{" "}
                    {session.startTime} to {session.endTime}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Pricing</p>
            <p className="text-sm text-muted-foreground">
              {program.isFree
                ? "Free"
                : `${program.priceAmount?.toString()} ${program.priceCurrency}`}
            </p>
          </div>

          {program.capacity && (
            <div>
              <p className="text-sm font-medium">Capacity</p>
              <p className="text-sm text-muted-foreground">{program.capacity}</p>
            </div>
          )}

          {program.notes && (
            <div>
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm text-muted-foreground">{program.notes}</p>
            </div>
          )}

          {program.whatToBring && (
            <div>
              <p className="text-sm font-medium">What to Bring</p>
              <p className="text-sm text-muted-foreground">
                {program.whatToBring}
              </p>
            </div>
          )}

          {program.preparationInstructions && (
            <div>
              <p className="text-sm font-medium">Preparation Instructions</p>
              <p className="text-sm text-muted-foreground">
                {program.preparationInstructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registrations ({program._count.bookings}
            {program.capacity ? `/${program.capacity}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {program.bookings.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No registrations yet
            </div>
          ) : (
            <div className="space-y-2">
              {program.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {booking.student.firstName} {booking.student.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.student.email}
                    </p>
                    {booking.student.phone && (
                      <p className="text-sm text-muted-foreground">
                        {booking.student.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={
                        booking.status === "CONFIRMED"
                          ? "default"
                          : booking.status === "CANCELLATION_REQUESTED"
                            ? "destructive"
                            : booking.status === "WAITLISTED"
                              ? "outline"
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
