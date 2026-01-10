/**
 * Formats message content for display.
 * Supports:
 * - Line breaks (preserved)
 * - Bold text (*word* → <strong>word</strong>)
 *
 * Security: HTML is escaped before formatting to prevent XSS.
 */
export function formatMessageContent(content: string): string {
  // 1. Escape HTML entities first (security)
  let formatted = escapeHtml(content);

  // 2. Convert *bold* syntax to <strong> tags
  // Matches *word* or *multiple words* but not * alone or **
  formatted = formatted.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

  // 3. Convert newlines to <br> tags
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
}

/**
 * Strips formatting from message content (for previews, notifications).
 */
export function stripMessageFormatting(content: string): string {
  return content.replace(/\*([^*]+)\*/g, '$1');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Truncate message for preview display
 */
export function truncateMessage(content: string, maxLength: number = 50): string {
  const stripped = stripMessageFormatting(content);
  const singleLine = stripped.replace(/\n/g, ' ');
  if (singleLine.length <= maxLength) {
    return singleLine;
  }
  return singleLine.substring(0, maxLength - 3) + '...';
}
