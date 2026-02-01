import { z } from "zod";

// =============================================================================
// FILTER SCHEMA — for student list queries
// =============================================================================

export const studentFilterSchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  programId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

export type StudentFilterData = z.infer<typeof studentFilterSchema>;

// =============================================================================
// UPDATE STUDENT — edit contact info
// =============================================================================

export const updateStudentSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional().or(z.literal("")),
  whatsappPhone: z.string().min(10, "WhatsApp number must be at least 10 digits").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  emergencyContactName: z.string().optional().or(z.literal("")),
  emergencyContactRelation: z.string().optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
});

export type UpdateStudentData = z.infer<typeof updateStudentSchema>;

// =============================================================================
// UPDATE TAGS
// =============================================================================

export const updateStudentTagsSchema = z.object({
  tags: z.array(z.string().min(1).max(50)),
});

export type UpdateStudentTagsData = z.infer<typeof updateStudentTagsSchema>;

// =============================================================================
// UPDATE NOTES
// =============================================================================

export const updateStudentNotesSchema = z.object({
  notes: z.string().max(5000),
});

export type UpdateStudentNotesData = z.infer<typeof updateStudentNotesSchema>;
