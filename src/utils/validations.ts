import { z } from 'zod';

export const loginSchema = z.object({
  Email: z.string().email("L'adresse email est invalide"),
  Password: z.string().min(4, "Le mot de passe doit contenir au moins 4 caractères")
});

export const signupSchema = z.object({
  FullName: z.string().min(2, "Le nom est trop court"),
  Email: z.string().email("L'adresse email est invalide"),
  Password: z.string().min(4, "Le mot de passe doit contenir au moins 4 caractères")
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
