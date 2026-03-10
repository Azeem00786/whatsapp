/**
 * Simple in-memory FIFO queue for phone numbers.
 */
class Queue {
  constructor() {
    this.items = [];
    this.sent = [];
    this.failed = [];
    this.message = null;
  }

  /**
   * Sets the message to be sent.
   * @param {string} msg
   */
  setMessage(msg) {
    this.message = msg;
  }

  /**
   * Adds numbers to the queue, ensuring no duplicates within the queue or logs.
   * @param {string[]} numbers
   */
  enqueue(numbers) {
    const testNumbers = [
      "8573867986",
      "8756842113",
      "918573867986",
      "918756842113",
    ];
    numbers.forEach((number) => {
      const isTestNumber = testNumbers.includes(number);
      // Only skip if it's already in pending OR if it's already sent (and NOT a test number)
      if (
        !this.items.includes(number) &&
        (isTestNumber || !this.sent.includes(number))
      ) {
        this.items.push(number);
      }
    });
  }

  /**
   * Removes and returns a chunk of numbers.
   * @param {number} size
   * @returns {string[]}
   */
  dequeueChunk(size) {
    return this.items.splice(0, size);
  }

  /**
   * Marks a number as sent.
   * @param {string} number
   */
  markAsSent(number) {
    this.sent.push(number);
  }

  /**
   * Marks a number as failed.
   * @param {string} number
   */
  markAsFailed(number) {
    this.failed.push(number);
  }

  /**
   * Resets the entire queue and history.
   */
  clearSession() {
    this.items = [];
    this.sent = [];
    this.failed = [];
    this.message = null;
  }

  /**
   * Gets current status.
   * @returns {object}
   */
  getStatus() {
    return {
      pending: this.items.length,
      sent: this.sent.length,
      failed: this.failed.length,
    };
  }
}

module.exports = new Queue(); // Singleton for simple shared state
