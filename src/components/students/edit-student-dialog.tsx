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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { updateStudent } from "@/lib/actions/students";
import { toast } from "sonner";
import type { UpdateStudentData } from "@/lib/validations/students";

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  whatsappPhone: string | null;
  dateOfBirth: Date | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  emergencyContactName: string | null;
  emergencyContactRelation: string | null;
  emergencyContactPhone: string | null;
}

interface EditStudentDialogProps {
  teacherId: string;
  student: StudentData;
}

export function EditStudentDialog({
  teacherId,
  student,
}: EditStudentDialogProps) {
  const t = useTranslations("students");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<UpdateStudentData>({
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phone: student.phone ?? "",
    whatsappPhone: student.whatsappPhone ?? "",
    dateOfBirth: student.dateOfBirth
      ? student.dateOfBirth.toISOString().split("T")[0]
      : "",
    gender: student.gender ?? null,
    emergencyContactName: student.emergencyContactName ?? "",
    emergencyContactRelation: student.emergencyContactRelation ?? "",
    emergencyContactPhone: student.emergencyContactPhone ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateStudent(teacherId, student.id, formData);
      if (result.error) {
        toast.error(t("toast.updateError"));
      } else {
        toast.success(t("toast.updateSuccess"));
        setOpen(false);
      }
    });
  };

  const updateField = (field: keyof UpdateStudentData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 size-4" />
          {t("detail.edit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("detail.editStudent")}</DialogTitle>
          <DialogDescription>
            {t("detail.editStudentDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("detail.firstName")}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("detail.lastName")}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("detail.email")}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("detail.phone")}</Label>
              <Input
                id="phone"
                value={formData.phone ?? ""}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappPhone">{t("detail.whatsapp")}</Label>
              <Input
                id="whatsappPhone"
                value={formData.whatsappPhone ?? ""}
                onChange={(e) => updateField("whatsappPhone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t("detail.dateOfBirth")}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth ?? ""}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">{t("detail.gender")}</Label>
              <Select
                value={formData.gender ?? "none"}
                onValueChange={(value) =>
                  updateField(
                    "gender",
                    value === "none" ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-</SelectItem>
                  <SelectItem value="MALE">
                    {t("detail.genderMale")}
                  </SelectItem>
                  <SelectItem value="FEMALE">
                    {t("detail.genderFemale")}
                  </SelectItem>
                  <SelectItem value="OTHER">
                    {t("detail.genderOther")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">
              {t("detail.emergencyContact")}
            </Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName ?? ""}
              onChange={(e) =>
                updateField("emergencyContactName", e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelation">
                {t("detail.emergencyRelation")}
              </Label>
              <Input
                id="emergencyContactRelation"
                value={formData.emergencyContactRelation ?? ""}
                onChange={(e) =>
                  updateField("emergencyContactRelation", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">
                {t("detail.emergencyPhone")}
              </Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone ?? ""}
                onChange={(e) =>
                  updateField("emergencyContactPhone", e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {t("pagination.previous")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t("detail.saveChanges")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
