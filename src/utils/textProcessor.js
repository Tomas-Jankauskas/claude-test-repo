/**
 * Text Processing Utilities
 * 
 * This module provides utility functions for processing and transforming text data.
 * Added as part of testing the new TextCortex Claude Code PR Autodoc Action.
 */

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} text - The input text to capitalize
 * @returns {string} The capitalized text
 */
function capitalizeWords(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Removes extra whitespace and normalizes line endings
 * @param {string} text - The input text to clean
 * @returns {string} The cleaned text
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .trim();  // Remove leading/trailing whitespace
}

/**
 * Truncates text to a specified length with optional ellipsis
 * @param {string} text - The input text to truncate
 * @param {number} maxLength - Maximum length of the output
 * @param {string} suffix - Suffix to add when truncating (default: '...')
 * @returns {string} The truncated text
 */
function truncateText(text, maxLength, suffix = '...') {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Counts the number of words in a text string
 * @param {string} text - The input text
 * @returns {number} The word count
 */
function countWords(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
}

module.exports = {
  capitalizeWords,
  cleanText,
  truncateText,
  countWords
};
