const queue = require("./queue");
const sender = require("./sender");
const logger = require("./logger");
const config = require("../config");

/**
 * Orchestrates sending messages in chunks with delays.
 */
class ChunkProcessor {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Starts the processing loop.
   */
  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    while (this.isRunning && queue.getStatus().pending > 0) {
      const chunk = queue.dequeueChunk(config.CHUNK_SIZE);
      console.log(`Processing chunk of ${chunk.length} numbers...`);

      for (const phone of chunk) {
        if (!this.isRunning) break;

        const success = await sender.sendInvitation(phone);
        if (success) {
          queue.markAsSent(phone);
          logger.log(phone, "SUCCESS");
        } else {
          queue.markAsFailed(phone);
          logger.log(phone, "FAILED");
        }

        // Delay between messages in a chunk
        console.log(
          `Waiting ${config.DELAY_BETWEEN_MESSAGES / 1000}s before next message...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, config.DELAY_BETWEEN_MESSAGES),
        );
      }

      if (this.isRunning && queue.getStatus().pending > 0) {
        console.log(
          `Chunk complete. Waiting ${config.DELAY_BETWEEN_CHUNKS / 1000}s before next chunk...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, config.DELAY_BETWEEN_CHUNKS),
        );
      }
    }

    this.isRunning = false;
    console.log("Sending process complete.");
  }

  /**
   * Stops the processing loop.
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Checks if processor is running.
   * @returns {boolean}
   */
  status() {
    return this.isRunning;
  }
}

module.exports = new ChunkProcessor();
