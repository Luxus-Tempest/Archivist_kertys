import { z } from 'zod';
import type { TFunction } from 'i18next';

export const loginSchema = (t: TFunction) => z.object({
  Email: z.string().email(t("invalidEmail")),
  Password: z.string().min(4, t("passwordTooShort"))
});

// Step 1: Organization info
export const signupOrgSchema = (t: TFunction) => z.object({
  OrgName: z.string().min(2, t("orgNameTooShort", "Organization name is too short")),
  OrgEmail: z.string().email(t("invalidEmail")),
  Domain: z.string().min(2, t("domainTooShort", "Domain is too short")),
});

// Step 2: User info
export const signupUserSchema = (t: TFunction) => z.object({
  FullName: z.string().min(2, t("nameTooShort")),
  Email: z.string().email(t("invalidEmail")),
  Password: z.string().min(4, t("passwordTooShort"))
});

// Combined schema for the full signup
export const signupSchema = (t: TFunction) => signupOrgSchema(t).merge(signupUserSchema(t));

export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;
export type SignupFormData = z.infer<ReturnType<typeof signupSchema>>;
export type SignupOrgFormData = z.infer<ReturnType<typeof signupOrgSchema>>;
export type SignupUserFormData = z.infer<ReturnType<typeof signupUserSchema>>;
