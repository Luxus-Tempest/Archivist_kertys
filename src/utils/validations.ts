import { z } from 'zod';
import type { TFunction } from 'i18next';
import { UserRoleEnum, UserStatusEnum } from '../types/auth';

export const loginSchema = (t: TFunction) => z.object({
  Email: z.string().email(t("invalidEmail")),
  Password: z.string().min(4, t("passwordTooShort")),
  OrganizationId: z.string().optional()
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
export type SignupFormData = z.infer<ReturnType<typeof signupSchema>>; //create organization + default admin user
export type SignupOrgFormData = z.infer<ReturnType<typeof signupOrgSchema>>; //create organization only
export type SignupUserFormData = z.infer<ReturnType<typeof signupUserSchema>>; //create user only 

export const forgotPasswordSchema = (t: TFunction) => z.object({
  Email: z.string().email(t("invalidEmail")),
  OrganizationId: z.string().optional(),
});

export type ForgotPasswordFormData = z.infer<ReturnType<typeof forgotPasswordSchema>>;

export const resetPasswordSchema = (t: TFunction) => z.object({
  Password: z.string().min(4, t("passwordTooShort")),
  ConfirmPassword: z.string().min(4, t("passwordTooShort")),
}).refine((data) => data.Password === data.ConfirmPassword, {
  message: t("passwordsMustMatch", "Les mots de passe ne correspondent pas"),
  path: ["ConfirmPassword"],
});

export type ResetPasswordFormData = z.infer<ReturnType<typeof resetPasswordSchema>>;




// Admin invite user
export const inviteUserSchema = (t: TFunction) => z.object({
  email: z.string().email(t("invalidEmail")),
  role: z.enum(UserRoleEnum),
  status: z.enum(UserStatusEnum),
});

// create user by admin 
// create user by admin 
export const createUserByAdminSchema = (t: TFunction) => z.object({
  Email: z.string().email(t("invalidEmail")),
  FullName: z.string().min(2, t("nameTooShort")),
  Password: z.string().min(4, t("passwordTooShort")),
  Role: z.enum(UserRoleEnum),
  Status: z.enum(UserStatusEnum),
});

export type InviteUserFormData = z.infer<ReturnType<typeof inviteUserSchema>>;
export type CreateUserByAdminFormData = z.infer<ReturnType<typeof createUserByAdminSchema>>;