const AnnualReport = require('./src/models/AnnualReport');

async function run() {
  try {
    const items = await AnnualReport.find({ status: "published" }).sort("-year");
    console.log(`Found ${items.length} items`);
    if (items.length > 0) {
      console.log(items[0]);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
