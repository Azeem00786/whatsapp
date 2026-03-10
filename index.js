const express = require("express");
const multer = require("multer");
const path = require("path");
const config = require("./config");
const whatsapp = require("./server/whatsapp");
const queue = require("./server/queue");
const csvParser = require("./server/csvParser");
const manualParser = require("./server/manualParser");
const chunkProcessor = require("./server/chunkProcessor");
const logger = require("./server/logger");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(express.static("public")); // For future UI

// Initialize WhatsApp on startup (will wait for QR scan)
whatsapp.init().then(async () => {
  console.log("WhatsApp initialization started.");
});

/**
 * Handle CSV upload
 */
app.post("/upload-csv", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  try {
    const numbers = await csvParser.parse(req.file.path);
    queue.enqueue(numbers);
    res.json({
      message: "CSV parsed and numbers added to queue",
      count: numbers.length,
      status: queue.getStatus(),
    });
  } catch (error) {
    res.status(500).send(`Error parsing CSV: ${error.message}`);
  }
});

/**
 * Handle manual number input
 */
app.post("/add-numbers", (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).send("No input provided.");

  const numbers = manualParser.parse(input);
  queue.enqueue(numbers);
  res.json({
    message: "Numbers added to queue",
    count: numbers.length,
    status: queue.getStatus(),
  });
});

/**
 * Update message
 */
app.post("/set-message", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).send("No message provided.");

  queue.setMessage(message);
  res.json({ message: "Message updated successfully" });
});

/**
 * Start sending messages
 */
app.post("/start-sending", async (req, res) => {
  if (!(await whatsapp.isLoggedIn())) {
    return res
      .status(401)
      .send("WhatsApp not logged in. Please scan QR code first.");
  }

  if (chunkProcessor.status()) {
    return res.status(400).send("Process is already running.");
  }

  chunkProcessor.start();
  res.json({ message: "Sending process started." });
});

/**
 * Stop sending messages
 */
app.post("/stop-sending", (req, res) => {
  chunkProcessor.stop();
  res.json({ message: "Sending process stopped." });
});

/**
 * Get current status
 */
app.get("/status", (req, res) => {
  res.json({
    whatsapp: whatsapp.getPage() ? "Initialized" : "Not Initialized",
    processor: chunkProcessor.status() ? "Running" : "Stopped",
    queue: queue.getStatus(),
  });
});

/**
 * Get logs
 */
app.get("/logs", (req, res) => {
  res.json(logger.getLogs());
});

/**
 * Clear logs and reset session
 */
app.delete("/logs", (req, res) => {
  logger.clearLogs();
  queue.clearSession();
  res.json({ message: "Logs and session cleared successfully" });
});

app.listen(config.PORT, () => {
  console.log(`Server running at http://localhost:${config.PORT}`);
});
