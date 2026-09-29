const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const Notice = require("./models/Notice");

const seedNotices = async () => {
  await connectDB();

  const data = [
    {
      title: "Letter of Credit opened in relation to Shipment of Gasoline",
      slug: "letter-of-credit-shipment-gasoline",
      category: "Corporate Statement",
      summary:
        "A Letter of Credit with a 30-day credit period was established through People's Bank for the shipment. Following non-performance by the supplier, the Letter of Credit is null and void. The earmarked proceeds remain intact for future fuel purchases.",
      content:
        "A Letter of Credit with a 30-day credit period was established through People's Bank for the shipment. Following non-performance by the supplier, the Letter of Credit is null and void. The earmarked proceeds remain intact for future fuel purchases.",
      publishedDate: new Date("2026-08-20"),
      status: "published",
    },
    {
      title: "Marketing Circular No. 1041 - Fuel supply to dealers",
      slug: "marketing-circular-1041",
      category: "Marketing Circular 1041",
      summary:
        "Guidance for dealers on fuel supply and invoicing procedures following the latest marketing circular.",
      content:
        "Dealers are advised to follow the procedures set out in Marketing Circular No. 1041 regarding fuel supply and invoicing arrangements.",
      document:
        "https://ceypetco.gov.lk/wp-content/uploads/2025/08/For-Dealers-Circular-No-1041.pdf",
      publishedDate: new Date("2026-08-15"),
      status: "published",
    },
    {
      title: "Marketing Circular No. 1047 - Dealer invoicing update",
      slug: "marketing-circular-1047",
      category: "Marketing Circular 1047",
      summary:
        "Supplementary instructions to Circular 1041 for dealers on updated invoicing procedures.",
      content:
        "Supplementary instructions issued to dealers amending the invoicing procedures previously set out in Circular 1041.",
      publishedDate: new Date("2026-08-12"),
      status: "published",
    },
    {
      title: "Regaining Trincomalee Oil Tank Farm",
      slug: "trincomalee-oil-tank-farm",
      category: "Agreement",
      summary:
        "Modalities for the possession, development and use of the China Bay Oil Tank Farm by CPC, Lanka IOC PLC and Trinco Petroleum Terminal (Pvt) Limited.",
      content:
        "This document sets out the modalities for the possession, development and use of the China Bay Oil Tank Farm by Ceylon Petroleum Corporation, Lanka IOC PLC and Trinco Petroleum Terminal (Pvt) Limited.",
      document:
        "https://ceypetco.gov.lk/wp-content/uploads/2025/08/MODALITIES-FOR-THE-POSSESSION-DEVELOPMENT-AND-USE-OF-THE-CHINA-BAY-OIL-TANK-FARM-BY-CEYLON-PETROLEUM-CORPORATION-CPC-LANKA-IOC-PLC-LIOC-AND-TRINCO-PETROLEUM-TERMINAL-PVT-LIMITED-JVC.pdf",
      publishedDate: new Date("2026-08-05"),
      status: "published",
    },
    {
      title: "Public notice - Fuel price revision effective this month",
      slug: "fuel-price-revision",
      category: "public-notice",
      summary:
        "Ceypetco announces the latest revision of retail fuel prices in line with the monthly pricing formula.",
      content:
        "Ceypetco advises members of the public of the revised retail fuel prices effective this month, in accordance with the official monthly pricing mechanism.",
      publishedDate: new Date("2026-08-01"),
      status: "published",
    },
  ];

  for (const item of data) {
    const existing = await Notice.findOne({ slug: item.slug });
    if (existing) {
      console.log(`Notice already exists: ${item.title}`);
      continue;
    }
    await Notice.create(item);
    console.log(`Notice created: ${item.title}`);
  }

  await closeDB();
  console.log("Notice seeding complete.");
  process.exit(0);
};

seedNotices().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
