"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Rocket,
  Save,
} from "lucide-react";
import {
  updateProgramStatus,
  duplicateProgram,
  deleteProgram,
  saveAsTemplate,
} from "@/lib/actions/program-management";
import { toast } from "sonner";

interface ProgramActionsProps {
  teacherId: string;
  programId: string;
  status: string;
  programName: string;
  hasBookings: boolean;
}

export function ProgramActions({
  teacherId,
  programId,
  status,
  programName,
  hasBookings,
}: ProgramActionsProps) {
  const t = useTranslations("programs");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [templateName, setTemplateName] = useState(programName);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleStatusChange = (
    newStatus: "PUBLISHED" | "CANCELLED" | "COMPLETED"
  ) => {
    startTransition(async () => {
      const result = await updateProgramStatus(teacherId, programId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t(`toast.${newStatus.toLowerCase()}`));
        if (newStatus === "CANCELLED") setCancelDialogOpen(false);
      }
    });
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateProgram(teacherId, programId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("toast.duplicated"));
        router.push(`/dashboard/programs/${result.programId}`);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProgram(teacherId, programId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("toast.deleted"));
        router.push("/dashboard/programs");
      }
    });
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    startTransition(async () => {
      const result = await saveAsTemplate(
        teacherId,
        programId,
        templateName.trim()
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("toast.templateSaved"));
        setTemplateDialogOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Publish */}
      {status === "DRAFT" && (
        <Button
          onClick={() => handleStatusChange("PUBLISHED")}
          disabled={isPending}
          size="sm"
        >
          <Rocket className="mr-2 size-4" />
          {t("actions.publish")}
        </Button>
      )}

      {/* Complete */}
      {status === "PUBLISHED" && (
        <Button
          onClick={() => handleStatusChange("COMPLETED")}
          disabled={isPending}
          size="sm"
          variant="outline"
        >
          <CheckCircle className="mr-2 size-4" />
          {t("actions.complete")}
        </Button>
      )}

      {/* Duplicate */}
      <Button
        onClick={handleDuplicate}
        disabled={isPending}
        size="sm"
        variant="outline"
      >
        <Copy className="mr-2 size-4" />
        {t("actions.duplicate")}
      </Button>

      {/* Save as Template */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Save className="mr-2 size-4" />
            {t("actions.saveTemplate")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.saveTemplateTitle")}</DialogTitle>
            <DialogDescription>
              {t("actions.saveTemplateDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("actions.templateName")}</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveTemplate} disabled={isPending}>
              {t("actions.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel (Published only) */}
      {status === "PUBLISHED" && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <XCircle className="mr-2 size-4" />
              {t("actions.cancel")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("actions.cancelTitle")}</DialogTitle>
              <DialogDescription>
                {hasBookings
                  ? t("actions.cancelWithBookings")
                  : t("actions.cancelConfirm")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
                {t("actions.back")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusChange("CANCELLED")}
                disabled={isPending}
              >
                {t("actions.confirmCancel")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete (Draft only, no bookings) */}
      {status === "DRAFT" && !hasBookings && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-destructive">
              <Trash2 className="mr-2 size-4" />
              {t("actions.delete")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("actions.deleteTitle")}</DialogTitle>
              <DialogDescription>
                {t("actions.deleteConfirm")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                {t("actions.back")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {t("actions.confirmDelete")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
