const puppeteer = require("puppeteer");
const config = require("../config");

/**
 * Manages Puppeteer browser and page for WhatsApp Web.
 */
class WhatsApp {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Launches browser and opens WhatsApp Web.
   */
  async init() {
    if (this.browser) return;

    this.browser = await puppeteer.launch({
      headless: config.PUPPETEER_HEADLESS,
      ignoreHTTPSErrors: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    );

    console.log("Opening WhatsApp Web...");
    await this.page.goto("https://web.whatsapp.com", {
      waitUntil: "networkidle2",
    });
    console.log("Please scan the QR code to log in.");
  }

  /**
   * Checks if logged in by looking for the side panel.
   * @returns {Promise<boolean>}
   */
  async isLoggedIn() {
    try {
      await this.page.waitForSelector("#pane-side", { timeout: 10000 });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Gets the current page instance.
   * @returns {Page}
   */
  getPage() {
    return this.page;
  }

  /**
   * Closes the browser.
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

module.exports = new WhatsApp();
