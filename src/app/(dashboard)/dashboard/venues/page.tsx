import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { getVenues } from "@/lib/actions/venues";
import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
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
import { MapPin } from "lucide-react";
import { CreateVenueDialog } from "@/components/venues/create-venue-dialog";
import { VenueRowActions } from "@/components/venues/venue-row-actions";

export const metadata: Metadata = {
  title: "Venues — Shala",
};

export default async function VenuesPage() {
  const { teacher } = await requireAuth();

  if (!teacher || !teacher.onboardingCompleted) {
    redirect("/onboarding");
  }

  const t = await getTranslations("venues");
  const venues = await getVenues(teacher.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <CreateVenueDialog teacherId={teacher.id} />
      </div>

      {venues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="mb-4 size-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">{t("empty.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("empty.description")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.location")}</TableHead>
                <TableHead className="text-center">{t("columns.capacity")}</TableHead>
                <TableHead className="text-center">{t("columns.programs")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("columns.shared")}</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue) => (
                <TableRow key={venue.id}>
                  <TableCell className="font-medium">{venue.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {venue.city}, {venue.country}
                  </TableCell>
                  <TableCell className="text-center">
                    {venue.capacity ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {venue._count.programs}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {venue.isShared && (
                      <Badge variant="secondary">{t("shared")}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <VenueRowActions
                      teacherId={teacher.id}
                      venue={venue}
                      hasActivePrograms={venue._count.programs > 0}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
