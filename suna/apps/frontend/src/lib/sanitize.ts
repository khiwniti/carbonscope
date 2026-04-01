'use client';

/**
 * HTML Sanitization Utilities using DOMPurify.
 * Browser-only — returns safe fallback on server (SSR).
 * Import only in 'use client' components.
 */

import type DOMPurifyType from 'dompurify';

type DOMPurifyConfig = DOMPurifyType.Config;

function getPurify(): typeof DOMPurifyType | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('dompurify');
  return mod.default ?? mod;
}

const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote', 'img', 'div', 'span',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const DEFAULT_ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'src', 'alt', 'class', 'id'];

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this instead of dangerouslySetInnerHTML with raw strings.
 */
export function sanitizeHtml(html: string, options?: DOMPurifyConfig): string {
  const purify = getPurify();
  if (!purify) return '';
  return purify.sanitize(html, {
    ALLOWED_TAGS: DEFAULT_ALLOWED_TAGS,
    ALLOWED_ATTR: DEFAULT_ALLOWED_ATTR,
    ...options,
  }) as string;
}

/**
 * Get sanitized HTML object for dangerouslySetInnerHTML.
 * @example <div dangerouslySetInnerHTML={getSafeHtml(userContent)} />
 */
export function getSafeHtml(html: string, options?: DOMPurifyConfig) {
  return { __html: sanitizeHtml(html, options) };
}

/**
 * Sanitize tutorial embed code — iframes only, restricted to trusted domains.
 * SECURITY CRITICAL: Enforces strict iframe-only rendering.
 */
export function sanitizeTutorialEmbed(dirty: string): string {
  const purify = getPurify();
  if (!purify) return '';

  const trustedDomains = [
    'youtube.com', 'youtu.be',
    'vimeo.com', 'player.vimeo.com',
    'loom.com', 'figma.com', 'miro.com', 'mural.co',
    'demo.arcade.software',
  ];

  const sanitized = purify.sanitize(dirty, {
    ALLOWED_TAGS: ['div', 'iframe'],
    ALLOWED_ATTR: [
      'src', 'width', 'height', 'frameborder', 'allowfullscreen',
      'allow', 'title', 'loading', 'class', 'style',
      'webkitallowfullscreen', 'mozallowfullscreen',
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  }) as string;

  // Validate all iframe src domains
  const srcMatches = [...sanitized.matchAll(/src="([^"]+)"/g)];
  for (const match of srcMatches) {
    const src = match[1];
    if (!src.startsWith('https://')) return '';
    try {
      const url = new URL(src);
      const hostname = url.hostname.toLowerCase();
      const isTrusted = trustedDomains.some(
        d => hostname === d || hostname.endsWith(`.${d}`)
      );
      if (!isTrusted) return '';
    } catch {
      return '';
    }
  }

  return sanitized;
}

/**
 * Sanitize general HTML content — alias kept for backwards compat.
 */
export const sanitizeHTML = sanitizeHtml;
