import DOMPurify from 'dompurify';

// Sanitize untrusted HTML (inbound email bodies, user-authored signatures)
// before injecting into the DOM. Email content is attacker-controlled, so the
// allowlist is deliberately tight: no scripts, forms, frames, or active content.
const purify = DOMPurify();

purify.addHook('afterSanitizeAttributes', (node) => {
  // Force links to open in a new tab without opener access
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer nofollow');
  }
  // Lazy-load remote images and prevent referrer leakage
  if (node.tagName === 'IMG') {
    node.setAttribute('loading', 'lazy');
    node.setAttribute('referrerpolicy', 'no-referrer');
  }
});

export function sanitizeHtml(html: string): string {
  return purify.sanitize(html || '', {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [
      'script', 'iframe', 'object', 'embed', 'form', 'input', 'button',
      'select', 'textarea', 'link', 'meta', 'base', 'frame', 'frameset',
      'applet', 'video', 'audio', 'source', 'track', 'style',
    ],
    FORBID_ATTR: ['srcset', 'formaction', 'xlink:href', 'nonce'],
    ALLOW_DATA_ATTR: false,
  });
}

// Plain-text email fallback: escape HTML entities, then convert newlines to
// <br> — otherwise a text body containing "<script>" would still execute.
export function textToSafeHtml(text: string): string {
  const escaped = (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped.replace(/\n/g, '<br>');
}
