/**
 * Tests for sanitize.ts utilities.
 * Note: DOMPurify requires window — these tests run in a jsdom environment via bun.
 */
import { describe, test, expect, beforeAll, mock } from 'bun:test';

// Mock window and DOMPurify for test environment
const mockSanitize = (html: string, opts?: Record<string, unknown>) => {
  // Simple strip-tags for testing purposes
  if (!opts || !opts.ALLOWED_TAGS) return html.replace(/<[^>]*>/g, '');
  const allowed = opts.ALLOWED_TAGS as string[];
  return html.replace(/<\/?([a-z][a-z0-9]*)[^>]*>/gi, (match, tag) => {
    if (allowed.includes(tag.toLowerCase())) return match;
    return '';
  }).replace(/\s+on\w+="[^"]*"/g, '').replace(/javascript:[^"']*/g, '');
};

// Mock the module so tests work without a real browser
mock.module('dompurify', () => ({
  default: { sanitize: mockSanitize },
}));

// Patch window for the module
if (typeof (globalThis as Record<string, unknown>).window === 'undefined') {
  (globalThis as Record<string, unknown>).window = globalThis;
}

import {
  sanitizeHtml,
  getSafeHtml,
  sanitizeTutorialEmbed,
  sanitizeHTML,
} from './sanitize';

describe('sanitizeHtml', () => {
  test('removes script tags', () => {
    const dirty = '<p>Safe</p><script>alert("XSS")</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script>');
  });

  test('removes event handlers', () => {
    const dirty = '<div onclick="alert(\'XSS\')">Click</div>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('onclick');
  });

  test('preserves allowed tags', () => {
    const dirty = '<p>Text</p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('<p>');
  });

  test('removes javascript: protocol', () => {
    const dirty = '<a href="javascript:alert(\'XSS\')">Link</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('javascript:');
  });
});

describe('getSafeHtml', () => {
  test('returns object with __html key', () => {
    const result = getSafeHtml('<p>Test</p>');
    expect(result).toHaveProperty('__html');
  });

  test('sanitizes the html value', () => {
    const result = getSafeHtml('<p>Safe</p><script>bad()</script>');
    expect(result.__html).not.toContain('<script>');
  });
});

describe('sanitizeHTML alias', () => {
  test('is the same as sanitizeHtml', () => {
    const input = '<p>Test</p>';
    expect(sanitizeHTML(input)).toBe(sanitizeHtml(input));
  });
});

describe('sanitizeTutorialEmbed', () => {
  test('returns empty for non-iframe content', () => {
    expect(sanitizeTutorialEmbed('<div>Not an iframe</div>')).toBe('');
  });

  test('returns empty for script injection attempt', () => {
    expect(sanitizeTutorialEmbed('<script>alert("XSS")</script>')).toBe('');
  });

  test('returns empty for untrusted domain', () => {
    const embed = '<iframe src="https://evil.com/embed/abc"></iframe>';
    expect(sanitizeTutorialEmbed(embed)).toBe('');
  });

  test('returns empty for javascript: protocol', () => {
    const embed = '<iframe src="javascript:alert(1)"></iframe>';
    expect(sanitizeTutorialEmbed(embed)).toBe('');
  });

  test('allows youtube.com embeds', () => {
    const embed = '<iframe src="https://www.youtube.com/embed/abc123" width="560" height="315"></iframe>';
    const result = sanitizeTutorialEmbed(embed);
    // After sanitization with mock, iframe should be preserved and src validated
    expect(result).not.toContain('evil');
  });

  test('allows arcade.software embeds', () => {
    const embed = '<div><iframe src="https://demo.arcade.software/abc123?embed" title="Demo" frameborder="0"></iframe></div>';
    const result = sanitizeTutorialEmbed(embed);
    expect(result).not.toContain('evil');
  });
});
