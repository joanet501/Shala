import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect, notFound } from "next/navigation";
import { getStudentById } from "@/lib/actions/students";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  User,
  Heart,
  AlertCircle,
} from "lucide-react";
import { EditStudentDialog } from "@/components/students/edit-student-dialog";
import { StudentTags } from "@/components/students/student-tags";
import { StudentNotes } from "@/components/students/student-notes";

export const metadata: Metadata = {
  title: "Student Detail — Shala",
};

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { teacher } = await requireAuth();

  if (!teacher || !teacher.onboardingCompleted) {
    redirect("/onboarding");
  }

  const t = await getTranslations("students");
  const { id } = await params;
  const student = await getStudentById(teacher.id, id);

  if (!student) {
    notFound();
  }

  const bookingStatusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-800",
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    CANCELLED: "bg-red-100 text-red-800",
    WAITLISTED: "bg-orange-100 text-orange-800",
    NO_SHOW: "bg-gray-100 text-gray-800",
  };

  const paymentStatusColors: Record<string, string> = {
    PAID: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REFUNDED: "bg-blue-100 text-blue-800",
    WAIVED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/students">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 size-4" />
              {t("detail.backToList")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-muted-foreground">{student.email}</p>
          </div>
        </div>
        <EditStudentDialog teacherId={teacher.id} student={student} />
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            {t("detail.contactInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow icon={<Mail className="size-4" />} label={t("detail.email")} value={student.email} />
            <InfoRow icon={<Phone className="size-4" />} label={t("detail.phone")} value={student.phone} />
            <InfoRow icon={<MessageCircle className="size-4" />} label={t("detail.whatsapp")} value={student.whatsappPhone} />
            <InfoRow
              icon={<Calendar className="size-4" />}
              label={t("detail.dateOfBirth")}
              value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : null}
            />
            <InfoRow icon={<User className="size-4" />} label={t("detail.gender")} value={student.gender ? t(`detail.gender${student.gender.charAt(0) + student.gender.slice(1).toLowerCase()}` as "detail.genderMale") : null} />
            <InfoRow icon={<AlertCircle className="size-4" />} label={t("detail.emergencyContact")} value={student.emergencyContactName ? `${student.emergencyContactName} (${student.emergencyContactRelation ?? ""}) — ${student.emergencyContactPhone ?? ""}` : null} />
          </div>
        </CardContent>
      </Card>

      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.bookingHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {student.bookings.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("detail.noBookings")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("detail.bookingColumns.program")}</TableHead>
                  <TableHead>{t("detail.bookingColumns.date")}</TableHead>
                  <TableHead>{t("detail.bookingColumns.status")}</TableHead>
                  <TableHead>{t("detail.bookingColumns.payment")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.program.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={bookingStatusColors[booking.status] ?? "bg-gray-100 text-gray-800"} variant="secondary">
                        {booking.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusColors[booking.paymentStatus] ?? "bg-gray-100 text-gray-800"} variant="secondary">
                        {booking.paymentStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Health Forms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="size-5" />
            {t("detail.healthForms")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {student.bookings.filter((b) => b.healthForm).length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("detail.noHealthForms")}
            </p>
          ) : (
            <div className="space-y-4">
              {student.bookings
                .filter((b) => b.healthForm)
                .map((booking) => {
                  const hf = booking.healthForm!;
                  return (
                    <div key={hf.id} className="rounded-lg border p-4">
                      <h4 className="mb-2 font-medium">
                        {t("detail.healthFormFor", { programName: booking.program.name })}
                      </h4>
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        {hf.healthConditions.length > 0 && (
                          <div>
                            <span className="font-medium">{t("detail.conditions")}: </span>
                            {hf.healthConditions.join(", ")}
                          </div>
                        )}
                        {hf.conditionDetails && (
                          <div>
                            <span className="font-medium">{t("detail.conditionDetails")}: </span>
                            {hf.conditionDetails}
                          </div>
                        )}
                        {hf.previousYogaPractice && (
                          <div>
                            <span className="font-medium">{t("detail.previousYoga")}: </span>
                            {hf.previousYogaPractice}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{t("detail.pregnant")}: </span>
                          {hf.isPregnant ? t("detail.yes") : t("detail.no")}
                        </div>
                        <div>
                          <span className="font-medium">{t("detail.recentSurgery")}: </span>
                          {hf.hadRecentSurgery ? t("detail.yes") : t("detail.no")}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Practices */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.practices")}</CardTitle>
        </CardHeader>
        <CardContent>
          {student.studentPractices.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("detail.noPractices")}
            </p>
          ) : (
            <div className="space-y-2">
              {student.studentPractices.map((practice) => (
                <div
                  key={practice.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{practice.practiceName}</p>
                    <p className="text-sm text-muted-foreground">
                      {practice.program.name}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {t("detail.initiatedOn", {
                      date: new Date(practice.initiatedAt).toLocaleDateString(),
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.tags")}</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentTags
            teacherId={teacher.id}
            studentId={student.id}
            initialTags={student.tags}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.notes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentNotes
            teacherId={teacher.id}
            studentId={student.id}
            initialNotes={student.teacherNotes ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value ?? "—"}</p>
      </div>
    </div>
  );
}
