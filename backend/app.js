// Direct entry point for Plesk configurations that select app.js instead of
// the generated .plesk.startup.cjs Passenger wrapper.
const app = require("./src/server");

if (require.main === module) {
  app.startServer().catch((error) => {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });
}

module.exports = app;
