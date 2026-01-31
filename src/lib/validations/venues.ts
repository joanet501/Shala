import { z } from "zod";

export const createVenueSchema = z.object({
  teacherId: z.string().uuid(),
  name: z.string().min(2, "Venue name must be at least 2 characters").max(100),
  address: z.string().min(5, "Address must be at least 5 characters").max(500),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  saveForReuse: z.boolean().default(true),
});

export type CreateVenueData = z.infer<typeof createVenueSchema>;
