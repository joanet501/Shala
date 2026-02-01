"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { updateVenue, deleteVenue } from "@/lib/actions/venues";
import { toast } from "sonner";

interface VenueData {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number | null;
  notes: string | null;
  isShared: boolean;
}

interface VenueRowActionsProps {
  teacherId: string;
  venue: VenueData;
  hasActivePrograms: boolean;
}

export function VenueRowActions({
  teacherId,
  venue,
  hasActivePrograms,
}: VenueRowActionsProps) {
  const t = useTranslations("venues");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: venue.name,
    address: venue.address,
    city: venue.city,
    country: venue.country,
    capacity: venue.capacity?.toString() ?? "",
    notes: venue.notes ?? "",
    isShared: venue.isShared,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateVenue(teacherId, venue.id, {
        name: form.name,
        address: form.address,
        city: form.city,
        country: form.country,
        capacity: form.capacity ? parseInt(form.capacity, 10) : null,
        notes: form.notes || null,
        isShared: form.isShared,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("toast.updated"));
        setEditOpen(false);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteVenue(teacherId, venue.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("toast.deleted"));
        setDeleteOpen(false);
      }
    });
  };

  return (
    <div className="flex items-center gap-1">
      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("edit.title")}</DialogTitle>
            <DialogDescription>{t("edit.description")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("fields.name")}</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{t("fields.address")}</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("fields.city")}</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>{t("fields.country")}</Label>
                <Input value={form.country} onChange={(e) => update("country", e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("fields.capacity")}</Label>
              <Input type="number" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("fields.notes")}</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id={`shared-${venue.id}`} checked={form.isShared} onChange={(e) => update("isShared", e.target.checked)} className="rounded" />
              <Label htmlFor={`shared-${venue.id}`}>{t("fields.isShared")}</Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={isPending}>{t("cancel")}</Button>
              <Button type="submit" disabled={isPending}>{t("edit.submit")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" disabled={hasActivePrograms} title={hasActivePrograms ? t("delete.hasPrograms") : ""}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("delete.title")}</DialogTitle>
            <DialogDescription>{t("delete.confirm")}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t("cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>{t("delete.submit")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
