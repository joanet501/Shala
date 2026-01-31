import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Clock, Users } from "lucide-react";
import { RegistrationForm } from "@/components/registration/registration-form";
import { LanguageSwitcher } from "@/components/language-switcher";

interface PageProps {
  params: Promise<{ slug: string; programSlug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;

  const program = await prisma.program.findFirst({
    where: {
      slug: params.programSlug,
      teacher: { slug: params.slug },
      status: "PUBLISHED",
    },
    include: { teacher: true },
  });

  if (!program) {
    return { title: "Program Not Found — Shala" };
  }

  return {
    title: `Register for ${program.name} — Shala`,
    description: program.description || `Register for ${program.name}`,
  };
}

export default async function RegisterPage(props: PageProps) {
  const params = await props.params;

  const program = await prisma.program.findFirst({
    where: {
      slug: params.programSlug,
      teacher: { slug: params.slug },
      status: "PUBLISHED",
    },
    include: {
      teacher: true,
      venue: true,
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!program) {
    notFound();
  }

  const sessions = program.sessions as Array<{
    date: string;
    startTime: string;
    endTime: string;
    title: string;
  }>;

  const spotsLeft = program.capacity
    ? program.capacity - program._count.bookings
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Shala
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-12">
        <Link
          href={`/t/${params.slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to {program.teacher.name}
        </Link>

        <div className="space-y-6">
          {/* Program Header */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={isFull ? "secondary" : "default"}>
                {isFull ? "Full" : "Open for Registration"}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold">{program.name}</h1>
            <p className="mt-2 text-xl text-muted-foreground">
              with {program.teacher.name}
            </p>
          </div>

          {/* Program Details */}
          <Card>
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {program.description && (
                <div>
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <p className="text-muted-foreground">{program.description}</p>
                </div>
              )}

              {/* Sessions */}
              <div>
                <h3 className="mb-3 font-semibold">Schedule</h3>
                <div className="space-y-3">
                  {sessions.map((session, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <Calendar className="mt-0.5 size-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{session.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="size-4" />
                          {session.startTime} - {session.endTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Venue */}
              {program.venue && (
                <div>
                  <h3 className="mb-2 font-semibold">Venue</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{program.venue.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {program.venue.address}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {program.venue.city}, {program.venue.country}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Capacity */}
              {program.capacity && (
                <div>
                  <h3 className="mb-2 font-semibold">Capacity</h3>
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-muted-foreground" />
                    <span>
                      {program._count.bookings} / {program.capacity} registered
                    </span>
                    {spotsLeft !== null && spotsLeft > 0 && (
                      <Badge variant="outline">
                        {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {program.notes && (
                <div>
                  <h3 className="mb-2 font-semibold">Important Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {program.notes}
                  </p>
                </div>
              )}

              {program.whatToBring && (
                <div>
                  <h3 className="mb-2 font-semibold">What to Bring</h3>
                  <p className="text-sm text-muted-foreground">
                    {program.whatToBring}
                  </p>
                </div>
              )}

              {program.preparationInstructions && (
                <div>
                  <h3 className="mb-2 font-semibold">Preparation</h3>
                  <p className="text-sm text-muted-foreground">
                    {program.preparationInstructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registration Form */}
          {isFull ? (
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                  <p className="font-semibold text-destructive">
                    This program is currently full
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Please contact the teacher for waitlist information
                  </p>
                  {program.teacher.whatsappPhone && (
                    <a
                      href={`https://wa.me/${program.teacher.whatsappPhone.replace(/\D/g, "")}?text=Hi, I'd like to register for ${program.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Contact via WhatsApp
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <RegistrationForm
              programId={program.id}
              programName={program.name}
              teacherSlug={params.slug}
              requiresHealthForm={program.requiresHealthForm}
              isFree={program.isFree}
              allowPayAtVenue={program.allowPayAtVenue}
              price={program.priceAmount?.toString()}
              currency={program.priceCurrency}
            />
          )}
        </div>
      </main>
    </div>
  );
}
