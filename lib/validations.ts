import { z } from "zod"

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  visibility: z.enum(["private", "unlisted", "public"]).default("private"),
})

export const createProjectSchema = projectSchema.omit({ slug: true })
export const updateProjectSchema = projectSchema.partial()

export const stepSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  notes: z.string().nullable().optional(),
  language: z.string().min(1, "Language is required").default("typescript"),
  code: z.string().min(1, "Code is required"),
  index: z.number().int().min(0),
})

// For creating steps, allow empty code (user can fill it in later)
export const createStepSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  notes: z.string().nullable().optional(),
  language: z.string().min(1, "Language is required").default("typescript"),
  code: z.string().default(""), // Allow empty code when creating
})
export const updateStepSchema = stepSchema.partial()

export type ProjectFormData = z.infer<typeof projectSchema>
export type CreateProjectFormData = z.infer<typeof createProjectSchema>
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>
export type StepFormData = z.infer<typeof stepSchema>
export type CreateStepFormData = z.infer<typeof createStepSchema>
export type UpdateStepFormData = z.infer<typeof updateStepSchema>

