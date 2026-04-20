import { z } from 'zod';
import type { TFunction } from 'i18next';

export const loginSchema = (t: TFunction) => z.object({
  Email: z.string().email(t("invalidEmail")),
  Password: z.string().min(4, t("passwordTooShort"))
});

export const signupSchema = (t: TFunction) => z.object({
  FullName: z.string().min(2, t("nameTooShort")),
  Email: z.string().email(t("invalidEmail")),
  Password: z.string().min(4, t("passwordTooShort"))
});

export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;
export type SignupFormData = z.infer<ReturnType<typeof signupSchema>>;
