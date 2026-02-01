"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface StudentFiltersProps {
  allTags: string[];
}

export function StudentFilters({ allTags }: StudentFiltersProps) {
  const t = useTranslations("students");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") ?? "";
  const currentTag = searchParams.get("tag") ?? "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filtering
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams, startTransition]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          defaultValue={currentSearch}
          onChange={(e) => {
            // Debounce search
            const value = e.target.value;
            const timeout = setTimeout(() => updateParams("search", value), 300);
            return () => clearTimeout(timeout);
          }}
          className={`pl-9 ${isPending ? "opacity-70" : ""}`}
        />
      </div>

      {allTags.length > 0 && (
        <Select
          value={currentTag || "all"}
          onValueChange={(value) =>
            updateParams("tag", value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("filterByTag")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTags")}</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
