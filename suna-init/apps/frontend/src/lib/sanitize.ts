/**
 * HTML Sanitization Utility
 * Protects against XSS attacks by sanitizing HTML content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this instead of dangerouslySetInnerHTML
 */
export function sanitizeHtml(
  html: string,
  options?: DOMPurify.Config
): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote', 'img', 'div', 'span',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'class', 'id'],
    ...options
  });
}

/**
 * Get sanitized HTML object for dangerouslySetInnerHTML
 * @example <div dangerouslySetInnerHTML={getSafeHtml(userContent)} />
 */
export function getSafeHtml(html: string, options?: DOMPurify.Config) {
  return { __html: sanitizeHtml(html, options) };
}
