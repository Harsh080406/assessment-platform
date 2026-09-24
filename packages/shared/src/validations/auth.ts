import { z } from "zod";

export const SignUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(50, "First name is too long"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(50, "Last name is too long"),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof SignUpSchema>;

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

export const PhoneRequestOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(
      /^\+?[0-9\s\-()]{8,20}$/,
      "Please enter a valid phone number (e.g. +1 555-0199 or +91 9876543210)"
    ),
});

export type PhoneRequestOtpInput = z.infer<typeof PhoneRequestOtpSchema>;

export const PhoneVerifyOtpSchema = z.object({
  phone: z.string().trim().min(8, "Phone number is required"),
  code: z
    .string()
    .trim()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^[0-9]{6}$/, "Code must contain numbers only"),
});

export type PhoneVerifyOtpInput = z.infer<typeof PhoneVerifyOtpSchema>;

export const EmailRequestOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),
});

export type EmailRequestOtpInput = z.infer<typeof EmailRequestOtpSchema>;

export const EmailVerifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),
  code: z
    .string()
    .trim()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^[0-9]{6}$/, "Code must contain numbers only"),
});

export type EmailVerifyOtpInput = z.infer<typeof EmailVerifyOtpSchema>;
