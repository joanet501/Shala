"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { HealthForm } from "./health-form";
import { createRegistration } from "@/lib/actions/registration";
import {
  type StudentRegistrationData,
  type HealthFormData,
  type CompleteRegistrationData,
} from "@/lib/validations/registration";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface RegistrationFormProps {
  programId: string;
  programName: string;
  teacherSlug: string;
  requiresHealthForm: boolean;
  isFree: boolean;
  allowPayAtVenue: boolean;
  price?: string;
  currency?: string;
}

export function RegistrationForm({
  programId,
  programName,
  teacherSlug,
  requiresHealthForm,
  isFree,
  allowPayAtVenue,
  price,
  currency = "USD",
}: RegistrationFormProps) {
  const router = useRouter();
  const t = useTranslations("registration");
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);

  // Calculate total steps
  const totalSteps = requiresHealthForm ? 4 : 3;

  // Step 1: Personal Information
  const [studentData, setStudentData] = useState<StudentRegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: undefined,
    phone: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
  });

  // Step 2: Health Form (conditional)
  const [healthFormData, setHealthFormData] = useState<HealthFormData>({
    howDidYouHear: "",
    previousYogaPractice: "",
    hasLearnedIshaYoga: false,
    ishaYogaPractices: "",
    healthConditions: [],
    conditionDetails: "",
    isPregnant: false,
    hadRecentSurgery: false,
    consentGiven: false,
  });

  // Step 3/4: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "BANK_TRANSFER" | "CASH" | "FREE">(
    isFree ? "FREE" : "ONLINE"
  );

  function validatePersonalInfo(): boolean {
    if (!studentData.firstName || studentData.firstName.length < 2) {
      toast.error(t("errors.firstNameMin"));
      return false;
    }
    if (!studentData.lastName || studentData.lastName.length < 2) {
      toast.error(t("errors.lastNameMin"));
      return false;
    }
    if (!studentData.email || !studentData.email.includes("@")) {
      toast.error(t("errors.emailInvalid"));
      return false;
    }
    if (!studentData.phone || studentData.phone.length < 10) {
      toast.error(t("errors.phoneMin"));
      return false;
    }
    if (!studentData.emergencyContactName || studentData.emergencyContactName.length < 2) {
      toast.error(t("errors.emergencyNameRequired"));
      return false;
    }
    if (!studentData.emergencyContactRelation) {
      toast.error(t("errors.emergencyRelationRequired"));
      return false;
    }
    if (!studentData.emergencyContactPhone || studentData.emergencyContactPhone.length < 10) {
      toast.error(t("errors.emergencyPhoneRequired"));
      return false;
    }
    return true;
  }

  function validateHealthForm(): boolean {
    if (!healthFormData.consentGiven) {
      toast.error(t("healthForm.consentRequired"));
      return false;
    }
    return true;
  }

  function handleNext() {
    if (currentStep === 1 && !validatePersonalInfo()) {
      return;
    }

    if (currentStep === 2 && requiresHealthForm && !validateHealthForm()) {
      return;
    }

    setCurrentStep(currentStep + 1);
  }

  function handleBack() {
    setCurrentStep(currentStep - 1);
  }

  function handleSubmit() {
    startTransition(async () => {
      const registrationData: CompleteRegistrationData = {
        programId,
        student: studentData,
        healthForm: requiresHealthForm ? healthFormData : undefined,
        paymentMethod,
      };

      const result = await createRegistration(registrationData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.message || t("booking.success"));
        // Redirect to confirmation page or show success message
        router.push(`/t/${teacherSlug}/booking/${result.bookingId}`);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex size-10 items-center justify-center rounded-full text-sm font-medium ${
                step < currentStep
                  ? "bg-green-600 text-white"
                  : step === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? <Check className="size-5" /> : step}
            </div>
            {step < totalSteps && (
              <div
                className={`h-0.5 w-12 ${step < currentStep ? "bg-green-600" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("steps.personal")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("personalInfo.firstName")} *</Label>
                <Input
                  id="firstName"
                  value={studentData.firstName}
                  onChange={(e) =>
                    setStudentData({ ...studentData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("personalInfo.lastName")} *</Label>
                <Input
                  id="lastName"
                  value={studentData.lastName}
                  onChange={(e) =>
                    setStudentData({ ...studentData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("personalInfo.email")} *</Label>
              <Input
                id="email"
                type="email"
                value={studentData.email}
                onChange={(e) =>
                  setStudentData({ ...studentData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t("personalInfo.dateOfBirth")}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={studentData.dateOfBirth}
                  onChange={(e) =>
                    setStudentData({ ...studentData, dateOfBirth: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">{t("personalInfo.gender")}</Label>
                <Select
                  value={studentData.gender}
                  onValueChange={(value) =>
                    setStudentData({
                      ...studentData,
                      gender: value as "MALE" | "FEMALE" | "OTHER",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">{t("personalInfo.genderMale")}</SelectItem>
                    <SelectItem value="FEMALE">{t("personalInfo.genderFemale")}</SelectItem>
                    <SelectItem value="OTHER">{t("personalInfo.genderOther")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("personalInfo.phone")} *</Label>
              <Input
                id="phone"
                type="tel"
                value={studentData.phone}
                onChange={(e) =>
                  setStudentData({ ...studentData, phone: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">
                {t("personalInfo.emergencyName")} *
              </Label>
              <Input
                id="emergencyContactName"
                value={studentData.emergencyContactName}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    emergencyContactName: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelation">{t("personalInfo.emergencyRelation")} *</Label>
                <Input
                  id="emergencyContactRelation"
                  value={studentData.emergencyContactRelation}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      emergencyContactRelation: e.target.value,
                    })
                  }
                  placeholder={t("personalInfo.relationPlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">{t("personalInfo.emergencyPhone")} *</Label>
                <Input
                  id="emergencyContactPhone"
                  type="tel"
                  value={studentData.emergencyContactPhone}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      emergencyContactPhone: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Health Form (if required) */}
      {currentStep === 2 && requiresHealthForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t("steps.health")}</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthForm
              value={healthFormData}
              onChange={setHealthFormData}
              gender={studentData.gender}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 3/4: Payment Method */}
      {currentStep === (requiresHealthForm ? 3 : 2) && (
        <Card>
          <CardHeader>
            <CardTitle>{t("payment.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t("payment.total")}:</span>
                <span className="text-2xl font-bold">
                  {isFree ? t("payment.free") : `${price} ${currency}`}
                </span>
              </div>
            </div>

            {!isFree && (
              <div className="space-y-3">
                <Label>{t("payment.selectMethod")}</Label>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer rounded-lg border p-4 hover:bg-muted/50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      className="size-4"
                    />
                    <div>
                      <div className="font-medium">{t("payment.online")}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("payment.onlineDesc")}
                      </div>
                    </div>
                  </label>

                  {allowPayAtVenue && (
                    <label className="flex items-center gap-3 cursor-pointer rounded-lg border p-4 hover:bg-muted/50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CASH"
                        checked={paymentMethod === "CASH"}
                        onChange={() => setPaymentMethod("CASH")}
                        className="size-4"
                      />
                      <div>
                        <div className="font-medium">{t("payment.atVenue")}</div>
                        <div className="text-sm text-muted-foreground">
                          {t("payment.atVenueDesc")}
                        </div>
                      </div>
                    </label>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer rounded-lg border p-4 hover:bg-muted/50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={() => setPaymentMethod("BANK_TRANSFER")}
                      className="size-4"
                    />
                    <div>
                      <div className="font-medium">{t("payment.bankTransfer")}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("payment.bankTransferDesc")}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === totalSteps && (
        <Card>
          <CardHeader>
            <CardTitle>{t("review.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t("review.program")}</h3>
              <p className="text-sm text-muted-foreground">{programName}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t("review.participant")}</h3>
              <p className="text-sm">
                {studentData.firstName} {studentData.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{studentData.email}</p>
              <p className="text-sm text-muted-foreground">{studentData.phone}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t("review.payment")}</h3>
              <p className="text-sm">
                {isFree
                  ? t("payment.free")
                  : paymentMethod === "ONLINE"
                    ? t("payment.online")
                    : paymentMethod === "CASH"
                      ? t("payment.atVenue")
                      : t("payment.bankTransfer")}
              </p>
              {!isFree && (
                <p className="text-sm text-muted-foreground">
                  {t("payment.total")}: {price} {currency}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isPending}
          >
            <ChevronLeft className="mr-2 size-4" />
            {t("buttons.back")}
          </Button>
        )}

        {currentStep < totalSteps && (
          <Button
            type="button"
            onClick={handleNext}
            className="ml-auto"
            disabled={isPending}
          >
            {t("buttons.next")}
            <ChevronRight className="ml-2 size-4" />
          </Button>
        )}

        {currentStep === totalSteps && (
          <Button
            type="button"
            onClick={handleSubmit}
            className="ml-auto"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("buttons.processing")}
              </>
            ) : (
              t("buttons.confirm")
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
