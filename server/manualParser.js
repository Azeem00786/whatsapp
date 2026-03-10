const Validator = require("./validator");

/**
 * Parses manually entered phone numbers from a string.
 */
class ManualParser {
  /**
   * Splits input by common separators (newline, comma, space) and normalizes numbers.
   * @param {string} input
   * @returns {string[]}
   */
  static parse(input) {
    if (!input) return [];

    // Regex to split by newline, comma, semicolon, or any whitespace
    const rawNumbers = input.split(/[\n,;\s]+/).filter((n) => n.trim() !== "");

    return Validator.validateList(rawNumbers);
  }
}

module.exports = ManualParser;
