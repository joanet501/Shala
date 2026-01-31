import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookingDetails } from "@/lib/actions/registration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, MapPin, Clock, CheckCircle, Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{ slug: string; bookingId: string }>;
}

export const metadata: Metadata = {
  title: "Booking Confirmation — Shala",
};

export default async function BookingConfirmationPage(props: PageProps) {
  const params = await props.params;
  const t = await getTranslations("booking");
  const result = await getBookingDetails(params.bookingId);

  if (result.error || !result.booking) {
    notFound();
  }

  const { booking } = result;
  const sessions = booking.program.sessions as Array<{
    date: string;
    startTime: string;
    endTime: string;
    title: string;
  }>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Shala
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-12">
        {/* Success Message */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="size-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">{t("success")}</h1>
          <p className="mt-2 text-muted-foreground">{t("confirmed")}</p>
        </div>

        {/* Booking Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("details")}</CardTitle>
                <Badge
                  variant={
                    booking.status === "CONFIRMED" ? "default" : "secondary"
                  }
                >
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("reference")}</p>
                <p className="font-mono text-sm">{booking.id.slice(0, 8).toUpperCase()}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  {t("../registration/review.program")}
                </p>
                <p className="font-semibold">{booking.program.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  {t("../registration/review.participant")}
                </p>
                <p>
                  {booking.student.firstName} {booking.student.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {booking.student.email}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("schedule")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((session, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <Calendar className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{session.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(session.date).toLocaleDateString("es-ES", {
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
            </CardContent>
          </Card>

          {booking.program.venue && (
            <Card>
              <CardHeader>
                <CardTitle>{t("venue")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{booking.program.venue.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.program.venue.address}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.program.venue.city}, {booking.program.venue.country}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {booking.paymentStatus === "PENDING" && (
            <Card className="border-yellow-500/50 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">
                  {t("paymentPending")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800">
                  {booking.paymentMethod === "ONLINE"
                    ? t("paymentComplete")
                    : booking.paymentMethod === "BANK_TRANSFER"
                      ? t("bankTransferInfo")
                      : t("atVenueInfo")}
                </p>
                {booking.paymentAmount && (
                  <p className="mt-2 text-lg font-semibold text-yellow-800">
                    {t("amount")}: {booking.paymentAmount.toString()} {booking.paymentCurrency}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {(booking.program.whatToBring || booking.program.preparationInstructions) && (
            <Card>
              <CardHeader>
                <CardTitle>{t("importantInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.program.whatToBring && (
                  <div>
                    <p className="font-semibold">{t("whatToBring")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.program.whatToBring}
                    </p>
                  </div>
                )}
                {booking.program.preparationInstructions && (
                  <div>
                    <p className="font-semibold">{t("preparation")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.program.preparationInstructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t("contactTeacher")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("contactQuestion", { teacherName: booking.program.teacher.name })}
              </p>

              <div className="flex gap-2">
                {booking.program.teacher.whatsappPhone && (
                  <Button asChild className="flex-1">
                    <a
                      href={`https://wa.me/${booking.program.teacher.whatsappPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="mr-2 size-4" />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {booking.program.teacher.email && (
                  <Button variant="outline" asChild className="flex-1">
                    <a href={`mailto:${booking.program.teacher.email}`}>
                      <Mail className="mr-2 size-4" />
                      Email
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button asChild variant="outline">
              <Link href={`/t/${params.slug}`}>{t("backToTeacher")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
