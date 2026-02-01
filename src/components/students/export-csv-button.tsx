"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportStudentsCSV } from "@/lib/actions/students";
import { toast } from "sonner";

interface ExportCsvButtonProps {
  teacherId: string;
}

export function ExportCsvButton({ teacherId }: ExportCsvButtonProps) {
  const t = useTranslations("students");
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      try {
        const csv = await exportStudentsCSV(teacherId);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        toast.error(t("toast.exportError"));
      }
    });
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isPending}>
      <Download className="mr-2 size-4" />
      {t("exportCsv")}
    </Button>
  );
}
