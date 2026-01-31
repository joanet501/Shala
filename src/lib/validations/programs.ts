import { z } from "zod";

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_PROGRAM_SLUGS = [
  "new",
  "edit",
  "settings",
  "bookings",
  "students",
  "create",
  "all",
  "upcoming",
  "past",
  "draft",
  "published",
];

export const sessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  title: z.string().min(1).max(100),
});

export const newVenueSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  saveForReuse: z.boolean(),
});

export const createProgramSchema = z
  .object({
    teacherId: z.string().uuid(),
    templateId: z.string().uuid(),
    name: z
      .string()
      .min(3, "Program name must be at least 3 characters")
      .max(100, "Program name must be at most 100 characters"),
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(50, "Slug must be at most 50 characters")
      .regex(
        SLUG_REGEX,
        "Slug can only contain lowercase letters, numbers, and hyphens"
      )
      .refine(
        (val) => !RESERVED_PROGRAM_SLUGS.includes(val),
        "This slug is reserved"
      ),
    description: z.string().max(2000).optional(),

    venueType: z.enum(["IN_PERSON", "ONLINE", "HYBRID"]),
    venueId: z.string().uuid().optional(),
    newVenue: newVenueSchema.optional(),

    onlineMeetingProvider: z
      .enum(["ZOOM", "GOOGLE_MEET", "CUSTOM"])
      .optional(),
    onlineMeetingUrl: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === "") return true;
          // Check if it's a valid URL with or without protocol
          const urlWithProtocol = /^https?:\/\//i.test(val)
            ? val
            : `https://${val}`;
          try {
            new URL(urlWithProtocol);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Please enter a valid URL" }
      )
      .transform((val) => {
        if (!val || val === "") return undefined;
        // Add https:// if no protocol is present
        if (!/^https?:\/\//i.test(val)) {
          return `https://${val}`;
        }
        return val;
      }),

    sessions: z.array(sessionSchema).min(1, "At least one session is required"),
    registrationDeadline: z.string().datetime().optional(),

    capacity: z.number().int().positive().optional(),
    isFree: z.boolean(),
    priceAmount: z.number().positive().optional(),
    priceCurrency: z.string().length(3),
    allowPayAtVenue: z.boolean(),

    notes: z.string().max(2000).optional(),
    whatToBring: z.string().max(2000).optional(),
    preparationInstructions: z.string().max(2000).optional(),
    requiresHealthForm: z.boolean(),

    status: z.enum(["DRAFT", "PUBLISHED"]),
  })
  .refine(
    (data) => data.isFree || (data.priceAmount && data.priceAmount > 0),
    {
      message: "Price is required for paid programs",
      path: ["priceAmount"],
    }
  )
  .refine(
    (data) => {
      if (data.venueType === "IN_PERSON" || data.venueType === "HYBRID") {
        return data.venueId || data.newVenue;
      }
      return true;
    },
    {
      message: "Venue is required for in-person programs",
      path: ["venueId"],
    }
  )
  .refine(
    (data) => {
      if (data.venueType === "ONLINE" || data.venueType === "HYBRID") {
        return data.onlineMeetingProvider && data.onlineMeetingUrl;
      }
      return true;
    },
    {
      message: "Meeting details are required for online programs",
      path: ["onlineMeetingProvider"],
    }
  );

export type CreateProgramData = z.infer<typeof createProgramSchema>;
