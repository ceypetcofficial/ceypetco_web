require("dotenv").config();

const app = require("../src/app");
const connectDB = require("../src/config/db");

let ready = false;
let readyPromise = null;

async function ensureConnected() {
  if (ready) return;
  if (!readyPromise) {
    readyPromise = connectDB()
      .then(() => {
        ready = true;
      })
      .catch((err) => {
        readyPromise = null;
        throw err;
      });
  }
  return readyPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureConnected();
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Service temporarily unavailable" });
    return;
  }
  return app(req, res);
};
