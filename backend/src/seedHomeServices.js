const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const HomeService = require("./models/HomeService");

const seedHomeServices = async () => {
  await connectDB();

  const data = [
    {
      title: "Regional Offices",
      description: "Find regional contacts and support",
      icon: "globe",
      link: "/regional-offices",
      order: 1,
      status: "published",
    },
    {
      title: "Market & Sales",
      description: "Explore fuel products, pricing and the dealer network",
      icon: "building",
      link: "/marketing-sales",
      order: 2,
      status: "published",
    },
    {
      title: "Mobile App",
      description: "Access Ceypetco services on mobile",
      icon: "app",
      link: "/mobile-app",
      order: 3,
      status: "published",
    },
    {
      title: "Product Specifications",
      description: "Review petroleum product standards",
      icon: "droplet",
      link: "https://ceypetco.gov.lk/wp-content/uploads/2026/04/Marketing-Sepecifictions.pdf",
      order: 4,
      status: "published",
    },
    {
      title: "Registration of Suppliers",
      description: "Supplier registration and procurement",
      icon: "shield",
      link: "/tenders#supplier-registration",
      order: 5,
      status: "published",
    },
    {
      title: "Consumer Registration",
      description: "Register for applicable consumer services",
      icon: "app",
      link: "/consumer-registration",
      order: 6,
      status: "published",
    },
    {
      title: "Notices",
      description: "Read current public and operational notices",
      icon: "clock",
      link: "/notices",
      order: 7,
      status: "published",
    },
    {
      title: "Projects",
      description: "Explore current development initiatives",
      icon: "building",
      link: "/projects",
      order: 8,
      status: "published",
    },
    {
      title: "Annual Reports",
      description: "Access corporate performance publications",
      icon: "download",
      link: "/annual-reports",
      order: 9,
      status: "published",
    },
    {
      title: "Right to Information",
      description: "Public information and RTI guidance",
      icon: "globe",
      link: "/right-to-information",
      order: 10,
      status: "published",
    },
  ];

  for (const item of data) {
    const existing = await HomeService.findOne({ title: item.title, link: item.link });
    if (existing) {
      console.log(`Home service already exists: ${item.title}`);
      continue;
    }
    await HomeService.create(item);
    console.log(`Home service created: ${item.title}`);
  }

  await closeDB();
  console.log("Home service seeding complete.");
  process.exit(0);
};

seedHomeServices().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
