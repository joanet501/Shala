import { z } from "zod";

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_SLUGS = [
  "admin",
  "api",
  "auth",
  "dashboard",
  "login",
  "register",
  "onboarding",
  "settings",
  "help",
  "support",
  "about",
  "terms",
  "privacy",
  "blog",
  "pricing",
  "shala",
];

export const AVAILABLE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ru", label: "Russian" },
  { code: "ar", label: "Arabic" },
] as const;

export const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  slug: z
    .string()
    .min(3, "URL must be at least 3 characters")
    .max(40, "URL must be at most 40 characters")
    .regex(
      SLUG_REGEX,
      "URL can only contain lowercase letters, numbers, and hyphens"
    )
    .refine((val) => !RESERVED_SLUGS.includes(val), "This URL is reserved"),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100, "City name is too long"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country name is too long"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  photoUrl: z.string().url().nullable().optional(),
  bio: z
    .string()
    .trim()
    .max(500, "Bio must be at most 500 characters")
    .optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
