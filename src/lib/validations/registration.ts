import { z } from "zod";

export const studentRegistrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactRelation: z.string().min(2, "Emergency contact relation is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
});

export const healthFormSchema = z.object({
  // General Information
  howDidYouHear: z.string().optional(),
  previousYogaPractice: z.string().optional(),
  hasLearnedIshaYoga: z.boolean(),
  ishaYogaPractices: z.string().optional(),

  // Health Conditions
  healthConditions: z.array(z.string()).default([]),
  conditionDetails: z.string().optional(),

  // Specific Questions
  isPregnant: z.boolean(),
  hadRecentSurgery: z.boolean(),

  // Consent
  consentGiven: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export const completeRegistrationSchema = z.object({
  programId: z.string().uuid(),
  student: studentRegistrationSchema,
  healthForm: healthFormSchema.optional(),
  paymentMethod: z.enum(["ONLINE", "BANK_TRANSFER", "CASH", "FREE"]),
});

export type StudentRegistrationData = z.infer<typeof studentRegistrationSchema>;
export type HealthFormData = z.infer<typeof healthFormSchema>;
export type CompleteRegistrationData = z.infer<typeof completeRegistrationSchema>;

// Health condition options matching the form
export const HEALTH_CONDITIONS = [
  { value: "physical_disability", label: "Discapacidad física" },
  { value: "injury_3y", label: "Lesión en los últimos tres años" },
  { value: "surgery_3y", label: "Cirugía en los últimos tres años" },
  { value: "osteoporosis", label: "Osteoporosis" },
  { value: "arthritis", label: "Artritis" },
  { value: "hernia", label: "Hernia" },
  { value: "dislocations", label: "Dislocaciones" },
  { value: "joint_replacement", label: "Reemplazo de articulaciones" },
  { value: "spine_condition", label: "Afección de la columna vertebral" },
  { value: "heart_condition", label: "Afección cardíaca" },
  { value: "stroke", label: "Accidente cerebrovascular" },
  { value: "high_blood_pressure", label: "Presión arterial alta" },
  { value: "low_blood_pressure", label: "Presión arterial baja" },
  { value: "asthma", label: "Asma / Afección respiratoria" },
  { value: "chronic_pain", label: "Dolor crónico" },
  { value: "seizures", label: "Convulsiones / Epilepsia" },
  { value: "anemia", label: "Anemia" },
  { value: "glaucoma", label: "Glaucoma" },
  { value: "contagious_disease", label: "Enfermedad contagiosa" },
  { value: "endocrine_condition", label: "Afección endocrina" },
  { value: "diabetes", label: "Diabetes / Hipoglucemia" },
  { value: "digestive_condition", label: "Acidez, úlcera péptica o afecciones intestinales" },
  { value: "urinary_condition", label: "Afección urinaria" },
  { value: "allergy", label: "Alergia" },
  { value: "depression", label: "Depresión" },
  { value: "anxiety", label: "Ansiedad" },
  { value: "therapy_5y", label: "Terapia psicológica o asesoramiento en los últimos 5 años" },
  { value: "substance_treatment_5y", label: "Programa de tratamiento por consumo de alcohol o sustancias en los últimos 5 años" },
] as const;
