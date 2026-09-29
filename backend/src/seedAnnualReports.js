const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const AnnualReport = require("./models/AnnualReport");

const reports = [
  ["2023", "https://ceypetco.gov.lk/wp-content/uploads/2025/12/2023_ENGLISH.pdf"],
  ["2022", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/2022_English.pdf"],
  ["2021", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/2021-_English.pdf"],
  ["2020", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/3-AR-2020-English.pdf"],
  ["2019", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/3-English-2019.pdf"],
  ["2015", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/Annual-Report_2015_Printer.pdf"],
  ["2014", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/Annual_Report-2014_English.pdf"],
  ["2013", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/Annual_Report_2013.pdf"],
  ["2012", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/Annual_report_2012.pdf"],
  ["2011", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/Annual_Report_2011.pdf"],
  ["2010", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/Annual_Report_2010.pdf"],
  ["2009", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/Annual_Report_2009.pdf"],
  ["2008", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/Annual_Report_2008.pdf"],
  ["2007", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/Annual_Report_2007.pdf"],
  ["2006", "https://ceypetco.gov.lk/wp-content/uploads/2025/08/Annual_Report_2006.pdf"],
];

const seed = async () => {
  await connectDB();

  for (const [year, url] of reports) {
    const exists = await AnnualReport.findOne({ year });
    if (exists) {
      console.log(`AnnualReport already exists: ${year}`);
      continue;
    }
    await AnnualReport.create({ year, url, status: "published" });
    console.log(`AnnualReport created: ${year}`);
  }

  await closeDB();
  console.log("Annual report seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
