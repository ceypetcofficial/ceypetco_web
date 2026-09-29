const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const Project = require("./models/Project");

const seedProjects = async () => {
  await connectDB();

  const data = [
    {
      title: "Sapugaskanda Oil Refinery Expansion & Modernization (SOREM)",
      slug: "sapugaskanda-oil-refinery-expansion-modernization",
      category: "Refinery",
      location: "Sapugaskanda, Sri Lanka",
      statusLabel: "Expansion & Modernization",
      summary:
        "Upgrading the Sapugaskanda refinery with new conversion processes to produce higher-value fuels and strengthen national refining capacity.",
      content:
        "The existing refinery was built as a hydro-skimming refinery with an original design capacity of 35,000 barrels per day. A later limited expansion increased processing capacity to 50,000 barrels per day to meet domestic petroleum-fuel demand. The SOREM project introduces modern conversion processes that upgrade low-value residual oil into fuels meeting current environmental standards, creating substantial foreign-exchange savings for Sri Lanka.",
      featuredImage:
        "https://ceypetco.gov.lk/wp-content/uploads/2025/08/refinery-sapugaskanda.jpg",
      startDate: new Date("2009-02-20"),
      status: "published",
    },
    {
      title: "Island-wide Fuel Station Modernization",
      slug: "fuel-station-modernization",
      category: "Retail Network",
      location: "Island-wide, Sri Lanka",
      statusLabel: "Ongoing",
      summary:
        "Refurbishing and modernizing the retail fuel station network to improve customer experience and operational efficiency.",
      content:
        "An ongoing programme to modernize Ceypetco's islandwide retail fuel station network, improving safety, customer experience, and operational efficiency across participating outlets.",
      featuredImage:
        "https://ceypetco.gov.lk/wp-content/uploads/2026/04/distribution.jpg",
      startDate: new Date("2024-01-01"),
      status: "published",
    },
    {
      title: "Regaining and Developing Trincomalee Oil Tank Farm",
      slug: "trincomalee-oil-tank-farm",
      category: "Infrastructure",
      location: "Trincomalee, Sri Lanka",
      statusLabel: "Agreement Signed",
      summary:
        "Joint modalities for the possession, development and use of the China Bay Oil Tank Farm alongside Lanka IOC and Trinco Petroleum Terminal.",
      content:
        "This project covers the modalities for the possession, development and use of the China Bay Oil Tank Farm by Ceylon Petroleum Corporation, Lanka IOC PLC and Trinco Petroleum Terminal (Pvt) Limited.",
      featuredImage:
        "https://ceypetco.gov.lk/wp-content/uploads/2025/08/China-Bay-Trincomalee.jpg",
      startDate: new Date("2025-08-01"),
      status: "published",
    },
  ];

  for (const item of data) {
    const existing = await Project.findOne({ slug: item.slug });
    if (existing) {
      console.log(`Project already exists: ${item.title}`);
      continue;
    }
    await Project.create(item);
    console.log(`Project created: ${item.title}`);
  }

  await closeDB();
  console.log("Project seeding complete.");
  process.exit(0);
};

seedProjects().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
