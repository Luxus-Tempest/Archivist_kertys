import { z } from 'zod';

export const instructionSchema = z.object({
  id: z.coerce.string(),
  classId: z.coerce.number({ message: "Veuillez sélectionner une classe" }),
  className: z.coerce.string().min(1, "Le nom de la classe est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  updatedAt: z.any().optional(),
});

export type InstructionFormData = z.infer<typeof instructionSchema>;
