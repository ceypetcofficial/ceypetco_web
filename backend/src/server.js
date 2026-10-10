const path = require("path");
const { validateEnvironment } = require("./config/env");
const app = require("./app");
const connectDB = require("./config/db");
const ensureHistoricalPrices = require("./ensureHistoricalPrices");
const ensurePageContents = require("./ensurePageContents");
const ensureGalleryItems = require("./ensureGalleryItems");
const { ensureUploadDirectories } = require("./utils/assetStorage");

let startPromise;

const startServer = async () => {
  if (startPromise) return startPromise;

  startPromise = (async () => {
    validateEnvironment();
    ensureUploadDirectories();

    const server = await new Promise((resolve, reject) => {
      let s;

      if (typeof PhusionPassenger !== "undefined") {
        // Under Phusion Passenger, passenger hooks the listen call.
        // Calling listen('passenger') is the documented Passenger reverse port binding target.
        s = app.listen("passenger");
      } else {
        const rawPort = process.env.PORT;
        if (typeof rawPort === "string" && (rawPort === "passenger" || rawPort.startsWith("/") || rawPort.startsWith("\\\\.\\pipe\\"))) {
          // Named pipe or UNIX domain socket
          s = app.listen(rawPort);
        } else {
          const port = Number(rawPort) || 5001;
          const host = process.env.HOST || "0.0.0.0";
          s = app.listen(port, host);
        }
      }

      s.once("error", reject);
      s.once("listening", () => {
        const addr = s.address();
        const bind = typeof addr === "string" ? addr : `${addr?.address || "0.0.0.0"}:${addr?.port || "port"}`;
        console.log(`Server listening on ${bind}`);
        resolve(s);
      });
    });

    // Database connection and startup seeds run after the listener is open.
    // This ensures reverse port binding completes immediately under Passenger/Plesk
    // and health check requests (/api/health) respond without waiting for DB sync.
    connectDB()
      .then(async () => {
        await ensureHistoricalPrices().catch((err) =>
          console.error(`Historical prices sync warning: ${err.message}`)
        );
        await ensurePageContents().catch((err) =>
          console.error(`Page content sync warning: ${err.message}`)
        );
        await ensureGalleryItems().catch((err) =>
          console.error(`Gallery items sync warning: ${err.message}`)
        );
      })
      .catch((err) => {
        console.error(`Database initialization warning: ${err.message}`);
      });

    return server;
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

// Start the server automatically whenever this file is executed directly OR
// loaded by Phusion Passenger / Plesk. Only skip if explicitly running in a test suite.
const isTest = process.env.NODE_ENV === "test";
if (!isTest) {
  startServer().catch(reportStartupFailure);
}

module.exports = app;
module.exports.startServer = startServer;
