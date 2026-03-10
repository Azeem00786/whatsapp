const fs = require("fs");
const csv = require("csv-parser");
const Validator = require("./validator");

/**
 * Parses CSV files containing student numbers.
 */
class CsvParser {
  /**
   * Parses a CSV file and extracts phone numbers.
   * Expected columns: 'phone' or 'number' or 'mobile'.
   * @param {string} filePath
   * @returns {Promise<string[]>}
   */
  static parse(filePath) {
    return new Promise((resolve, reject) => {
      const numbers = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Try to find a phone column
          const phone =
            data.phone ||
            data.number ||
            data.mobile ||
            data.Phone ||
            data.Number ||
            data.Mobile;
          if (phone) {
            numbers.push(phone);
          }
        })
        .on("end", () => {
          resolve(Validator.validateList(numbers));
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }
}

module.exports = CsvParser;
