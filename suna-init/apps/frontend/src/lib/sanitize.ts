/**
 * HTML Sanitization Utility
 * Protects against XSS attacks by sanitizing HTML content.
 * Browser-only: uses window guard to avoid SSR jsdom dependency.
 */

import type { Config } from 'dompurify';

function getPurify() {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('dompurify');
  return (mod.default ?? mod) as typeof import('dompurify').default;
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this instead of dangerouslySetInnerHTML with raw strings.
 */
export function sanitizeHtml(html: string, options?: Config): string {
  const purify = getPurify();
  if (!purify) return '';
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote', 'img', 'div', 'span',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'class', 'id'],
    ...options
  }) as string;
}

/**
 * Get sanitized HTML object for dangerouslySetInnerHTML.
 * @example <div dangerouslySetInnerHTML={getSafeHtml(userContent)} />
 */
export function getSafeHtml(html: string, options?: Config) {
  return { __html: sanitizeHtml(html, options) };
}
