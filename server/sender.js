const whatsapp = require("./whatsapp");
const config = require("../config");
const queue = require("./queue");

/**
 * Handles sending messages to specific numbers.
 */
class Sender {
  /**
   * Sends the invitation message to a phone number.
   * @param {string} phone
   * @param {function} onProgress
   * @returns {Promise<boolean>}
   */
  async sendInvitation(phone, onProgress = () => {}) {
    const page = whatsapp.getPage();
    const defaultMessage = `Hi 👋
I saw you in the *All India Jobs Grp -1* and wanted to share my WhatsApp channel:

🚀 *Learn AI | ML | Coding*
👉 https://whatsapp.com/channel/0029Vb5W5XH9xVJkNuUOej3g

I regularly share:
⚙️ Smart AI tools that boost productivity
🧠 AI fundamentals & Prompt Engineering
💼 Interview tips & AI for job opportunities
📚 Coding resources & real-world AI use cases

If you want to *upgrade your skills*, feel free to join us!
Thanks & take care! 😊`;
    const message = queue.message || defaultMessage;

    try {
      console.log(`[Sender] Using message: "${message.substring(0, 30)}..."`);
      console.log(`[Sender] Starting to send to ${phone}...`);
      onProgress(10, "Initializing...");

      // Navigate to a blank page first to ensure a CLEAN load of the next chat URL
      // This prevents WhatsApp SPA from ignoring the fragment/parameter change
      await page.goto("about:blank");

      const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

      // Navigate to the chat URL
      console.log(`[Sender] Navigating to ${phone} chat...`);
      onProgress(33, "Navigating...");
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      try {
        // Wait for the side panel which indicates the app is loaded
        await page.waitForSelector("#pane-side", { timeout: 45000 });

        // Wait for the message input area (composer)
        const composerSelector = 'div[contenteditable="true"][data-tab="10"]';
        await page.waitForSelector(composerSelector, { timeout: 30000 });

        console.log(
          `[Sender] Chat loaded for ${phone}. Waiting for pre-fill...`,
        );

        // Wait a few seconds for WhatsApp to pre-fill the text
        onProgress(66, "Processing...");
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const sendButtonSelector =
          'span[data-icon="send"], [aria-label="Send"]';
        const sendBtn = await page.$(sendButtonSelector);

        if (sendBtn) {
          console.log(`[Sender] Send button found for ${phone}. Clicking...`);
          await sendBtn.click();
        } else {
          console.log(
            `[Sender] Send button NOT found for ${phone}. Pressing Enter instead...`,
          );
          await page.focus(composerSelector);
          await page.keyboard.press("Enter");
        }

        // Final wait to confirm message is sent
        onProgress(100, "Sent!");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        console.log(`[Sender] Successfully processed sending for ${phone}`);
        return true;
      } catch (e) {
        const content = await page.content();
        if (content.includes("Phone number shared via url is invalid")) {
          console.error(`[Sender] Error: Invalid phone number ${phone}`);
        } else {
          console.error(`[Sender] Error sending to ${phone}: ${e.message}`);
        }
        return false;
      }
    } catch (error) {
      console.error(
        `[Sender] Failed to navigate to WhatsApp for ${phone}:`,
        error.message,
      );
      return false;
    }
  }
}

module.exports = new Sender();
