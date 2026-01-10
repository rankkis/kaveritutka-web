import {
  formatMessageContent,
  stripMessageFormatting,
  truncateMessage,
} from './message-format.helper';

describe('Message Format Helpers', () => {
  describe('formatMessageContent', () => {
    it('should convert *text* to <strong>text</strong>', () => {
      const result = formatMessageContent('Hello *world*!');
      expect(result).toContain('<strong>world</strong>');
    });

    it('should convert multiple bold markers', () => {
      const result = formatMessageContent('*Hello* and *world*!');
      expect(result).toContain('<strong>Hello</strong>');
      expect(result).toContain('<strong>world</strong>');
    });

    it('should convert newlines to <br> tags', () => {
      const result = formatMessageContent('Hello\nWorld');
      expect(result).toContain('<br>');
    });

    it('should handle multiple newlines', () => {
      const result = formatMessageContent('Line 1\n\nLine 3');
      expect(result).toBe('Line 1<br><br>Line 3');
    });

    it('should escape HTML entities for security', () => {
      const result = formatMessageContent('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should handle bold text with special characters inside', () => {
      const result = formatMessageContent('*Hello & World*');
      // The & should be escaped before bold conversion
      expect(result).toContain('<strong>');
      expect(result).toContain('</strong>');
    });

    it('should not convert single asterisks', () => {
      const result = formatMessageContent('5 * 3 = 15');
      expect(result).not.toContain('<strong>');
    });

    it('should handle empty string', () => {
      expect(formatMessageContent('')).toBe('');
    });

    it('should handle plain text without formatting', () => {
      const text = 'Hei! Nähdään puistossa.';
      const result = formatMessageContent(text);
      expect(result).toBe(text);
    });

    it('should handle combined formatting (bold and newlines)', () => {
      const result = formatMessageContent('*Tärkeää*:\nOta mukaan pallo');
      expect(result).toContain('<strong>Tärkeää</strong>');
      expect(result).toContain('<br>');
    });
  });

  describe('stripMessageFormatting', () => {
    it('should remove bold markers', () => {
      const result = stripMessageFormatting('Hello *world*!');
      expect(result).toBe('Hello world!');
    });

    it('should remove multiple bold markers', () => {
      const result = stripMessageFormatting('*Hello* and *world*!');
      expect(result).toBe('Hello and world!');
    });

    it('should preserve newlines', () => {
      const result = stripMessageFormatting('Hello\nWorld');
      expect(result).toBe('Hello\nWorld');
    });

    it('should handle text without formatting', () => {
      const text = 'Plain text message';
      expect(stripMessageFormatting(text)).toBe(text);
    });

    it('should handle empty string', () => {
      expect(stripMessageFormatting('')).toBe('');
    });

    it('should not remove single asterisks', () => {
      const result = stripMessageFormatting('5 * 3 = 15');
      expect(result).toBe('5 * 3 = 15');
    });

    it('should handle nested asterisks correctly', () => {
      const result = stripMessageFormatting('*bold text*');
      expect(result).toBe('bold text');
    });
  });

  describe('truncateMessage', () => {
    it('should return full message if shorter than maxLength', () => {
      const result = truncateMessage('Short message', 50);
      expect(result).toBe('Short message');
    });

    it('should truncate long messages with ellipsis', () => {
      const longMessage = 'This is a very long message that should be truncated';
      const result = truncateMessage(longMessage, 20);
      expect(result.length).toBe(20);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should strip formatting before truncating', () => {
      const result = truncateMessage('*Bold* message here', 50);
      expect(result).toBe('Bold message here');
      expect(result).not.toContain('*');
    });

    it('should replace newlines with spaces', () => {
      const result = truncateMessage('Line 1\nLine 2', 50);
      expect(result).toBe('Line 1 Line 2');
      expect(result).not.toContain('\n');
    });

    it('should use default maxLength of 50', () => {
      const longMessage = 'A'.repeat(100);
      const result = truncateMessage(longMessage);
      expect(result.length).toBe(50);
    });

    it('should handle empty string', () => {
      expect(truncateMessage('')).toBe('');
    });

    it('should handle message exactly at maxLength', () => {
      const message = 'A'.repeat(50);
      const result = truncateMessage(message, 50);
      expect(result).toBe(message);
      expect(result.length).toBe(50);
    });

    it('should handle combined formatting and newlines before truncating', () => {
      const result = truncateMessage('*Hello*\n*World*', 50);
      expect(result).toBe('Hello World');
    });

    it('should truncate correctly at word boundaries not guaranteed', () => {
      // Note: This implementation truncates at character boundary, not word boundary
      const result = truncateMessage('The quick brown fox jumps', 15);
      expect(result).toBe('The quick br...');
    });
  });
});
