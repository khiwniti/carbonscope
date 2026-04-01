'use client';

/**
 * HTML Sanitization Utilities using DOMPurify (browser-only).
 * Import only in 'use client' components.
 * Returns input unchanged when window is not available (SSR/build).
 */

import type { Config } from 'dompurify';

function getDOMPurify() {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require('dompurify');
  return DOMPurify.default ?? DOMPurify;
}

/**
 * Sanitize general HTML content.
 * Removes all scripts, event handlers, and dangerous attributes.
 * Returns empty string on server (no user-controlled content reaches SSR).
 */
export function sanitizeHTML(dirty: string): string {
  const purify = getDOMPurify();
  if (!purify) return '';

  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  });
}

/**
 * Sanitize tutorial embed code (iframes only).
 * SECURITY CRITICAL: Enforces strict iframe-only rendering with trusted domains.
 */
export function sanitizeTutorialEmbed(dirty: string): string {
  const purify = getDOMPurify();
  if (!purify) return '';

  const trustedDomains = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'player.vimeo.com',
    'loom.com',
    'figma.com',
    'miro.com',
    'mural.co',
  ];

  const sanitized = purify.sanitize(dirty, {
    ALLOWED_TAGS: ['iframe'],
    ALLOWED_ATTR: [
      'src', 'width', 'height', 'frameborder', 'allowfullscreen',
      'allow', 'title', 'loading', 'class', 'style',
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  });

  if (!sanitized.includes('<iframe')) return '';

  const srcMatch = sanitized.match(/src="([^"]+)"/);
  if (!srcMatch) return '';

  const src = srcMatch[1];
  if (!src.startsWith('https://')) return '';

  try {
    const url = new URL(src);
    const hostname = url.hostname.toLowerCase();
    const isTrusted = trustedDomains.some(
      domain => hostname === domain || hostname.endsWith(`.${domain}`)
    );
    if (!isTrusted) return '';
  } catch {
    return '';
  }

  return sanitized;
}

/**
 * Sanitize HTML with a custom DOMPurify configuration.
 */
export function sanitizeWithConfig(dirty: string, config: Config): string {
  const purify = getDOMPurify();
  if (!purify) return '';
  return purify.sanitize(dirty, config) as string;
}
