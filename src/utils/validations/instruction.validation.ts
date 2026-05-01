import { z } from 'zod';

export const instructionSchema = z.object({
  id: z.string(),
  classId: z.number({ message: "Veuillez sélectionner une classe" }),
  className: z.string().min(1, "Le nom de la classe est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  updatedAt: z.string().optional(),
});

export type InstructionFormData = z.infer<typeof instructionSchema>;
