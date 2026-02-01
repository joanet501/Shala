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
import { Plus } from "lucide-react";
import { createVenue } from "@/lib/actions/venues";
import { toast } from "sonner";

interface CreateVenueDialogProps {
  teacherId: string;
}

export function CreateVenueDialog({ teacherId }: CreateVenueDialogProps) {
  const t = useTranslations("venues");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    capacity: "",
    notes: "",
    isShared: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createVenue(teacherId, {
        name: form.name,
        address: form.address,
        city: form.city,
        country: form.country,
        capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
        notes: form.notes || undefined,
        isShared: form.isShared,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("toast.created"));
        setOpen(false);
        setForm({ name: "", address: "", city: "", country: "", capacity: "", notes: "", isShared: false });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          {t("addVenue")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("create.title")}</DialogTitle>
          <DialogDescription>{t("create.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Input type="number" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} placeholder={t("fields.capacityPlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label>{t("fields.notes")}</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder={t("fields.notesPlaceholder")} rows={3} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isShared" checked={form.isShared} onChange={(e) => update("isShared", e.target.checked)} className="rounded" />
            <Label htmlFor="isShared">{t("fields.isShared")}</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>{t("cancel")}</Button>
            <Button type="submit" disabled={isPending}>{t("create.submit")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
