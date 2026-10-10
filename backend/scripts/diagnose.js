const fs = require("fs");
const path = require("path");
const { validateEnvironment } = require("../src/config/env");
const connectDB = require("../src/config/db");

const required = [
  "CLIENT_URL",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_SECRET",
  "LOCAL_ASSET_BASE_URL",
];

async function diagnose() {
  console.log(`Node: ${process.version}`);
  console.log(`Working directory: ${process.cwd()}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || "(not set)"}`);
  console.log(`app.js exists: ${fs.existsSync(path.resolve(__dirname, "../app.js"))}`);

  const missing = required.filter((name) => !process.env[name]?.trim());
  console.log(`Missing environment variables: ${missing.length ? missing.join(", ") : "none"}`);

  validateEnvironment();
  console.log("Environment validation: OK");

  const pool = await connectDB();
  await pool.query("SELECT 1");
  console.log("Database connection: OK");
  await connectDB.closeDB();
  console.log("Backend startup prerequisites: OK");
}

diagnose().catch(async (error) => {
  console.error(`DIAGNOSIS FAILED: ${error.message}`);
  await connectDB.closeDB().catch(() => {});
  process.exitCode = 1;
});
