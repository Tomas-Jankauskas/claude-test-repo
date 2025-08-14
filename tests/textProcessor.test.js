const {
  capitalizeWords,
  cleanText,
  truncateText,
  countWords
} = require('../src/utils/textProcessor');

describe('Text Processor Utilities', () => {
  describe('capitalizeWords', () => {
    test('should capitalize each word in a sentence', () => {
      expect(capitalizeWords('hello world test')).toBe('Hello World Test');
    });

    test('should handle empty strings', () => {
      expect(capitalizeWords('')).toBe('');
    });

    test('should handle null/undefined input', () => {
      expect(capitalizeWords(null)).toBe('');
      expect(capitalizeWords(undefined)).toBe('');
    });

    test('should handle single word', () => {
      expect(capitalizeWords('javascript')).toBe('Javascript');
    });
  });

  describe('cleanText', () => {
    test('should remove extra whitespace', () => {
      expect(cleanText('hello    world   test')).toBe('hello world test');
    });

    test('should normalize line endings', () => {
      expect(cleanText('line1\r\nline2\r\nline3')).toBe('line1\nline2\nline3');
    });

    test('should trim leading and trailing whitespace', () => {
      expect(cleanText('  hello world  ')).toBe('hello world');
    });
  });

  describe('truncateText', () => {
    test('should truncate long text with default ellipsis', () => {
      expect(truncateText('This is a very long text that needs truncating', 20))
        .toBe('This is a very lo...');
    });

    test('should not truncate text shorter than maxLength', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
    });

    test('should use custom suffix', () => {
      expect(truncateText('Long text here', 10, ' [more]'))
        .toBe('Long [more]');
    });
  });

  describe('countWords', () => {
    test('should count words correctly', () => {
      expect(countWords('hello world test')).toBe(3);
    });

    test('should handle extra whitespace', () => {
      expect(countWords('  hello   world  ')).toBe(2);
    });

    test('should return 0 for empty string', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
    });
  });
});
