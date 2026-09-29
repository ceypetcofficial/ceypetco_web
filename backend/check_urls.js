const AnnualReport = require('./src/models/AnnualReport');

async function run() {
  try {
    const items = await AnnualReport.find({ status: "published" }).sort("-year");
    console.log(`Found ${items.length} items`);
    items.forEach(item => {
      console.log(`Year: ${item.year}, URL: ${item.url ? 'Yes' : 'No (' + item.fileUrl + ')'}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
