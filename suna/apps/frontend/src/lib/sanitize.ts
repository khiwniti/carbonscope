/**
 * HTML Sanitization Utilities using DOMPurify
 * Prevents XSS attacks by sanitizing user-controlled HTML content
 */

import DOMPurify, { type Config } from 'isomorphic-dompurify';

/**
 * Sanitize general HTML content
 * Removes all scripts, event handlers, and dangerous attributes
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  });
}

/**
 * Sanitize tutorial embed code (iframes only)
 * SECURITY CRITICAL: Enforces strict iframe-only rendering with trusted domains
 */
export function sanitizeTutorialEmbed(dirty: string): string {
  // Trusted domains for iframe embeds
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

  // First sanitization pass - allow iframes with src attribute
  const sanitized = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['iframe'],
    ALLOWED_ATTR: [
      'src', 'width', 'height', 'frameborder', 'allowfullscreen',
      'allow', 'title', 'loading', 'class', 'style'
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  });

  // No iframe found after sanitization
  if (!sanitized.includes('<iframe')) {
    return '';
  }

  // Extract src attribute and validate domain
  const srcMatch = sanitized.match(/src="([^"]+)"/);
  if (!srcMatch) {
    // No src attribute - return empty
    return '';
  }

  const src = srcMatch[1];

  // Block non-https protocols
  if (!src.startsWith('https://')) {
    return '';
  }

  // Validate domain is in trusted list
  try {
    const url = new URL(src);
    const hostname = url.hostname.toLowerCase();

    const isTrusted = trustedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isTrusted) {
      return '';
    }
  } catch {
    // Invalid URL
    return '';
  }

  return sanitized;
}

/**
 * Sanitize JSON structured data for schema.org
 * Future-proofs against dynamic content in JSON-LD
 */
export function sanitizeJSON(jsonData: Record<string, any>): string {
  const cloned = JSON.parse(JSON.stringify(jsonData));

  function sanitizeValue(obj: any): any {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
      });
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeValue);
    }

    if (obj && typeof obj === 'object') {
      const sanitized: Record<string, any> = {};
      for (const key in obj) {
        sanitized[key] = sanitizeValue(obj[key]);
      }
      return sanitized;
    }

    return obj;
  }

  const sanitized = sanitizeValue(cloned);
  return JSON.stringify(sanitized);
}

/**
 * Sanitize HTML with custom configuration
 */
export function sanitizeWithConfig(
  dirty: string,
  config: Config
): string {
  return DOMPurify.sanitize(dirty, config) as string;
}
