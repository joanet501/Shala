"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HEALTH_CONDITIONS, type HealthFormData } from "@/lib/validations/registration";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface HealthFormProps {
  value: HealthFormData;
  onChange: (data: HealthFormData) => void;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export function HealthForm({ value, onChange, gender }: HealthFormProps) {
  const t = useTranslations("registration.healthForm");
  const tc = useTranslations("healthConditions");
  const [otherCondition, setOtherCondition] = useState("");

  const handleConditionToggle = (conditionValue: string) => {
    const updated = value.healthConditions.includes(conditionValue)
      ? value.healthConditions.filter((c) => c !== conditionValue)
      : [...value.healthConditions, conditionValue];

    onChange({ ...value, healthConditions: updated });
  };

  return (
    <div className="space-y-6">
      {/* General Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("generalInfo")}</h3>

        <div className="space-y-2">
          <Label htmlFor="howDidYouHear">{t("howDidYouHear")}</Label>
          <Textarea
            id="howDidYouHear"
            value={value.howDidYouHear || ""}
            onChange={(e) =>
              onChange({ ...value, howDidYouHear: e.target.value })
            }
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="previousYogaPractice">{t("previousYoga")}</Label>
          <Textarea
            id="previousYogaPractice"
            value={value.previousYogaPractice || ""}
            onChange={(e) =>
              onChange({ ...value, previousYogaPractice: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="space-y-3">
          <Label>{t("learnedIsha")}</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasLearnedIshaYoga"
                checked={value.hasLearnedIshaYoga === true}
                onChange={() =>
                  onChange({ ...value, hasLearnedIshaYoga: true })
                }
                className="size-4"
              />
              <span>{t("yes")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasLearnedIshaYoga"
                checked={value.hasLearnedIshaYoga === false}
                onChange={() =>
                  onChange({ ...value, hasLearnedIshaYoga: false })
                }
                className="size-4"
              />
              <span>{t("no")}</span>
            </label>
          </div>
        </div>

        {value.hasLearnedIshaYoga && (
          <div className="space-y-2">
            <Label htmlFor="ishaYogaPractices">{t("whichPractices")}</Label>
            <Textarea
              id="ishaYogaPractices"
              value={value.ishaYogaPractices || ""}
              onChange={(e) =>
                onChange({ ...value, ishaYogaPractices: e.target.value })
              }
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Health Status */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{t("healthConditionsTitle")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("healthConditionsDesc")}
          </p>
        </div>

        <div className="space-y-3">
          <Label>{t("healthConditionsQuestion")}</Label>
          <div className="grid gap-2">
            {HEALTH_CONDITIONS.map((condition) => (
              <label
                key={condition.value}
                className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={value.healthConditions.includes(condition.value)}
                  onChange={() => handleConditionToggle(condition.value)}
                  className="size-4"
                />
                <span className="text-sm">{tc(condition.value)}</span>
              </label>
            ))}

            {/* Other option */}
            <div className="flex items-start gap-2 rounded-lg border p-3">
              <input
                type="checkbox"
                checked={value.healthConditions.includes("other")}
                onChange={() => handleConditionToggle("other")}
                className="mt-1 size-4"
              />
              <div className="flex-1 space-y-2">
                <span className="text-sm">{t("other")}:</span>
                <input
                  type="text"
                  value={otherCondition}
                  onChange={(e) => {
                    setOtherCondition(e.target.value);
                    if (e.target.value && !value.healthConditions.includes("other")) {
                      handleConditionToggle("other");
                    }
                  }}
                  placeholder="Especifica..."
                  className="w-full rounded border px-3 py-1 text-sm"
                  disabled={!value.healthConditions.includes("other")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="conditionDetails">{t("conditionDetails")}</Label>
          <Textarea
            id="conditionDetails"
            value={value.conditionDetails || ""}
            onChange={(e) =>
              onChange({ ...value, conditionDetails: e.target.value })
            }
            rows={3}
          />
        </div>

        {/* Pregnancy question - only show for females */}
        {gender === "FEMALE" && (
          <div className="space-y-3">
            <Label>{t("pregnant")}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isPregnant"
                  checked={value.isPregnant === true}
                  onChange={() => onChange({ ...value, isPregnant: true })}
                  className="size-4"
                />
                <span>{t("yes")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isPregnant"
                  checked={value.isPregnant === false}
                  onChange={() => onChange({ ...value, isPregnant: false })}
                  className="size-4"
                />
                <span>{t("no")}</span>
              </label>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label>{t("recentSurgery")}</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hadRecentSurgery"
                checked={value.hadRecentSurgery === true}
                onChange={() =>
                  onChange({ ...value, hadRecentSurgery: true })
                }
                className="size-4"
              />
              <span>{t("yes")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hadRecentSurgery"
                checked={value.hadRecentSurgery === false}
                onChange={() =>
                  onChange({ ...value, hadRecentSurgery: false })
                }
                className="size-4"
              />
              <span>{t("no")}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Consent */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("agreement")}</h3>
        <label className="flex items-start gap-3 cursor-pointer rounded-lg border p-4 hover:bg-muted/50">
          <input
            type="checkbox"
            checked={value.consentGiven}
            onChange={(e) =>
              onChange({ ...value, consentGiven: e.target.checked })
            }
            className="mt-1 size-4 shrink-0"
          />
          <span className="text-sm">{t("consentText")}</span>
        </label>
        {!value.consentGiven && (
          <p className="text-xs text-destructive">{t("consentRequired")}</p>
        )}
      </div>
    </div>
  );
}
