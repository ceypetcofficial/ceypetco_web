const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const MobileApp = require("./models/MobileApp");
const HomeService = require("./models/HomeService");

const seedMobileApps = async () => {
  await connectDB();

  const data = [
    {
      title: "FuelUP",
      description:
        "Ceypetco's official mobile application for finding fuel stations, checking product availability and accessing public services on the move.",
      platform: "android",
      appIcon: "",
      downloadUrl: "https://fuelup.cpstl.lk/apk/",
      storeUrl: "",
      order: 1,
      featured: true,
      status: "published",
    },
    {
      title: "FuelUP for iOS",
      description:
        "The iOS experience of FuelUP, bringing Ceypetco fuel-station information and services to Apple devices.",
      platform: "ios",
      appIcon: "",
      downloadUrl: "",
      storeUrl: "",
      order: 2,
      featured: false,
      status: "published",
    },
  ];

  for (const item of data) {
    const existing = await MobileApp.findOne({ title: item.title });
    if (existing) {
      console.log(`Mobile app already exists: ${item.title}`);
      continue;
    }
    await MobileApp.create(item);
    console.log(`Mobile app created: ${item.title}`);
  }

  // Point the homepage "Mobile App" card to the new page.
  const mobileCard = await HomeService.findOne({ title: "Mobile App" });
  if (mobileCard) {
    if (mobileCard.link !== "/mobile-app") {
      mobileCard.link = "/mobile-app";
      await mobileCard.save();
      console.log("Home service updated: Mobile App -> /mobile-app");
    } else {
      console.log("Home service already points to /mobile-app");
    }
  }

  await closeDB();
  console.log("Mobile app seeding complete.");
  process.exit(0);
};

seedMobileApps().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
