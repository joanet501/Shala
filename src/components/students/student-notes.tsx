"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateStudentNotes } from "@/lib/actions/students";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface StudentNotesProps {
  teacherId: string;
  studentId: string;
  initialNotes: string;
}

export function StudentNotes({
  teacherId,
  studentId,
  initialNotes,
}: StudentNotesProps) {
  const t = useTranslations("students");
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();
  const hasChanges = notes !== initialNotes;

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateStudentNotes(teacherId, studentId, notes);
      if (result.error) {
        toast.error(t("toast.notesError"));
      } else {
        toast.success(t("toast.notesSuccess"));
      }
    });
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("detail.notesPlaceholder")}
        rows={5}
        className="resize-y"
        disabled={isPending}
      />
      <Button
        onClick={handleSave}
        disabled={isPending || !hasChanges}
        size="sm"
      >
        <Save className="mr-2 size-4" />
        {isPending ? t("detail.saving") : t("detail.saveNotes")}
      </Button>
    </div>
  );
}
