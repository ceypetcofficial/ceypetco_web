require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const ensureHistoricalPrices = require("./ensureHistoricalPrices");
const ensurePageContents = require("./ensurePageContents");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ensureHistoricalPrices();
    await ensurePageContents();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
