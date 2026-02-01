"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StudentPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}

export function StudentPagination({
  page,
  totalPages,
  total,
  perPage,
}: StudentPaginationProps) {
  const t = useTranslations("students");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {t("pagination.showing", { from, to, total })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="mr-1 size-4" />
          {t("pagination.previous")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("pagination.page", { page, totalPages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          {t("pagination.next")}
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
