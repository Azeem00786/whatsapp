const Validator = require("./server/validator");
const manualParser = require("./server/manualParser");
const csvParser = require("./server/csvParser");
const path = require("path");

async function runTests() {
  console.log("--- Testing Validator ---");
  console.log("Normalize 9876543210:", Validator.normalize("9876543210"));
  console.log(
    "Normalize +91 98765-43210:",
    Validator.normalize("+91 98765-43210"),
  );

  console.log("\n--- Testing Manual Parser ---");
  const manualInput = "9876543210, 911234567890\n9988776655";
  console.log("Manual Parse:", manualParser.parse(manualInput));

  console.log("\n--- Testing CSV Parser ---");
  try {
    const csvPath = path.join(__dirname, "test.csv");
    const numbers = await csvParser.parse(csvPath);
    console.log("CSV Parse:", numbers);
  } catch (err) {
    console.error("CSV Parse Error:", err);
  }
}

runTests();
