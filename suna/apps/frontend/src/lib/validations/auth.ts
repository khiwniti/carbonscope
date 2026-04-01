import { z } from 'zod';

/**
 * Zod validation schemas for authentication forms.
 */

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')
  .toLowerCase()
  .trim();

export const otpSchema = z
  .string()
  .min(6, 'Verification code must be 6 digits')
  .max(6, 'Verification code must be 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only digits');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const signInSchema = z.object({
  email: emailSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const otpVerifySchema = z.object({
  email: emailSchema,
  token: otpSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

/**
 * Validate email from FormData and return error message if invalid.
 */
export function validateEmail(email: string): string | null {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return result.error.errors[0]?.message ?? 'Invalid email';
  }
  return null;
}

/**
 * Validate OTP token from FormData and return error message if invalid.
 */
export function validateOtp(token: string): string | null {
  const result = otpSchema.safeParse(token);
  if (!result.success) {
    return result.error.errors[0]?.message ?? 'Invalid code';
  }
  return null;
}
