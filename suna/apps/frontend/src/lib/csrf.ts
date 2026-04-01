/**
 * CSRF Token Generation and Validation
 * Protects against Cross-Site Request Forgery attacks on form submissions
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token and store in httpOnly cookie
 */
export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const cookieStore = await cookies();

  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  return token;
}

/**
 * Validate CSRF token from request against stored cookie
 */
export async function validateCsrfToken(requestToken: string | null): Promise<boolean> {
  if (!requestToken) return false;

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;

  if (!cookieToken) return false;

  return crypto.timingSafeEqual(
    Buffer.from(cookieToken, 'hex'),
    Buffer.from(requestToken, 'hex')
  );
}

/**
 * Extract CSRF token from request headers
 */
export function getCsrfTokenFromRequest(request: Request): string | null {
  return request.headers.get(CSRF_HEADER_NAME);
}
