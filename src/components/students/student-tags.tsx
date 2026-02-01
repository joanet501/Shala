"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { updateStudentTags } from "@/lib/actions/students";
import { toast } from "sonner";

interface StudentTagsProps {
  teacherId: string;
  studentId: string;
  initialTags: string[];
}

export function StudentTags({
  teacherId,
  studentId,
  initialTags,
}: StudentTagsProps) {
  const t = useTranslations("students");
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setNewTag("");
      return;
    }

    const updatedTags = [...tags, trimmed];
    setTags(updatedTags);
    setNewTag("");

    startTransition(async () => {
      const result = await updateStudentTags(teacherId, studentId, updatedTags);
      if (result.error) {
        setTags(tags); // Revert
        toast.error(t("toast.tagsError"));
      } else {
        toast.success(t("toast.tagsSuccess"));
      }
    });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);

    startTransition(async () => {
      const result = await updateStudentTags(teacherId, studentId, updatedTags);
      if (result.error) {
        setTags(tags); // Revert
        toast.error(t("toast.tagsError"));
      } else {
        toast.success(t("toast.tagsSuccess"));
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("detail.noTags")}</p>
        )}
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              disabled={isPending}
              className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          placeholder={t("detail.addTag")}
          className="h-8 text-sm"
          disabled={isPending}
        />
        <Button
          onClick={handleAddTag}
          disabled={isPending || !newTag.trim()}
          size="sm"
          variant="outline"
          className="h-8"
        >
          <Plus className="mr-1 size-3" />
          {t("detail.addTagButton")}
        </Button>
      </div>
    </div>
  );
}
