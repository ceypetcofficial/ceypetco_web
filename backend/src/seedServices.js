const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const Service = require("./models/Service");

const CLOUD =
  "/images/";

const seedServices = async () => {
  await connectDB();

  const data = [
    {
      title: "New Dealership Registration",
      category: "Business Services",
      text: "Start an application to join Ceypetco’s islandwide retail network",
      image: CLOUD + "media-3.jpg",
      link: "/contact?subject=New%20Dealership%20Registration&from=services",
      order: 1,
      status: "published",
    },
    {
      title: "Regional Offices",
      category: "Islandwide Support",
      text: "Find regional contacts serving communities and dealers across Sri Lanka",
      image: CLOUD + "head-office.webp",
      link: "/regional-offices?from=services",
      order: 2,
      status: "published",
    },
    {
      title: "Fuel Station Services",
      category: "Digital Services",
      text: "Access information and support for Ceypetco fuel station operations",
      image: CLOUD + "distribution.jpg",
      link: "/#fuel-network",
      order: 3,
      status: "published",
    },
    {
      title: "Product Specifications",
      category: "Technical Information",
      text: "Review quality and technical information for marketed petroleum products",
      image: CLOUD + "media-1.jpg",
      link: "https://ceypetco.gov.lk/wp-content/uploads/2026/04/Marketing-Sepecifictions.pdf",
      order: 4,
      status: "published",
    },
    {
      title: "Supplier Registration",
      category: "Procurement",
      text: "Register interest in supplying products and professional services to CPC",
      image: CLOUD + "refinery.png",
      link: "/tenders?from=services#supplier-registration",
      order: 5,
      status: "published",
    },
    {
      title: "Consumer Registration",
      category: "Customer Services",
      text: "Submit consumer information and connect with the appropriate service team",
      image: CLOUD + "hero.png",
      link: "/consumer-registration?from=services",
      order: 6,
      status: "published",
    },
    {
      title: "Notices",
      category: "Public Information",
      text: "Follow important notices and updates from current infrastructure projects",
      image: CLOUD + "media-2.jpg",
      link: "/notices?from=services",
      order: 7,
      status: "published",
    },
    {
      title: "Projects",
      category: "Strategic Development",
      text: "Explore refinery modernization and infrastructure initiatives",
      image: CLOUD + "refinery-detail-1.jpg",
      link: "/projects?from=services",
      order: 8,
      status: "published",
    },
    {
      title: "Annual Reports",
      category: "Corporate Publications",
      text: "Request access to annual reports and key corporate publications",
      image: CLOUD + "about-banner.webp",
      link: "/annual-reports?from=services",
      order: 9,
      status: "published",
    },
    {
      title: "Right to Information",
      category: "Public Access",
      text: "Learn how to submit an official request for public information",
      image: CLOUD + "career-team.jpg",
      link: "/right-to-information?from=services",
      order: 10,
      status: "published",
    },
    {
      title: "Online Banking",
      category: "Banking Information",
      text: "View bank and branch information. No payments are processed on this website.",
      image: CLOUD + "head-office.webp",
      link: "/online-banking?from=services",
      order: 11,
      status: "published",
    },
  ];

  for (const item of data) {
    const existing = await Service.findOne({ title: item.title, link: item.link });
    if (existing) {
      console.log(`Service already exists: ${item.title}`);
      continue;
    }
    await Service.create(item);
    console.log(`Service created: ${item.title}`);
  }

  await closeDB();
  console.log("Service seeding complete.");
  process.exit(0);
};

seedServices().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
