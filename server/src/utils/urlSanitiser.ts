/**
 * Sanitize a return URL to prevent open redirects
 * Only accepts relative URLs starting with /
 *
 * @param url - The URL to sanitize
 * @returns The sanitized URL or null if invalid
 */
export function sanitizeReturnUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Reject absolute URLs (http://, https://, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) {
    return null;
  }

  // Must start with single forward slash
  if (!url.startsWith('/')) {
    return null;
  }

  // Reject protocol-relative URLs (//example.com)
  if (url.startsWith('//')) {
    return null;
  }

  // Reject javascript: URLs (case insensitive)
  if (url.toLowerCase().includes('javascript:')) {
    return null;
  }

  return url;
}
