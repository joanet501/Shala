import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { getStudents, getAllStudentTags, exportStudentsCSV } from "@/lib/actions/students";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { StudentFilters } from "@/components/students/student-filters";
import { ExportCsvButton } from "@/components/students/export-csv-button";
import { StudentPagination } from "@/components/students/student-pagination";

export const metadata: Metadata = {
  title: "Students — Shala",
};

interface StudentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const { teacher } = await requireAuth();

  if (!teacher || !teacher.onboardingCompleted) {
    redirect("/onboarding");
  }

  const t = await getTranslations("students");
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : undefined;
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;

  const [result, allTags] = await Promise.all([
    getStudents(teacher.id, { search, tag, page, perPage: 20 }),
    getAllStudentTags(teacher.id),
  ]);

  if ("error" in result) {
    return <div className="text-destructive">{result.error}</div>;
  }

  const { students, total, totalPages } = result;
  const hasFilters = !!search || !!tag;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        {students.length > 0 && (
          <ExportCsvButton teacherId={teacher.id} />
        )}
      </div>

      <StudentFilters allTags={allTags} />

      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-4 size-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">
              {hasFilters ? t("emptyState.noResults") : t("emptyState.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? t("emptyState.noResultsDescription")
                : t("emptyState.description")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.email")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("columns.phone")}</TableHead>
                  <TableHead className="text-center">{t("columns.programs")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("columns.lastBooking")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("columns.tags")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link
                        href={`/dashboard/students/${student.id}`}
                        className="font-medium hover:underline"
                      >
                        {student.firstName} {student.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.email}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {student.phone ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {student.programCount}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {student.lastBookingDate
                        ? new Date(student.lastBookingDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {student.tags.slice(0, 3).map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                        {student.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{student.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <StudentPagination
            page={page}
            totalPages={totalPages}
            total={total}
            perPage={20}
          />
        </>
      )}
    </div>
  );
}
