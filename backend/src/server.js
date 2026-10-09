const { validateEnvironment } = require("./config/env");
const app = require("./app");
const connectDB = require("./config/db");
const ensureHistoricalPrices = require("./ensureHistoricalPrices");
const ensurePageContents = require("./ensurePageContents");
const ensureGalleryItems = require("./ensureGalleryItems");
const { ensureUploadDirectories } = require("./utils/assetStorage");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    validateEnvironment();
    ensureUploadDirectories();
    await connectDB();
    await ensureHistoricalPrices();
    await ensurePageContents();
    await ensureGalleryItems();

    app.listen(PORT, HOST, () => {
      console.log(`Server listening on ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
