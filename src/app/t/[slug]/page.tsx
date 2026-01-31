import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Mail,
  Phone,
  Video,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const teacher = await prisma.teacher.findUnique({
    where: { slug: params.slug },
    select: { name: true, bio: true },
  });

  if (!teacher) {
    return { title: "Teacher Not Found — Shala" };
  }

  return {
    title: `${teacher.name} — Shala`,
    description: teacher.bio || `Yoga programs by ${teacher.name}`,
  };
}

export default async function TeacherPublicPage(props: PageProps) {
  const params = await props.params;

  const teacher = await prisma.teacher.findUnique({
    where: { slug: params.slug },
  });

  if (!teacher) {
    notFound();
  }

  const programs = await prisma.program.findMany({
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
  });

  const initials = teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

      <main className="container mx-auto max-w-6xl px-6 py-12">
        {/* Teacher Profile Section */}
        <Card className="mb-12">
          <CardContent className="pt-6">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <Avatar className="size-24">
                <AvatarImage src={teacher.photoUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{teacher.name}</h1>
                  {teacher.city && teacher.country && (
                    <p className="text-muted-foreground">
                      {teacher.city}, {teacher.country}
                    </p>
                  )}
                </div>

                {teacher.bio && (
                  <p className="text-muted-foreground">{teacher.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  {teacher.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4" />
                      <a
                        href={`tel:${teacher.phone}`}
                        className="hover:underline"
                      >
                        {teacher.phone}
                      </a>
                    </div>
                  )}
                  {teacher.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="size-4" />
                      <a
                        href={`mailto:${teacher.email}`}
                        className="hover:underline"
                      >
                        {teacher.email}
                      </a>
                    </div>
                  )}
                  {teacher.whatsappPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4" />
                      <a
                        href={`https://wa.me/${teacher.whatsappPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        WhatsApp
                      </a>
                    </div>
                  )}
                </div>

                {teacher.languages && teacher.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Globe className="size-4 text-muted-foreground" />
                    {teacher.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programs Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Upcoming Programs</h2>
            <p className="text-muted-foreground">
              {programs.length > 0
                ? "Register for upcoming yoga programs"
                : "No upcoming programs at the moment"}
            </p>
          </div>

          {programs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="mb-4 size-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Check back soon for new programs
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {programs.map((program) => {
                const sessions = program.sessions as Array<{
                  date: string;
                  startTime: string;
                  endTime: string;
                  title: string;
                }>;
                const firstSession = sessions[0];
                const lastSession = sessions[sessions.length - 1];

                const spotsLeft = program.capacity
                  ? program.capacity - program._count.bookings
                  : null;
                const isFull = spotsLeft !== null && spotsLeft <= 0;

                return (
                  <Card
                    key={program.id}
                    className="flex flex-col overflow-hidden"
                  >
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        {program.name}
                      </CardTitle>
                      {program.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {program.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-4">
                      {/* Date & Time */}
                      {firstSession && (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm">
                            <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {new Date(firstSession.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </div>
                              {sessions.length > 1 && (
                                <div className="text-xs text-muted-foreground">
                                  to{" "}
                                  {new Date(
                                    lastSession.date
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="size-4" />
                            <span>
                              {firstSession.startTime} - {firstSession.endTime}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Venue */}
                      {program.venueType === "ONLINE" ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Video className="size-4" />
                          <span>Online</span>
                        </div>
                      ) : program.venue ? (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 size-4 shrink-0" />
                          <div className="line-clamp-2">
                            {program.venue.name}, {program.venue.city}
                          </div>
                        </div>
                      ) : null}

                      {/* Capacity */}
                      {program.capacity && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="size-4 text-muted-foreground" />
                          <span
                            className={
                              isFull ? "text-destructive" : "text-muted-foreground"
                            }
                          >
                            {isFull
                              ? "Full"
                              : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
                          </span>
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="mt-auto space-y-3 pt-4">
                        <div className="flex items-center justify-between">
                          {program.isFree ? (
                            <Badge variant="outline" className="text-base">
                              Free
                            </Badge>
                          ) : (
                            <div className="text-2xl font-bold">
                              {program.priceCurrency}{" "}
                              {program.priceAmount?.toString()}
                            </div>
                          )}
                        </div>

                        <Button
                          asChild
                          className="w-full"
                          disabled={isFull}
                          variant={isFull ? "secondary" : "default"}
                        >
                          <Link
                            href={`/t/${teacher.slug}/register/${program.slug}`}
                          >
                            {isFull ? "Full" : "Register Now"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Powered by Shala</p>
        </div>
      </footer>
    </div>
  );
}
