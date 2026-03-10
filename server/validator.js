/**
 * Validates and cleans phone numbers.
 */
class Validator {
  /**
   * Cleans a phone number by removing non-numeric characters.
   * Ensure it has a country code (defaults to 91 if missing and 10 digits).
   * @param {string} phone
   * @returns {string|null}
   */
  static normalize(phone) {
    if (!phone) return null;

    // Remove all non-numeric characters
    let clean = phone.toString().replace(/\D/g, "");

    // If 10 digits, add 91 (India) as default if not specified
    if (clean.length === 10) {
      clean = "91" + clean;
    }

    // Validate length (typical international format 11-13 digits including CC)
    // India: 91 + 10 digits = 12
    if (clean.length >= 11 && clean.length <= 13) {
      return clean;
    }

    return null;
  }

  /**
   * Validates a list of numbers and removes duplicates.
   * @param {string[]} numbers
   * @returns {string[]}
   */
  static validateList(numbers) {
    const validNumbers = numbers
      .map((n) => this.normalize(n))
      .filter((n) => n !== null);

    return [...new Set(validNumbers)];
  }
}

module.exports = Validator;
