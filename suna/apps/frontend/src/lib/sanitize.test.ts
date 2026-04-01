import { describe, test, expect } from 'bun:test';
import {
  sanitizeHTML,
  sanitizeTutorialEmbed,
  sanitizeJSON,
  sanitizeWithConfig,
} from './sanitize';

describe('sanitizeHTML', () => {
  test('removes script tags', () => {
    const dirty = '<p>Safe content</p><script>alert("XSS")</script>';
    const clean = sanitizeHTML(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<p>Safe content</p>');
  });

  test('removes event handlers', () => {
    const dirty = '<div onclick="alert(\'XSS\')">Click me</div>';
    const clean = sanitizeHTML(dirty);
    expect(clean).not.toContain('onclick');
    expect(clean).toContain('<div>Click me</div>');
  });

  test('preserves allowed tags', () => {
    const dirty = '<p>Text with <strong>bold</strong> and <em>italic</em></p>';
    const clean = sanitizeHTML(dirty);
    expect(clean).toBe(dirty);
  });

  test('removes dangerous attributes', () => {
    const dirty = '<a href="javascript:alert(\'XSS\')">Link</a>';
    const clean = sanitizeHTML(dirty);
    expect(clean).not.toContain('javascript:');
  });

  test('preserves safe attributes', () => {
    const dirty = '<a href="https://example.com" title="Example">Link</a>';
    const clean = sanitizeHTML(dirty);
    expect(clean).toContain('href="https://example.com"');
    expect(clean).toContain('title="Example"');
  });
});

describe('sanitizeTutorialEmbed', () => {
  test('allows valid YouTube iframe', () => {
    const dirty = '<iframe src="https://www.youtube.com/embed/abc123" width="560" height="315"></iframe>';
    const clean = sanitizeTutorialEmbed(dirty);
    expect(clean).toContain('<iframe');
    expect(clean).toContain('youtube.com');
  });

  test('allows valid Vimeo iframe', () => {
    const dirty = '<iframe src="https://player.vimeo.com/video/123456" width="640" height="360"></iframe>';
    const clean = sanitizeTutorialEmbed(dirty);
    expect(clean).toContain('<iframe');
    expect(clean).toContain('vimeo.com');
  });

  test('allows valid Loom iframe', () => {
    const dirty = '<iframe src="https://www.loom.com/embed/abc123xyz" width="640" height="360"></iframe>';
    const clean = sanitizeTutorialEmbed(dirty);
    expect(clean).toContain('<iframe');
    expect(clean).toContain('loom.com');
  });

  test('blocks malicious script in iframe src', () => {
    const dirty = '<iframe src="javascript:alert(\'XSS\')"></iframe>';
    const clean = sanitizeTutorialEmbed(dirty);
    expect(clean).toBe('');
  });

  test('blocks untrusted domain', () => {
    const dirty = '<iframe src="https://evil.com/malicious"></iframe>';
    const clean = sanitizeTutorialEmbed(dirty);
    expect(clean).toBe('');
  });

  test('removes non-iframe tags', () => {
    const dirty = '<script>alert("XSS")</script><iframe src="https://youtube.com/embed/abc"></iframe>';
    const clean = sanitizeTutorialEmbed(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<iframe');
  });

  test('returns empty string for non-iframe content', () => {
    const dirty = '<div>Not an iframe</div>';
    const clean = sanitizeTutorialEmbed(dirty);
    expect(clean).toBe('');
  });

  test('preserves allowed iframe attributes', () => {
    const dirty = '<iframe src="https://youtube.com/embed/abc" width="560" height="315" frameborder="0" allowfullscreen></iframe>';
    const clean = sanitizeTutorialEmbed(dirty);
    expect(clean).toContain('width="560"');
    expect(clean).toContain('height="315"');
    expect(clean).toContain('allowfullscreen');
  });
});

describe('sanitizeJSON', () => {
  test('sanitizes string values in JSON', () => {
    const dirty = {
      name: 'Test <script>alert("XSS")</script>',
      description: 'Safe content',
    };
    const clean = sanitizeJSON(dirty);
    const parsed = JSON.parse(clean);
    expect(parsed.name).not.toContain('<script>');
    expect(parsed.name).toContain('Test');
    expect(parsed.description).toBe('Safe content');
  });

  test('handles nested objects', () => {
    const dirty = {
      outer: {
        inner: {
          value: 'Test <script>alert("XSS")</script>',
        },
      },
    };
    const clean = sanitizeJSON(dirty);
    const parsed = JSON.parse(clean);
    expect(parsed.outer.inner.value).not.toContain('<script>');
  });

  test('handles arrays', () => {
    const dirty = {
      items: ['Safe', 'Content <script>alert("XSS")</script>', 'Normal'],
    };
    const clean = sanitizeJSON(dirty);
    const parsed = JSON.parse(clean);
    expect(parsed.items[1]).not.toContain('<script>');
    expect(parsed.items[0]).toBe('Safe');
    expect(parsed.items[2]).toBe('Normal');
  });

  test('preserves non-string values', () => {
    const dirty = {
      number: 42,
      boolean: true,
      null: null,
      array: [1, 2, 3],
    };
    const clean = sanitizeJSON(dirty);
    const parsed = JSON.parse(clean);
    expect(parsed.number).toBe(42);
    expect(parsed.boolean).toBe(true);
    expect(parsed.null).toBe(null);
    expect(parsed.array).toEqual([1, 2, 3]);
  });

  test('removes event handlers from JSON strings', () => {
    const dirty = {
      html: '<div onclick="alert(\'XSS\')">Click</div>',
    };
    const clean = sanitizeJSON(dirty);
    const parsed = JSON.parse(clean);
    expect(parsed.html).not.toContain('onclick');
  });
});

describe('sanitizeWithConfig', () => {
  test('applies custom configuration', () => {
    const dirty = '<p>Keep</p><div>Remove</div>';
    const clean = sanitizeWithConfig(dirty, {
      ALLOWED_TAGS: ['p'],
    });
    expect(clean).toContain('<p>Keep</p>');
    expect(clean).not.toContain('<div>');
  });

  test('custom allowed attributes', () => {
    const dirty = '<a href="https://example.com" title="Example" data-custom="value">Link</a>';
    const clean = sanitizeWithConfig(dirty, {
      ALLOWED_TAGS: ['a'],
      ALLOWED_ATTR: ['href'],
      ALLOW_DATA_ATTR: false,
    });
    expect(clean).toContain('href=');
    expect(clean).not.toContain('title=');
    expect(clean).not.toContain('data-custom=');
  });
});
