const fs = require("fs");
const path = require("path");

/**
 * Simple JSON logger for sending activity.
 */
class Logger {
  constructor() {
    this.logFile = path.join(__dirname, "../logs/sent.json");
    if (!fs.existsSync(path.dirname(this.logFile))) {
      fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    }
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, JSON.stringify([]));
    }
  }

  /**
   * Logs a sending event.
   * @param {string} phone
   * @param {string} status
   */
  log(phone, status) {
    const logs = JSON.parse(fs.readFileSync(this.logFile));
    logs.push({
      phone,
      status,
      timestamp: new Date().toISOString(),
    });
    fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
  }

  /**
   * Gets all logs.
   * @returns {object[]}
   */
  getLogs() {
    return JSON.parse(fs.readFileSync(this.logFile));
  }

  /**
   * Clears all logs.
   */
  clearLogs() {
    fs.writeFileSync(this.logFile, JSON.stringify([]));
  }
}

module.exports = new Logger();
