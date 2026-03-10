require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  CHUNK_SIZE: parseInt(process.env.CHUNK_SIZE) || 20,
  DELAY_BETWEEN_MESSAGES: parseInt(process.env.DELAY_BETWEEN_MESSAGES) || 30000, // 30 seconds
  DELAY_BETWEEN_CHUNKS: parseInt(process.env.DELAY_BETWEEN_CHUNKS) || 180000, // 3 minutes
  WHATSAPP_CHANNEL_URL:
    process.env.WHATSAPP_CHANNEL_URL ||
    "https://whatsapp.com/channel/CHANNEL_ID",
  PUPPETEER_HEADLESS: process.env.PUPPETEER_HEADLESS === "true",
};
