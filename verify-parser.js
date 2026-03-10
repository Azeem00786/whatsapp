const ManualParser = require("./server/manualParser");
const input = "8573867986,9651861130";
const results = ManualParser.parse(input);
console.log("Input:", input);
console.log("Parsed Results:", results);
console.log("Count:", results.length);
