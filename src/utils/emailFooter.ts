/**
 * Email Footer Utilities
 *
 * Handles separation and rejoining of email footer from body content.
 * The footer contains the unsubscribe link and is locked from editing.
 */

// Standard footer template (HTML format)
export const STANDARD_EMAIL_FOOTER = `<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0 20px 0;"/><p style="font-size: 12px; color: #888888;">Questions? Reply to this email or contact team@voxxypresents.com directly.</p><p style="font-size: 12px; color: #888888;"><a href="[unsubscribeLink]" style="color: #888888; text-decoration: underline;">Unsubscribe from these emails</a></p><p style="font-size: 12px; color: #aaaaaa;">Powered by Voxxy Presents</p>`;

// Plain text version of footer (for plain text editors)
export const STANDARD_EMAIL_FOOTER_PLAIN = `---

Questions? Reply to this email or contact team@voxxypresents.com directly.

Unsubscribe from these emails: [unsubscribeLink]

Powered by Voxxy Presents`;

/**
 * Split email body into content and footer
 * Returns both parts separately for display
 */
export interface SplitEmailResult {
  content: string;
  footer: string;
  hasFooter: boolean;
}

export function splitEmailBody(bodyTemplate: string): SplitEmailResult {
  if (!bodyTemplate) {
    return {
      content: '',
      footer: STANDARD_EMAIL_FOOTER,
      hasFooter: false,
    };
  }

  // Check if body contains <hr> tag (HTML format)
  if (bodyTemplate.includes('<hr')) {
    const hrIndex = bodyTemplate.indexOf('<hr');
    if (hrIndex === -1) {
      return {
        content: bodyTemplate,
        footer: STANDARD_EMAIL_FOOTER,
        hasFooter: false,
      };
    }

    const content = bodyTemplate.substring(0, hrIndex).trim();
    const footer = bodyTemplate.substring(hrIndex).trim();

    return {
      content,
      footer,
      hasFooter: true,
    };
  }

  // Check if body contains --- separator (plain text format)
  if (bodyTemplate.includes('\n---\n')) {
    const parts = bodyTemplate.split('\n---\n');
    if (parts.length >= 2) {
      const content = parts[0].trim();
      const footer = '---\n' + parts.slice(1).join('\n---\n').trim();

      return {
        content,
        footer,
        hasFooter: true,
      };
    }
  }

  // No footer found - return content as-is and standard footer
  return {
    content: bodyTemplate.trim(),
    footer: STANDARD_EMAIL_FOOTER,
    hasFooter: false,
  };
}

/**
 * Join email content and footer back together
 */
export function joinEmailBody(content: string, footer?: string): string {
  const footerToUse = footer || STANDARD_EMAIL_FOOTER;

  if (!content) {
    return footerToUse;
  }

  // Trim content to avoid extra whitespace
  const trimmedContent = content.trim();

  // Join with no extra spacing (footer already has its own styling)
  return trimmedContent + footerToUse;
}

/**
 * Ensure email has proper footer
 * If missing, appends standard footer
 */
export function ensureEmailFooter(bodyTemplate: string): string {
  const { content, footer, hasFooter } = splitEmailBody(bodyTemplate);

  if (hasFooter) {
    return bodyTemplate; // Already has footer
  }

  return joinEmailBody(content, STANDARD_EMAIL_FOOTER);
}

/**
 * Convert HTML footer to plain text (for plain text editors)
 */
export function htmlFooterToPlain(htmlFooter: string): string {
  if (!htmlFooter) return STANDARD_EMAIL_FOOTER_PLAIN;

  // If it's already plain text, return as-is
  if (!htmlFooter.includes('<')) {
    return htmlFooter;
  }

  // Simple conversion: strip HTML tags and normalize
  let plain = htmlFooter;

  // Replace <hr> with ---
  plain = plain.replace(/<hr[^>]*>/gi, '---');

  // Replace <p> tags with newlines
  plain = plain.replace(/<p[^>]*>/gi, '\n');
  plain = plain.replace(/<\/p>/gi, '');

  // Replace <br> with newlines
  plain = plain.replace(/<br\s*\/?>/gi, '\n');

  // Remove all other HTML tags
  plain = plain.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  const tmp = document.createElement('div');
  tmp.innerHTML = plain;
  plain = tmp.textContent || tmp.innerText || plain;

  // Normalize whitespace
  plain = plain.trim().replace(/\n{3,}/g, '\n\n');

  return plain;
}

/**
 * Convert plain text footer to HTML (for HTML editors)
 */
export function plainFooterToHtml(plainFooter: string): string {
  if (!plainFooter) return STANDARD_EMAIL_FOOTER;

  // If it's already HTML, return as-is
  if (plainFooter.includes('<')) {
    return plainFooter;
  }

  // Use standard footer as it's already properly formatted
  return STANDARD_EMAIL_FOOTER;
}
