const path = require("path");
const { validateEnvironment } = require("./config/env");
const app = require("./app");
const connectDB = require("./config/db");
const ensureHistoricalPrices = require("./ensureHistoricalPrices");
const ensurePageContents = require("./ensurePageContents");
const ensureGalleryItems = require("./ensureGalleryItems");
const { ensureUploadDirectories } = require("./utils/assetStorage");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

let startPromise;

const startServer = async () => {
  if (startPromise) return startPromise;

  startPromise = (async () => {
    validateEnvironment();
    ensureUploadDirectories();
    await connectDB();
    await ensureHistoricalPrices();
    await ensurePageContents();
    await ensureGalleryItems();

    return new Promise((resolve, reject) => {
      const server = app.listen(PORT, HOST);
      server.once("error", reject);
      server.once("listening", () => {
        console.log(`Server listening on ${HOST}:${PORT}`);
        resolve(server);
      });
    });
  })();

  try {
    return await startPromise;
  } catch (error) {
    startPromise = undefined;
    throw error;
  }
};

const reportStartupFailure = (error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
};

// Plesk's generated .plesk.startup.cjs loads this module after Passenger has
// patched http.Server.prototype.listen. Direct Node execution is also
// supported for local development and non-Passenger hosting.
const parentFile = path.basename(module.parent?.filename || "");
const loadedByPlesk = parentFile.startsWith(".plesk.startup.");

if (require.main === module || loadedByPlesk) {
  startServer().catch(reportStartupFailure);
}

module.exports = app;
module.exports.startServer = startServer;
